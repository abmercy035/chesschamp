"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAbly } from '../context/AblyContext';

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

export default function MatchmakingPage() {
	const [userElo, setUserElo] = useState(1200);
	const [queueInfo, setQueueInfo] = useState([]);
	const [isInQueue, setIsInQueue] = useState(false);
	const [queuePosition, setQueuePosition] = useState(null);
	const [queueSize, setQueueSize] = useState(0);
	const [matchFound, setMatchFound] = useState(null);
	const [pendingMatch, setPendingMatch] = useState(null);
	const [waitingForOpponent, setWaitingForOpponent] = useState(false);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const router = useRouter();
	const ably = useAbly();

	// ELO tier system
	const getEloTier = (elo) => {
		if (elo >= 2200) return { name: 'Grandmaster', color: 'text-purple-400', bg: 'bg-purple-500/20', icon: '👑' };
		if (elo >= 2000) return { name: 'Master', color: 'text-yellow-400', bg: 'bg-yellow-500/20', icon: '🏆' };
		if (elo >= 1800) return { name: 'Expert', color: 'text-red-400', bg: 'bg-red-500/20', icon: '⚔️' };
		if (elo >= 1600) return { name: 'Advanced', color: 'text-orange-400', bg: 'bg-orange-500/20', icon: '🔥' };
		if (elo >= 1400) return { name: 'Intermediate', color: 'text-blue-400', bg: 'bg-blue-500/20', icon: '⚡' };
		if (elo >= 1200) return { name: 'Amateur', color: 'text-green-400', bg: 'bg-green-500/20', icon: '🌟' };
		if (elo >= 1000) return { name: 'Novice', color: 'text-teal-400', bg: 'bg-teal-500/20', icon: '🚀' };
		return { name: 'Beginner', color: 'text-slate-400', bg: 'bg-slate-500/20', icon: '🌱' };
	};

	// Setup Ably real-time notifications
	useEffect(() => {
		if (!ably) return;

		const userChannel = ably.channels.get(`user-${userElo}`); // We'll need actual user ID here
		
		// Listen for match found notifications
		userChannel.subscribe('matchFound', (message) => {
			// Match found notification received
			setMatchFound(message.data);
			setIsInQueue(false);
		});

		// Listen for match declined notifications
		userChannel.subscribe('matchDeclined', (message) => {
			// Match declined notification received
			setMatchFound(null);
			setPendingMatch(null);
			setWaitingForOpponent(false);
			setError(message.data.message);
			// Automatically rejoin queue after decline
			setTimeout(() => joinQueue(), 2000);
		});

		// Listen for game starting notifications
		userChannel.subscribe('gameStarting', (message) => {
			// Game starting notification received
			router.push(`/game/${message.data.gameId}`);
		});

		return () => {
			userChannel.unsubscribe();
		};
	}, [ably, router, userElo]);

	// Fetch queue info and user status
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
			// Error fetching queue info
		}
	};

	// Check queue status
	const checkQueueStatus = async () => {
		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/queue-status`, {
				credentials: 'include'
			});

			if (response.ok) {
				const data = await response.json();
				setIsInQueue(data.inQueue);
				setQueuePosition(data.queuePosition);
				setQueueSize(data.queueSize);
				setPendingMatch(data.pendingMatch);
			}
		} catch (error) {
			// Error checking queue status
		}
	};

	// Join matchmaking queue
	const joinQueue = async () => {
		setIsLoading(true);
		setError('');

		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/join-queue`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' }
			});

			const data = await response.json();

			if (data.success) {
				if (data.status === 'matched') {
					setMatchFound({
						matchId: data.matchId,
						opponent: data.opponent,
						eloDifference: data.eloDifference
					});
				} else {
					setIsInQueue(true);
					setQueuePosition(data.queuePosition);
					setQueueSize(data.queueSize);
				}
			} else {
				setError(data.message || 'Failed to join queue');
			}
		} catch (error) {
			setError('Error joining queue: ' + error.message);
		}

		setIsLoading(false);
	};

	// Leave matchmaking queue
	const leaveQueue = async () => {
		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/leave-queue`, {
				method: 'POST',
				credentials: 'include'
			});

			if (response.ok) {
				setIsInQueue(false);
				setQueuePosition(null);
				setMatchFound(null);
			}
		} catch (error) {
			setError('Error leaving queue: ' + error.message);
		}
	};

	// Accept or decline match
	const respondToMatch = async (accept) => {
		if (!matchFound) return;

		setIsLoading(true);
		try {
			const response = await fetch(`${API_BASE}/api/matchmaking/confirm-match`, {
				method: 'POST',
				credentials: 'include',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					matchId: matchFound.matchId, 
					accept 
				})
			});

			const data = await response.json();

			if (data.success) {
				if (accept) {
					if (data.status === 'game_starting') {
						router.push(`/game/${data.gameId}`);
					} else {
						setWaitingForOpponent(true);
						setMatchFound(null);
					}
				} else {
					setMatchFound(null);
					setError('Match declined. Searching for new opponents...');
					// Automatically rejoin queue
					setTimeout(() => joinQueue(), 1000);
				}
			} else {
				setError(data.error || 'Failed to respond to match');
			}
		} catch (error) {
			setError('Error responding to match: ' + error.message);
		}

		setIsLoading(false);
	};

	useEffect(() => {
		fetchQueueInfo();
		checkQueueStatus();
		
		const interval = setInterval(() => {
			fetchQueueInfo();
			checkQueueStatus();
		}, 5000); // Check every 5 seconds
		
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

			{/* Main Container */}
			<div className="container mx-auto p-6 max-w-4xl relative z-10">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-5xl font-black tracking-wide mb-4">
						<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
							MATCH
						</span>
						<span className="text-white">MAKING</span>
					</h1>
					<div className="h-1 w-32 mx-auto bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-4"></div>
					<p className="text-gray-300 text-lg">Find your perfect chess opponent</p>
				</div>

				{/* Navigation */}
				<div className="mb-6">
					<button
						onClick={() => router.push('/dashboard')}
						className="bg-black border border-white/20 hover:border-yellow-400/50 text-white hover:text-yellow-400 px-6 py-3 rounded-xl font-bold transition-all duration-300 hover:scale-105"
					>
						← Back to Dashboard
					</button>
				</div>

				{/* User ELO Card */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<div className={`w-16 h-16 ${currentTier.bg} rounded-full flex items-center justify-center border-2 border-white/20`}>
								<span className="text-2xl">{currentTier.icon}</span>
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
						{/* Queue Status */}
						<div className="text-right">
							{isInQueue && (
								<div className="text-green-400 font-bold">
									<div className="text-2xl animate-pulse">⏳</div>
									<div>Position #{queuePosition}</div>
									<div className="text-sm text-gray-400">of {queueSize} players</div>
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Error Display */}
				{error && (
					<div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 mb-6">
						<p className="text-red-400 font-semibold">⚠️ {error}</p>
					</div>
				)}

				{/* Match Found Modal */}
				{matchFound && (
					<div className="bg-green-500/20 border border-green-500/50 rounded-xl p-6 mb-6">
						<div className="text-center">
							<h3 className="text-2xl font-bold text-green-400 mb-4">
								🎉 Match Found!
							</h3>
							<div className="flex justify-center items-center space-x-6 mb-6">
								<div className="text-center">
									<div className="text-3xl mb-2">{currentTier.icon}</div>
									<div className="font-medium text-white">You</div>
									<div className="text-sm text-gray-400">{userElo} ELO</div>
								</div>
								<div className="text-yellow-400 text-3xl animate-pulse">⚡</div>
								<div className="text-center">
									<div className="text-3xl mb-2">{matchFound.opponent.avatar}</div>
									<div className="font-medium text-white">{matchFound.opponent.username}</div>
									<div className="text-sm text-gray-400">{matchFound.opponent.elo} ELO</div>
								</div>
							</div>
							<p className="text-gray-300 mb-6">
								ELO Difference: <span className="text-yellow-400 font-bold">±{matchFound.eloDifference}</span>
							</p>
							<div className="flex space-x-4">
								<button
									onClick={() => respondToMatch(true)}
									disabled={isLoading}
									className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
								>
									✅ ACCEPT BATTLE
								</button>
								<button
									onClick={() => respondToMatch(false)}
									disabled={isLoading}
									className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 disabled:opacity-50"
								>
									❌ DECLINE
								</button>
							</div>
						</div>
					</div>
				)}

				{/* Waiting for Opponent */}
				{waitingForOpponent && (
					<div className="bg-blue-500/20 border border-blue-500/50 rounded-xl p-6 mb-6">
						<div className="text-center">
							<div className="text-4xl mb-4 animate-pulse">⏳</div>
							<h3 className="text-xl font-bold text-blue-400 mb-2">
								Waiting for Opponent
							</h3>
							<p className="text-gray-300">
								You accepted the match! Waiting for your opponent to accept...
							</p>
						</div>
					</div>
				)}

				{/* Main Action Buttons */}
				{!matchFound && !waitingForOpponent && (
					<div className="text-center mb-8">
						{!isInQueue ? (
							<button
								onClick={joinQueue}
								disabled={isLoading}
								className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black py-6 px-12 rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 transform active:scale-95 disabled:opacity-50"
							>
								{isLoading ? '🔄 JOINING...' : '⚔️ START MATCHMAKING'}
							</button>
						) : (
							<button
								onClick={leaveQueue}
								className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-6 px-12 rounded-2xl font-black text-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl transform active:scale-95"
							>
								🚪 LEAVE QUEUE
							</button>
						)}
					</div>
				)}

				{/* Queue Status */}
				{isInQueue && (
					<div className="bg-yellow-500/20 border border-yellow-500/50 rounded-xl p-6 mb-6">
						<div className="text-center">
							<div className="text-4xl mb-4 animate-bounce">⏳</div>
							<h3 className="text-xl font-bold text-yellow-400 mb-2">
								Searching for Opponents...
							</h3>
							<p className="text-gray-300 mb-4">
								You are <span className="text-yellow-400 font-bold">#{queuePosition}</span> in queue
							</p>
							<div className="text-sm text-gray-400">
								{queueSize} players currently searching
							</div>
						</div>
					</div>
				)}

				{/* Queue Information */}
				<div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
					<h2 className="text-2xl font-bold text-white mb-4">Active Players by Rank</h2>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{queueInfo.map((range) => {
							const tier = getEloTier(range.min + 100); // Representative ELO for the range
							return (
								<div
									key={range.name}
									className={`p-4 rounded-xl border-2 transition-all duration-300 ${range.isCurrentUserRange
										? 'border-yellow-400/50 bg-yellow-500/20'
										: 'border-white/20 bg-white/5'
										}`}
								>
									<div className="text-center">
										<div className="text-2xl mb-2">{tier.icon}</div>
										<div className="font-bold text-white text-sm mb-1">
											{range.name}
										</div>
										<div className="text-xs text-gray-400 mb-2">
											{range.min}-{range.max} ELO
										</div>
										<div className={`font-bold ${range.activePlayersCount > 0 ? 'text-green-400' : 'text-gray-500'}`}>
											{range.activePlayersCount} players
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</div>

			<style jsx>{`
				.floating-animation {
					animation: floating 6s ease-in-out infinite;
				}
				@keyframes floating {
					0% { transform: translateY(0px); }
					50% { transform: translateY(-20px); }
					100% { transform: translateY(0px); }
				}
			`}</style>
		</div>
	);
}
