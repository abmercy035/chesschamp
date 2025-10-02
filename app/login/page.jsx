"use client";
import { useState } from 'react';
import profileService from '../../utils/profileService';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    if (res.ok) {
      // Initialize or update profile with username
      let profile = profileService.getProfile();
      if (!profile || profile.username !== username) {
        profileService.updateUserInfo(username, username);
      }
      window.location.href = '/dashboard';
    } else setError(data.error);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-responsive relative overflow-hidden font-sans">
      {/* Animated background elements with a darker, more subtle theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl opacity-50 floating-animation" style={{ animationDuration: '6s' }}></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#d4af37]/10 rounded-full blur-3xl opacity-50 floating-animation" style={{ animationDelay: '1.5s', animationDuration: '8s' }}></div>
      </div>

      <div className="w-full max-w-xl relative z-10 space-y-8">
        {/* Logo Section */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-wide">
              <span className="bg-gradient-to-r from-yellow-500 to-yellow-300 bg-clip-text text-transparent">
                CHESS
              </span>
              <span className="text-[#e5e7eb]">CHAMP</span>
            </h1>
            <div className="h-1 w-24 mx-auto chess-gold-gradient rounded-full transform scale-x-75"></div>
          </div>

          <p className="text-[#9ca3af] text-lg font-light">Welcome back, Strategist</p>

          {/* Chess pieces decoration */}
          <div className="flex justify-center space-x-4 text-3xl sm:text-4xl">
            <span className="opacity-60 text-[#9ca3af]">♜</span>
            <span className="opacity-80 text-[#9ca3af]">♞</span>
            <span className="text-[#e5e7eb] pulse-glow">♚</span>
            <span className="opacity-80 text-[#9ca3af]">♝</span>
            <span className="opacity-60 text-[#9ca3af]">♜</span>
          </div>
        </div>

        {/* Login Form */}
        <div className="card-strong space-y-6 p-6 sm:p-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold chess-text">Return to Battle</h2>
            <p className="chess-text-muted">Access your champion account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="group space-y-2">
              <label className="block text-[#9ca3af] text-sm font-semibold group-focus-within:text-[#d4af37] transition-colors">
                👑 Champion Identity
              </label>
              <input
                type="text"
                placeholder="Your chess handle"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 chess-text placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 text-base"
              />
            </div>

            <div className="group space-y-2">
              <label className="block text-[#9ca3af] text-sm font-semibold group-focus-within:text-[#d4af37] transition-colors">
                🗝️ Master Key
              </label>
              <input
                type="password"
                placeholder="Your secret strategy"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 chess-text placeholder-gray-400 focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/20 transition-all duration-300 text-base"
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-xl mt-6"
            >
              ⚡ ENTER THE ARENA
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-5 py-4 rounded-xl text-center backdrop-blur-sm">
              <span className="font-semibold">⚠️ {error}</span>
            </div>
          )}

          {/* Signup Link */}
          <div className="text-center pt-2">
            <p className="text-[#9ca3af]">
              New to the arena?{' '}
              <a
                href="/"
                className="text-yellow-400 hover:text-yellow-300 font-bold transition-colors duration-300 hover:underline"
              >
                Become a Champion
              </a>
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="text-center">
          <div className="bg-white/5 rounded-2xl p-4 backdrop-blur-sm shadow-inner shadow-white/5 space-y-2">
            <p className="text-[#9ca3af] text-sm">🔒 Secure • 🏆 Competitive • ⚡ Real-time</p>
            <div className="flex justify-center space-x-4 text-xs text-[#9ca3af]">
              <span>SSL Encrypted</span>
              <span>•</span>
              <span>Fair Play Guaranteed</span>
              <span>•</span>
              <span>24/7 Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
