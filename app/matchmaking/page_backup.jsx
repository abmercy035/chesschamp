'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MatchmakingPage() {
	const [userElo, setUserElo] = useState(1200);
	const [queueInfo, setQueueInfo] = useState([]);
	const [isSearching, setIsSearching] = useState(false);
	const [matchFound, setMatchFound] = useState(null);
	const [searchAttempts, setSearchAttempts] = useState(0);
	const [error, setError] = useState('');
	const router = useRouter();

	// ELO tier system
	const getEloTier = (elo) => {
		if (elo >= 2200) return { name: 'Grandmaster', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '👑' };
		if (elo >= 2000) return { name: 'Master', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '🏆' };
		if (elo >= 1800) return { name: 'Expert', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '💎' };
		if (elo >= 1600) return { name: 'Advanced', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '⚡' };
		if (elo >= 1400) return { name: 'Intermediate', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🎯' };
		if (elo >= 1200) return { name: 'Amateur', color: 'text-cyan-400', bg: 'bg-cyan-500/20', icon: '🔥' };
		if (elo >= 1000) return { name: 'Novice', color: 'text-gray-400', bg: 'bg-gray-500/20', icon: '⭐' };
		return { name: 'Beginner', color: 'text-slate-400', bg: 'bg-slate-500/20', icon: '🌱' };
	};

	// Fetch queue info and user ELO
	const fetchQueueInfo = async () => {
		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/queue`, {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				setQueueInfo(data.queueInfo);
				setUserElo(data.currentUserElo);
			}
		} catch (error) {
			console.error('Error fetching queue info:', error);
		}
	};

	// Start matchmaking search
	const startMatchmaking = async () => {
		setIsSearching(true);
		setError('');
		setMatchFound(null);
		setSearchAttempts(prev => prev + 1);

		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/matchmake`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			if (data.success && data.match) {
				setMatchFound(data.match);
			} else {
				setError(data.message || 'No suitable opponents found');
			}
		} catch (error) {
			setError('Error finding match: ' + error.message);
		}

		setIsSearching(false);
	};

	// Accept match and create game
	const acceptMatch = async () => {
		if (!matchFound) return;

		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/create-ranked-game`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ opponentId: matchFound.userId })
			});

			const data = await response.json();

			if (data.success) {
				router.push(`/game/${data.gameId}`);
			} else {
				setError('Failed to create ranked game');
			}
		} catch (error) {
			setError('Error creating game: ' + error.message);
		}
	};

	useEffect(() => {
		fetchQueueInfo();
		const interval = setInterval(fetchQueueInfo, 30000); // Refresh every 30 seconds
		return () => clearInterval(interval);
	}, []);

	const currentTier = getEloTier(userElo);

	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
			{/* Animated background */}
			<div className="absolute inset-0">
				<div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-0 right-1/4 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="container mx-auto p-4 sm:p-6 lg:p-8 max-w-7xl relative z-10 space-y-10">
				{/* Header */}
				<div className="text-center space-y-6">
					<h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent mb-2">
						🎯 Skill-Based Matchmaking
					</h1>
					<p className="text-gray-400">Find opponents matching your skill level</p>
				</div>

				{/* User's Current Rating */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
					<h2 className="text-2xl font-bold text-white mb-4">Your Rating</h2>
					<div className="flex items-center space-x-4">
						<div className={`${currentTier.bg} p-4 rounded-lg`}>
							<span className="text-3xl">{currentTier.icon}</span>
						</div>
						<div>
							<div className="flex items-center space-x-2">
								<span className={`text-xl font-bold ${currentTier.color}`}>
									{currentTier.name}
								</span>
								<span className="text-white text-2xl font-bold">
									{userElo}
								</span>
							</div>
							<p className="text-gray-400">ELO Rating</p>
						</div>
					</div>
				</div>

				{/* Queue Information */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
					<h2 className="text-2xl font-bold text-white mb-4">Active Players by Rank</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{queueInfo.map((range) => {
							const tier = getEloTier(range.min + 100); // Representative ELO for the range
							return (
								<div
									key={range.name}
									className={`p-4 rounded-lg border ${range.isCurrentUserRange
										? 'border-yellow-500 bg-yellow-500/20'
										: 'border-white/20 bg-white/5'
										}`}
								>
									<div className="flex items-center space-x-2 mb-2">
										<span className="text-2xl">{tier.icon}</span>
										<span className={`font-medium ${tier.color}`}>
											{range.name}
										</span>
									</div>
									<div className="text-sm text-gray-400">
										{range.min}-{range.max} ELO
									</div>
									<div className="text-lg font-bold text-white">
										{range.activePlayersCount} players
									</div>
								</div>
							);
						})}
					</div>
				</div>

				{/* Matchmaking Section */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
					<h2 className="text-2xl font-bold text-white mb-4">Find Match</h2>

					{!matchFound && !isSearching && (
						<div className="text-center">
							<button
								onClick={startMatchmaking}
								className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
							>
								🎯 Find Ranked Match
							</button>
							<p className="text-gray-400 mt-2">
								We'll find an opponent close to your skill level
							</p>
							{searchAttempts > 0 && (
								<p className="text-gray-500 mt-1 text-sm">
									Searches attempted: {searchAttempts}
								</p>
							)}
						</div>
					)}

					{isSearching && (
						<div className="text-center py-8">
							<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mb-4"></div>
							<p className="text-white text-lg">Searching for opponent...</p>
							<p className="text-gray-400">Looking for players near {userElo} ELO</p>
						</div>
					)}

					{matchFound && (
						<div className="bg-green-500/20 border border-green-500/50 rounded-lg p-6">
							<div className="text-center mb-4">
								<h3 className="text-xl font-bold text-green-400 mb-2">
									✅ Match Found!
								</h3>
								<div className="flex justify-center items-center space-x-6">
									<div className="text-center">
										<div className="text-2xl mb-1">{matchFound.avatar}</div>
										<div className="font-medium text-white">{matchFound.displayName}</div>
										<div className="text-sm text-gray-400">{matchFound.elo} ELO</div>
									</div>
									<div className="text-yellow-400 text-2xl">⚡</div>
									<div className="text-center">
										<div className="text-2xl mb-1">{currentTier.icon}</div>
										<div className="font-medium text-white">You</div>
										<div className="text-sm text-gray-400">{userElo} ELO</div>
									</div>
								</div>
								<div className="mt-4 space-y-2">
									<p className="text-gray-300">
										<span className="font-medium">Match Quality:</span> {matchFound.matchQuality}
									</p>
									<p className="text-gray-300">
										<span className="font-medium">ELO Difference:</span> {matchFound.eloDifference} points
									</p>
									<p className="text-gray-300">
										<span className="font-medium">Opponent Games:</span> {matchFound.gamesPlayed}
									</p>
								</div>
							</div>

							<div className="flex justify-center space-x-4">
								<button
									onClick={acceptMatch}
									className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg"
								>
									Accept Match
								</button>
								<button
									onClick={() => setMatchFound(null)}
									className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-lg"
								>
									Decline
								</button>
							</div>
						</div>
					)}

					{error && (
						<div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-center">
							<p className="text-red-400">{error}</p>
							<button
								onClick={startMatchmaking}
								className="mt-2 text-yellow-400 hover:text-yellow-300 underline"
							>
								Try Again
							</button>
						</div>
					)}
				</div>

				{/* Back to Dashboard */}
				<div className="text-center">
					<button
						onClick={() => router.push('/dashboard')}
						className="text-gray-400 hover:text-white underline"
					>
						← Back to Dashboard
					</button>
				</div>
			</div>
		</div>
	);
}
