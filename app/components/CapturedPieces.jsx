/**
	* CapturedPieces - Simple side tray for captured pieces
	* Shows captured pieces in a vertical side panel without labels
	*/
export function CapturedPieces({ whiteCaptured = [], blackCaptured = [] }) {
	// Use the same symbols but style them with CSS colors
	const pieceSymbols = {
		p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚'
	};

	return (
		<div className="w-14 bg-slate-800 border-l border-slate-600 py-4 px-2 flex flex-col gap-3 min-h-[400px]">
			{/* Captured Black Pieces (shown at top) */}
			<div className="flex flex-col gap-2 items-center">
				{blackCaptured.map((piece, index) => (
					<span
						key={`black-${index}`}
						className="text-xl text-gray-900 hover:scale-110 transition-transform cursor-default drop-shadow-md"
						title={`Captured black ${piece}`}
						style={{
							filter: 'brightness(0.1)',
							textShadow: '0 0 3px rgba(255,255,255,0.3)'
						}}
					>
						{pieceSymbols[piece.toLowerCase()]}
					</span>
				))}
			</div>

			{/* Spacer */}
			<div className="flex-1"></div>

			{/* Captured White Pieces (shown at bottom) */}
			<div className="flex flex-col gap-2 items-center">
				{whiteCaptured.map((piece, index) => (
					<span
						key={`white-${index}`}
						className="text-xl text-white hover:scale-110 transition-transform cursor-default drop-shadow-lg"
						title={`Captured white ${piece}`}
						style={{
							textShadow: '0 0 4px rgba(0,0,0,0.8)'
						}}
					>
						{pieceSymbols[piece.toLowerCase()]}
					</span>
				))}
			</div>
		</div>
	);
}

export default CapturedPieces;
