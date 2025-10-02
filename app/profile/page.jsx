'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '../context/ModalContext';
import Navigation from '../components/Navigation';
import profileService, { CHESS_AVATARS } from '../../utils/profileService';

export default function ProfilePage({ params }) {
	const router = useRouter();
	const { showAlert, showConfirm } = useModal();
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [editMode, setEditMode] = useState(false);
	const [displayName, setDisplayName] = useState('');
	const [selectedAvatar, setSelectedAvatar] = useState('♔');
	const [achievements, setAchievements] = useState([]);
	const [isOwnProfile, setIsOwnProfile] = useState(true);
	const [targetUsername, setTargetUsername] = useState(null);

	useEffect(() => {
		// Load profile on component mount
		const loadProfile = async () => {
			try {
				let userProfile;
				let username = params?.username;

				if (username) {
					// Loading another user's profile
					setTargetUsername(username);
					setIsOwnProfile(false);
					setEditMode(false); // Can't edit other users' profiles
					userProfile = await profileService.getProfileByUsername(username);
				} else {
					// Loading own profile
					setIsOwnProfile(true);
					userProfile = await profileService.getProfile();
				}

				if (userProfile) {
					console.log('Loaded profile:', userProfile);
					setProfile(userProfile);

					// Backend returns flattened profile structure  
					setDisplayName(userProfile.displayName || userProfile.username || '');
					setSelectedAvatar(userProfile.avatar || '♔');

					// Load achievements if it's own profile
					if (isOwnProfile) {
						const userAchievements = await profileService.getUnlockedAchievements();
						setAchievements(userAchievements);
					}
				}
			} catch (error) {
				console.error('Error loading profile:', error);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [params?.username]);

	const handleSaveProfile = async () => {
		try {
			const updatedProfile = await profileService.updateProfile({
				displayName,
				avatar: selectedAvatar
			});
			if (updatedProfile) {
				setProfile(updatedProfile);
				setEditMode(false);
			}
		} catch (error) {
			console.error('Error saving profile:', error);
		}
	};

	const handlePreferenceChange = async (key, value) => {
		try {
			const updatedProfile = await profileService.updatePreferences({ [key]: value });
			if (updatedProfile) {
				setProfile(updatedProfile);
			}
		} catch (error) {
			console.error('Error updating preferences:', error);
		}
	};

	const formatDate = (dateString) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="flex items-center space-x-4">
					<div className="w-8 h-8 border-4 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
					<span className="text-yellow-400 font-semibold">Loading Profile...</span>
				</div>
			</div>
		);
	}

	if (!profile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-white mb-4">Profile Not Found</h2>
					<button
						onClick={() => router.push('/dashboard')}
						className="chess-gold-gradient text-black px-6 py-3 rounded-2xl font-bold"
					>
						Return to Dashboard
					</button>
				</div>
			</div>
		);
	}

	// Handle the data structure - backend returns flattened profile data
	const stats = profile.stats || {};
	const ranking = profile.ranking || {};
	const preferences = profile.preferences || {};
	const profileAchievements = profile.achievements || {};

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
			{/* Navigation */}
			<Navigation currentPage="profile" />

			{/* Content */}
			<div className="p-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex items-center justify-center mb-8">
						<h1 className="text-4xl font-black text-white">Champion Profile</h1>
					</div>

					{/* Profile Header Card */}
					<div className="glass rounded-3xl p-8 mb-8 backdrop-blur-xl border border-white/20">
						<div className="flex items-center space-x-8">
							{/* Avatar Section */}
							<div className="flex flex-col items-center">
								<div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-4xl mb-4">
									{profile.avatar}
								</div>
								{editMode ? (
									<button
										onClick={() => setActiveTab('avatar')}
										className="text-yellow-400 text-sm hover:text-yellow-300 transition-colors"
									>
										Change Avatar
									</button>
								) : (
									<div className="text-gray-400 text-sm">{ranking.rank || 'Novice'}</div>
								)}
							</div>

							{/* Profile Info */}
							<div className="flex-1">
								{editMode ? (
									<div className="space-y-4">
										<div>
											<label className="block text-gray-300 text-sm mb-2">Display Name</label>
											<input
												type="text"
												value={displayName}
												onChange={(e) => setDisplayName(e.target.value)}
												className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
												placeholder="Enter display name"
											/>
										</div>
										<div className="flex space-x-4">
											<button
												onClick={handleSaveProfile}
												className="cursor-pointer bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all">
												Save Changes
											</button>
											<button
												onClick={() => setEditMode(false)}
												className="cursor-pointer bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-2 rounded-xl font-bold hover:from-gray-700 hover:to-gray-800 transition-all">
												Cancel
											</button>
										</div>
									</div>
								) : (
									<>
										<div className="flex items-center space-x-4 mb-4">
											<h2 className="text-3xl font-bold text-white">{profile.displayName || profile.username}</h2>
											<button
												onClick={() => setEditMode(true)}
												className="cursor-pointer text-yellow-400 hover:text-yellow-300 transition-colors"
											>
												✏️
											</button>
										</div>
										<div className="grid grid-cols-3 gap-6">
											<div>
												<div className="text-yellow-400 font-bold text-2xl">{ranking.elo || 1200}</div>
												<div className="text-gray-400 text-sm">Current ELO</div>
											</div>
											<div>
												<div className="text-yellow-400 font-bold text-2xl">{stats.gamesPlayed || 0}</div>
												<div className="text-gray-400 text-sm">Games Played</div>
											</div>
											<div>
												<div className="text-yellow-400 font-bold text-2xl">{stats.winRate || 0}%</div>
												<div className="text-gray-400 text-sm">Win Rate</div>
											</div>
										</div>
									</>
								)}
							</div>

							{/* Rank Badge */}
							<div className="text-center">
								<div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2 ${ranking.seasonRank === 'Diamond' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' :
									ranking.seasonRank === 'Platinum' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
										ranking.seasonRank === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
											ranking.seasonRank === 'Silver' ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
												ranking.seasonRank === 'Bronze' ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
													'bg-gradient-to-br from-gray-600 to-gray-800'
									}`}>
									{ranking.seasonRank === 'Diamond' ? '💎' :
										ranking.seasonRank === 'Platinum' ? '🥈' :
											ranking.seasonRank === 'Gold' ? '🥇' :
												ranking.seasonRank === 'Silver' ? '🥈' :
													ranking.seasonRank === 'Bronze' ? '🥉' : '⚫'}
								</div>
								<div className="text-white font-bold text-sm">{ranking.seasonRank || 'Iron'}</div>
							</div>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex space-x-2 mb-8 glass rounded-2xl p-2 backdrop-blur-xl border border-white/20">
						{[
							{ id: 'overview', label: 'Overview', icon: '📊' },
							{ id: 'statistics', label: 'Statistics', icon: '📈' },
							{ id: 'achievements', label: 'Achievements', icon: '🏆' },
							{ id: 'avatar', label: 'Avatar', icon: '👤' },
							{ id: 'settings', label: 'Settings', icon: '⚙️' }
						].map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`cursor-pointer flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === tab.id
									? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
									: 'text-gray-400 hover:text-white hover:bg-white/10'
									}`}
							>
								<span>{tab.icon}</span>
								<span>{tab.label}</span>
							</button>
						))}
					</div>

					{/* Tab Content */}
					{activeTab === 'overview' && (
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
							{/* Recent Performance */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
									<span>📈</span>
									<span>Recent Performance</span>
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-400">Current Streak:</span>
										<span className="text-white font-bold">
											{(stats.currentWinStreak || 0) > 0 ? `🔥 ${stats.currentWinStreak} wins` :
												(stats.currentLossStreak || 0) > 0 ? `❄️ ${stats.currentLossStreak} losses` : 'No streak'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Best Streak:</span>
										<span className="text-yellow-400 font-bold">{stats.bestWinStreak || 0} wins</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">This Month:</span>
										<span className="text-white font-bold">
											{(stats.monthlyStats && stats.monthlyStats[profileService.getCurrentMonth()]?.games) || 0} games
										</span>
									</div>
								</div>
							</div>

							{/* Game Breakdown */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
									<span>⚔️</span>
									<span>Game Results</span>
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-green-400">Wins:</span>
										<span className="text-white font-bold">{stats.wins}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-red-400">Losses:</span>
										<span className="text-white font-bold">{stats.losses}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-blue-400">Draws:</span>
										<span className="text-white font-bold">{stats.draws}</span>
									</div>
									<div className="border-t border-white/20 pt-2 mt-2">
										<div className="flex justify-between">
											<span className="text-yellow-400">Win Rate:</span>
											<span className="text-yellow-400 font-bold">{stats.winRate}%</span>
										</div>
									</div>
								</div>
							</div>

							{/* Time Stats */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
									<span>⏱️</span>
									<span>Time Statistics</span>
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-400">Total Play Time:</span>
										<span className="text-white font-bold">{profileService.formatTime(stats.totalPlayTime)}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Avg Game Time:</span>
										<span className="text-white font-bold">{profileService.formatTime(stats.averageGameTime)}</span>
									</div>
									{stats.fastestWin && (
										<div className="flex justify-between">
											<span className="text-gray-400">Fastest Win:</span>
											<span className="text-green-400 font-bold">{profileService.formatTime(stats.fastestWin)}</span>
										</div>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Additional tabs will be continued in the next part... */}
					{activeTab === 'statistics' && (
						<div className="space-y-6">
							{/* Detailed Statistics */}
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
									<h3 className="text-xl font-bold text-white mb-4">Win Methods</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-400">Checkmate:</span>
											<span className="text-white font-bold">{stats.winsByCheckmate}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Timeout:</span>
											<span className="text-white font-bold">{stats.winsByTimeout}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Resignation:</span>
											<span className="text-white font-bold">{stats.winsByResignation}</span>
										</div>
									</div>
								</div>

								<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
									<h3 className="text-xl font-bold text-white mb-4">Draw Methods</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-400">Agreement:</span>
											<span className="text-white font-bold">{stats.drawsByAgreement}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Stalemate:</span>
											<span className="text-white font-bold">{stats.drawsByStalemate}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Repetition:</span>
											<span className="text-white font-bold">{stats.drawsByRepetition}</span>
										</div>
									</div>
								</div>

								<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
									<h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
										<span>⚔️</span>
										<span>Battle Actions</span>
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-400">Draws Offered:</span>
											<span className="text-white font-bold">{stats.drawsOffered || 0}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Resignations:</span>
											<span className="text-white font-bold">{stats.resignations || 0}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Move Statistics */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-4">Move Analysis</h3>
								<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
									<div className="text-center">
										<div className="text-yellow-400 font-bold text-2xl">{stats.totalMoves}</div>
										<div className="text-gray-400 text-sm">Total Moves</div>
									</div>
									<div className="text-center">
										<div className="text-yellow-400 font-bold text-2xl">{stats.averageMovesPerGame}</div>
										<div className="text-gray-400 text-sm">Avg Moves/Game</div>
									</div>
									<div className="text-center">
										<div className="text-yellow-400 font-bold text-2xl">{ranking.peakElo}</div>
										<div className="text-gray-400 text-sm">Peak ELO</div>
									</div>
									<div className="text-center">
										<div className="text-yellow-400 font-bold text-2xl">{formatDate(profile.joinDate || new Date()).split(',')[0]}</div>
										<div className="text-gray-400 text-sm">Joined</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'achievements' && (
						<div className="space-y-6">
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Unlocked Achievements</h3>
								{achievements.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{achievements.map((achievement, index) => (
											<div key={index} className="bg-gradient-to-r from-yellow-400/20 to-yellow-600/20 border border-yellow-400/30 rounded-2xl p-4">
												<div className="flex items-center space-x-3">
													<div className="text-2xl">{achievement.icon}</div>
													<div>
														<div className="text-white font-bold">{achievement.name}</div>
														<div className="text-gray-300 text-sm">{achievement.description}</div>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<div className="text-6xl mb-4">🏆</div>
										<div className="text-white font-bold text-xl mb-2">No Achievements Yet</div>
										<div className="text-gray-400">Play games to unlock achievements!</div>
									</div>
								)}
							</div>

							{/* Achievement Progress */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Achievement Progress</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-4">
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-gray-400">Wins Progress</span>
												<span className="text-white">{stats.wins}/100</span>
											</div>
											<div className="w-full bg-gray-700 rounded-full h-2">
												<div
													className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full"
													style={{ width: `${Math.min((stats.wins / 100) * 100, 100)}%` }}
												></div>
											</div>
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-gray-400">Games Played</span>
												<span className="text-white">{stats.gamesPlayed}/100</span>
											</div>
											<div className="w-full bg-gray-700 rounded-full h-2">
												<div
													className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
													style={{ width: `${Math.min((stats.gamesPlayed / 100) * 100, 100)}%` }}
												></div>
											</div>
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-gray-400">Win Streak</span>
												<span className="text-white">{stats.bestWinStreak}/10</span>
											</div>
											<div className="w-full bg-gray-700 rounded-full h-2">
												<div
													className="bg-gradient-to-r from-red-400 to-red-600 h-2 rounded-full"
													style={{ width: `${Math.min((stats.bestWinStreak / 10) * 100, 100)}%` }}
												></div>
											</div>
										</div>
										<div>
											<div className="flex justify-between mb-2">
												<span className="text-gray-400">Draws Achieved</span>
												<span className="text-white">{stats.draws}/10</span>
											</div>
											<div className="w-full bg-gray-700 rounded-full h-2">
												<div
													className="bg-gradient-to-r from-green-400 to-green-600 h-2 rounded-full"
													style={{ width: `${Math.min((stats.draws / 10) * 100, 100)}%` }}
												></div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'avatar' && (
						<div className="space-y-6">
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Choose Your Avatar</h3>

								{/* Current Avatar */}
								<div className="text-center mb-8">
									<div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-6xl mx-auto mb-4">
										{selectedAvatar}
									</div>
									<div className="text-gray-400">Current Selection</div>
								</div>

								{/* Avatar Categories */}
								{Object.entries(CHESS_AVATARS).map(([category, avatars]) => (
									<div key={category} className="mb-8">
										<h4 className="text-lg font-bold text-white mb-4 capitalize">
											{category === 'pieces' ? '♟️ Chess Pieces' :
												category === 'crowns' ? '👑 Royalty' :
													category === 'symbols' ? '⚔️ Symbols' :
														category === 'faces' ? '😎 Faces' :
															category === 'animals' ? '🦅 Animals' : category}
										</h4>
										<div className="grid grid-cols-6 md:grid-cols-12 gap-3">
											{avatars.map((avatar, index) => (
												<button
													key={index}
													onClick={() => setSelectedAvatar(avatar)}
													className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-300 ${selectedAvatar === avatar
														? 'bg-gradient-to-br from-yellow-400 to-yellow-600 scale-110 shadow-lg shadow-yellow-400/50'
														: 'bg-white/10 hover:bg-white/20 hover:scale-105'
														}`}
												>
													{avatar}
												</button>
											))}
										</div>
									</div>
								))}

								{/* Save Avatar Button */}
								<div className="text-center pt-6">
									<button
										onClick={handleSaveProfile}
										className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-8 py-3 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
									>
										Save Avatar
									</button>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'settings' && (
						<div className="space-y-6">
							{/* Game Preferences */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Game Preferences</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-gray-300 text-sm mb-2">Board Style</label>
										<select
											value={preferences.boardStyle}
											onChange={(e) => handlePreferenceChange('boardStyle', e.target.value)}
											className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
										>
											<option value="classic">Classic</option>
											<option value="modern">Modern</option>
											<option value="wood">Wood</option>
											<option value="marble">Marble</option>
										</select>
									</div>
									<div>
										<label className="block text-gray-300 text-sm mb-2">Piece Style</label>
										<select
											value={preferences.pieceStyle}
											onChange={(e) => handlePreferenceChange('pieceStyle', e.target.value)}
											className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
										>
											<option value="traditional">Traditional</option>
											<option value="modern">Modern</option>
											<option value="minimalist">Minimalist</option>
										</select>
									</div>
									<div>
										<label className="block text-gray-300 text-sm mb-2">Animation Speed</label>
										<select
											value={preferences.animationSpeed}
											onChange={(e) => handlePreferenceChange('animationSpeed', e.target.value)}
											className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
										>
											<option value="slow">Slow</option>
											<option value="normal">Normal</option>
											<option value="fast">Fast</option>
											<option value="instant">Instant</option>
										</select>
									</div>
									<div>
										<label className="block text-gray-300 text-sm mb-2">Theme</label>
										<select
											value={preferences.theme}
											onChange={(e) => handlePreferenceChange('theme', e.target.value)}
											className="w-full bg-black/30 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-yellow-400"
										>
											<option value="dark">Dark</option>
											<option value="light">Light</option>
											<option value="auto">Auto</option>
										</select>
									</div>
								</div>
							</div>

							{/* Toggle Settings */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Display Options</h3>
								<div className="space-y-4">
									{[
										{ key: 'soundEffects', label: 'Sound Effects', icon: '🔊' },
										{ key: 'showCoordinates', label: 'Show Board Coordinates', icon: '🗺️' },
										{ key: 'highlightMoves', label: 'Highlight Legal Moves', icon: '✨' },
										{ key: 'autoQueen', label: 'Auto-Promote to Queen', icon: '♕' },
										{ key: 'confirmMoves', label: 'Confirm Moves', icon: '✅' }
									].map(setting => (
										<div key={setting.key} className="flex items-center justify-between p-4 bg-black/20 rounded-xl">
											<div className="flex items-center space-x-3">
												<span className="text-xl">{setting.icon}</span>
												<span className="text-white font-medium">{setting.label}</span>
											</div>
											<label className="relative inline-flex items-center cursor-pointer">
												<input
													type="checkbox"
													checked={preferences[setting.key]}
													onChange={(e) => handlePreferenceChange(setting.key, e.target.checked)}
													className="sr-only peer"
												/>
												<div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-500"></div>
											</label>
										</div>
									))}
								</div>
							</div>

							{/* Data Management */}
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
								<h3 className="text-xl font-bold text-white mb-6">Data Management</h3>
								<div className="flex justify-center">
									<button
										onClick={async () => {
											const confirmed = await showConfirm(
												'Are you sure you want to reset your profile? This cannot be undone.',
												'Reset Profile',
												'Reset',
												'Cancel'
											);
											if (confirmed) {
												try {
													const resetProfile = await profileService.resetProfile();
													if (resetProfile) {
														setProfile(resetProfile);
														setAchievements([]);
														await showAlert('Profile reset successfully!');
													}
												} catch (error) {
													console.error('Error resetting profile:', error);
													await showAlert('Failed to reset profile. Please try again.');
												}
											}
										}}
										className="bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl font-bold hover:from-red-700 hover:to-red-800 transition-all"
									>
										Reset Profile
									</button>
								</div>
								<p className="text-gray-400 text-sm mt-4 text-center">
									Profile data is automatically saved to the server. No export/import needed.
								</p>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
