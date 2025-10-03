// Initial chess board setup
export const initialBoard = [
	['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'], // Black back rank
	['p', 'p', 'p', 'p', 'p', 'p', 'p', 'p'], // Black pawns
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	[null, null, null, null, null, null, null, null],
	['P', 'P', 'P', 'P', 'P', 'P', 'P', 'P'], // White pawns
	['R', 'N', 'B', 'Q', 'K', 'B', 'N', 'R'], // White back rank
];

// Different piece sets for piece style preferences
export const pieceSets = {
	traditional: {
		// White pieces (uppercase)
		'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
		// Black pieces (lowercase)
		'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
	},
	modern: {
		// White pieces (uppercase) - outlined versions
		'K': '♚', 'Q': '♛', 'R': '♜', 'B': '♝', 'N': '♞', 'P': '♟',
		// Black pieces (lowercase) - filled versions  
		'k': '♔', 'q': '♕', 'r': '♖', 'b': '♗', 'n': '♘', 'p': '♙'
	},
	minimalist: {
		// White pieces (uppercase)
		'K': '⚪', 'Q': '⚫', 'R': '⬜', 'B': '⬛', 'N': '🔳', 'P': '🔲',
		// Black pieces (lowercase)
		'k': '⚫', 'q': '⚪', 'r': '⬛', 'b': '⬜', 'n': '🔲', 'p': '🔳'
	}
};

// Legacy support - default to traditional
export const pieceSymbols = pieceSets.traditional;

export function ChessBoard({ board = initialBoard, onSquareClick, preferences = {}, selectedSquare = null, legalMoves = [] }) {
	// Default preferences
	const defaultPreferences = {
		boardStyle: 'classic',
		pieceStyle: 'traditional',
		theme: 'dark',
		showCoordinates: true,
		highlightMoves: true
	};

	const prefs = { ...defaultPreferences, ...preferences };

	// Board style configurations
	const boardStyles = {
		classic: {
			light: 'bg-gradient-to-br from-amber-50 to-amber-100',
			dark: 'bg-gradient-to-br from-amber-800 to-amber-900',
			border: 'border-yellow-400/30',
			coordColor: 'text-yellow-400'
		},
		modern: {
			light: 'bg-gradient-to-br from-slate-100 to-slate-200',
			dark: 'bg-gradient-to-br from-slate-700 to-slate-800',
			border: 'border-blue-400/30',
			coordColor: 'text-blue-400'
		},
		wood: {
			light: 'bg-gradient-to-br from-amber-200 to-yellow-300',
			dark: 'bg-gradient-to-br from-amber-700 to-yellow-800',
			border: 'border-amber-600/50',
			coordColor: 'text-amber-400'
		},
		marble: {
			light: 'bg-gradient-to-br from-gray-50 to-white',
			dark: 'bg-gradient-to-br from-gray-500 to-gray-600',
			border: 'border-gray-400/40',
			coordColor: 'text-gray-600'
		}
	};

	// Theme configurations
	const themeStyles = {
		dark: {
			background: 'bg-gray-900',
			text: 'text-white'
		},
		light: {
			background: 'bg-white',
			text: 'text-gray-900'
		},
		auto: {
			background: 'bg-gray-900', // Default to dark for now
			text: 'text-white'
		}
	};

	const currentBoardStyle = boardStyles[prefs.boardStyle] || boardStyles.classic;
	const animationClass = 'duration-300'; // Fixed animation speed
	const currentTheme = themeStyles[prefs.theme] || themeStyles.dark;
	const currentPieceSet = pieceSets[prefs.pieceStyle] || pieceSets.traditional;

	// Helper function to check if a square is a legal move destination
	const isLegalMoveSquare = (row, col) => {
		if (!prefs.highlightMoves || !selectedSquare || !legalMoves.length) return false;
		const squareNotation = `${String.fromCharCode(97 + col)}${8 - row}`;
		return legalMoves.includes(squareNotation);
	};

	// Helper function to check if a square is selected
	const isSelectedSquare = (row, col) => {
		return selectedSquare && selectedSquare.row === row && selectedSquare.col === col;
	};

	return (
		<div className={`inline-block relative w-full max-w-3xl mx-auto ${currentTheme.background} ${currentTheme.text} transition-all ${animationClass} rounded-2xl`}>
			{/* Chess board frame */}
			<div className="p-4 sm:p-6">
				{/* Coordinates - Top */}
				{prefs.showCoordinates && (
					<div className="flex justify-center mb-3 sm:mb-4">
						<div className="grid grid-cols-8 gap-0 w-full">
							{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
								<div key={letter} className={`text-center ${currentBoardStyle.coordColor} font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center transition-all ${animationClass}`}>
									{letter}
								</div>
							))}
						</div>
					</div>
				)}

				{/* Chess board with side coordinates */}
				<div className="flex items-center justify-center gap-2 sm:gap-4">
					{/* Left coordinates */}
					{prefs.showCoordinates && (
						<div className="flex flex-col">
							{[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
								<div key={number} className={`${currentBoardStyle.coordColor} font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center transition-all ${animationClass}`}>
									{number}
								</div>
							))}
						</div>
					)}

					{/* The board */}
					<div className={`grid grid-cols-8 grid-rows-8 border-2 sm:border-4 ${currentBoardStyle.border} rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex-1 max-w-4xl`}>
						{board.map((row, rowIndex) =>
							row.map((piece, colIndex) => {
								const isLight = (rowIndex + colIndex) % 2 === 0;
								const isWhitePiece = piece && piece === piece.toUpperCase();

								// Dynamic board style based on preferences
								const squareClasses = isLight ? currentBoardStyle.light : currentBoardStyle.dark;

								const isSelected = isSelectedSquare(rowIndex, colIndex);
								const isLegalMove = isLegalMoveSquare(rowIndex, colIndex);

								return (
									<div
										key={`${rowIndex}-${colIndex}`}
										onClick={() => onSquareClick && onSquareClick(rowIndex, colIndex)}
										className={`
											${squareClasses}
											aspect-square w-full
											flex items-center justify-center 
											text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold
											cursor-pointer select-none
											hover:brightness-110 
											transition-all ${animationClass}
											relative group
											border border-opacity-20
											${isWhitePiece ? 'text-white' : 'text-black'}
											${isSelected ? 'ring-4 ring-yellow-400 ring-opacity-70' : ''}
										`}
										style={{
											textShadow: isWhitePiece
												? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
												: '2px 2px 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7)'
										}}
									>
										{/* Hover effect overlay */}
										<div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

										{/* Selected square highlight */}
										{isSelected && (
											<div className="absolute inset-0 bg-yellow-400/30 animate-pulse border-2 border-yellow-400 rounded-lg"></div>
										)}

										{/* Legal move dot marker */}
										{isLegalMove && !piece && (
											<div className="absolute inset-0 flex items-center justify-center z-20">
												<div className="w-3 h-3 bg-green-400 rounded-full opacity-80 animate-pulse shadow-lg"></div>
											</div>
										)}
										{isLegalMove && piece && (
											<div className="absolute inset-0 rounded-lg border-3 border-green-400 opacity-70 animate-pulse"></div>
										)}

										{/* Chess piece */}
										{piece && (
											<span className={`relative z-10 drop-shadow-lg hover:scale-110 transition-all ${animationClass} filter drop-shadow-xl animate-pulse-subtle`}>
												{currentPieceSet[piece]}
											</span>
										)}

										{/* Coordinate labels */}
										{prefs.showCoordinates && rowIndex === 7 && (
											<span className="absolute bottom-0.5 right-0.5 text-xs font-mono opacity-60 z-0">
												{String.fromCharCode(97 + colIndex)}
											</span>
										)}
										{prefs.showCoordinates && colIndex === 0 && (
											<span className="absolute top-0.5 left-0.5 text-xs font-mono opacity-60 z-0">
												{8 - rowIndex}
											</span>
										)}
									</div>
								);
							})
						)}
					</div>

					{/* Right coordinates */}
					{prefs.showCoordinates && (
						<div className="flex flex-col">
							{[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
								<div key={number} className={`${currentBoardStyle.coordColor} font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center transition-all ${animationClass}`}>
									{number}
								</div>
							))}
						</div>
					)}
				</div>

				{/* Coordinates - Bottom */}
				{prefs.showCoordinates && (
					<div className="flex justify-center mt-3 sm:mt-4">
						<div className="grid grid-cols-8 gap-0 w-full">
							{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
								<div key={letter} className={`text-center ${currentBoardStyle.coordColor} font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center transition-all ${animationClass}`}>
									{letter}
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
