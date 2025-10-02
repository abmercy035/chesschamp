'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import Link from 'next/link';

export default function HowToPlayPage() {
	const [activeSection, setActiveSection] = useState('getting-started');

	const sections = [
		{ id: 'getting-started', name: 'Getting Started', icon: '🚀' },
		{ id: 'matchmaking', name: 'Finding Games', icon: '🎯' },
		{ id: 'gameplay', name: 'During Games', icon: '⚡' },
		{ id: 'features', name: 'Platform Features', icon: '🛠️' },
		{ id: 'ranking', name: 'Ranking System', icon: '🏆' },
		{ id: 'tips', name: 'Pro Tips', icon: '💡' }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
			{/* Navigation */}
			<Navigation currentPage="how-to-play" />

			{/* Animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl relative z-10 space-y-12">
				{/* Header */}
				<div className="text-center space-y-6">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
						🎮 How to Play ChessChamp
					</h1>
					<p className="text-gray-400 text-lg">
						Master the platform and dominate the online chess arena
					</p>
				</div>

				{/* Section Navigation */}
				<div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
					<div className="flex flex-wrap justify-center gap-2">
						{sections.map((section) => (
							<button
								key={section.id}
								onClick={() => setActiveSection(section.id)}
								className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeSection === section.id
										? 'bg-yellow-500 text-black shadow-lg'
										: 'bg-white/10 text-gray-300 hover:bg-white/20'
									}`}
							>
								<span className="mr-2">{section.icon}</span>
								{section.name}
							</button>
						))}
					</div>
				</div>

				{/* Getting Started Section */}
				{activeSection === 'getting-started' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">🚀</span>
							Getting Started
						</h2>

						<div className="grid lg:grid-cols-2 gap-8">
							<div className="space-y-6">
								<div className="bg-gradient-to-r from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
									<h3 className="text-xl font-semibold text-green-400 mb-4">
										1️⃣ Create Your Account
									</h3>
									<ul className="text-gray-300 space-y-2">
										<li>• Visit the homepage and click "Become a Champion"</li>
										<li>• Fill in your details: username, email, age, country, password</li>
										<li>• Choose a unique username (this will be your chess identity)</li>
										<li>• Verify your email address</li>
									</ul>
								</div>

								<div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
									<h3 className="text-xl font-semibold text-blue-400 mb-4">
										2️⃣ Explore Your Dashboard
									</h3>
									<ul className="text-gray-300 space-y-2">
										<li>• View your current ELO rating (starts at 1200)</li>
										<li>• Check your game history and statistics</li>
										<li>• See active games you can continue</li>
										<li>• Browse available games to join</li>
									</ul>
								</div>
							</div>

							<div className="space-y-6">
								<div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
									<h3 className="text-xl font-semibold text-purple-400 mb-4">
										3️⃣ Set Up Your Profile
									</h3>
									<ul className="text-gray-300 space-y-2">
										<li>• Visit your profile page to customize settings</li>
										<li>• Choose your avatar and display preferences</li>
										<li>• Review your achievements and badges</li>
										<li>• Track your monthly and overall statistics</li>
									</ul>
								</div>

								<div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl p-6 border border-yellow-500/30">
									<h3 className="text-xl font-semibold text-yellow-400 mb-4">
										4️⃣ Learn the Interface
									</h3>
									<ul className="text-gray-300 space-y-2">
										<li>• Familiarize yourself with the chess board</li>
										<li>• Understand the timer display (5 minutes each)</li>
										<li>• Learn how to offer draws and resign</li>
										<li>• Practice with the move notation system</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Matchmaking Section */}
				{activeSection === 'matchmaking' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">🎯</span>
							Finding Games
						</h2>

						<div className="space-y-8">
							{/* Matchmaking Process */}
							<div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
								<h3 className="text-2xl font-semibold text-blue-400 mb-6">
									⚡ Quick Matchmaking (Recommended)
								</h3>
								<div className="grid md:grid-cols-3 gap-6">
									<div className="text-center space-y-3">
										<div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto">
											<span className="text-white font-bold">1</span>
										</div>
										<h4 className="font-semibold text-white">Join Queue</h4>
										<p className="text-gray-300 text-sm">
											Click "Find Match" to enter the matchmaking queue
										</p>
									</div>
									<div className="text-center space-y-3">
										<div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto">
											<span className="text-white font-bold">2</span>
										</div>
										<h4 className="font-semibold text-white">Get Matched</h4>
										<p className="text-gray-300 text-sm">
											System finds an opponent with similar ELO rating
										</p>
									</div>
									<div className="text-center space-y-3">
										<div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto">
											<span className="text-white font-bold">3</span>
										</div>
										<h4 className="font-semibold text-white">Accept & Play</h4>
										<p className="text-gray-300 text-sm">
											Both players confirm and the game begins immediately
										</p>
									</div>
								</div>
							</div>

							{/* Manual Game Joining */}
							<div className="grid md:grid-cols-2 gap-8">
								<div className="bg-white/5 rounded-xl p-6 border border-white/10">
									<h3 className="text-xl font-semibold text-yellow-400 mb-4">
										🎮 Join Existing Games
									</h3>
									<ul className="text-gray-300 space-y-3">
										<li>• Browse available games on the dashboard</li>
										<li>• Check the host's ELO rating before joining</li>
										<li>• Click "JOIN BATTLE" to enter as the opponent</li>
										<li>• Game starts immediately when you join</li>
									</ul>
								</div>

								<div className="bg-white/5 rounded-xl p-6 border border-white/10">
									<h3 className="text-xl font-semibold text-green-400 mb-4">
										⚔️ Create Your Own Game
									</h3>
									<ul className="text-gray-300 space-y-3">
										<li>• Click "Create New Game" on dashboard</li>
										<li>• Your game appears in the public lobby</li>
										<li>• Wait for an opponent to join</li>
										<li>• Game begins when someone accepts your challenge</li>
									</ul>
								</div>
							</div>

							{/* ELO Matching */}
							<div className="bg-gradient-to-r from-yellow-500/20 to-red-500/20 rounded-xl p-6 border border-yellow-500/30">
								<h3 className="text-xl font-semibold text-yellow-400 mb-4">
									⚖️ ELO-Based Matching
								</h3>
								<div className="grid md:grid-cols-3 gap-6">
									<div className="text-center">
										<div className="text-2xl mb-2">🟢</div>
										<h4 className="font-semibold text-green-400">Perfect Match</h4>
										<p className="text-gray-300 text-sm">±0-50 ELO difference</p>
									</div>
									<div className="text-center">
										<div className="text-2xl mb-2">🟡</div>
										<h4 className="font-semibold text-yellow-400">Good Match</h4>
										<p className="text-gray-300 text-sm">±50-100 ELO difference</p>
									</div>
									<div className="text-center">
										<div className="text-2xl mb-2">🟠</div>
										<h4 className="font-semibold text-orange-400">Fair Match</h4>
										<p className="text-gray-300 text-sm">±100-200 ELO difference</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Gameplay Section */}
				{activeSection === 'gameplay' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">⚡</span>
							During Games
						</h2>

						<div className="space-y-8">
							{/* Game Interface */}
							<div className="grid lg:grid-cols-2 gap-8">
								<div className="space-y-6">
									<div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
										<h3 className="text-xl font-semibold text-blue-400 mb-4">
											🎯 Making Moves
										</h3>
										<ul className="text-gray-300 space-y-2">
											<li>• <strong>Click to select:</strong> Click on a piece to select it</li>
											<li>• <strong>Click to move:</strong> Click on a valid square to move there</li>
											<li>• <strong>Drag & drop:</strong> Drag pieces to their destination</li>
											<li>• <strong>Legal moves:</strong> Valid moves are highlighted automatically</li>
											<li>• <strong>Undo:</strong> No take-backs once you release the piece!</li>
										</ul>
									</div>

									<div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
										<h3 className="text-xl font-semibold text-green-400 mb-4">
											⏰ Time Management
										</h3>
										<ul className="text-gray-300 space-y-2">
											<li>• <strong>5 minutes total:</strong> Each player gets 5 minutes for entire game</li>
											<li>• <strong>Your clock runs:</strong> Only when it's your turn to move</li>
											<li>• <strong>Time pressure:</strong> Clock turns red when under 30 seconds</li>
											<li>• <strong>Time out = loss:</strong> Running out of time means you lose</li>
										</ul>
									</div>
								</div>

								<div className="space-y-6">
									<div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
										<h3 className="text-xl font-semibold text-purple-400 mb-4">
											🤝 Game Actions
										</h3>
										<ul className="text-gray-300 space-y-2">
											<li>• <strong>Offer Draw:</strong> Click the handshake button to offer a draw</li>
											<li>• <strong>Accept Draw:</strong> Accept opponent's draw offer if you agree</li>
											<li>• <strong>Resign:</strong> Give up by clicking the flag button</li>
											<li>• <strong>Chat:</strong> Send quick messages using predefined options</li>
										</ul>
									</div>

									<div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
										<h3 className="text-xl font-semibold text-red-400 mb-4">
											⚠️ Important Notes
										</h3>
										<ul className="text-gray-300 space-y-2">
											<li>• <strong>No disconnection mercy:</strong> Lost connection = time keeps running</li>
											<li>• <strong>Move confirmation:</strong> Double-check moves before releasing</li>
											<li>• <strong>Promotion choice:</strong> Select piece when pawn reaches end</li>
											<li>• <strong>Check notifications:</strong> You'll be notified when in check</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Special Situations */}
							<div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
								<h3 className="text-xl font-semibold text-orange-400 mb-4">
									🔥 Special Situations
								</h3>
								<div className="grid md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold text-white mb-2">When You're Winning:</h4>
										<ul className="text-gray-300 space-y-1 text-sm">
											<li>• Keep pressure on your opponent</li>
											<li>• Manage your time wisely</li>
											<li>• Don't let your opponent escape with a draw</li>
											<li>• Calculate checkmate sequences carefully</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-white mb-2">When You're Losing:</h4>
										<ul className="text-gray-300 space-y-1 text-sm">
											<li>• Look for tactical opportunities</li>
											<li>• Consider offering a draw in equal positions</li>
											<li>• Try to complicate the position</li>
											<li>• Don't resign too early - fight until the end!</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Features Section */}
				{activeSection === 'features' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">🛠️</span>
							Platform Features
						</h2>

						<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Profile System */}
							<div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl p-6 border border-blue-500/30">
								<h3 className="text-xl font-semibold text-blue-400 mb-4">
									👤 Profile & Stats
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Detailed game statistics</li>
									<li>• Win/loss/draw ratios</li>
									<li>• Monthly performance tracking</li>
									<li>• Achievement system</li>
									<li>• ELO rating history</li>
									<li>• Country-based filtering</li>
								</ul>
							</div>

							{/* Leaderboards */}
							<div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-xl p-6 border border-yellow-500/30">
								<h3 className="text-xl font-semibold text-yellow-400 mb-4">
									🏆 Leaderboards
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Global ELO rankings</li>
									<li>• Win rate leaderboards</li>
									<li>• Most active players</li>
									<li>• Win streak records</li>
									<li>• Monthly championships</li>
									<li>• Country-specific rankings</li>
								</ul>
							</div>

							{/* Game Features */}
							<div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl p-6 border border-green-500/30">
								<h3 className="text-xl font-semibold text-green-400 mb-4">
									⚡ Game Features
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Real-time gameplay</li>
									<li>• Move validation</li>
									<li>• Automatic draw detection</li>
									<li>• Time control management</li>
									<li>• Move history display</li>
									<li>• Spectator mode</li>
								</ul>
							</div>

							{/* Social Features */}
							<div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl p-6 border border-purple-500/30">
								<h3 className="text-xl font-semibold text-purple-400 mb-4">
									💬 Social Features
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Quick chat options</li>
									<li>• Post-game analysis</li>
									<li>• Player profiles</li>
									<li>• Game sharing</li>
									<li>• Challenge friends</li>
									<li>• Tournament participation</li>
								</ul>
							</div>

							{/* Mobile Support */}
							<div className="bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-xl p-6 border border-red-500/30">
								<h3 className="text-xl font-semibold text-red-400 mb-4">
									📱 Mobile Support
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Responsive design</li>
									<li>• Touch-friendly interface</li>
									<li>• Mobile-optimized controls</li>
									<li>• Cross-platform sync</li>
									<li>• Offline capability</li>
									<li>• Push notifications</li>
								</ul>
							</div>

							{/* Security */}
							<div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 rounded-xl p-6 border border-gray-500/30">
								<h3 className="text-xl font-semibold text-gray-400 mb-4">
									🔒 Security & Fair Play
								</h3>
								<ul className="text-gray-300 space-y-2 text-sm">
									<li>• Anti-cheat detection</li>
									<li>• Secure authentication</li>
									<li>• Fair matchmaking</li>
									<li>• Report system</li>
									<li>• Data protection</li>
									<li>• Terms enforcement</li>
								</ul>
							</div>
						</div>
					</div>
				)}

				{/* Ranking System Section */}
				{activeSection === 'ranking' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">🏆</span>
							Ranking System
						</h2>

						<div className="space-y-8">
							{/* ELO System Explanation */}
							<div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-6 border border-blue-500/30">
								<h3 className="text-2xl font-semibold text-blue-400 mb-4">
									⚖️ ELO Rating System
								</h3>
								<div className="grid md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold text-white mb-3">How It Works:</h4>
										<ul className="text-gray-300 space-y-2">
											<li>• Everyone starts at 1200 ELO</li>
											<li>• Win against stronger players = more points</li>
											<li>• Win against weaker players = fewer points</li>
											<li>• Draws give small +/- adjustments</li>
											<li>• Losses always cost you points</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-white mb-3">Point Changes:</h4>
										<ul className="text-gray-300 space-y-2">
											<li>• <span className="text-green-400">Win:</span> +16 to +32 points</li>
											<li>• <span className="text-yellow-400">Draw:</span> -8 to +8 points</li>
											<li>• <span className="text-red-400">Loss:</span> -16 to -32 points</li>
											<li>• Exact amount depends on rating difference</li>
											<li>• New players have higher volatility</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Rank Tiers */}
							<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
								<div className="bg-slate-500/10 rounded-xl p-4 border border-slate-500/30 text-center">
									<div className="text-3xl mb-2">🌱</div>
									<h4 className="font-semibold text-slate-400">Beginner</h4>
									<p className="text-gray-300 text-sm">800 - 1000 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Learning the basics</p>
								</div>

								<div className="bg-green-500/10 rounded-xl p-4 border border-green-500/30 text-center">
									<div className="text-3xl mb-2">🎯</div>
									<h4 className="font-semibold text-green-400">Novice</h4>
									<p className="text-gray-300 text-sm">1000 - 1200 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Getting comfortable</p>
								</div>

								<div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/30 text-center">
									<div className="text-3xl mb-2">⚔️</div>
									<h4 className="font-semibold text-blue-400">Amateur</h4>
									<p className="text-gray-300 text-sm">1200 - 1400 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Solid fundamentals</p>
								</div>

								<div className="bg-purple-500/10 rounded-xl p-4 border border-purple-500/30 text-center">
									<div className="text-3xl mb-2">🔥</div>
									<h4 className="font-semibold text-purple-400">Intermediate</h4>
									<p className="text-gray-300 text-sm">1400 - 1600 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Tactical awareness</p>
								</div>

								<div className="bg-orange-500/10 rounded-xl p-4 border border-orange-500/30 text-center">
									<div className="text-3xl mb-2">⚡</div>
									<h4 className="font-semibold text-orange-400">Advanced</h4>
									<p className="text-gray-300 text-sm">1600 - 1800 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Strategic thinking</p>
								</div>

								<div className="bg-red-500/10 rounded-xl p-4 border border-red-500/30 text-center">
									<div className="text-3xl mb-2">💎</div>
									<h4 className="font-semibold text-red-400">Expert</h4>
									<p className="text-gray-300 text-sm">1800 - 2000 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Deep understanding</p>
								</div>

								<div className="bg-yellow-500/10 rounded-xl p-4 border border-yellow-500/30 text-center">
									<div className="text-3xl mb-2">🏆</div>
									<h4 className="font-semibold text-yellow-400">Master</h4>
									<p className="text-gray-300 text-sm">2000 - 2200 ELO</p>
									<p className="text-xs text-gray-400 mt-2">Elite player</p>
								</div>

								<div className="bg-purple-600/10 rounded-xl p-4 border border-purple-600/30 text-center">
									<div className="text-3xl mb-2">👑</div>
									<h4 className="font-semibold text-purple-300">Grandmaster</h4>
									<p className="text-gray-300 text-sm">2200+ ELO</p>
									<p className="text-xs text-gray-400 mt-2">Chess legend</p>
								</div>
							</div>

							{/* Climbing Tips */}
							<div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
								<h3 className="text-xl font-semibold text-green-400 mb-4">
									📈 Tips for Climbing the Ladder
								</h3>
								<div className="grid md:grid-cols-3 gap-6">
									<div>
										<h4 className="font-semibold text-white mb-2">🧠 Study & Practice</h4>
										<ul className="text-gray-300 text-sm space-y-1">
											<li>• Learn basic tactics</li>
											<li>• Study endgames</li>
											<li>• Analyze your games</li>
											<li>• Practice regularly</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-white mb-2">⏰ Time Management</h4>
										<ul className="text-gray-300 text-sm space-y-1">
											<li>• Don't rush early moves</li>
											<li>• Save time for complex positions</li>
											<li>• Practice fast calculations</li>
											<li>• Know when to take time</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-white mb-2">🎯 Mental Game</h4>
										<ul className="text-gray-300 text-sm space-y-1">
											<li>• Stay calm under pressure</li>
											<li>• Learn from losses</li>
											<li>• Don't tilt after bad games</li>
											<li>• Focus on improvement</li>
										</ul>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Pro Tips Section */}
				{activeSection === 'tips' && (
					<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 p-8">
						<h2 className="text-3xl font-bold text-white mb-8 flex items-center">
							<span className="mr-3">💡</span>
							Pro Tips & Strategies
						</h2>

						<div className="space-y-8">
							{/* Quick Tips Grid */}
							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
								<div className="bg-blue-500/10 rounded-xl p-6 border border-blue-500/30">
									<h3 className="text-lg font-semibold text-blue-400 mb-3">
										🚀 Opening Principles
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• Control the center with pawns</li>
										<li>• Develop knights before bishops</li>
										<li>• Castle early for king safety</li>
										<li>• Don't move the same piece twice</li>
										<li>• Connect your rooks</li>
									</ul>
								</div>

								<div className="bg-green-500/10 rounded-xl p-6 border border-green-500/30">
									<h3 className="text-lg font-semibold text-green-400 mb-3">
										⚡ Tactical Awareness
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• Always check for checks</li>
										<li>• Look for forks and pins</li>
										<li>• Watch for discovered attacks</li>
										<li>• Calculate forcing moves first</li>
										<li>• Don't miss free pieces</li>
									</ul>
								</div>

								<div className="bg-purple-500/10 rounded-xl p-6 border border-purple-500/30">
									<h3 className="text-lg font-semibold text-purple-400 mb-3">
										🏰 Endgame Essentials
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• King becomes active in endgame</li>
										<li>• Centralize your king</li>
										<li>• Push passed pawns</li>
										<li>• Learn basic checkmate patterns</li>
										<li>• Rook endgames are crucial</li>
									</ul>
								</div>

								<div className="bg-yellow-500/10 rounded-xl p-6 border border-yellow-500/30">
									<h3 className="text-lg font-semibold text-yellow-400 mb-3">
										⏰ Time Management
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• Think on opponent's time</li>
										<li>• Pre-move when possible</li>
										<li>• Don't overthink simple moves</li>
										<li>• Save time for critical moments</li>
										<li>• Practice speed chess regularly</li>
									</ul>
								</div>

								<div className="bg-red-500/10 rounded-xl p-6 border border-red-500/30">
									<h3 className="text-lg font-semibold text-red-400 mb-3">
										🧠 Psychology
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• Stay calm under time pressure</li>
										<li>• Don't show emotions</li>
										<li>• Learn from every game</li>
										<li>• Take breaks between games</li>
										<li>• Focus on your own play</li>
									</ul>
								</div>

								<div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/30">
									<h3 className="text-lg font-semibold text-orange-400 mb-3">
										📱 Platform Mastery
									</h3>
									<ul className="text-gray-300 space-y-2 text-sm">
										<li>• Use drag-and-drop for speed</li>
										<li>• Learn keyboard shortcuts</li>
										<li>• Practice with the interface</li>
										<li>• Keep stable internet connection</li>
										<li>• Report technical issues promptly</li>
									</ul>
								</div>
							</div>

							{/* Common Mistakes */}
							<div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-xl p-6 border border-red-500/30">
								<h3 className="text-xl font-semibold text-red-400 mb-4">
									❌ Common Mistakes to Avoid
								</h3>
								<div className="grid md:grid-cols-2 gap-6">
									<div>
										<h4 className="font-semibold text-white mb-2">Strategic Mistakes:</h4>
										<ul className="text-gray-300 space-y-1 text-sm">
											<li>• Moving without a plan</li>
											<li>• Ignoring opponent's threats</li>
											<li>• Weakening king position unnecessarily</li>
											<li>• Trading pieces without reason</li>
											<li>• Neglecting pawn structure</li>
										</ul>
									</div>
									<div>
										<h4 className="font-semibold text-white mb-2">Platform Mistakes:</h4>
										<ul className="text-gray-300 space-y-1 text-sm">
											<li>• Not managing time properly</li>
											<li>• Misclicking in time trouble</li>
											<li>• Forgetting about draw offers</li>
											<li>• Playing when tilted or tired</li>
											<li>• Not using the analysis features</li>
										</ul>
									</div>
								</div>
							</div>

							{/* Success Mindset */}
							<div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-6 border border-green-500/30">
								<h3 className="text-xl font-semibold text-green-400 mb-4">
									🎯 Champion Mindset
								</h3>
								<div className="grid md:grid-cols-3 gap-6">
									<div className="text-center">
										<div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
											<span className="text-2xl">🧘</span>
										</div>
										<h4 className="font-semibold text-white mb-2">Stay Patient</h4>
										<p className="text-gray-300 text-sm">
											Improvement takes time. Focus on learning, not just winning.
										</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
											<span className="text-2xl">📚</span>
										</div>
										<h4 className="font-semibold text-white mb-2">Keep Learning</h4>
										<p className="text-gray-300 text-sm">
											Every game teaches something. Analyze losses more than wins.
										</p>
									</div>
									<div className="text-center">
										<div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
											<span className="text-2xl">💪</span>
										</div>
										<h4 className="font-semibold text-white mb-2">Stay Persistent</h4>
										<p className="text-gray-300 text-sm">
											Champions are made through consistent practice and dedication.
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Ready to Play CTA */}
				<div className="text-center">
					<div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl p-8 border border-yellow-500/30">
						<h3 className="text-2xl font-bold text-white mb-4">Ready to Become a ChessChamp? 🏆</h3>
						<p className="text-gray-300 mb-6">
							You now have all the knowledge needed to dominate the online chess arena!
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Link
								href="/matchmaking"
								className="btn-primary text-lg px-8 py-3"
							>
								⚔️ Start Your Journey
							</Link>
							<Link
								href="/rules"
								className="bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300"
							>
								📚 Review Chess Rules
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
