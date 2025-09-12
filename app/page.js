"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const router = useRouter();

	async function handleSignup(e) {
		e.preventDefault();
		setError('');
		const res = await fetch('http://localhost:5000/api/auth/signup', {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password })
		});
		const data = await res.json();
		if (res.ok) router.push('/login');
		else setError(data.error);
	}

	return (
		<div className="min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
			{/* Animated background elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl floating-animation"></div>
				<div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '1s' }}></div>
				<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl floating-animation" style={{ animationDelay: '2s' }}></div>
			</div>

			<div className="w-full max-w-lg relative z-10 space-y-8">
				{/* Logo Section */}
				<div className="text-center space-y-6">
					<div className="space-y-4">
						<h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-wide">
							<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
								CHESS
							</span>
							<span className="text-white">CHAMP</span>
						</h1>
						<div className="h-1 w-24 mx-auto chess-gold-gradient rounded-full"></div>
					</div>

					<p className="text-gray-300 text-lg sm:text-xl font-light">Enter the Elite Chess Arena</p>

					{/* Chess piece with glow effect */}
					<div className="flex justify-center">
						<div className="text-6xl sm:text-7xl lg:text-8xl filter drop-shadow-2xl pulse-glow">♔</div>
					</div>

					<div className="flex justify-center space-x-3 sm:space-x-4 text-3xl sm:text-4xl">
						<span className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer">♜</span>
						<span className="opacity-40 hover:opacity-100 transition-opacity cursor-pointer">♞</span>
						<span className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer">♝</span>
						<span className="opacity-50 hover:opacity-100 transition-opacity cursor-pointer">♛</span>
					</div>
				</div>

				{/* Signup Form */}
				<div className="glass rounded-3xl p-6 sm:p-8 chess-shadow backdrop-blur-xl border border-white/20 space-y-6">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-white mb-2">Join the Elite</h2>
						<p className="text-gray-300">Create your champion account</p>
					</div>

					<form onSubmit={handleSignup} className="space-y-6">
						<div className="group">
							<label className="block text-gray-300 text-sm font-semibold mb-3 group-focus-within:text-yellow-400 transition-colors">
								🎯 Chess Handle
							</label>
							<input
								type="text"
								placeholder="Your strategic identity"
								value={username}
								onChange={e => setUsername(e.target.value)}
								required
								className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
							/>
						</div>

						<div className="group">
							<label className="block text-gray-300 text-sm font-semibold mb-3 group-focus-within:text-yellow-400 transition-colors">
								🔐 Master Key
							</label>
							<input
								type="password"
								placeholder="Your secret strategy"
								value={password}
								onChange={e => setPassword(e.target.value)}
								required
								className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
							/>
						</div>

						<button
							type="submit"
							className="w-full chess-gold-gradient text-black py-4 px-6 rounded-2xl font-black text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 transform active:scale-95"
						>
							⚡ ASCEND TO CHAMPION
						</button>
					</form>

					{/* Error Message */}
					{error && (
						<div className="mt-6 bg-red-500/20 border border-red-400/50 text-red-300 px-6 py-4 rounded-2xl text-center backdrop-blur-sm">
							<span className="font-semibold">⚠️ {error}</span>
						</div>
					)}

					{/* Login Link */}
					<div className="mt-8 text-center">
						<p className="text-gray-300">
							Already a champion?{' '}
							<a
								href="/login"
								className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors duration-300 hover:underline"
							>
								Return to Battle
							</a>
						</p>
					</div>
				</div>

				{/* Footer Stats */}
				<div className="mt-8 text-center">
					<div className="grid grid-cols-3 gap-4 glass rounded-2xl p-4 backdrop-blur-sm">
						<div>
							<div className="text-yellow-400 font-bold text-lg">1,247+</div>
							<div className="text-gray-400 text-xs">Champions</div>
						</div>
						<div>
							<div className="text-yellow-400 font-bold text-lg">24/7</div>
							<div className="text-gray-400 text-xs">Battles</div>
						</div>
						<div>
							<div className="text-yellow-400 font-bold text-lg">$10K+</div>
							<div className="text-gray-400 text-xs">Daily Stakes</div>
						</div>
					</div>
				</div>

				{/* Features */}
				<div className="mt-8 grid grid-cols-3 gap-4 text-center">
					<div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
						<div className="text-2xl mb-2">⚡</div>
						<div className="text-xs text-gray-400">Real-time</div>
					</div>
					<div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
						<div className="text-2xl mb-2">💰</div>
						<div className="text-xs text-gray-400">High Stakes</div>
					</div>
					<div className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4">
						<div className="text-2xl mb-2">🏆</div>
						<div className="text-xs text-gray-400">Competitive</div>
					</div>
				</div>

				{/* Footer */}
				<div className="text-center mt-8">
					<p className="text-gray-500 text-sm">
						Elite chess platform • Secure tournaments • Professional gameplay
					</p>
				</div>
			</div>
		</div>
	);
}
