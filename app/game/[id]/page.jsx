"use client";
import { useEffect, useState, useRef, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAbly } from '../../context/AblyContext';
import { ChessBoard, initialBoard } from '../../components/ChessBoard';
import profileService from '../../../utils/profileService';

import { Chess } from 'chess.js'; // Import chess.js for proper move validation
import { log } from '@/utils/logger';
import soundManager from '../../../utils/soundManager';

// Safe sound wrapper to prevent SSR issues
const playSound = (soundFunction) => {
  if (typeof window !== 'undefined' && soundFunction) {
    try {
      soundFunction();
    } catch (error) {
      // Sound playback failed silently
    }
  }
};

export default function GamePage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [game, setGame] = useState(null);
  const [move, setMove] = useState('');
  const [error, setError] = useState('');
  const [board, setBoard] = useState(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [timeLeft, setTimeLeft] = useState({ w: 300, b: 300 }); // Default 5 minutes each
  const [showGameEndModal, setShowGameEndModal] = useState(false);
  const [gameResult, setGameResult] = useState(null);
  const [notification, setNotification] = useState(null); // For showing game start notifications
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionMove, setPromotionMove] = useState(null); // Stores the move awaiting promotion choice
  const [showDrawOfferModal, setShowDrawOfferModal] = useState(false);
  const [drawOffer, setDrawOffer] = useState(null);
  const [showResignationModal, setShowResignationModal] = useState(false); // Current pending draw offer
  const [showConfirmMoveModal, setShowConfirmMoveModal] = useState(false); // Confirm moves modal
  const [pendingMove, setPendingMove] = useState(null); // Stores move awaiting confirmation
  const [userPreferences, setUserPreferences] = useState({});
  const [legalMoves, setLegalMoves] = useState([]);

  const channelRef = useRef(null);
  const isInitialized = useRef(false);
  const timerRef = useRef(null);
  const ably = useAbly(); // Use the global Ably context



  useEffect(() => {
    if (!id || !ably || isInitialized.current) return;

    // Initialize game page
    isInitialized.current = true;

    // Load user preferences
    const loadPreferences = async () => {
      try {
        const profile = await profileService.getProfile();
        if (profile && profile.preferences) {
          setUserPreferences(profile.preferences);
          // User preferences loaded successfully
        }
      } catch (error) {
        // Error loading preferences
      }
    };

    loadPreferences();

    // Fetch game data
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/${id}`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(game => {
        setGame(game);

        // Make sure the channel exists before publishing
        if (channelRef.current) {
          channelRef.current.publish('gameStart', {
            game: {
              ...game,
              white: { name: game.host.username },
              black: { name: game?.opponent?.username }
            },
            message: 'Game started! Both players have joined.'
          });
        }

        // Game data loaded
        if (game.timeLeft) {
          setTimeLeft(game.timeLeft);
        }
        updateBoardFromFEN(game.fen);
      })
      .catch((error) => {
        log({ error }, "frontend-game-62")
        setError('Failed to load game')
      });

    // Subscribe to channel using the global Ably instance
    if (!channelRef.current && ably) {
      try {
        // Subscribe to game channel
        channelRef.current = ably.channels.get(`game-${id}`);

        // Subscribe to game start events (when second player joins)
        channelRef.current.subscribe('gameStart', msg => {
          // Game started - both players joined

          // Preserve user-specific properties when updating game state
          setGame(prevGame => ({
            ...msg.data.game,
            userRole: prevGame?.userRole,
            playerColor: prevGame?.playerColor,
            userId: prevGame?.userId
          }));

          if (msg.data.game.timeLeft) {
            setTimeLeft(msg.data.game.timeLeft);
          }
          // Show visual notification that game has started
          setNotification({
            type: 'gameStart',
            message: '🎉 Player joined! Game is now LIVE!',
            playerName: msg.data.game.black?.name || 'Player 2'
          });

          // Play game start notification sound if enabled
          if (userPreferences.soundEffects) {
            playSound(() => soundManager.playGameStart());
          }

          // Auto-hide notification after 5 seconds
          setTimeout(() => setNotification(null), 5000);
          // Game started - both players joined
        });

        channelRef.current.subscribe('move', msg => {
          // Move received via Ably

          // Preserve user-specific properties when updating game state
          setGame(prevGame => ({
            ...msg.data.game,
            userRole: prevGame?.userRole,
            playerColor: prevGame?.playerColor,
            userId: prevGame?.userId
          }));

          if (msg.data.game.timeLeft) {
            setTimeLeft(msg.data.game.timeLeft);
          }
          updateBoardFromFEN(msg.data.game.fen);
        });

        // Subscribe to time sync events for real-time timer updates (from moves)
        channelRef.current.subscribe('timeSync', msg => {
          // Time sync received via Ably
          if (msg.data.timeLeft) {
            setTimeLeft(msg.data.timeLeft);
            // Timer synced via Ably
          }
        });

        // Subscribe to draw offer events
        channelRef.current.subscribe('drawOffer', msg => {
          // Draw offer received via Ably
          setDrawOffer(msg.data.offeredBy);
          setShowDrawOfferModal(true);

          // Play notification sound for draw offer if enabled
          if (userPreferences.soundEffects) {
            playSound(() => soundManager.playNotification());
          }
        });

        channelRef.current.subscribe('drawDeclined', msg => {
          // Draw declined via Ably
          setDrawOffer(null);
          setShowDrawOfferModal(false);
          setNotification({
            type: 'drawDeclined',
            message: `${msg.data.declinedBy.color === 'white' ? 'White' : 'Black'} declined your draw offer`,
          });

          // Play error sound for draw declined if enabled
          if (userPreferences.soundEffects) {
            playSound(() => soundManager.playError());
          }

          setTimeout(() => setNotification(null), 3000);
        });

        // Subscribe to game end events
        channelRef.current.subscribe('gameEnd', msg => {
          // Game end received via Ably
          const { reason, winner, loser, game: gameData } = msg.data;

          // Map win/draw reasons to user-friendly messages
          const getGameEndMessage = (reason) => {
            switch (reason) {
              case 'checkmate': return 'Checkmate';
              case 'timeout': return 'Time expired';
              case 'resignation': return 'Resignation';
              case 'stalemate': return 'Draw by stalemate';
              case 'threefold': return 'Draw by threefold repetition';
              case 'fiftyMove': return 'Draw by fifty-move rule';
              case 'insufficientMaterial': return 'Draw by insufficient material';
              case 'draw': return 'Draw';
              default: return reason || 'Game ended';
            }
          };

          // Determine if it's a draw
          const isDraw = ['stalemate', 'threefold', 'fiftyMove', 'insufficientMaterial', 'draw'].includes(reason);
          let winnerColor = null;

          if (!isDraw && winner) {
            // Winner determination logic

            // For timeout and resignation, backend sends winner object directly
            // For checkmate, backend also sends winner object
            // Host is always white player, opponent is always black player

            // Method 1: Check if gameData has host property (more reliable)
            if (gameData && gameData.host) {
              const hostId = typeof gameData.host === 'object' ? gameData.host._id : gameData.host;
              const winnerId = typeof winner === 'object' ? winner.id : winner;
              winnerColor = hostId.toString() === winnerId.toString() ? 'White' : 'Black';
            }
            // Method 2: Fallback - try to use the winner object username and compare to white/black names
            else if (gameData && gameData.white && gameData.black && winner.username) {
              if (winner.username === gameData.white.name) {
                winnerColor = 'White';
              } else if (winner.username === gameData.black.name) {
                winnerColor = 'Black';
              }
            }

            // Final winner color determined
          }

          setGameResult({
            winner: winnerColor,
            reason: getGameEndMessage(reason),
            isDraw: isDraw
          });

          setShowGameEndModal(true);

          // Play appropriate game end sound if enabled
          if (userPreferences.soundEffects) {
            if (reason === 'checkmate') {
              playSound(() => soundManager.playCheckmate());
            } else {
              playSound(() => soundManager.playGameEnd());
            }
          }

          // Track game statistics in profile
          if (game && game.userId) {
            const gameStartTime = new Date(game.createdAt).getTime();
            const gameEndTime = Date.now();
            const gameTimeSeconds = Math.round((gameEndTime - gameStartTime) / 1000);
            const totalMoves = game.moves ? game.moves.length : 0;

            // Determine if current user won, lost, or drew
            let isWin = false;
            let isLoss = false;
            let isDrawResult = false;

            if (['stalemate', 'threefold', 'fiftyMove', 'insufficientMaterial', 'draw'].includes(reason)) {
              isDrawResult = true;
            } else if (winner) {
              // For timeout, checkmate, resignation, etc.
              const winnerUserId = typeof winner === 'object' ? winner.id : winner;
              isWin = winnerUserId === game.userId;
              isLoss = !isWin && !isDrawResult;
            }

            // Record game result in user statistics
            console.log('� Recording game result in user statistics...');
            const gameResultData = {
              result: isWin ? 'win' : isLoss ? 'loss' : 'draw',
              winMethod: reason,
              gameTimeSeconds,
              totalMoves,
              isWin,
              isLoss,
              isDraw: isDrawResult
            };

            // Add a small delay to let backend automatic tracking complete first
            setTimeout(() => {
              profileService.recordGameResult(gameResultData).then(updatedProfile => {
                if (updatedProfile && updatedProfile.stats) {
                  // Game result recorded and profile updated
                } else {
                  // Failed to record game result
                }
              }).catch(error => {
                // Error recording game result
              });
            }, 1500); // Wait 1.5 seconds for backend processing

            // Game ended with result tracking
          }

          // Preserve user-specific properties when updating game state
          setGame(prevGame => ({
            ...msg.data.game,
            userRole: prevGame?.userRole,
            playerColor: prevGame?.playerColor,
            userId: prevGame?.userId
          }));
        });
      } catch (error) {
        // Failed to initialize Ably channel
        setError('Failed to connect to game server');
      }
    }

    // Cleanup function
    return () => {
      // Cleaning up game page

      // Clear any active timers
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Unsubscribe from Ably channel
      if (channelRef.current) {
        // Unsubscribing from channel
        channelRef.current.unsubscribe();
        channelRef.current = null;
      }

      isInitialized.current = false;
    };
  }, [id, ably]); // Add ably as dependency

  // Separate useEffect to handle draw offer filtering with access to game state
  useEffect(() => {
    if (!channelRef.current || !game) return;

    // Unsubscribe from previous draw offer handler
    channelRef.current.unsubscribe('drawOffer');

    // Re-subscribe with current game context
    channelRef.current.subscribe('drawOffer', msg => {
      // Received draw offer via Ably

      // Only show modal to the recipient (not the sender)
      if (msg.data.offeredBy.id !== game.userId) {
        setDrawOffer(msg.data.offeredBy);
        setShowDrawOfferModal(true);
      } else {
        // Not showing draw offer modal - user is the sender
      }
    });

    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe('drawOffer');
      }
    };
  }, [game?.userId]); // Re-run when userId changes

  // Client-side timer with minimal server sync - much more server-friendly!
  useEffect(() => {
    // Only run timer if game is active
    if (!game || game.status !== 'active') {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      // Timer stopped - game not active
      return;
    }

    // Clear any existing timer before starting a new one
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    // Client-side timer started

    // Run client-side countdown (much more server-friendly)
    timerRef.current = setInterval(() => {
      setTimeLeft(prevTime => {
        const newTime = { ...prevTime };
        const currentPlayer = game.turn;

        if (newTime[currentPlayer] > 0) {
          newTime[currentPlayer] -= 1;

          // Check if time is about to run out (last 10 seconds) - sync with server for accuracy
          if (newTime[currentPlayer] <= 10 && newTime[currentPlayer] % 5 === 0) {
            // Time running low, syncing with server
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/time-sync/${id}`, {
              credentials: 'include'
            }).then(res => res.json()).then(data => {
              if (data.gameEnded && data.gameDeleted) {
                router.push('/dashboard');
              } else if (data.timeLeft) {
                setTimeLeft(data.timeLeft);
              }
            }).catch(err => {/* Timer sync error */});
          }

          // If time reaches 0, let server handle timeout
          if (newTime[currentPlayer] <= 0) {
            // Time up - server will handle timeout
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
  }, [game?.turn, game?.status, id]);

  function updateBoardFromFEN(fenString) {
    // Updating board from FEN

    // If no FEN provided or it's 'start', use starting position
    if (!fenString || fenString === 'start') {
      // Using starting position
      setBoard(initialBoard);
      return;
    }

    try {
      // Parse FEN string to create board array
      const chess = new Chess(fenString);
      const chessBoard = chess.board();

      // Convert chess.js board format to our 8x8 array format
      const newBoard = chessBoard.map(row =>
        row.map(piece => {
          if (!piece) return null;
          // Convert chess.js piece to our notation (uppercase for white, lowercase for black)
          return piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
        })
      );

      // Successfully converted FEN to board
      setBoard(newBoard);
    } catch (error) {
      console.error('Error parsing FEN:', error, 'FEN:', fenString);
      // Falling back to starting position
      setBoard(initialBoard);
    }
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

  // Helper function to detect pawn promotion
  function isPawnPromotion(fromSquare, toSquare, piece) {
    if (!piece || piece.toLowerCase() !== 'p') return false;

    const fromRank = parseInt(fromSquare[1]); // Chess rank (1-8)
    const toRank = parseInt(toSquare[1]);     // Chess rank (1-8)
    const isWhitePawn = piece === 'P';

    // White pawn: must move from rank 7 to rank 8
    // Black pawn: must move from rank 2 to rank 1
    if (isWhitePawn) {
      return fromRank === 7 && toRank === 8;
    } else {
      return fromRank === 2 && toRank === 1;
    }
  }

  // Handle pawn promotion piece selection
  function handlePromotionChoice(piece) {
    if (promotionMove) {
      // Promotion choice selected

      // Play promotion sound if enabled
      if (userPreferences.soundEffects) {
        playSound(() => soundManager.playPromotion());
      }

      setShowPromotionModal(false);
      submitMove(promotionMove.from, promotionMove.to, piece);
      setPromotionMove(null);
    }
  }

  // Handle move confirmation
  function handleConfirmMove() {
    if (pendingMove) {
      setShowConfirmMoveModal(false);
      submitMove(pendingMove.from, pendingMove.to);
      setPendingMove(null);
    }
  }

  // Handle move cancellation
  function handleCancelMove() {
    setShowConfirmMoveModal(false);
    setPendingMove(null);

    // Play error sound if enabled
    if (userPreferences.soundEffects) {
      playSound(() => soundManager.playError());
    }
  }

  // Get legal moves for the selected piece (for visual hints)
  function getLegalMoves(fromSquare) {
    if (!game?.fen) return [];

    try {
      const chess = new Chess(game.fen);
      const moves = chess.moves({ square: fromSquare, verbose: true });
      return moves.map(move => move.to);
    } catch (error) {
      // Error getting legal moves
      return [];
    }
  }

  // Updated function for proper chess move submission
  async function submitMove(fromSquare, toSquare, promotion = null) {
    // Submitting move
    setError('');

    try {
      // Create move object in the format expected by backend
      const moveData = {
        from: fromSquare, // e.g., "e2"
        to: toSquare, // e.g., "e4"
      };

      // Add promotion if specified (for pawn promotion)
      if (promotion) {
        moveData.promotion = promotion;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/move/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          move: moveData
          // No longer sending timeLeft - backend calculates it automatically
        })
      });

      const data = await res.json();
      if (res.ok) {
        // Move submitted successfully

        // Play appropriate sound effects if enabled
        if (userPreferences.soundEffects) {
          const moveResult = data.moveResult;

          if (moveResult?.captured) {
            playSound(() => soundManager.playCapture());
          } else if (moveResult?.san?.includes('O-O')) {
            playSound(() => soundManager.playCastling());
          } else {
            playSound(() => soundManager.playMove());
          }

          // Check for game state sounds
          if (moveResult?.isCheckmate) {
            setTimeout(() => playSound(() => soundManager.playCheckmate()), 200);
          } else if (moveResult?.isCheck) {
            setTimeout(() => playSound(() => soundManager.playCheck()), 200);
          }
        }
        setMove(''); // Clear the manual input field

        // Check if game was deleted (finished)
        if (data.gameDeleted) {
          // Game finished, redirecting to dashboard
          router.push('/dashboard');
          return;
        }

        // The move response will be handled by Ably realtime update
      } else {
        // Move submission failed
        setError(data.error);

        // Play error sound if enabled
        if (userPreferences.soundEffects) {
          playSound(() => soundManager.playError());
        }
      }
    } catch (error) {
      // Network error
      setError('Failed to submit move - network error');

      // Play error sound if enabled
      if (userPreferences.soundEffects) {
        playSound(() => soundManager.playError());
      }
    }
  }

  // Timeout handling is now done automatically by the backend via time-sync

  // Handle player resignation
  async function handleResignation() {
    setShowResignationModal(true);
  }

  // Confirm resignation
  async function confirmResignation() {
    try {
      setShowResignationModal(false);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/resign/${id}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        // Resignation successful
        const data = await res.json();

        // Check if game was deleted
        if (data.gameDeleted) {
          // Game finished after resignation, redirecting
          router.push('/dashboard');
          return;
        }

        // The game end will be handled by Ably real-time update
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to resign');
      }
    } catch (error) {
      // Resignation failed
      setError('Failed to resign');
    }
  }

  // Handle draw offer
  async function handleDrawOffer() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/offer-draw/${id}`, {
        method: 'POST',
        credentials: 'include'
      });

      if (res.ok) {
        // Draw offer sent
        setNotification({
          type: 'drawOffered',
          message: 'Draw offer sent to your opponent',
        });
        setTimeout(() => setNotification(null), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to offer draw');
      }
    } catch (error) {
      // Draw offer failed
      setError('Failed to offer draw');
    }
  }

  // Handle draw response
  async function handleDrawResponse(response) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/respond-draw/${id}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response })
      });

      if (res.ok) {
        // Draw response sent
        const data = await res.json();
        setDrawOffer(null);
        setShowDrawOfferModal(false);

        if (response === 'accept') {
          // Check if game was deleted
          if (data.gameDeleted) {
            // Game finished after draw acceptance, redirecting
            router.push('/dashboard');
            return;
          }
          // Game end will be handled by Ably
        } else {
          setNotification({
            type: 'drawDeclined',
            message: 'Draw offer declined',
          });
          setTimeout(() => setNotification(null), 3000);
        }
      } else {
        const data = await res.json();
        setError(data.error || `Failed to ${response} draw`);
      }
    } catch (error) {
      // Draw response failed
      setError(`Failed to ${response} draw`);
    }
  }

  function handleSquareClick(row, col) {
    if (!game) return;
    console.log('🖱️ Square clicked:', { row, col });
    console.log('🖱️ Game state:', { userRole: game.userRole, playerColor: game.playerColor, turn: game.turn });

    // If we don't have user role info yet, allow the move (backend will validate)
    if (game.userRole && game.userRole !== 'player') {
      // Blocked: Spectator
      setError('Spectators cannot make moves');
      return;
    }

    // If we have player color info, check turn
    log({ game });
    log([game.playerColor, game.turn]);
    log([game.playerColor, game.turn !== game.playerColor]);

    if (game.playerColor && game.turn !== game.playerColor) {
      // Blocked: Not your turn
      setError('Not your turn');
      return;
    }

    if (selectedSquare) {
      // Make a move from selectedSquare to clicked square
      const fromRow = selectedSquare.row;
      const fromCol = selectedSquare.col;
      const fromPiece = board[fromRow][fromCol];
      const toPiece = board[row][col];
      // Move attempt

      // Check if there's actually a piece to move
      if (!fromPiece) {
        // Blocked: No piece at selected square
        setError('No piece selected!');
        setSelectedSquare(null);
        return;
      }

      // Check if destination has own piece (illegal)
      if (toPiece) {
        const fromPieceColor = fromPiece === fromPiece.toUpperCase() ? 'w' : 'b';
        const toPieceColor = toPiece === toPiece.toUpperCase() ? 'w' : 'b';
        if (fromPieceColor === toPieceColor) {
          // Blocked: Cannot capture own piece
          setError('You cannot capture your own pieces!');
          setSelectedSquare(null);
          return;
        }
      }

      // Convert board coordinates to chess notation
      const fromSquare = `${String.fromCharCode(97 + fromCol)}${8 - fromRow}`;
      const toSquare = `${String.fromCharCode(97 + col)}${8 - row}`;

      // Submitting move

      // Check if this is a pawn promotion move (pawn reaching last rank)
      if (isPawnPromotion(fromSquare, toSquare, fromPiece)) {
        // Pawn promotion detected

        // Auto-promote to Queen if preference is enabled
        if (userPreferences.autoQueen) {
          // Auto-promoting to Queen
          setSelectedSquare(null);
          setLegalMoves([]);
          setError('');

          // Play promotion sound if enabled
          if (userPreferences.soundEffects) {
            playSound(() => soundManager.playPromotion());
          }

          submitMove(fromSquare, toSquare, 'q');
          return;
        }

        // Show promotion modal for manual selection
        console.log('Promotion details:', {
          fromSquare,
          toSquare,
          piece: fromPiece,
          toRank: parseInt(toSquare[1]),
          isWhitePawn: fromPiece === 'P'
        });
        // Store the move for after promotion choice
        setPromotionMove({ from: fromSquare, to: toSquare });
        setShowPromotionModal(true);
        setSelectedSquare(null);
        return;
      }

      // Clear selection and errors immediately for responsive UI
      setSelectedSquare(null);
      setLegalMoves([]);
      setError('');

      // Check if move confirmation is enabled
      if (userPreferences.confirmMoves) {
        // Store the move for confirmation
        setPendingMove({ from: fromSquare, to: toSquare });
        setShowConfirmMoveModal(true);
        return;
      }

      // Submit the move with proper chess notation
      submitMove(fromSquare, toSquare);
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

          // Get legal moves for this piece
          const fromSquare = `${String.fromCharCode(97 + col)}${8 - row}`;
          const moves = getLegalMoves(fromSquare);
          setLegalMoves(moves);
          console.log('📍 Legal moves for', fromSquare, ':', moves);
        } else {
          console.log('❌ Blocked: Wrong piece for current turn');
          setError(`It's ${game.turn === 'w' ? 'White' : 'Black'}'s turn. You can only move ${game.turn === 'w' ? 'white' : 'black'} pieces.`);
        }
      }
    }
  }

  if (!game) {
    console.log(game, 382)
    return <div>Loading...</div>;
  }

  // Helper function to format time as MM:SS
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* Main Container */}
      <div className="container mx-auto p-6 max-w-7xl relative z-10 max-h-vh overflow-y">
        {/* Header */}
        <div className="text-center mb-8 sticky top-0">
          <div className="mb-4">
            <h1 className="text-5xl font-black tracking-wide mb-2">
              <span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                CHESS
              </span>
              <span className="text-white">CHAMP</span>
            </h1>
            <div className="h-1 w-24 mx-auto chess-gold-gradient rounded-full"></div>
          </div>
          <div className="w-full flex justify-between items-center text-sm text-gray-300 font-mono px-4 py-2 gap-2">

            <div className="text-sm text-gray-300 font-mono glass rounded-2xl px-4 py-2 inline-block backdrop-blur-sm">
              Battle ID: <span className="text-yellow-400 font-bold">{id?.substring(0, 8)}</span>
            </div>
            <div className="text-sm text-gray-300 font-mono glass rounded-2xl px-4 py-2 inline-block backdrop-blur-sm">
              <div className="flex items-center justify-center space-x-2">
                <span>Current Turn:</span>
                <span className={`font-bold ${game?.turn === 'w' ? 'text-yellow-400' : 'text-gray-300'}`}>
                  {game?.turn === 'w' ? '♔ White' : '♚ Black'}
                </span>
              </div>
            </div>
            <div className="text-sm text-gray-300 font-mono px-4 py-2 inline-block">
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
            </div>
          </div>
        </div>
        {/* Navigation */}
        <div className="w-full mb-4 flex gap-4">
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="cursor-pointer bg-black border border-white/20 hover:border-yellow-400/50 text-white hover:text-yellow-400 px-8 py-4 rounded-2xl font-bold text-md transition-all duration-300 hover:scale-105 backdrop-blur-sm flex items-center space-x-2"
          >
            <span>←</span>
            <span>Return to Arena</span>
          </button>


        </div>
        {/* Game Layout - Simple 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4">

          {/* Top Row: Left and Right Players */}
          <div className="col-span-1">
            {/* White Player (Left) */}
            <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 border-4 border-yellow-300 rounded-full mx-auto mb-4 flex items-center justify-center shadow-xl">
                  <span className="text-3xl font-bold text-black">♔</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">White Champion</h3>
                <p className={`mb-6 text-xl transition-all duration-300 ${game?.white?.name ? 'text-emerald-400 font-semibold' : 'text-gray-300 animate-pulse'}`}>
                  {game?.white?.name || 'Awaiting Challenger...'}
                  {game?.white?.name && game?.status === 'active' && ' ✅'}
                </p>
                {/* Timer */}
                <div className={`transition-all duration-300 ${game?.turn === 'w'
                  ? 'border-yellow-400  chess-gold-gradient text-black pulse-glow'
                  : 'border-gray-600  text-white'
                  }`}>
                  <div className="text-4xl font-mono font-black mb-2">
                    {formatTime(timeLeft.w)}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    {game?.turn === 'w' ? '⚡ YOUR MOVE' : '⏳ WAITING'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-span-1">
            {/* Black Player (Right) */}
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
                <div className={`transition-all duration-300 ${game?.turn === 'b'
                  ? 'border-yellow-400 chess-gold-gradient text-black pulse-glow'
                  : 'border-gray-600 text-white'
                  }`}>
                  <div className="text-4xl font-mono font-black mb-2">
                    {formatTime(timeLeft.b)}
                  </div>
                  <div className="text-sm font-bold uppercase tracking-wider">
                    {game?.turn === 'b' ? '⚡ YOUR MOVE' : '⏳ WAITING'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Chess Board (Left) and Actions (Right) */}
          <div className="col-span-2">
            {/* Status Messages */}
            <div className="text-center mt-4 space-y-4">
              {selectedSquare && (
                <div className="inline-block glass rounded-2xl px-6 py-3 text-yellow-400 font-mono font-bold backdrop-blur-sm border border-yellow-400/30">
                  🎯 Selected: {String.fromCharCode(97 + selectedSquare.col)}{8 - selectedSquare.row}
                </div>
              )}
              {error && (
                <div className="inline-block bg-gray-800 rounded-2xl px-6 py-3  text-red-500 font-semibold backdrop-blur-sm border border-red-400/30 mb-4">
                  ⚠️ {error}
                </div>
              )}
            </div>
            {/* Chess Board */}
            <div className="flex flex-col justify-center mb-6 bg-black rounded-md">
              <ChessBoard
                board={board}
                onSquareClick={handleSquareClick}
                preferences={userPreferences}
                selectedSquare={selectedSquare}
                legalMoves={legalMoves}
              />

              {/* Game Actions */}
              {game?.status === 'active' && game?.userRole === 'player' && (
                <div className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20 h-full">
                  <h4 className="text-lg font-bold text-white mb-4 text-center flex items-center justify-center space-x-2">
                    <span>⚔️</span>
                    <span>Battle Actions</span>
                  </h4>
                  <div className="space-y-4">
                    <button
                      onClick={handleDrawOffer}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 flex items-center justify-center space-x-2 border-2 border-blue-500/50"
                    >
                      <span>🤝</span>
                      <span>OFFER DRAW</span>
                    </button>
                    <button
                      onClick={handleResignation}
                      className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 flex items-center justify-center space-x-2 border-2 border-red-500/50"
                    >
                      <span>🏳️</span>
                      <span>RESIGN</span>
                    </button>
                    <div className="text-center text-xs text-gray-400 px-2">
                      Propose a draw or forfeit the match
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>



      {/* Game End Modal */}
      {showGameEndModal && gameResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-12 max-w-lg w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-24 h-24 chess-gold-gradient rounded-full mx-auto mb-8 flex items-center justify-center shadow-2xl">
                <span className="text-5xl">{gameResult.isDraw ? '🤝' : '🏆'}</span>
              </div>
              <h2 className="text-4xl font-black text-white mb-4">
                {gameResult.isDraw ? 'Battle Draw!' : 'Battle Complete!'}
              </h2>
              {gameResult.isDraw ? (
                <div className="text-3xl font-black text-blue-400 mb-4">
                  🤝 Honorable Draw 🤝
                </div>
              ) : (
                <div className="text-3xl font-black text-yellow-400 mb-4">
                  🎊 {gameResult.winner} Victorious! 🎊
                </div>
              )}
              <p className="text-gray-300 mb-4 text-lg font-semibold">{gameResult.reason}</p>
              <div className="glass rounded-2xl p-4 mb-8 backdrop-blur-sm border border-yellow-400/30">
                {gameResult.isDraw ? (
                  <>
                    <div className="text-gray-300 text-sm mt-1">🤝 Honor • 🎯 Skill • ⚖️ Balance</div>
                  </>
                ) : (
                  <>

                    <div className="text-gray-300 text-sm mt-1">🏆 Glory • 💎 Honor • ⚡ Dominance</div>
                  </>
                )}
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

      {/* Pawn Promotion Modal */}
      {showPromotionModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <span className="text-2xl">♕</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Pawn Promotion!</h2>
              <p className="text-gray-300 mb-6 text-lg">Choose your promotion piece:</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => handlePromotionChoice('q')}
                  className="glass rounded-2xl p-6 hover:border-yellow-400/50 border border-white/20 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">♕</div>
                  <div className="text-white font-bold">Queen</div>
                  <div className="text-gray-400 text-sm">Most powerful</div>
                </button>

                <button
                  onClick={() => handlePromotionChoice('r')}
                  className="glass rounded-2xl p-6 hover:border-yellow-400/50 border border-white/20 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">♖</div>
                  <div className="text-white font-bold">Rook</div>
                  <div className="text-gray-400 text-sm">Straight lines</div>
                </button>

                <button
                  onClick={() => handlePromotionChoice('b')}
                  className="glass rounded-2xl p-6 hover:border-yellow-400/50 border border-white/20 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">♗</div>
                  <div className="text-white font-bold">Bishop</div>
                  <div className="text-gray-400 text-sm">Diagonal moves</div>
                </button>

                <button
                  onClick={() => handlePromotionChoice('n')}
                  className="glass rounded-2xl p-6 hover:border-yellow-400/50 border border-white/20 transition-all duration-300 hover:scale-105 group"
                >
                  <div className="text-6xl mb-2 group-hover:scale-110 transition-transform">♘</div>
                  <div className="text-white font-bold">Knight</div>
                  <div className="text-gray-400 text-sm">L-shaped jumps</div>
                </button>
              </div>

              <p className="text-gray-400 text-sm">Click a piece to promote your pawn</p>
            </div>
          </div>
        </div>
      )}

      {/* Draw Offer Modal */}
      {showDrawOfferModal && drawOffer && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <span className="text-2xl">🤝</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Draw Offer</h2>
              <p className="text-gray-300 mb-2 text-lg">
                <span className="font-semibold text-blue-400">
                  {drawOffer.color === 'white' ? 'White' : 'Black'}
                </span> has offered a draw
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                Do you accept the draw and end the game?
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleDrawResponse('accept')}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  ✅ ACCEPT
                </button>

                <button
                  onClick={() => handleDrawResponse('decline')}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  ❌ DECLINE
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-4">
                Accepting will end the game as a draw
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Move Modal */}
      {showConfirmMoveModal && pendingMove && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <span className="text-2xl">✅</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Confirm Move</h2>
              <p className="text-gray-300 mb-2 text-lg">
                Move from <span className="font-bold text-yellow-400">{pendingMove.from}</span> to <span className="font-bold text-yellow-400">{pendingMove.to}</span>
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                Do you want to make this move?
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={handleConfirmMove}
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  ✅ CONFIRM
                </button>

                <button
                  onClick={handleCancelMove}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  ❌ CANCEL
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-4">
                This setting can be changed in your profile preferences
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resignation Confirmation Modal */}
      {showResignationModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-red-700 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                <span className="text-2xl">🏳️</span>
              </div>
              <h2 className="text-3xl font-black text-white mb-4">Confirm Resignation</h2>
              <p className="text-gray-300 mb-2 text-lg">
                Are you sure you want to resign?
              </p>
              <p className="text-gray-400 mb-6 text-sm">
                This will end the game immediately and your opponent will be declared the winner.
              </p>

              <div className="flex space-x-4">
                <button
                  onClick={() => setShowResignationModal(false)}
                  className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  ❌ CANCEL
                </button>

                <button
                  onClick={confirmResignation}
                  className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-3 px-6 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  🏳️ RESIGN
                </button>
              </div>

              <p className="text-gray-400 text-xs mt-4">
                This action cannot be undone
              </p>
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

      {/* Other Notifications */}
      {notification && ['drawOffered', 'drawDeclined'].includes(notification.type) && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
          <div className={`glass rounded-2xl p-6 backdrop-blur-xl shadow-2xl ${notification.type === 'drawOffered'
            ? 'border border-blue-400/50 bg-blue-500/20 shadow-blue-500/25'
            : 'border border-orange-400/50 bg-orange-500/20 shadow-orange-500/25'
            }`}>
            <div className="flex items-center space-x-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center animate-pulse ${notification.type === 'drawOffered'
                ? 'bg-blue-500' : 'bg-orange-500'
                }`}>
                <span className="text-2xl">{notification.type === 'drawOffered' ? '🤝' : '❌'}</span>
              </div>
              <div>
                <div className={`font-bold text-lg ${notification.type === 'drawOffered'
                  ? 'text-blue-400' : 'text-orange-400'
                  }`}>
                  {notification.message}
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className={`hover:text-white transition-colors ${notification.type === 'drawOffered'
                  ? 'text-blue-400' : 'text-orange-400'
                  }`}
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game End Modal */}
      {showGameEndModal && gameResult && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-lg flex items-center justify-center z-50">
          <div className="glass rounded-3xl p-8 max-w-lg w-full mx-4 chess-shadow backdrop-blur-xl border border-white/20">
            <div className="text-center">
              {/* Icon based on game result */}
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-2xl ${gameResult.isDraw
                ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                : gameResult.winner === 'White'
                  ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                  : 'bg-gradient-to-br from-gray-600 to-gray-800'
                }`}>
                {gameResult.isDraw ? (
                  <span className="text-3xl">🤝</span>
                ) : gameResult.winner === 'White' ? (
                  <span className="text-3xl text-black">♔</span>
                ) : (
                  <span className="text-3xl text-white">♚</span>
                )}
              </div>

              {/* Game Result Title */}
              <h2 className="text-4xl font-black mb-4">
                {gameResult.isDraw ? (
                  <span className="text-yellow-400">DRAW</span>
                ) : (
                  <span className={gameResult.winner === 'White' ? 'text-yellow-400' : 'text-gray-300'}>
                    {gameResult.winner?.toUpperCase()} WINS!
                  </span>
                )}
              </h2>

              {/* Reason */}
              <div className="mb-6">
                <p className="text-xl text-gray-300 mb-2">
                  {gameResult.reason}
                </p>
                {!gameResult.isDraw && (
                  <p className="text-lg font-semibold">
                    <span className={gameResult.winner === 'White' ? 'text-yellow-400' : 'text-gray-300'}>
                      {gameResult.winner} Champion
                    </span>
                    <span className="text-gray-400"> is victorious!</span>
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-4 justify-center">
                <button
                  onClick={() => {
                    setShowGameEndModal(false);
                    window.location.href = '/dashboard';
                  }}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-8 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  🏟️ BACK TO ARENA
                </button>

                <button
                  onClick={() => {
                    setShowGameEndModal(false);
                    window.location.reload();
                  }}
                  className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-8 rounded-2xl font-bold transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95"
                >
                  🔄 REMATCH
                </button>
              </div>

              <p className="text-gray-400 text-sm mt-6">
                Great game! 🎉
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

