"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '../context/ModalContext';
import Navigation from '../components/Navigation';
import profileService from '../../utils/profileService';

export default function Dashboard() {
	const [games, setGames] = useState([]);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);
	const { showAlert } = useModal();
	const [refreshing, setRefreshing] = useState(false);
	const [profile, setProfile] = useState(null);
	const router = useRouter();

	// Function to fetch games
	async function fetchGames(isRefresh = false) {
		if (isRefresh) setRefreshing(true);
		else setLoading(true);

		try {
			const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game`, {
				credentials: 'include'
			});
			const games = await res.json();
			console.log(games)
			setGames(games || []);
			setError('');
		} catch (err) {
			setError('Failed to load games');
		} finally {
			setLoading(false);
			setRefreshing(false);
		}
	}
	// const joinGame = () =>{ 
	// 	return
	// 	router.push(`/game/${g._id}`)
	// }
	useEffect(() => {
		fetchGames();
		// Load profile
		const userProfile = profileService.getProfile();
		if (userProfile) {
			setProfile(userProfile);
		}
	}, []);

	async function createGame() {
		setError('');
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/create`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		});
		console.log(res)
		const data = await res.json();

		console.log('🎮 Create game response:', { status: res.status, data });

		if (res.ok && data.id) {
			// Refresh games list to show the new game at the top
			await fetchGames(true);
			console.log(data)
			// router.push(`/game/${data.id}`);
		} else {
			setError(data.error || 'Failed to create game. Please make sure you are logged in.');
		}
	}

	async function joinGame(gameId) {
		setError('');
		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/game/join/${gameId}`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' }
		});
		const data = await res.json();
		console.log(res)
		if (res.ok) {
			if (data.role === 'spectator') {
				await showAlert('Joining as spectator - this game already has 2 players');
			}
			router.push(`/game/${gameId}`);
		} else setError(data.error);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
			{/* Navigation */}
			<Navigation currentPage="dashboard" />

			{/* Animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="container mx-auto p-responsive max-w-7xl relative z-10 space-y-responsive">
				{/* Header */}
				<div className="text-center space-y-6">
					<div className="space-y-4">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-wide">
							<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
								CHESS
							</span>
							<span className="text-white">CHAMP</span>
						</h1>
						<div className="h-1 w-32 mx-auto chess-gold-gradient rounded-full"></div>
					</div>
					<p className="text-gray-300 text-xl font-light">Elite Gaming Arena</p>

					{/* Decorative elements */}
					<div className="flex justify-center space-x-4 sm:space-x-6 text-3xl sm:text-4xl">
						<span className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer">♜</span>
						<span className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">♞</span>
						<span className="opacity-100 pulse-glow">♔</span>
						<span className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">♝</span>
						<span className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer">♜</span>
					</div>
				</div>

				{/* Action Bar */}
				<div className="flex flex-col lg:flex-row justify-between items-center gap-6">
					<div className="text-center lg:text-left space-y-2">
						<div className="flex items-center justify-center lg:justify-start space-x-3">
							<h2 className="text-2xl sm:text-3xl font-bold text-white">Battle Arena</h2>
							{refreshing && (
								<div className="flex items-center space-x-2">
									<div className="w-6 h-6 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></div>
									<span className="text-yellow-400 text-sm font-semibold">Refreshing...</span>
								</div>
							)}
						</div>
						<p className="text-gray-300 text-lg">Choose your next conquest</p>
					</div>
					<div className="flex justify-center lg:justify-end">
						{/* Create Game Button */}
						<button
							onClick={createGame}
							className="cursor-pointer btn-primary text-lg flex items-center space-x-2"
						>
							<span>⚔️</span>
							<span>CREATE BATTLE</span>
						</button>
					</div>
				</div>

				{/* Error Message */}
				{error && (
					<div className="glass rounded-2xl p-6 mb-8 border border-red-400/30 backdrop-blur-sm">
						<div className="flex items-center justify-center space-x-3">
							<span className="text-2xl">⚠️</span>
							<span className="text-red-300 font-semibold text-lg">{error}</span>
						</div>
					</div>
				)}

				{/* Games Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
					{games.map(g => (
						<div key={g._id} className="glass rounded-3xl p-6 chess-shadow backdrop-blur-xl border border-white/20 hover:border-yellow-400/30 transition-all duration-300 hover:scale-105 group">
							{/* Game Header */}
							<div className="flex items-center justify-between mb-6">
								<div className="text-lg font-bold text-white font-mono flex items-center space-x-2">
									<span className="text-yellow-400">🎯</span>
									<span>#{g._id.substring(0, 8)}</span>
								</div>
								<div className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border ${g.status === 'finished'
									? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
									: g.status === 'active'
										? 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse'
										: 'bg-blue-500/20 text-blue-400 border-blue-500/50'
									}`}>
									{g.status === 'active' ? '🔥 LIVE' : g.status}
								</div>
							</div>

							{/* Winner Display */}
							{g.status === 'finished' && g.winner && (
								<div className="glass rounded-2xl p-6 mb-6 border border-emerald-500/30 backdrop-blur-sm">
									<div className="text-center">
										<div className="text-4xl mb-3">🏆</div>
										<div className="text-emerald-400 font-bold text-xl mb-2">
											Victory Achieved!
										</div>
										<div className="text-white font-semibold text-lg">
											{g.winner.username || 'Champion'}
										</div>
										{g.winReason && (
											<div className="text-gray-300 text-sm mt-2 px-3 py-1 bg-white/10 rounded-full">
												{g.winReason}
											</div>
										)}
									</div>
								</div>
							)}

							{/* Game Details */}
							<div className="space-y-4 mb-6">
								{g.gameType === 'tournament' && g.scheduledStartTime && (
									<div className="flex justify-between items-center p-4 glass rounded-2xl">
										<div className="flex items-center space-x-2">
											<span className="text-green-400">⏰</span>
											<span className="text-gray-300">Scheduled</span>
										</div>
										<span className="text-green-400 font-semibold text-sm">
											{new Date(g.scheduledStartTime).toLocaleString()}
										</span>
									</div>
								)}

								<div className="flex justify-between items-center p-4 glass rounded-2xl">
									<div className="flex items-center space-x-2">
										<span className="text-blue-400">🎮</span>
										<span className="text-gray-300">Players</span>
									</div>
									<div className="text-white font-semibold">
										{g.gameType === 'tournament' && g.opponent ? (
											<span className="text-sm px-3 py-1 bg-white/10 rounded-full">
												{g.host.username} vs {g.opponent.username}
											</span>
										) : g.opponent ? (
											<span className="text-sm px-3 py-1 bg-white/10 rounded-full">
												{g.host.username} vs {g.opponent.username}
											</span>
										) : (
											<span className="text-sm px-3 py-1 bg-white/10 rounded-full">
												{g.host.username} (waiting for opponent)
											</span>
										)}
									</div>
								</div>
							</div>

							{/* Action Button */}
							<div className="mt-6">
								{g.status === 'waiting' && g.userRole === 'spectator' && (
									<button
										onClick={() => joinGame(g._id)}
										className="btn-primary w-full text-lg flex items-center justify-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
									>
										<span>⚔️</span>
										<span>JOIN BATTLE</span>
									</button>
								)}
								{g.status === 'waiting' && (
									<button
										onClick={() => joinGame(g._id)}
										className="cursor-pointer w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 flex items-center justify-center space-x-2"
									>
										<span>⚙️</span>
										<span>PREPARE BATTLE</span>
									</button>
								)}
								{g.status === 'active' && (
									<button
										onClick={() => joinGame(g._id)}
										className="cursor-pointer w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 animate-pulse flex items-center justify-center space-x-2"
									>
										<span>⚡</span>
										<span>CONTINUE BATTLE</span>
									</button>
								)}
								{g.status === 'active' && g.userRole === 'spectator' && (
									<button
										onClick={() => joinGame(g._id)}
										className="cursor-pointer w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 flex items-center justify-center space-x-2"
									>
										<span>�️</span>
										<span>SPECTATE</span>
									</button>
								)}
								{g.status === 'finished' && (
									<button
										onClick={() => joinGame(g._id)}
										className="cursor-pointer w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-6 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl transform active:scale-95 flex items-center justify-center space-x-2"
									>
										<span>�</span>
										<span>VIEW RESULTS</span>
									</button>
								)}
							</div>
						</div>
					))}
				</div>

				{/* Empty State */}
				{games.length === 0 && !error && (
					<div className="text-center py-20">
						<div className="glass rounded-3xl p-12 max-w-lg mx-auto backdrop-blur-xl border border-white/20">
							<div className="text-8xl mb-6">♔</div>
							<h3 className="text-2xl font-bold text-white mb-4">No Active Battles</h3>
							<p className="text-gray-300 mb-8">The arena awaits your first move, Champion.</p>
							<button
								onClick={createGame}
								className="chess-gold-gradient text-black px-8 py-4 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 transform active:scale-95 flex items-center space-x-2 mx-auto"
							>
								<span>⚔️</span>
								<span>START YOUR FIRST BATTLE</span>
							</button>
						</div>
					</div>
				)}

				{/* Footer Stats */}
				<div className="mt-16">
					<div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20">
						<div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
							<div>
								<div className="text-4xl mb-2">🏆</div>
								<div className="text-yellow-400 font-bold text-2xl">1,247</div>
								<div className="text-gray-400">Active Champions</div>
							</div>
							<div>
								<div className="text-4xl mb-2">⚔️</div>
								<div className="text-yellow-400 font-bold text-2xl">89</div>
								<div className="text-gray-400">Live Battles</div>
							</div>
							<div>
								<div className="text-4xl mb-2">💰</div>
								<div className="text-yellow-400 font-bold text-2xl">$12.5K</div>
								<div className="text-gray-400">Daily Stakes</div>
							</div>
							<div>
								<div className="text-4xl mb-2">🔥</div>
								<div className="text-yellow-400 font-bold text-2xl">24/7</div>
								<div className="text-gray-400">Action</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Floating Refresh Button */}
			<button
				onClick={() => fetchGames(true)}
				disabled={refreshing || loading}
				className={`fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full transition-all duration-300 shadow-2xl ${refreshing
					? 'bg-blue-500/80 animate-spin'
					: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:scale-110 active:scale-95'
					} text-white flex items-center justify-center font-bold text-xl backdrop-blur-sm border border-white/20`}
				title="Refresh Games"
			>
				{refreshing ? '⟳' : '↻'}
			</button>
		</div>
	);
}
