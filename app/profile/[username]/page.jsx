'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import Navigation from '../../components/Navigation';
import profileService, { CHESS_AVATARS } from '../../../utils/profileService';

export default function UserProfilePage({ params }) {
	const { username } = use(params);
	const router = useRouter();
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [achievements, setAchievements] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		const loadProfile = async () => {
			try {
				setLoading(true);
				const userProfile = await profileService.getProfileByUsername(username);

				if (userProfile) {
					// Profile loaded for user
					setProfile(userProfile);

					// Load achievements for the user
					const profileData = userProfile.profile || userProfile;
					const achievementList = getAchievementsFromProfile(profileData);
					setAchievements(achievementList);
				} else {
					setError('User not found');
				}
			} catch (error) {
				// Error loading profile for user
				setError('Failed to load profile');
			} finally {
				setLoading(false);
			}
		};

		if (username) {
			loadProfile();
		}
	}, [username]);

	// Helper function to extract achievements from profile data
	const getAchievementsFromProfile = (profileData) => {
		const achievements = profileData?.achievements || {};
		const unlocked = [];

		if (achievements.firstWin) unlocked.push({ name: 'First Victory', icon: '🏆', description: 'Won their first game' });
		if (achievements.tenWins) unlocked.push({ name: 'Ten Victories', icon: '🥉', description: 'Won 10 games' });
		if (achievements.hundredWins) unlocked.push({ name: 'Century Champion', icon: '🥇', description: 'Won 100 games' });
		if (achievements.winStreak5) unlocked.push({ name: '5 Win Streak', icon: '🔥', description: 'Won 5 games in a row' });
		if (achievements.winStreak10) unlocked.push({ name: '10 Win Streak', icon: '⚡', description: 'Won 10 games in a row' });
		if (achievements.veteran) unlocked.push({ name: 'Veteran Player', icon: '🎖️', description: 'Played 100 games' });
		if (achievements.drawMaster) unlocked.push({ name: 'Draw Master', icon: '🤝', description: 'Achieved 10 draws' });

		return unlocked;
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

	if (error || !profile) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
				<div className="text-center">
					<div className="text-6xl mb-4">⚠️</div>
					<h2 className="text-2xl font-bold text-white mb-4">{error || 'Profile Not Found'}</h2>
					<p className="text-gray-400 mb-6">The user "{username}" could not be found.</p>
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

	const { stats, achievements: profileAchievements, ranking, preferences } = profile.profile || profile;
	const userData = profile.user || profile;

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
									{profile.profile?.avatar || '♔'}
								</div>
								<div className="text-gray-400 text-sm">{ranking?.rank || 'Novice'}</div>
							</div>

							{/* Profile Info */}
							<div className="flex-1">
								<div className="flex items-center space-x-4 mb-4">
									<h2 className="text-3xl font-bold text-white">{profile.profile?.displayName || userData?.username || username}</h2>
									<span className="text-gray-400 text-lg">@{username}</span>
								</div>
								<div className="grid grid-cols-3 gap-6">
									<div>
										<div className="text-yellow-400 font-bold text-2xl">{ranking?.elo || 1200}</div>
										<div className="text-gray-400 text-sm">Current ELO</div>
									</div>
									<div>
										<div className="text-yellow-400 font-bold text-2xl">{stats?.gamesPlayed || 0}</div>
										<div className="text-gray-400 text-sm">Games Played</div>
									</div>
									<div>
										<div className="text-yellow-400 font-bold text-2xl">{stats?.winRate || 0}%</div>
										<div className="text-gray-400 text-sm">Win Rate</div>
									</div>
								</div>
							</div>

							{/* Rank Badge */}
							<div className="text-center">
								<div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white mb-2 ${ranking?.seasonRank === 'Diamond' ? 'bg-gradient-to-br from-cyan-400 to-blue-600' :
										ranking?.seasonRank === 'Platinum' ? 'bg-gradient-to-br from-gray-400 to-gray-600' :
											ranking?.seasonRank === 'Gold' ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
												ranking?.seasonRank === 'Silver' ? 'bg-gradient-to-br from-gray-300 to-gray-500' :
													ranking?.seasonRank === 'Bronze' ? 'bg-gradient-to-br from-amber-600 to-amber-800' :
														'bg-gradient-to-br from-gray-600 to-gray-800'
									}`}>
									{ranking?.seasonRank === 'Diamond' ? '💎' :
										ranking?.seasonRank === 'Platinum' ? '🥈' :
											ranking?.seasonRank === 'Gold' ? '🥇' :
												ranking?.seasonRank === 'Silver' ? '🥈' :
													ranking?.seasonRank === 'Bronze' ? '🥉' : '⚫'}
								</div>
								<div className="text-white font-bold text-sm">{ranking?.seasonRank || 'Iron'}</div>
							</div>
						</div>
					</div>

					{/* Navigation Tabs */}
					<div className="flex space-x-2 mb-8 glass rounded-2xl p-2 backdrop-blur-xl border border-white/20">
						{[
							{ id: 'overview', label: 'Overview', icon: '📊' },
							{ id: 'statistics', label: 'Statistics', icon: '📈' },
							{ id: 'achievements', label: 'Achievements', icon: '🏆' }
						].map(tab => (
							<button
								key={tab.id}
								onClick={() => setActiveTab(tab.id)}
								className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-xl font-bold transition-all ${activeTab === tab.id
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
									<span>Performance</span>
								</h3>
								<div className="space-y-3">
									<div className="flex justify-between">
										<span className="text-gray-400">Current Streak:</span>
										<span className="text-white font-bold">
											{stats?.currentWinStreak > 0 ? `🔥 ${stats.currentWinStreak} wins` :
												stats?.currentLossStreak > 0 ? `❄️ ${stats.currentLossStreak} losses` : 'No streak'}
										</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Best Streak:</span>
										<span className="text-yellow-400 font-bold">{stats?.bestWinStreak || 0} wins</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Member Since:</span>
										<span className="text-white font-bold">{formatDate(userData?.joinDate || new Date())}</span>
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
										<span className="text-white font-bold">{stats?.wins || 0}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-red-400">Losses:</span>
										<span className="text-white font-bold">{stats?.losses || 0}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-blue-400">Draws:</span>
										<span className="text-white font-bold">{stats?.draws || 0}</span>
									</div>
									<div className="border-t border-white/20 pt-2 mt-2">
										<div className="flex justify-between">
											<span className="text-yellow-400">Win Rate:</span>
											<span className="text-yellow-400 font-bold">{stats?.winRate || 0}%</span>
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
										<span className="text-white font-bold">{Math.floor((stats?.totalPlayTime || 0) / 60)}min</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Avg Game Time:</span>
										<span className="text-white font-bold">{Math.floor((stats?.averageGameTime || 0) / 60)}min</span>
									</div>
									<div className="flex justify-between">
										<span className="text-gray-400">Peak ELO:</span>
										<span className="text-yellow-400 font-bold">{ranking?.peakElo || ranking?.elo || 1200}</span>
									</div>
								</div>
							</div>
						</div>
					)}

					{activeTab === 'statistics' && (
						<div className="space-y-6">
							{/* Detailed Statistics */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
									<h3 className="text-xl font-bold text-white mb-4">Win Methods</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-400">Checkmate:</span>
											<span className="text-white font-bold">{stats?.winsByCheckmate || 0}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Timeout:</span>
											<span className="text-white font-bold">{stats?.winsByTimeout || 0}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Resignation:</span>
											<span className="text-white font-bold">{stats?.winsByResignation || 0}</span>
										</div>
									</div>
								</div>

								<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
									<h3 className="text-xl font-bold text-white mb-4">Move Analysis</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-400">Total Moves:</span>
											<span className="text-white font-bold">{stats?.totalMoves || 0}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Avg Moves/Game:</span>
											<span className="text-white font-bold">{stats?.averageMovesPerGame || 0}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-400">Games Played:</span>
											<span className="text-white font-bold">{stats?.gamesPlayed || 0}</span>
										</div>
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
										<div className="text-gray-400">This champion hasn't unlocked any achievements.</div>
									</div>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
