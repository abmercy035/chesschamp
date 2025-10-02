'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useModal } from '../context/ModalContext';

// const API_BASE = process.env.NODE_ENV === 'production'
// ? 'https://chesschamp-backend.onrender.com/api'
// : 'http://localhost:5000/api';

export default function AdminDashboard() {
	const router = useRouter();
	const { showAlert, showConfirm } = useModal();
	const [user, setUser] = useState(null);
	const [tournaments, setTournaments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [showCreateForm, setShowCreateForm] = useState(false);

	// Form states
	const [formData, setFormData] = useState({
		name: '',
		description: '',
		type: 'single-elimination',
		format: 'rapid',
		maxParticipants: 8,
		prizePool: 0,
		registrationDeadline: '',
		startDate: '',
		settings: {
			timeControl: '10+5',
			rated: true,
			requireMinElo: false,
			minElo: 0,
			allowSpectators: true
		}
	});

	useEffect(() => {
		checkAdminAuth();
		if (activeTab === 'tournaments') {
			fetchTournaments();
		}
	}, [activeTab]);

	const checkAdminAuth = async () => {
		try {
			// Check if user is logged in using existing auth endpoint
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/profile`, {
				credentials: 'include' // Include cookies in request
			});

			if (response.ok) {
				const userData = await response.json();
				// userData is the user object directly, not wrapped in { user: ... }
				if (!userData.isAdmin && userData.role !== 'admin') {
					router.push('/dashboard');
					return;
				}
				setUser(userData);
			} else {
				router.push('/login');
			}
		} catch (error) {
			console.error('Auth check error:', error);
			router.push('/login');
		} finally {
			setLoading(false);
		}
	};

	const fetchTournaments = async () => {
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tournaments`, {
				credentials: 'include' // Include cookies in request
			});

			if (response.ok) {
				const data = await response.json();
				setTournaments(data.tournaments);
			}
		} catch (error) {
			console.error('Fetch tournaments error:', error);
		}
	};

	const handleCreateTournament = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tournaments`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include', // Include cookies
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				const result = await response.json();
				await showAlert('Tournament created successfully!');
				setShowCreateForm(false);
				setFormData({
					name: '',
					description: '',
					type: 'single-elimination',
					format: 'rapid',
					maxParticipants: 8,
					prizePool: 0,
					registrationDeadline: '',
					startDate: '',
					settings: {
						timeControl: '10+5',
						rated: true,
						requireMinElo: false,
						minElo: 0,
						allowSpectators: true
					}
				});
				fetchTournaments();
			} else {
				const error = await response.json();
				await showAlert(`Error: ${error.message}`);
			}
		} catch (error) {
			console.error('Create tournament error:', error);
			await showAlert('Failed to create tournament');
		}
	};

	const startTournament = async (tournamentId) => {
		const confirmed = await showConfirm('Are you sure you want to start this tournament?', 'Start Tournament');
		if (!confirmed) return;

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tournaments/${tournamentId}/start`, {
				method: 'POST',
				credentials: 'include' // Include cookies
			});

			if (response.ok) {
				await showAlert('Tournament started successfully!');
				fetchTournaments();
			} else {
				const error = await response.json();
				await showAlert(`Error: ${error.message}`);
			}
		} catch (error) {
			console.error('Start tournament error:', error);
			await showAlert('Failed to start tournament');
		}
	};

	const endTournament = async (tournamentId) => {
		const confirmed = await showConfirm('Are you sure you want to end this tournament?', 'End Tournament');
		if (!confirmed) return;

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tournaments/${tournamentId}/end`, {
				method: 'POST',
				credentials: 'include' // Include cookies
			});

			if (response.ok) {
				await showAlert('Tournament ended successfully!');
				fetchTournaments();
			} else {
				const error = await response.json();
				await showAlert(`Error: ${error.message}`);
			}
		} catch (error) {
			console.error('End tournament error:', error);
			await showAlert('Failed to end tournament');
		}
	};

	const deleteTournament = async (tournamentId) => {
		const confirmed = await showConfirm(
			'Are you sure you want to delete this tournament? This action cannot be undone.',
			'Delete Tournament',
			'Delete',
			'Cancel'
		);
		if (!confirmed) return;

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/tournaments/${tournamentId}`, {
				method: 'DELETE',
				credentials: 'include' // Include cookies
			});

			if (response.ok) {
				await showAlert('Tournament deleted successfully!');
				fetchTournaments();
			} else {
				const error = await response.json();
				await showAlert(`Error: ${error.message}`);
			}
		} catch (error) {
			console.error('Delete tournament error:', error);
			await showAlert('Failed to delete tournament');
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-white text-2xl">Loading Admin Panel...</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen p-6">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold text-white mb-2">⚡ Admin Dashboard</h1>
					<p className="text-gray-300">Welcome back, {user?.username} | Tournament Management Console</p>
				</div>

				{/* Navigation Tabs */}
				<div className="flex space-x-4 mb-8">
					{['overview', 'tournaments', 'users', 'analytics'].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === tab
								? 'chess-gold-gradient text-black shadow-lg'
								: 'glass text-gray-300 hover:bg-white/20'
								}`}
						>
							{tab.charAt(0).toUpperCase() + tab.slice(1)}
						</button>
					))}
				</div>

				{/* Overview Tab */}
				{activeTab === 'overview' && (
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
							<h3 className="text-xl font-bold text-white mb-2">🏆 Total Tournaments</h3>
							<p className="text-3xl font-bold" style={{ color: 'var(--chess-gold)' }}>{tournaments.length}</p>
							<p className="text-gray-300 text-sm">All time tournaments</p>
						</div>
						<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
							<h3 className="text-xl font-bold text-white mb-2">⚡ Active Tournaments</h3>
							<p className="text-3xl font-bold text-green-400">
								{tournaments.filter(t => t.status === 'active').length}
							</p>
							<p className="text-gray-300 text-sm">Currently running</p>
						</div>
						<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
							<h3 className="text-xl font-bold text-white mb-2">📝 Registration Open</h3>
							<p className="text-3xl font-bold" style={{ color: 'var(--chess-gold-light)' }}>
								{tournaments.filter(t => t.status === 'registration').length}
							</p>
							<p className="text-gray-300 text-sm">Accepting players</p>
						</div>
					</div>
				)}

				{/* Tournaments Tab */}
				{activeTab === 'tournaments' && (
					<div>
						{/* Tournament Actions */}
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-2xl font-bold text-white">🏆 Tournament Management</h2>
							<button
								onClick={() => setShowCreateForm(true)}
								className="chess-gold-gradient hover:opacity-90 text-black px-6 py-3 rounded-xl font-semibold transition-all"
							>
								➕ Create New Tournament
							</button>
						</div>

						{/* Create Tournament Form */}
						{showCreateForm && (
							<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20 mb-6">
								<h3 className="text-xl font-bold text-white mb-4">Create New Tournament</h3>
								<form onSubmit={handleCreateTournament} className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-white mb-2">Tournament Name *</label>
										<input
											type="text"
											value={formData.name}
											onChange={(e) => setFormData({ ...formData, name: e.target.value })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
											placeholder="Enter tournament name"
											required
										/>
									</div>
									<div>
										<label className="block text-white mb-2">Tournament Type *</label>
										<select
											value={formData.type}
											onChange={(e) => setFormData({ ...formData, type: e.target.value })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
										>
											<option value="single-elimination">Single Elimination</option>
											<option value="round-robin">Round Robin</option>
											<option value="swiss">Swiss System</option>
										</select>
									</div>
									<div>
										<label className="block text-white mb-2">Max Participants *</label>
										<select
											value={formData.maxParticipants}
											onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
										>
											<option value={4}>4 Players</option>
											<option value={8}>8 Players</option>
											<option value={16}>16 Players</option>
											<option value={32}>32 Players</option>
											<option value={64}>64 Players</option>
										</select>
									</div>
									<div>
										<label className="block text-white mb-2">Game Format</label>
										<select
											value={formData.format}
											onChange={(e) => setFormData({ ...formData, format: e.target.value })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
										>
											<option value="blitz">Blitz</option>
											<option value="rapid">Rapid</option>
											<option value="classical">Classical</option>
										</select>
									</div>
									<div>
										<label className="block text-white mb-2">Prize Pool ($)</label>
										<input
											type="number"
											value={formData.prizePool}
											onChange={(e) => setFormData({ ...formData, prizePool: parseInt(e.target.value) })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
											placeholder="0"
											min="0"
										/>
									</div>
									<div>
										<label className="block text-white mb-2">Registration Deadline</label>
										<input
											type="datetime-local"
											value={formData.registrationDeadline}
											onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white"
										/>
									</div>
									<div className="md:col-span-2">
										<label className="block text-white mb-2">Description</label>
										<textarea
											value={formData.description}
											onChange={(e) => setFormData({ ...formData, description: e.target.value })}
											className="w-full p-3 bg-white/10 border border-white/20 rounded-xl text-white h-24"
											placeholder="Tournament description..."
										/>
									</div>
									<div className="md:col-span-2 flex gap-4">
										<button
											type="submit"
											className="chess-gold-gradient hover:opacity-90 text-black px-6 py-3 rounded-xl font-semibold"
										>
											Create Tournament
										</button>
										<button
											type="button"
											onClick={() => setShowCreateForm(false)}
											className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-semibold"
										>
											Cancel
										</button>
									</div>
								</form>
							</div>
						)}

						{/* Tournaments List */}
						<div className="space-y-4">
							{tournaments.length === 0 ? (
								<div className="glass rounded-3xl p-8 backdrop-blur-xl border border-white/20 text-center">
									<h3 className="text-xl text-white mb-2">No Tournaments Created Yet</h3>
									<p className="text-gray-300">Create your first tournament to get started!</p>
								</div>
							) : (
								tournaments.map((tournament) => (
									<div key={tournament.id} className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
										<div className="flex justify-between items-start">
											<div className="flex-1">
												<div className="flex items-center gap-3 mb-2">
													<h3 className="text-xl font-bold text-white">{tournament.name}</h3>
													<span className={`px-3 py-1 rounded-full text-sm font-semibold ${tournament.status === 'registration' ? 'bg-yellow-500 text-black' :
															tournament.status === 'active' ? 'bg-green-500 text-white' :
																tournament.status === 'completed' ? 'bg-blue-500 text-white' :
																	'bg-gray-500 text-white'
														}`}>
														{tournament.status.toUpperCase()}
													</span>
												</div>
												<p className="text-gray-300 mb-2">{tournament.description}</p>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
													<div>
														<span className="text-gray-400">Type:</span>
														<p className="text-white font-semibold">{tournament.type}</p>
													</div>
													<div>
														<span className="text-gray-400">Participants:</span>
														<p className="text-white font-semibold">
															{tournament.currentParticipants}/{tournament.maxParticipants}
														</p>
													</div>
													<div>
														<span className="text-gray-400">Prize Pool:</span>
														<p className="text-white font-semibold">
															${typeof tournament.prizePool === 'object'
																? (tournament.prizePool.first + tournament.prizePool.second + tournament.prizePool.third + tournament.prizePool.participation)
																: tournament.prizePool}
														</p>
													</div>
													<div>
														<span className="text-gray-400">Format:</span>
														<p className="text-white font-semibold">{tournament.format}</p>
													</div>
												</div>
											</div>
											<div className="flex gap-2 ml-4">
												{tournament.status === 'registration' && (
													<button
														onClick={() => startTournament(tournament.id)}
														className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
													>
														▶ Start
													</button>
												)}
												{tournament.status === 'active' && (
													<button
														onClick={() => endTournament(tournament.id)}
														className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm"
													>
														⏹ End
													</button>
												)}
												<button
													onClick={() => router.push(`/admin/tournaments/${tournament.id}`)}
													className="chess-gold-gradient hover:opacity-90 text-black px-4 py-2 rounded-lg text-sm font-semibold"
												>
													📊 Manage
												</button>
												{tournament.status !== 'active' && (
													<button
														onClick={() => deleteTournament(tournament.id)}
														className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
													>
														🗑 Delete
													</button>
												)}
											</div>
										</div>
									</div>
								))
							)}
						</div>
					</div>
				)}

				{/* Users Tab */}
				{activeTab === 'users' && (
					<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
						<h2 className="text-2xl font-bold text-white mb-4">👥 User Management</h2>
						<p className="text-gray-300">User management features coming soon...</p>
					</div>
				)}

				{/* Analytics Tab */}
				{activeTab === 'analytics' && (
					<div className="glass rounded-3xl p-6 backdrop-blur-xl border border-white/20">
						<h2 className="text-2xl font-bold text-white mb-4">📊 Analytics</h2>
						<p className="text-gray-300">Analytics dashboard coming soon...</p>
					</div>
				)}
			</div>
		</div>
	);
}
