'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import profileService from '../../utils/profileService';

export default function Navigation({ currentPage = '' }) {
	const router = useRouter();
	const [profile, setProfile] = useState(null);
	const [loading, setLoading] = useState(true);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	// Close mobile menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (mobileMenuOpen && !event.target.closest('nav')) {
				setMobileMenuOpen(false);
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	}, [mobileMenuOpen]);

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const userProfile = await profileService.getProfile();
				if (userProfile) {
					setProfile(userProfile);
				}
			} catch (error) {
				console.error('Error loading profile for nav:', error);
			} finally {
				setLoading(false);
			}
		};

		loadProfile();

		// Set up periodic refresh every 30 seconds to catch profile updates
		const refreshInterval = setInterval(async () => {
			try {
				const userProfile = await profileService.getProfile();
				if (userProfile) {
					setProfile(userProfile);
				}
			} catch (error) {
				console.error('Error refreshing profile in nav:', error);
			}
		}, 30000); // Refresh every 30 seconds

		return () => clearInterval(refreshInterval);
	}, []);

	const handleLogout = async () => {
		try {
			await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/logout`, {
				method: 'POST',
				credentials: 'include'
			});
			router.push('/login');
		} catch (error) {
			console.error('Logout error:', error);
			router.push('/login');
		}
	};

	return (
		<nav className="w-full bg-black/20 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
			<div className="max-w-7xl mx-auto px-6 py-4">
				<div className="flex items-center justify-between">

					{/* Logo */}
					<button
						onClick={() => router.push('/dashboard')}
						className="flex items-center space-x-3 group"
					>
						<div className="text-3xl">♔</div>
						<div>
							<div className="text-xl font-black">
								<span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">CHESS</span>
								<span className="text-white">CHAMP</span>
							</div>
						</div>
					</button>

					{/* Navigation Links */}
					<div className="hidden md:flex items-center space-x-6">
						<button
							onClick={() => router.push('/dashboard')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'dashboard'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							🏠 Dashboard
						</button>

						<button
							onClick={() => router.push('/matchmaking')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'matchmaking'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							🎯 Matchmaking
						</button>

						<button
							onClick={() => router.push('/leaderboard')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'leaderboard'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							📊 Leaderboard
						</button>

						<button
							onClick={() => router.push('/profile')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'profile'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							👤 Profile
						</button>

						<button
							onClick={() => router.push('/rules')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'rules'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							♟️ Rules
						</button>

						<button
							onClick={() => router.push('/how-to-play')}
							className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'how-to-play'
								? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
								: 'text-gray-300 hover:text-white hover:bg-white/10'
								}`}
						>
							📚 How to Play
						</button>						{/* Admin Button - Only show for admin users */}
						{profile?.username === 'admin' && (
							<button
								onClick={() => router.push('/admin')}
								className={`cursor-pointer px-4 py-2 rounded-xl font-semibold transition-all ${currentPage === 'admin'
									? 'bg-red-500/20 text-red-400 border border-red-400/30'
									: 'text-gray-300 hover:text-red-400 hover:bg-red-400/10'
									}`}
							>
								⚙️ Admin
							</button>
						)}
					</div>

					{/* User Profile & Actions */}
					<div className="flex items-center space-x-4">

						{/* Profile Info */}
						{!loading && profile && (
							<button
								onClick={() => router.push('/profile')}
								className="cursor-pointer hidden sm:flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105"
							>
								<div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-lg">
									{profile.avatar || '♔'}
								</div>
								<div className="text-left">
									<div className="text-white font-bold text-sm">
										{profile.displayName || profile.username || 'Champion'}
									</div>
									<div className="text-gray-400 text-xs">
										{(profile.ranking?.elo || 1200)} ELO
									</div>
								</div>
							</button>
						)}

						{/* Mobile Menu Button */}
						<div className="md:hidden">
							<button
								onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
								className="cursor-pointer text-white p-2 rounded-xl hover:bg-white/10 transition-colors"
								aria-label="Toggle mobile menu"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									{mobileMenuOpen ? (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									) : (
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
									)}
								</svg>
							</button>
						</div>

						{/* Logout Button */}
						<button
							onClick={handleLogout}
							className="cursor-pointer text-gray-400 hover:text-red-400 transition-colors p-2 rounded-xl hover:bg-red-400/10"
							title="Logout"
						>
							<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
							</svg>
						</button>
					</div>
				</div>
			</div>

			{/* Mobile Menu Dropdown */}
			{mobileMenuOpen && (
				<div className="md:hidden bg-black/30 backdrop-blur-xl border-t border-white/10">
					<div className="px-6 py-4 space-y-2">
						{/* Profile Section */}
						{!loading && profile && (
							<button
								onClick={() => {
									router.push('/profile');
									setMobileMenuOpen(false);
								}}
								className="w-full flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 px-4 py-3 rounded-xl transition-all duration-300"
							>
								<div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center text-lg">
									{profile.avatar || '♔'}
								</div>
								<div className="text-left">
									<div className="text-white font-bold">
										{profile.displayName || profile.username || 'Champion'}
									</div>
									<div className="text-gray-400 text-sm">
										{(profile.ranking?.elo || 1200)} ELO
									</div>
								</div>
							</button>
						)}

						{/* Navigation Links */}
						<div className="space-y-1 pt-2">
							<button
								onClick={() => {
									router.push('/dashboard');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'dashboard'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								🏠 Dashboard
							</button>

							<button
								onClick={() => {
									router.push('/matchmaking');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'matchmaking'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								🎯 Matchmaking
							</button>

							<button
								onClick={() => {
									router.push('/leaderboard');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'leaderboard'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								📊 Leaderboard
							</button>

							<button
								onClick={() => {
									router.push('/profile');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'profile'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								👤 Profile
							</button>

							<button
								onClick={() => {
									router.push('/rules');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'rules'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								♟️ Rules
							</button>

							<button
								onClick={() => {
									router.push('/how-to-play');
									setMobileMenuOpen(false);
								}}
								className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'how-to-play'
									? 'bg-yellow-400/20 text-yellow-400 border border-yellow-400/30'
									: 'text-gray-300 hover:text-white hover:bg-white/10'
									}`}
							>
								📚 How to Play
							</button>

							{/* Admin Button - Only show for admin users */}
							{profile?.username === 'admin' && (
								<button
									onClick={() => {
										router.push('/admin');
										setMobileMenuOpen(false);
									}}
									className={`w-full text-left px-4 py-3 rounded-xl font-semibold transition-all ${currentPage === 'admin'
										? 'bg-red-500/20 text-red-400 border border-red-400/30'
										: 'text-gray-300 hover:text-red-400 hover:bg-red-400/10'
										}`}
								>
									⚙️ Admin
								</button>
							)}

							{/* Logout Button */}
							<button
								onClick={() => {
									handleLogout();
									setMobileMenuOpen(false);
								}}
								className="w-full text-left px-4 py-3 rounded-xl font-semibold text-gray-300 hover:text-red-400 hover:bg-red-400/10 transition-all"
							>
								🚪 Logout
							</button>
						</div>
					</div>
				</div>
			)}
		</nav>
	);
}
