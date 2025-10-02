"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import profileService from '../utils/profileService';
import Link from 'next/link';


const Page = () => {

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [email, setEmail] = useState('');
	const [age, setAge] = useState('');
	const [country, setCountry] = useState('');
	const [error, setError] = useState('');
	const [showSignup, setShowSignup] = useState(false);
	const router = useRouter();

	// List of countries for dropdown
	const countries = [
		'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahrain', 'Bangladesh',
		'Belarus', 'Belgium', 'Bolivia', 'Bosnia', 'Brazil', 'Bulgaria', 'Cambodia', 'Canada', 'Chile', 'China',
		'Colombia', 'Croatia', 'Czech Republic', 'Denmark', 'Ecuador', 'Egypt', 'Estonia', 'Finland', 'France', 'Georgia',
		'Germany', 'Ghana', 'Greece', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland',
		'Israel', 'Italy', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'South Korea', 'Kuwait', 'Latvia', 'Lebanon',
		'Lithuania', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan', 'Peru',
		'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia', 'Serbia', 'Singapore', 'Slovakia',
		'Slovenia', 'South Africa', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey', 'Ukraine', 'UAE', 'United Kingdom',
		'United States', 'Uruguay', 'Venezuela', 'Vietnam', 'Other'
	];

	async function handleSignup(e) {
		e.preventDefault();
		setError('');
		
		// Client-side validation
		if (!username || !password || !email || !age || !country) {
			setError('All fields are required');
			return;
		}
		
		if (age < 13 || age > 120) {
			setError('Age must be between 13 and 120');
			return;
		}
		
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			setError('Please enter a valid email address');
			return;
		}

		const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
			method: 'POST',
			credentials: 'include',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, email, age: parseInt(age), country })
		});
		const data = await res.json();
		if (res.ok) {
			// Initialize profile for new user
			profileService.updateUserInfo(username, username);
			router.push('/login');
		} else setError(data.error);
	}

	if (showSignup) {
		return (
			<div className="min-h-screen relative overflow-hidden">
				{/* Chess Background */}
				<div className="absolute inset-0">
					<Image
						src="/chess_bg.webp"
						alt="Chess Background"
						fill
						style={{ objectFit: 'cover' }}
						className="opacity-30"
						priority
					/>
					<div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70"></div>
				</div>

				<div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8">
					<div className="w-full max-w-lg space-y-8">
						{/* Back Button */}
						<button
							onClick={() => setShowSignup(false)}
							className="flex items-center text-gray-300 hover:text-yellow-400 transition-colors duration-300 mb-8"
						>
							<span className="mr-2">←</span>
							Back to Home
						</button>

						{/* Logo Section */}
						<div className="text-center space-y-6">
							<div className="space-y-4">
								<h1 className="text-4xl sm:text-5xl font-black tracking-wide">
									<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
										CHESS
									</span>
									<span className="text-white">CHAMP</span>
								</h1>
								<div className="h-1 w-24 mx-auto chess-gold-gradient rounded-full"></div>
							</div>
							<p className="text-gray-300 text-lg font-light">Join the Elite Chess Arena</p>
						</div>

						{/* Signup Form */}
						<div className="card-strong space-y-6">
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
										� Email Address
									</label>
									<input
										type="email"
										placeholder="your.email@example.com"
										value={email}
										onChange={e => setEmail(e.target.value)}
										required
										className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
									/>
								</div>

								<div className="grid grid-cols-2 gap-4">
									<div className="group">
										<label className="block text-gray-300 text-sm font-semibold mb-3 group-focus-within:text-yellow-400 transition-colors">
											🎂 Age
										</label>
										<input
											type="number"
											placeholder="18"
											min="13"
											max="120"
											value={age}
											onChange={e => setAge(e.target.value)}
											required
											className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
										/>
									</div>

									<div className="group">
										<label className="block text-gray-300 text-sm font-semibold mb-3 group-focus-within:text-yellow-400 transition-colors">
											🌍 Country
										</label>
										<select
											value={country}
											onChange={e => setCountry(e.target.value)}
											required
											className="w-full bg-white/5 border border-white/20 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 backdrop-blur-sm"
										>
											<option value="" className="bg-gray-800">Select Country</option>
											{countries.map(c => (
												<option key={c} value={c} className="bg-gray-800">{c}</option>
											))}
										</select>
									</div>
								</div>

								<div className="group">
									<label className="block text-gray-300 text-sm font-semibold mb-3 group-focus-within:text-yellow-400 transition-colors">
										�🔐 Master Key
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
									className="btn-primary w-full text-lg"
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
									Already a champion?
									<Link
										href="/login"
										className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors duration-300 hover:underline"
									>
										Return to Battle
									</Link>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen relative overflow-hidden">
			{/* Chess Background */}
			<div className="absolute inset-0">
				<Image
					src="/chess_bg.webp"
					alt="Chess Background"
					fill
					style={{ objectFit: 'cover' }}
					className="opacity-20"
					priority
				/>
				<div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/80"></div>
			</div>

			{/* Navigation */}
			<nav className="relative z-20 flex justify-between items-center p-6">
				<div className="flex items-center space-x-2">
					<div className="text-3xl">♔</div>
					<h1 className="text-xl font-bold">
						<span className="text-yellow-400">CHESS</span>
						<span className="text-white">CHAMP</span>
					</h1>
				</div>
				<div className="flex items-center space-x-4">
					<Link
						href="/login"
						className="text-gray-300 hover:text-yellow-400 transition-colors duration-300 font-medium"
					>
						Login
					</Link>
					<button
						onClick={() => setShowSignup(true)}
						className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-2 rounded-full font-bold transition-all duration-300 hover:scale-105"
					>
						Sign Up
					</button>
				</div>
			</nav>

			{/* Hero Section */}
			<div className="relative z-10 min-h-screen flex items-center justify-center p-4">
				<div className="max-w-6xl mx-auto text-center space-y-12">
					{/* Main Hero Content */}
					<div className="space-y-8">
						<div className="space-y-6">
							<h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-wide">
								<span className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
									CHESS
								</span>
								<span className="text-white">CHAMP</span>
							</h1>
							<div className="h-2 w-32 mx-auto chess-gold-gradient rounded-full"></div>
						</div>

						<p className="text-xl sm:text-2xl lg:text-3xl text-gray-300 font-light max-w-4xl mx-auto leading-relaxed">
							Master the ultimate strategy game in our elite chess arena.
							<br className="hidden sm:block" />
							Play against skilled opponents and perfect your chess mastery.
						</p>

						{/* Chess pieces decoration */}
						<div className="flex justify-center space-x-6 text-4xl sm:text-5xl opacity-60">
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♜</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♞</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♝</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♛</span>
							<span className="text-7xl sm:text-8xl text-yellow-400 pulse-glow">♔</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♕</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♗</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♘</span>
							<span className="hover:opacity-100 transition-opacity cursor-pointer transform hover:scale-110">♖</span>
						</div>
					</div>

					{/* CTA Buttons */}
					<div className="flex justify-center max-w-lg mx-auto">
						<button
							onClick={() => setShowSignup(true)}
							className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-black px-12 py-4 rounded-2xl font-black text-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 transform active:scale-95 flex items-center justify-center space-x-3"
						>
							<span>⚡</span>
							<span>START PLAYING</span>
						</button>
					</div>

					{/* Stats */}
					<div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
						<div className="card space-y-3">
							<div className="text-3xl sm:text-4xl font-black text-yellow-400">1,247+</div>
							<div className="text-gray-300 font-medium">Active Players</div>
							<div className="text-gray-500 text-sm">Worldwide community</div>
						</div>
						<div className="card space-y-3">
							<div className="text-3xl sm:text-4xl font-black text-yellow-400">24/7</div>
							<div className="text-gray-300 font-medium">Live Games</div>
							<div className="text-gray-500 text-sm">Never-ending chess</div>
						</div>
						<div className="card space-y-3">
							<div className="text-3xl sm:text-4xl font-black text-yellow-400">∞</div>
							<div className="text-gray-300 font-medium">Chess Possibilities</div>
							<div className="text-gray-500 text-sm">Unlimited games</div>
						</div>
					</div>
				</div>
			</div>

			{/* Features Section */}
			<div className="relative z-10 py-20 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="text-center space-y-6 mb-16">
						<h2 className="text-4xl sm:text-5xl font-black text-white">
							Why Champions Choose <span className="text-yellow-400">ChessChamp</span>
						</h2>
						<p className="text-xl text-gray-300 max-w-3xl mx-auto">
							Experience the most advanced chess platform with cutting-edge features designed for serious players.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[
							{
								icon: "⚡",
								title: "Lightning Fast",
								description: "Real-time gameplay with zero lag. Every move matters, every second counts.",
								color: "from-blue-400 to-blue-600"
							},
							{
								icon: "�",
								title: "Strategic Gameplay",
								description: "Master classic chess with intuitive controls and smooth piece movement.",
								color: "from-yellow-400 to-yellow-600"
							},
							{
								icon: "📊",
								title: "Game Analysis",
								description: "Review your games with detailed move analysis and improvement suggestions.",
								color: "from-green-400 to-green-600"
							},
							{
								icon: "🔒",
								title: "Secure Platform",
								description: "Bank-grade security ensuring fair play and account protection.",
								color: "from-purple-400 to-purple-600"
							},
							{
								icon: "🌐",
								title: "Global Community",
								description: "Connect with chess players and enthusiasts from around the world.",
								color: "from-red-400 to-red-600"
							},
							{
								icon: "📱",
								title: "Cross-Platform",
								description: "Play seamlessly across all devices with responsive design.",
								color: "from-indigo-400 to-indigo-600"
							}
						].map((feature, index) => (
							<div key={index} className="glass rounded-2xl p-8 backdrop-blur-xl border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 space-y-4">
								<div className={`text-5xl mb-4 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent filter drop-shadow-lg`}>
									{feature.icon}
								</div>
								<h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
								<p className="text-gray-300 leading-relaxed">{feature.description}</p>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* Footer */}
			<footer className="relative z-10 border-t border-white/10 py-12 px-4">
				<div className="max-w-6xl mx-auto text-center space-y-6">
					<div className="flex justify-center items-center space-x-2 mb-8">
						<div className="text-4xl">♔</div>
						<h3 className="text-2xl font-bold">
							<span className="text-yellow-400">CHESS</span>
							<span className="text-white">CHAMP</span>
						</h3>
					</div>
					<p className="text-gray-400 max-w-2xl mx-auto">
						The premier destination for chess enthusiasts. Join thousands of players in the ultimate test of strategy and skill.
					</p>
					<div className="flex justify-center space-x-6 text-gray-500">
						<span>Elite chess platform</span>
						<span>•</span>
						<span>Secure gameplay</span>
						<span>•</span>
						<span>Strategic mastery</span>
					</div>
				</div>
			</footer>
		</div>
	);

}

export default Page;

