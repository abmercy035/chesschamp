'use client';

import Navigation from '../components/Navigation';
import Link from 'next/link';

export default function RulesPage() {
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
			{/* Navigation */}
			<Navigation currentPage="rules" />

			{/* Animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-6xl relative z-10 space-y-12">
				{/* Header */}
				<div className="text-center space-y-6">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
						♟️ Chess Rules & Regulations
					</h1>
					<p className="text-gray-400 text-lg">
						Master the ancient game of strategy with complete rules and guidelines
					</p>
				</div>

				{/* Quick Navigation */}
				<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
					<h2 className="text-2xl font-bold text-white mb-4">📋 Quick Navigation</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<a href="#basic-rules" className="text-yellow-400 hover:text-yellow-300 transition-colors">
							🏁 Basic Rules
						</a>
						<a href="#piece-movements" className="text-yellow-400 hover:text-yellow-300 transition-colors">
							♞ Piece Movements
						</a>
						<a href="#special-moves" className="text-yellow-400 hover:text-yellow-300 transition-colors">
							✨ Special Moves
						</a>
						<a href="#game-end" className="text-yellow-400 hover:text-yellow-300 transition-colors">
							🏆 Game Endings
						</a>
					</div>
				</div>

				{/* Basic Rules Section */}
				<section id="basic-rules" className="space-y-6">
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
							<span className="mr-3">🏁</span>
							Basic Rules
						</h2>

						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="text-xl font-semibold text-yellow-400">🎯 Objective</h3>
								<p className="text-gray-300">
									The goal is to checkmate your opponent's king. This means placing the enemy king under attack
									in a way that it cannot escape capture on the next move.
								</p>

								<h3 className="text-xl font-semibold text-yellow-400">⚡ Turn Order</h3>
								<ul className="text-gray-300 space-y-2">
									<li>• White always moves first</li>
									<li>• Players alternate turns</li>
									<li>• You must move when it's your turn (except in stalemate)</li>
									<li>• Only one piece can be moved per turn (except castling)</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="text-xl font-semibold text-yellow-400">📐 Board Setup</h3>
								<ul className="text-gray-300 space-y-2">
									<li>• 8x8 board with 64 squares</li>
									<li>• White square in bottom-right corner</li>
									<li>• Queens start on their own color</li>
									<li>• Kings start next to queens</li>
								</ul>

								<h3 className="text-xl font-semibold text-yellow-400">⏰ Time Controls</h3>
								<p className="text-gray-300">
									Each player gets 5 minutes for the entire game. If you run out of time, you lose!
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Piece Movements Section */}
				<section id="piece-movements" className="space-y-6">
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
							<span className="mr-3">♞</span>
							Piece Movements
						</h2>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* King */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♔</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">King</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Moves one square in any direction</li>
									<li>• Cannot move into check</li>
									<li>• Most important piece to protect</li>
									<li>• Can castle under specific conditions</li>
								</ul>
							</div>

							{/* Queen */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♕</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">Queen</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Most powerful piece</li>
									<li>• Moves any distance horizontally</li>
									<li>• Moves any distance vertically</li>
									<li>• Moves any distance diagonally</li>
								</ul>
							</div>

							{/* Rook */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♖</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">Rook</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Moves any distance horizontally</li>
									<li>• Moves any distance vertically</li>
									<li>• Cannot move diagonally</li>
									<li>• Used in castling maneuver</li>
								</ul>
							</div>

							{/* Bishop */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♗</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">Bishop</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Moves any distance diagonally</li>
									<li>• Cannot move horizontally/vertically</li>
									<li>• Stays on same color squares</li>
									<li>• You have one light and one dark bishop</li>
								</ul>
							</div>

							{/* Knight */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♘</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">Knight</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Moves in "L" shape: 2+1 squares</li>
									<li>• Only piece that can "jump" over others</li>
									<li>• Always lands on opposite color square</li>
									<li>• Can be tricky for beginners</li>
								</ul>
							</div>

							{/* Pawn */}
							<div className="bg-white/5 rounded-xl p-6 border border-white/10">
								<div className="text-center mb-4">
									<span className="text-4xl">♙</span>
									<h3 className="text-xl font-semibold text-yellow-400 mt-2">Pawn</h3>
								</div>
								<ul className="text-gray-300 space-y-1 text-sm">
									<li>• Moves forward one square</li>
									<li>• Can move two squares from starting position</li>
									<li>• Captures diagonally forward</li>
									<li>• Can promote when reaching end</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Special Moves Section */}
				<section id="special-moves" className="space-y-6">
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
							<span className="mr-3">✨</span>
							Special Moves
						</h2>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Castling */}
							<div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
								<h3 className="text-xl font-semibold text-blue-400 mb-4">🏰 Castling</h3>
								<div className="space-y-3 text-gray-300 text-sm">
									<p><strong>Purpose:</strong> Protect your king and develop your rook</p>
									<p><strong>Requirements:</strong></p>
									<ul className="space-y-1 ml-4">
										<li>• King hasn't moved</li>
										<li>• Chosen rook hasn't moved</li>
										<li>• No pieces between king and rook</li>
										<li>• King not in check</li>
										<li>• King doesn't pass through check</li>
									</ul>
									<p><strong>How:</strong> King moves 2 squares toward rook, rook moves to square king passed over</p>
								</div>
							</div>

							{/* En Passant */}
							<div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
								<h3 className="text-xl font-semibold text-green-400 mb-4">👻 En Passant</h3>
								<div className="space-y-3 text-gray-300 text-sm">
									<p><strong>Purpose:</strong> Special pawn capture move</p>
									<p><strong>Requirements:</strong></p>
									<ul className="space-y-1 ml-4">
										<li>• Enemy pawn just moved 2 squares</li>
										<li>• Your pawn is beside it</li>
										<li>• Must capture immediately</li>
									</ul>
									<p><strong>How:</strong> Move your pawn diagonally behind the enemy pawn, remove the enemy pawn</p>
								</div>
							</div>

							{/* Pawn Promotion */}
							<div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
								<h3 className="text-xl font-semibold text-purple-400 mb-4">👑 Pawn Promotion</h3>
								<div className="space-y-3 text-gray-300 text-sm">
									<p><strong>Purpose:</strong> Transform pawn into powerful piece</p>
									<p><strong>Requirements:</strong></p>
									<ul className="space-y-1 ml-4">
										<li>• Pawn reaches opposite end of board</li>
									</ul>
									<p><strong>How:</strong> Choose Queen, Rook, Bishop, or Knight (usually Queen)</p>
									<p><strong>Note:</strong> You can have multiple queens!</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Game Endings Section */}
				<section id="game-end" className="space-y-6">
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
							<span className="mr-3">🏆</span>
							How Games End
						</h2>

						<div className="grid md:grid-cols-2 gap-8">
							{/* Winning Ways */}
							<div className="space-y-6">
								<h3 className="text-2xl font-semibold text-green-400">✅ Ways to Win</h3>

								<div className="space-y-4">
									<div className="bg-green-500/10 rounded-lg p-4 border border-green-500/30">
										<h4 className="font-semibold text-green-300 mb-2">♔ Checkmate</h4>
										<p className="text-gray-300 text-sm">
											Enemy king is under attack and has no legal moves to escape capture. This is the ultimate victory!
										</p>
									</div>

									<div className="bg-orange-500/10 rounded-lg p-4 border border-orange-500/30">
										<h4 className="font-semibold text-orange-300 mb-2">⏰ Time Out</h4>
										<p className="text-gray-300 text-sm">
											Your opponent runs out of time on their clock. Quick thinking wins the day!
										</p>
									</div>

									<div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
										<h4 className="font-semibold text-red-300 mb-2">🏳️ Resignation</h4>
										<p className="text-gray-300 text-sm">
											Your opponent gives up. Sometimes the position becomes hopeless and resignation is the honorable choice.
										</p>
									</div>
								</div>
							</div>

							{/* Draw Conditions */}
							<div className="space-y-6">
								<h3 className="text-2xl font-semibold text-blue-400">🤝 Draw Conditions</h3>

								<div className="space-y-4">
									<div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
										<h4 className="font-semibold text-blue-300 mb-2">🚫 Stalemate</h4>
										<p className="text-gray-300 text-sm">
											A player has no legal moves but their king is not in check. The game ends in a draw.
										</p>
									</div>

									<div className="bg-gray-500/10 rounded-lg p-4 border border-gray-500/30">
										<h4 className="font-semibold text-gray-300 mb-2">🔄 Threefold Repetition</h4>
										<p className="text-gray-300 text-sm">
											The same position occurs three times with the same player to move. Either player can claim a draw.
										</p>
									</div>

									<div className="bg-purple-500/10 rounded-lg p-4 border border-purple-500/30">
										<h4 className="font-semibold text-purple-300 mb-2">📏 50-Move Rule</h4>
										<p className="text-gray-300 text-sm">
											50 moves pass without a pawn move or piece capture. Either player can claim a draw.
										</p>
									</div>

									<div className="bg-yellow-500/10 rounded-lg p-4 border border-yellow-500/30">
										<h4 className="font-semibold text-yellow-300 mb-2">🤝 Mutual Agreement</h4>
										<p className="text-gray-300 text-sm">
											Both players agree to a draw. This often happens when the position is equal or repetitive.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* ChessChamp Specific Rules */}
				<section className="space-y-6">
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-6 flex items-center">
							<span className="mr-3">⚡</span>
							ChessChamp Platform Rules
						</h2>

						<div className="grid md:grid-cols-2 gap-8">
							<div className="space-y-4">
								<h3 className="text-xl font-semibold text-yellow-400">🎮 Game Format</h3>
								<ul className="text-gray-300 space-y-2">
									<li>• <strong>Time Control:</strong> 5 minutes per player (Blitz)</li>
									<li>• <strong>Rating System:</strong> ELO-based ranking (starts at 1200)</li>
									<li>• <strong>Matchmaking:</strong> Paired with players of similar skill</li>
									<li>• <strong>Fair Play:</strong> Computer assistance is strictly prohibited</li>
								</ul>
							</div>

							<div className="space-y-4">
								<h3 className="text-xl font-semibold text-yellow-400">🏆 Scoring & Rankings</h3>
								<ul className="text-gray-300 space-y-2">
									<li>• <strong>Win:</strong> +16 to +32 ELO points (depends on opponent rating)</li>
									<li>• <strong>Draw:</strong> +/- 0 to 8 ELO points</li>
									<li>• <strong>Loss:</strong> -16 to -32 ELO points</li>
									<li>• <strong>Ranks:</strong> From Novice (800) to Grandmaster (2200+)</li>
								</ul>
							</div>
						</div>
					</div>
				</section>

				{/* Navigation to How to Play */}
				<div className="text-center">
					<div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-500/30">
						<h3 className="text-2xl font-bold text-white mb-4">Ready to Play? 🚀</h3>
						<p className="text-gray-300 mb-6">
							Now that you know the rules, learn how to use the ChessChamp platform!
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/how-to-play"
								className="btn-primary text-lg px-8 py-3"
							>
								📚 How to Play Guide
							</Link>
							<Link
								href="/matchmaking"
								className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
							>
								⚔️ Start Playing Now
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
