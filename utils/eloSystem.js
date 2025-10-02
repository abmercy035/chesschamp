// ELO Rating System Utilities

export const getEloTier = (elo) => {
	if (elo >= 2200) return {
		name: 'Grandmaster',
		color: 'text-purple-400',
		bg: 'bg-purple-500/20',
		border: 'border-purple-500/50',
		icon: '👑',
		shortName: 'GM',
		range: '2200+'
	};
	if (elo >= 2000) return {
		name: 'Master',
		color: 'text-yellow-400',
		bg: 'bg-yellow-500/20',
		border: 'border-yellow-500/50',
		icon: '🏆',
		shortName: 'M',
		range: '2000-2199'
	};
	if (elo >= 1800) return {
		name: 'Expert',
		color: 'text-orange-400',
		bg: 'bg-orange-500/20',
		border: 'border-orange-500/50',
		icon: '💎',
		shortName: 'E',
		range: '1800-1999'
	};
	if (elo >= 1600) return {
		name: 'Advanced',
		color: 'text-blue-400',
		bg: 'bg-blue-500/20',
		border: 'border-blue-500/50',
		icon: '⚡',
		shortName: 'A',
		range: '1600-1799'
	};
	if (elo >= 1400) return {
		name: 'Intermediate',
		color: 'text-green-400',
		bg: 'bg-green-500/20',
		border: 'border-green-500/50',
		icon: '🎯',
		shortName: 'I',
		range: '1400-1599'
	};
	if (elo >= 1200) return {
		name: 'Amateur',
		color: 'text-cyan-400',
		bg: 'bg-cyan-500/20',
		border: 'border-cyan-500/50',
		icon: '🔥',
		shortName: 'Am',
		range: '1200-1399'
	};
	if (elo >= 1000) return {
		name: 'Novice',
		color: 'text-gray-400',
		bg: 'bg-gray-500/20',
		border: 'border-gray-500/50',
		icon: '⭐',
		shortName: 'N',
		range: '1000-1199'
	};
	return {
		name: 'Beginner',
		color: 'text-slate-400',
		bg: 'bg-slate-500/20',
		border: 'border-slate-500/50',
		icon: '🌱',
		shortName: 'B',
		range: '800-999'
	};
};

// Get rank icon for leaderboard position
export const getRankIcon = (position) => {
	if (position === 1) return '🥇';
	if (position === 2) return '🥈';
	if (position === 3) return '🥉';
	if (position <= 10) return '🏆';
	if (position <= 50) return '⭐';
	if (position <= 100) return '🔥';
	return '📊';
};

// ELO change calculation (basic)
export const calculateEloChange = (playerElo, opponentElo, result, kFactor = 32) => {
	const expectedScore = 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
	const actualScore = result; // 1 for win, 0.5 for draw, 0 for loss
	return Math.round(kFactor * (actualScore - expectedScore));
};

// Get all ELO tiers for display
export const getAllEloTiers = () => {
	return [
		{ ...getEloTier(2200), minElo: 2200, maxElo: 3000 },
		{ ...getEloTier(2000), minElo: 2000, maxElo: 2199 },
		{ ...getEloTier(1800), minElo: 1800, maxElo: 1999 },
		{ ...getEloTier(1600), minElo: 1600, maxElo: 1799 },
		{ ...getEloTier(1400), minElo: 1400, maxElo: 1599 },
		{ ...getEloTier(1200), minElo: 1200, maxElo: 1399 },
		{ ...getEloTier(1000), minElo: 1000, maxElo: 1199 },
		{ ...getEloTier(800), minElo: 800, maxElo: 999 }
	];
};

// Format ELO display with trend
export const formatEloDisplay = (elo, peakElo = null, recentChange = null) => {
	const tier = getEloTier(elo);
	const display = {
		elo,
		tier,
		isPeak: peakElo && elo === peakElo,
		change: recentChange
	};
	return display;
};
