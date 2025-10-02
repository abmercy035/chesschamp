'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navigation from '../components/Navigation';
import { getEloTier, getRankIcon } from '../../utils/eloSystem';

export default function LeaderboardPage() {
	const [activeTab, setActiveTab] = useState('elo');
	const [leaderboardData, setLeaderboardData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState({});
	const [countries, setCountries] = useState(['All']);
	const [selectedCountry, setSelectedCountry] = useState('All');

	const API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/leaderboard`;

	// Fetch leaderboard data
	const fetchLeaderboard = async (type, page = 1, country = 'All') => {
		setLoading(true);
		try {
			let url = `${API_BASE}/${type}?page=${page}&limit=50`;
			if (country && country !== 'All') {
				url += `&country=${encodeURIComponent(country)}`;
			}
			
			const response = await fetch(url, {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				setLeaderboardData(data.leaderboard);
				setPagination(data.pagination);
			}
		} catch (error) {
			console.error('Error fetching leaderboard:', error);
		}
		setLoading(false);
	};

	// Fetch countries for filter
	const fetchCountries = async () => {
		try {
			const response = await fetch(`${API_BASE}/countries`, {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				setCountries(data.countries);
			}
		} catch (error) {
			console.error('Error fetching countries:', error);
		}
	};

	useEffect(() => {
		fetchCountries();
	}, []);

	useEffect(() => {
		fetchLeaderboard(activeTab, currentPage, selectedCountry);
	}, [activeTab, currentPage, selectedCountry]);

	const handleTabChange = (tab) => {
		setActiveTab(tab);
		setCurrentPage(1);
	};

	const handlePageChange = (page) => {
		setCurrentPage(page);
		fetchLeaderboard(activeTab, page, selectedCountry);
	};

	const handleCountryChange = (country) => {
		setSelectedCountry(country);
		setCurrentPage(1);
	};

	// Using imported functions from eloSystem.js

	const tabs = [
		{ id: 'elo', name: 'ELO Rankings', icon: '⭐' },
		{ id: 'winrate', name: 'Win Rate', icon: '🎯' },
		{ id: 'games', name: 'Most Active', icon: '🎮' },
		{ id: 'streaks', name: 'Win Streaks', icon: '🔥' },
		{ id: 'monthly', name: 'Monthly', icon: '📅' }
	];

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
			{/* Navigation */}
			<Navigation currentPage="leaderboard" />

			{/* Animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl relative z-10 space-y-10">
				{/* Header */}
				<div className="text-center space-y-6">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
						🏆 Chess Champions Leaderboard
					</h1>
					<p className="text-gray-400 text-lg">
						Compete with the best chess players worldwide
					</p>
				</div>

				{/* Navigation Tabs */}
				<div className="flex flex-wrap justify-center gap-2 mb-6">
					{tabs.map((tab) => (
						<button
							key={tab.id}
							onClick={() => handleTabChange(tab.id)}
							className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
								? 'bg-yellow-500 text-black shadow-lg'
								: 'bg-white/10 text-gray-300 hover:bg-white/20'
								}`}
						>
							<span className="mr-2">{tab.icon}</span>
							{tab.name}
						</button>
					))}
				</div>

				{/* Country Filter */}
				<div className="flex justify-center mb-8">
					<div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm border border-white/20">
						<div className="flex items-center space-x-3">
							<span className="text-white font-medium">🌍 Filter by Country:</span>
							<select
								value={selectedCountry}
								onChange={(e) => handleCountryChange(e.target.value)}
								className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 min-w-[200px]"
							>
								{countries.map(country => (
									<option key={country} value={country} className="bg-gray-800">
										{country}
									</option>
								))}
							</select>
							{selectedCountry !== 'All' && (
								<button
									onClick={() => handleCountryChange('All')}
									className="text-yellow-400 hover:text-yellow-300 transition-colors"
									title="Clear filter"
								>
									✕
								</button>
							)}
						</div>
					</div>
				</div>

				{/* Loading State */}
				{loading && (
					<div className="text-center py-12">
						<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
						<p className="text-gray-300 mt-4">Loading leaderboard...</p>
					</div>
				)}

				{/* Leaderboards */}
				{!loading && (
					<div className="space-y-6">
						{/* Leaderboard Table */}
						<div className="glass rounded-3xl backdrop-blur-xl border border-white/20 overflow-hidden">
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="bg-white/5">
											<th className="px-6 py-4 text-left text-white font-semibold">Rank</th>
											<th className="px-6 py-4 text-left text-white font-semibold">Player</th>
											{activeTab === 'elo' && <th className="px-6 py-4 text-center text-white font-semibold">ELO</th>}
											{activeTab === 'winrate' && <th className="px-6 py-4 text-center text-white font-semibold">Win Rate</th>}
											{activeTab === 'games' && <th className="px-6 py-4 text-center text-white font-semibold">Games</th>}
											{activeTab === 'streaks' && <th className="px-6 py-4 text-center text-white font-semibold">Best Streak</th>}
											{activeTab === 'monthly' && <th className="px-6 py-4 text-center text-white font-semibold">Monthly Games</th>}
											<th className="px-6 py-4 text-center text-white font-semibold">Country</th>
											<th className="px-6 py-4 text-center text-white font-semibold">Games</th>
											<th className="px-6 py-4 text-center text-white font-semibold">W/L/D</th>
										</tr>
									</thead>
									<tbody>
										{leaderboardData.map((player, index) => (
											<tr key={index} className={`border-t border-white/10 ${player.isCurrentUser ? 'bg-yellow-500/20' : 'hover:bg-white/5'}`}>
												<td className="px-6 py-4">
													<span className="text-lg font-bold text-white">
														{getRankIcon(player.rank)}
													</span>
												</td>
												<td className="px-6 py-4">
													<div className="flex items-center space-x-3">
														<span className="text-2xl">{player.avatar}</span>
														<div>
															<Link href={`/profile/${player.username}`} className="text-white font-medium hover:text-yellow-300">
																{player.displayName}
															</Link>
															<div className="text-sm text-gray-400">
																{player.rank_title}
															</div>
														</div>
													</div>
												</td>
												{activeTab === 'elo' && (
													<td className="px-6 py-4 text-center">
														<div className="flex flex-col items-center space-y-1">
															<div className={`inline-flex items-center space-x-2 px-2 py-1 rounded-lg ${getEloTier(player.elo).bg} ${getEloTier(player.elo).border} border`}>
																<span className="text-lg">{getEloTier(player.elo).icon}</span>
																<span className={`font-bold ${getEloTier(player.elo).color}`}>
																	{getEloTier(player.elo).shortName}
																</span>
															</div>
															<span className="text-xl font-bold text-white">
																{player.elo}
															</span>
															<span className="text-xs text-gray-400">
																{getEloTier(player.elo).name}
															</span>
														</div>
													</td>
												)}
												{activeTab === 'winrate' && (
													<td className="px-6 py-4 text-center">
														<span className="text-xl font-bold text-yellow-400">
															{player.winRate}%
														</span>
													</td>
												)}
												{activeTab === 'games' && (
													<td className="px-6 py-4 text-center">
														<span className="text-xl font-bold text-blue-400">
															{player.gamesPlayed}
														</span>
													</td>
												)}
												{activeTab === 'streaks' && (
													<td className="px-6 py-4 text-center">
														<span className="text-xl font-bold text-orange-400">
															🔥 {player.bestWinStreak}
														</span>
													</td>
												)}
												{activeTab === 'monthly' && (
													<td className="px-6 py-4 text-center">
														<span className="text-xl font-bold text-green-400">
															{player.monthlyGames || 0}
														</span>
													</td>
												)}
												<td className="px-6 py-4 text-center text-gray-300">
													<span className="text-sm font-medium">
														{player.country || 'Unknown'}
													</span>
												</td>
												<td className="px-6 py-4 text-center text-gray-300">
													{player.gamesPlayed}
												</td>
												<td className="px-6 py-4 text-center text-sm">
													<span className="text-green-400">{player.wins}</span>/
													<span className="text-red-400">{player.losses}</span>/
													{activeTab !== 'monthly' && <span className="text-gray-400">/{player.draws || 0}</span>}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>

						{/* Pagination */}
						{pagination && pagination.totalPages > 1 && (
							<div className="flex justify-center items-center space-x-4">
								<button
									onClick={() => handlePageChange(currentPage - 1)}
									disabled={!pagination.hasPrev}
									className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
								>
									Previous
								</button>
								<span className="text-white">
									Page {pagination.currentPage} of {pagination.totalPages}
								</span>
								<button
									onClick={() => handlePageChange(currentPage + 1)}
									disabled={!pagination.hasNext}
									className="px-4 py-2 rounded-lg bg-white/10 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-colors"
								>
									Next
								</button>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
