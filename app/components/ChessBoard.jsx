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

// Piece symbols for display
export const pieceSymbols = {
	// White pieces (uppercase)
	'K': '♔', 'Q': '♕', 'R': '♖', 'B': '♗', 'N': '♘', 'P': '♙',
	// Black pieces (lowercase)
	'k': '♚', 'q': '♛', 'r': '♜', 'b': '♝', 'n': '♞', 'p': '♟'
};

export function ChessBoard({ board = initialBoard, onSquareClick }) {
	console.log('ChessBoard rendering with board:', board);

	return (
		<div className="inline-block relative w-full max-w-3xl mx-auto">
			{/* Chess board frame */}
			<div className="p-4 sm:p-6">
				{/* Coordinates - Top */}
				<div className="flex justify-center mb-3 sm:mb-4">
					<div className="grid grid-cols-8 gap-0 w-full">
						{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
							<div key={letter} className="text-center text-yellow-400 font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center">
								{letter}
							</div>
						))}
					</div>
				</div>

				{/* Chess board with side coordinates */}
				<div className="flex items-center justify-center gap-2 sm:gap-4">
					{/* Left coordinates */}
					<div className="flex flex-col">
						{[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
							<div key={number} className="text-yellow-400 font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center">
								{number}
							</div>
						))}
					</div>

					{/* The board */}
					<div className="grid grid-cols-8 grid-rows-8 border-2 sm:border-4 border-yellow-400/30 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex-1 max-w-4xl">
						{board.map((row, rowIndex) =>
							row.map((piece, colIndex) => {
								const isLight = (rowIndex + colIndex) % 2 === 0;
								const isWhitePiece = piece && piece === piece.toUpperCase();

								// Premium color scheme
								const squareClasses = isLight
								
									? 'bg-gradient-to-br from-amber-50 to-amber-100' // Light squares
									: 'bg-gradient-to-br from-amber-800 to-amber-900'; // Dark squares

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
											transition-all duration-300
											relative group
											border border-amber-600/20
											${isWhitePiece ? 'text-white' : 'text-black'}
										`}
										style={{
											textShadow: isWhitePiece
												? '2px 2px 4px rgba(0,0,0,0.8), 0 0 8px rgba(0,0,0,0.6)'
												: '2px 2px 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7)'
										}}
									>
										{/* Hover effect overlay */}
										<div className="absolute inset-0 bg-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

										{/* Chess piece */}
										{piece && (
											<span className="relative z-10 drop-shadow-lg hover:scale-110 transition-transform duration-300 filter drop-shadow-xl">
												{pieceSymbols[piece]}
											</span>
										)}

										{/* Coordinate labels */}
										{rowIndex === 7 && (
											<span className="absolute bottom-0.5 right-0.5 text-xs font-mono text-amber-700/60 z-0">
												{String.fromCharCode(97 + colIndex)}
											</span>
										)}
										{colIndex === 0 && (
											<span className="absolute top-0.5 left-0.5 text-xs font-mono text-amber-700/60 z-0">
												{8 - rowIndex}
											</span>
										)}
									</div>
								);
							})
						)}
					</div>

					{/* Right coordinates */}
					<div className="flex flex-col">
						{[8, 7, 6, 5, 4, 3, 2, 1].map(number => (
							<div key={number} className="text-yellow-400 font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center">
								{number}
							</div>
						))}
					</div>
				</div>

				{/* Coordinates - Bottom */}
				<div className="flex justify-center mt-3 sm:mt-4">
					<div className="grid grid-cols-8 gap-0 w-full">
						{['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(letter => (
							<div key={letter} className="text-center text-yellow-400 font-bold text-sm sm:text-base lg:text-lg aspect-square flex items-center justify-center">
								{letter}
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
