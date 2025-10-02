// Profile Service - Backend API Integration
// Handles user statistics, preferences, avatars, and achievements with server persistence

class ProfileService {
    constructor() {
        this.API_BASE = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/profile`;
    }

    // Get authentication headers
    getAuthHeaders() {
        return {
            'Content-Type': 'application/json'
        };
    }

    // Make authenticated API request
    async apiRequest(url, options = {}) {
        const headers = {
            ...this.getAuthHeaders(),
            ...options.headers
        };

        return fetch(url, {
            credentials: 'include', // Include cookies for JWT
            ...options,
            headers
        });
    }

    // Get current profile from server
    async getProfile(forceRefresh = false) {
        try {
            // Add cache busting parameter if force refresh
            const url = forceRefresh ? `${this.API_BASE}?_t=${Date.now()}` : this.API_BASE;
            const response = await this.apiRequest(url);

            if (response.ok) {
                const profile = await response.json();
                console.log('✅ Profile loaded from server' + (forceRefresh ? ' (refreshed)' : ''));
                return profile;
            } else {
                console.log('⚠️ No profile found on server');
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading profile:', error);
            return null;
        }
    }

    // Force refresh profile data (for use after games end)
    async refreshProfile() {
        console.log('🔄 Force refreshing profile data...');
        return this.getProfile(true);
    }

    // Get profile by username (for viewing other users)
    async getProfileByUsername(username) {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/user/${username}`);

            if (response.ok) {
                const profile = await response.json();
                console.log('✅ Profile loaded for user:', username);
                return profile;
            } else {
                console.log('⚠️ Profile not found for user:', username);
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading profile for user:', username, error);
            return null;
        }
    }

    // Update profile basic info (displayName, avatar)
    async updateProfile(updates) {
        try {
            const response = await this.apiRequest(`${this.API_BASE}`, {
                method: 'PUT',
                body: JSON.stringify(updates)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Profile updated on server');
                // Return profile data if included in response, otherwise return success
                return result.profile || result;
            } else {
                const error = await response.json();
                console.error('❌ Error updating profile:', error.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating profile:', error);
            return null;
        }
    }

    // Update user info (convenience method)
    async updateUserInfo(displayName) {
        return this.updateProfile({ displayName });
    }

    // Update avatar
    async updateAvatar(avatar) {
        return this.updateProfile({ avatar });
    }

    // Update preferences
    async updatePreferences(preferences) {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/preferences`, {
                method: 'PUT',
                body: JSON.stringify(preferences)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('✅ Preferences updated on server');
                // Return profile data if included in response, otherwise return success
                return result.profile || result;
            } else {
                const error = await response.json();
                console.error('❌ Error updating preferences:', error.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error updating preferences:', error);
            return null;
        }
    }

    // Record game result
    async recordGameResult(gameData) {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/game-result`, {
                method: 'POST',
                body: JSON.stringify(gameData)
            });

            if (response.ok) {
                const result = await response.json();
                console.log('📊 Game result recorded on server:', result.message);
                return result.profile;
            } else {
                const error = await response.json();
                console.error('❌ Error recording game result:', error.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error recording game result:', error);
            return null;
        }
    }

    // Get leaderboard
    async getLeaderboard(limit = 10, sortBy = 'elo') {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/leaderboard?limit=${limit}&sortBy=${sortBy}`);

            if (response.ok) {
                const leaderboard = await response.json();
                console.log('✅ Leaderboard loaded from server');
                return leaderboard;
            } else {
                console.error('❌ Error loading leaderboard');
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading leaderboard:', error);
            return [];
        }
    }

    // Get user's rank position
    async getUserRank() {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/rank`);

            if (response.ok) {
                const rankData = await response.json();
                console.log('✅ Rank data loaded from server');
                return rankData;
            } else {
                console.error('❌ Error loading rank data');
                return null;
            }
        } catch (error) {
            console.error('❌ Error loading rank data:', error);
            return null;
        }
    }

    // Get achievements with progress
    async getAchievements() {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/achievements`);

            if (response.ok) {
                const achievements = await response.json();
                console.log('✅ Achievements loaded from server');
                return achievements;
            } else {
                console.error('❌ Error loading achievements');
                return [];
            }
        } catch (error) {
            console.error('❌ Error loading achievements:', error);
            return [];
        }
    }

    // Reset profile (for testing)
    async resetProfile() {
        try {
            const response = await this.apiRequest(`${this.API_BASE}/reset`, {
                method: 'DELETE'
            });

            if (response.ok) {
                const result = await response.json();
                console.log('🔄 Profile reset on server');
                return result.profile;
            } else {
                const error = await response.json();
                console.error('❌ Error resetting profile:', error.error);
                return null;
            }
        } catch (error) {
            console.error('❌ Error resetting profile:', error);
            return null;
        }
    }

    // Get unlocked achievements (for backward compatibility)
    async getUnlockedAchievements() {
        const achievements = await this.getAchievements();
        return achievements.filter(achievement => achievement.unlocked);
    }

    // Format time for display
    formatTime(seconds) {
        if (!seconds) return '0m';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    }

    // Get current month (for compatibility)
    getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }

    // Show achievement notification
    showAchievement(title, icon) {
        console.log(`🏅 Achievement Unlocked: ${icon} ${title}`);

        // Create achievement notification (can be enhanced with UI)
        if (typeof window !== 'undefined') {
            setTimeout(() => {
                console.log(`🎉 ${icon} Achievement: ${title}`);
            }, 1000);
        }
    }
}

// Chess Avatar Options
export const CHESS_AVATARS = {
    pieces: ['♔', '♕', '♖', '♗', '♘', '♙', '♚', '♛', '♜', '♝', '♞', '♟'],
    crowns: ['👑', '🤴', '👸'],
    symbols: ['⚔️', '🏆', '🎯', '⭐', '💎', '🔥', '⚡', '🎖️'],
    faces: ['😎', '🤓', '😈', '🤖', '👾', '🦾', '🧠', '🎭'],
    animals: ['🦅', '🦁', '🐺', '🦈', '🐉', '🦂', '🐍', '🦉']
};

// Create and export singleton instance
const profileService = new ProfileService();

export default profileService;
