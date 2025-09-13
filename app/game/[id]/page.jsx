"use client";
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAbly } from '../../context/AblyContext';
import { ChessBoard, initialBoard } from '../../components/ChessBoard';
import { log } from '@/utils/logger';

export default function GamePage({ params }) {
  const { id } = use(params);
  const [game, setGame] = useState(null);
  const [move, setMove] = useState('');
  const [error, setError] = useState('');
  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ w: 300, b: 300 }); // Default 5 minutes each
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [notification, setNotification] = useState(null); // For showing game start notifications
  const channelRef = useRef(null);
  const isInitialized = useRef(false);
  const timerRef = useRef(null);
  const ably = useAbly(); // Use the global Ably context

  useEffect(() => {
    if (!id || !ably || isInitialized.current) return;
    
    console.log('Initializing game page for:', id, 'with Ably instance:', !!ably);
    isInitialized.current = true;
    
    // Fetch game data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(game => {
        console.log({ game });
        setGame(game);
        
        // Make sure the channel exists before publishing
        if (channelRef.current) {
          channelRef.current.publish('gameStart', {
            game: {
              ...game,
              white: { name: game.host.username },
              black: { name: game.opponent.username }
            },
            message: 'Game started! Both players have joined.'
          });
        }
        
        console.log('🎮 Game data received:', game);
        console.log('🎮 User role:', game.userRole);
        console.log('🎮 Player color:', game.playerColor);
        console.log('🎮 Current turn:', game.turn);
        console.log('⏰ Time left:', game.timeLeft);
        if (game.timeLeft) {
          setTimeLeft(game.timeLeft);
        }
        updateBoardFromMoves(game.moves);
      })
      .catch((error) => {
							log({error}, "frontend-game-62")
							setError('Failed to load game')});

    // Subscribe to channel using the global Ably instance
    if (!channelRef.current && ably) {
      try {
        console.log('Subscribing to channel:', `game-${id}`);
        channelRef.current = ably.channels.get(`game-${id}`);

        // Subscribe to game start events (when second player joins)
        channelRef.current.subscribe('gameStart', msg => {
          console.log('🎉 Received game start via Ably:', msg.data);
          setGame(msg.data.game);
          if (msg.data.game.timeLeft) {
            setTimeLeft(msg.data.game.timeLeft);
          }
          // Show visual notification that game has started
          setNotification({
            type: 'gameStart',
            message: '🎉 Player joined! Game is now LIVE!',
            playerName: msg.data.game.black?.name || 'Player 2'
          });
          // Auto-hide notification after 5 seconds
          setTimeout(() => setNotification(null), 5000);
          console.log('🎮 Game started! Both players have joined.');
        });

        channelRef.current.subscribe('move', msg => {
          console.log('Received move via Ably:', msg.data);
          setGame(msg.data.game);
          if (msg.data.game.timeLeft) {
            setTimeLeft(msg.data.game.timeLeft);
          }
          updateBoardFromMoves(msg.data.game.moves);
        });

        // Subscribe to game end events
        channelRef.current.subscribe('gameEnd', msg => {
          console.log('Received game end via Ably:', msg.data);
          const { reason, winner, loser } = msg.data;
          if (reason === 'timeout') {
            setGameResult({
              winner: winner === msg.data.game.host ? 'White' : 'Black',
              reason: 'Time expired',
              loser: loser === 'w' ? 'White' : 'Black'
            });
            setShowGameEndModal(true);
          }
          setGame(msg.data.game);
        });
      } catch (error) {
        console.error('Failed to initialize Ably channel:', error);
        setError('Failed to connect to game server');
      }
    }

    // Cleanup function
    return () => {
      console.log('Cleaning up game page');
      
      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      // Unsubscribe from Ably channel
      if (channelRef.current) {
        console.log('Unsubscribing from channel');
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }
      
      isInitialized.current = false;
    };
  }, [id, ably]); // Add ably as dependency

  // Timer effect - counts down current player's time
  useEffect(() => {
    // Only run timer if user is a player, not a spectator
    if (!game || game.status !== 'active' || game.userRole !== 'player') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      console.log('⏰ Timer stopped - not a player or game not active', {
        gameStatus: game?.status,
        userRole: game?.userRole
      });
      return;
    }
    
    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    console.log('⏰ Timer started for player', { userRole: game.userRole, playerColor: game.playerColor });
    
    // Start timer for current player
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = { ...prevTime };
        const currentPlayer = game.turn;
        
        if (newTime[currentPlayer] > 0) {
          newTime[currentPlayer] -= 1;
          
          // Check if time is up
          if (newTime[currentPlayer] <= 0) {
            console.log(`⏰ Time up for ${currentPlayer}!`);
            const winner = currentPlayer === 'w' ? 'Black' : 'White';
            const loser = currentPlayer === 'w' ? 'White' : 'Black';
            
            // End the game due to timeout
            endGameByTimeout(currentPlayer, winner);
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);
  // }, [game?.turn, game?.status, game?.userRole]);

  function updateBoardFromMoves(moves) {
    let newBoard = JSON.parse(JSON.stringify(initialBoard)); // Deep copy
    console.log('Updating board with moves:', moves);
    
    moves.forEach(move => {
      console.log('Processing move:', move);
      // Parse move format like "e2-e4"
      if (move.includes('-')) {
        const [from, to] = move.split('-');
        const fromCol = from.charCodeAt(0) - 97; // a=0, b=1, etc.
        const fromRow = 8 - parseInt(from[1]); // 1=7, 2=6, etc.
        const toCol = to.charCodeAt(0) - 97;
        const toRow = 8 - parseInt(to[1]);
        console.log(`Moving from [${fromRow},${fromCol}] to [${toRow},${toCol}]`);
        
        // Move piece
        const piece = newBoard[fromRow][fromCol];
        console.log('Moving piece:', piece);
        newBoard[toRow][toCol] = piece;
        newBoard[fromRow][fromCol] = null;
      }
    });
    
    console.log('New board state:', newBoard);
    setBoard(newBoard);
  }

  async function makeMove() {
    setError('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/move/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ move })
    });
    const data = await res.json();
    if (res.ok) {
      setMove('');
      setSelectedSquare(null);
    } else {
      setError(data.error);
    }
  }

  // New function for immediate move submission
  async function submitMove(moveString) {
    console.log('🚀 Submitting move immediately:', moveString);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/move/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ move: moveString })
      });
      const data = await res.json();
      if (res.ok) {
        console.log('✅ Move submitted successfully');
        setMove(''); // Clear the manual input field
      } else {
        console.log('❌ Move submission failed:', data.error);
        setError(data.error);
      }
    } catch (error) {
      console.log('❌ Network error:', error);
      setError('Failed to submit move');
    }
  }

  // End game due to timeout
  async function endGameByTimeout(loserColor, winnerName) {
    console.log('⏰ Ending game due to timeout:', { loserColor, winnerName });
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/timeout/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loserColor })
      });
      if (res.ok) {
        setGameResult({
          winner: winnerName,
          reason: 'Time expired',
          loser: loserColor === 'w' ? 'White' : 'Black'
        });
        setShowGameEndModal(true);
      }
    } catch (error) {
      console.log('❌ Failed to end game:', error);
      setError('Failed to end game');
    }
  }

  function handleSquareClick(row, col) {
    if (!game) return;
    console.log('🖱️ Square clicked:', { row, col });
    console.log('🖱️ Game state:', { userRole: game.userRole, playerColor: game.playerColor, turn: game.turn });
    
    // If we don't have user role info yet, allow the move (backend will validate)
    if (game.userRole && game.userRole !== 'player') {
      console.log('❌ Blocked: Spectator');
      setError('Spectators cannot make moves');
      return;
    }
    
    // If we have player color info, check turn
    log({game});
    log([game.playerColor, game.turn]);
    log([game.playerColor, game.turn !== game.playerColor]);
    
    if (game.playerColor && game.turn !== game.playerColor) {
      console.log('❌ Blocked: Not your turn');
      setError('Not your turn');
      return;
    }
    
    if (selectedSquare) {
      // Make a move from selectedSquare to clicked square
      const fromRow = selectedSquare.row;
      const fromCol = selectedSquare.col;
      const fromPiece = board[fromRow][fromCol];
      const toPiece = board[row][col];
      console.log('🎯 Move attempt:', { fromPiece, toPiece, from: [fromRow, fromCol], to: [row, col] });
      
      // Check if there's actually a piece to move
      if (!fromPiece) {
        console.log('❌ Blocked: No piece at selected square');
        setError('No piece selected!');
        setSelectedSquare(null);
        return;
      }
      
      // Check if destination has own piece (illegal)
      if (toPiece) {
        const fromPieceColor = fromPiece === fromPiece.toUpperCase() ? 'w' : 'b';
        const toPieceColor = toPiece === toPiece.toUpperCase() ? 'w' : 'b';
        if (fromPieceColor === toPieceColor) {
          console.log('❌ Blocked: Cannot capture own piece');
          setError('You cannot capture your own pieces!');
          setSelectedSquare(null);
          return;
        }
      }
      
      // Validate move according to chess rules
      if (!isValidChessMove(fromPiece, fromRow, fromCol, row, col, toPiece, board)) {
        console.log('❌ Blocked: Invalid move for piece type');
        setError(`Invalid move for ${getPieceName(fromPiece)}`);
        setSelectedSquare(null);
        return;
      }
      
      // If we reach here, the move is valid - submit it immediately!
      const moveString = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}-${String.fromCharCode(97 + col)}${8 - row}`;
      console.log('📝 Auto-submitting move:', moveString);
      
      // Clear selection and errors immediately for responsive UI
      setSelectedSquare(null);
      setError('');
      
      // Submit the move automatically
      submitMove(moveString);
    } else {
      // Select this square if it has a piece
      const piece = board[row][col];
      console.log('🎯 Piece at square:', piece);
      if (piece) {
        // Simple piece ownership check: 
        // White pieces (uppercase) can only be moved when it's white's turn
        // Black pieces (lowercase) can only be moved when it's black's turn
        const isWhitePiece = piece === piece.toUpperCase();
        const pieceColor = isWhitePiece ? 'w' : 'b';
        console.log('🔍 Piece analysis:', { piece, isWhitePiece, pieceColor, currentTurn: game.turn });
        
        if (pieceColor === game.turn) {
          console.log('✅ Valid piece selection - matches current turn');
          setSelectedSquare({ row, col });
          setError(''); // Clear any previous errors
        } else {
          console.log('❌ Blocked: Wrong piece for current turn');
          setError(`It's ${game.turn === 'w' ? 'White' : 'Black'}'s turn. You can only move ${game.turn === 'w' ? 'white' : 'black'} pieces.`);
        }
      }
    }
  }

  if (!game) {
			console.log(game, 382)
			return <div>Loading...</div>;}

  // Helper function to format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '1s' }}></div>
      </div>
      
      {/* Main Container */}
      <div className="container mx-auto p-6 max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-4">
            <h1 className="text-5xl font-black tracking-wide mb-2">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                CHESS
              </span>
              <span className="text-white">CHAMP</span>
            </h1>
            <div className="h-1 w-24 mx-auto chess-gold-gradient rounded-full"></div>
          </div>
          <div className="text-sm text-gray-300 font-mono glass rounded-2xl px-4 py-2 inline-block backdrop-blur-sm">
            Battle ID: <span className="text-yellow-400 font-bold">{id?.substring(0, 8)}</span>
          </div>
        </div>
        
        {/* Game Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Panel - White Player */}
          <div className="xl:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-black">♔</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">White Champion</h3>
                <p className={`mb-6 transition-all duration-300 ${game?.white?.name ? 'text-emerald-400 font-semibold' : 'text-gray-300 animate-pulse'}`}>
                  {game?.white?.name || 'Awaiting Challenger...'}
                  {game?.white?.name && game?.status === 'active' && ' ✅'}
                </p>
                {/* Timer */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${game?.turn === 'w'
                  ? 'border-yellow-400 glass chess-gold-gradient text-black pulse-glow'
                  : 'border-gray-600 glass text-white'
                  }`}>
                  <div className="text-4xl font-mono font-black mb-2">
                    {formatTime(timeLeft.w)}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    {game?.turn === 'w' ? '⚡ YOUR MOVE' : '⏳ WAITING'}
                  </div>
                </div>
                {game?.turn === 'w' && !showGameEndModal && (
                  <div className="mt-4 px-4 py-2 chess-gold-gradient text-black text-sm font-black rounded-full animate-pulse">
                    🔥 ACTIVE TURN
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Stakes */}
            <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
                <span>💰</span>
                <span>Battle Stakes</span>
              </h4>
              <div className="text-center">
                <div className="text-3xl font-black text-yellow-400 mb-2">$50.00</div>
                <div className="text-sm text-gray-300 uppercase tracking-wider font-semibold">Winner Takes All</div>
                <div className="mt-4 p-3 glass rounded-2xl text-xs text-gray-400">
                  🏆 Glory • 💎 Prestige • ⚡ Dominance
                </div>
              </div>
            </div>
          </div>
          
          {/* Center - Chess Board */}
          <div className="xl:col-span-2 flex justify-center">
            <div className="w-full max-w-2xl">
              <ChessBoard board={board} onSquareClick={handleSquareClick} />
            </div>
          </div>
          
          {/* Right Panel - Black Player */}
          <div className="xl:col-span-1 space-y-6">
            <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-900 border-4 border-gray-600 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-white">♚</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Black Champion</h3>
                <p className={`mb-6 transition-all duration-300 ${game?.black?.name ? 'text-emerald-400 font-semibold' : 'text-gray-300 animate-pulse'}`}>
                  {game?.black?.name || 'Awaiting Challenger...'}
                  {game?.black?.name && game?.status === 'active' && ' ✅'}
                </p>
                {/* Timer */}
                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${game?.turn === 'b'
                  ? 'border-yellow-400 glass chess-gold-gradient text-black pulse-glow'
                  : 'border-gray-600 glass text-white'
                  }`}>
                  <div className="text-4xl font-mono font-black mb-2">
                    {formatTime(timeLeft.b)}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    {game?.turn === 'b' ? '⚡ YOUR MOVE' : '⏳ WAITING'}
                  </div>
                </div>
                {game?.turn === 'b' && !showGameEndModal && (
                  <div className="mt-4 px-4 py-2 chess-gold-gradient text-black text-sm font-black rounded-full animate-pulse">
                    🔥 ACTIVE TURN
                  </div>
                )}
              </div>
            </div>
            
            {/* Game Status */}
            <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20">
              <h4 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
                <span>⚡</span>
                <span>Battle Status</span>
              </h4>
              <div className="text-center">
                <div className={`inline-block px-6 py-3 rounded-2xl text-sm font-bold uppercase tracking-wider border-2 transition-all duration-500 ${game?.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 animate-pulse shadow-lg shadow-emerald-500/25'
                  : game?.status === 'completed'
                    ? 'bg-gray-500/20 text-gray-400 border-gray-500/50'
                    : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50 animate-bounce'
                  }`}>
                  {game?.status === 'active' ? '🔥 LIVE BATTLE' :
                    game?.status === 'waiting' ? '⏳ WAITING FOR CHALLENGER' :
                      game?.status || 'Loading...'}
                </div>
                {/* Show player count indicator */}
                <div className="mt-3 p-2 glass rounded-xl text-xs text-gray-400">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Players:</span>
                    <span className={`font-bold ${(game?.white && game?.black) ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {(game?.white ? 1 : 0) + (game?.black ? 1 : 0)}/2
                      {(game?.white && game?.black) ? ' ✅' : ' 👥'}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-300 mt-4 p-3 glass rounded-2xl">
                  <div className="flex items-center justify-center space-x-2">
                    <span>Current Turn:</span>
                    <span className={`font-bold ${game?.turn === 'w' ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {game?.turn === 'w' ? '♔ White' : '♚ Black'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Messages */}
      <div className="text-center mt-12 space-y-4">
        {selectedSquare && (
          <div className="inline-block glass rounded-2xl px-6 py-3 text-yellow-400 font-mono font-bold backdrop-blur-sm border border-yellow-400/30">
            🎯 Selected: {String.fromCharCode(97 + selectedSquare.col)}{8 - selectedSquare.row}
          </div>
        )}
        {error && (
          <div className="inline-block glass rounded-2xl px-6 py-3 text-red-300 font-semibold backdrop-blur-sm border border-red-400/30">
            ⚠️ {error}
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="text-center mt-12">
        <button
          onClick={() => window.location.href = '/dashboard'}
          className="glass border border-white/20 hover:border-yellow-400/50 text-white hover:text-yellow-400 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-2 mx-auto"
        >
          <span>←</span>
          <span>Return to Arena</span>
        </button>
      </div>
      
      {/* Game End Modal */}
      {showGameEndModal && gameResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-12 max-w-lg w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-24 h-24 chess-gold-gradient rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">🏆</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">Battle Complete!</h2>
              <div className="text-3xl font-black text-yellow-400 mb-4">
                🎊 {gameResult.winner} Victorious! 🎊
              </div>
              <p className="text-gray-300 mb-4 text-lg">{gameResult.reason}</p>
              <div className="glass rounded-2xl p-4 mb-8 backdrop-blur-sm border border-yellow-400/30">
                <div className="text-yellow-400 font-bold text-xl">Prize Claimed: $50.00</div>
                <div className="text-gray-300 text-sm mt-1">🏆 Glory • 💎 Honor • ⚡ Dominance</div>
              </div>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full chess-gold-gradient text-black py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 transform active:scale-95"
              >
                ⚔️ RETURN TO ARENA
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Game Start Notification */}
      {notification && notification.type === 'gameStart' && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className="glass rounded-2xl p-6 border border-green-400/50 backdrop-blur-xl bg-green-500/20 shadow-2xl shadow-green-500/25">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <div className="text-green-400 font-bold text-lg">
                  {notification.message}
                </div>
                <div className="text-green-300 text-sm">
                  {notification.playerName} has joined the battle!
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-green-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Chess move validation functions
function isValidChessMove(piece, fromRow, fromCol, toRow, toCol, capturedPiece, board) {
  // Safety check for null piece
  if (!piece) {
    console.log('❌ Invalid move: No piece provided');
    return false;
  }
  
  const pieceType = piece.toLowerCase();
  const isWhite = piece === piece.toUpperCase();
  const rowDiff = toRow - fromRow;
  const colDiff = toCol - fromCol;
  const absRowDiff = Math.abs(rowDiff);
  const absColDiff = Math.abs(colDiff);
  
  console.log('🔍 Validating move:', { piece, pieceType, from: [fromRow, fromCol], to: [toRow, toCol], rowDiff, colDiff });
  
  switch (pieceType) {
    case 'p': // Pawn
      return isValidPawnMove(isWhite, fromRow, fromCol, toRow, toCol, capturedPiece, board);
    case 'r': // Rook
      return isValidRookMove(fromRow, fromCol, toRow, toCol, board);
    case 'n': // Knight
      return isValidKnightMove(rowDiff, colDiff);
    case 'b': // Bishop
      return isValidBishopMove(fromRow, fromCol, toRow, toCol, board);
    case 'q': // Queen
      return isValidQueenMove(fromRow, fromCol, toRow, toCol, board);
    case 'k': // King
      return isValidKingMove(rowDiff, colDiff);
    default:
      return false;
  }
}

function isValidPawnMove(isWhite, fromRow, fromCol, toRow, toCol, capturedPiece, board) {
  const direction = isWhite ? -1 : 1; // White moves up (decreasing row), black moves down
  const startRow = isWhite ? 6 : 1;   // Starting positions
  const rowDiff = toRow - fromRow;
  const colDiff = Math.abs(toCol - fromCol);
  
  console.log('🔍 Pawn move:', { isWhite, direction, startRow, rowDiff, colDiff, capturedPiece });
  
  // Forward moves (no capture)
  if (colDiff === 0 && !capturedPiece) {
    // One square forward
    if (rowDiff === direction) return true;
    // Two squares forward from starting position
    if (fromRow === startRow && rowDiff === 2 * direction) return true;
  }
  
  // Diagonal captures
  if (colDiff === 1 && rowDiff === direction && capturedPiece) {
    return true;
  }
  
  return false;
}

function isValidRookMove(fromRow, fromCol, toRow, toCol, board) {
  // Rook moves horizontally or vertically
  if (fromRow !== toRow && fromCol !== toCol) return false;
  
  // Check if path is clear
  return isPathClear(fromRow, fromCol, toRow, toCol, board);
}

function isValidKnightMove(rowDiff, colDiff) {
  // Knight moves in L-shape: 2+1 or 1+2
  return (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 1) ||
         (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 2);
}

function isValidBishopMove(fromRow, fromCol, toRow, toCol, board) {
  // Bishop moves diagonally
  if (Math.abs(toRow - fromRow) !== Math.abs(toCol - fromCol)) return false;
  
  // Check if path is clear
  return isPathClear(fromRow, fromCol, toRow, toCol, board);
}

function isValidQueenMove(fromRow, fromCol, toRow, toCol, board) {
  // Queen combines rook and bishop moves
  return isValidRookMove(fromRow, fromCol, toRow, toCol, board) ||
         isValidBishopMove(fromRow, fromCol, toRow, toCol, board);
}

function isValidKingMove(rowDiff, colDiff) {
  // King moves one square in any direction
  return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
}

function isPathClear(fromRow, fromCol, toRow, toCol, board) {
  const rowStep = toRow > fromRow ? 1 : (toRow < fromRow ? -1 : 0);
  const colStep = toCol > fromCol ? 1 : (toCol < fromCol ? -1 : 0);
  
  let currentRow = fromRow + rowStep;
  let currentCol = fromCol + colStep;
  
  while (currentRow !== toRow || currentCol !== toCol) {
    if (board[currentRow][currentCol] !== null) {
      console.log('❌ Path blocked at:', [currentRow, currentCol]);
      return false;
    }
    currentRow += rowStep;
    currentCol += colStep;
  }
  
  return true;
}

function getPieceName(piece) {
  const names = {
    'p': 'pawn', 'r': 'rook', 'n': 'knight', 'b': 'bishop', 'q': 'queen', 'k': 'king',
    'P': 'pawn', 'R': 'rook', 'N': 'knight', 'B': 'bishop', 'Q': 'queen', 'K': 'king'
  };
  return names[piece] || 'piece';
}
