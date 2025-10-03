// Sound Effects Manager for Chess Game
// This file manages a						// Sound data loadeddio playback for various chess game events

class SoundManager {
	constructor() {
		this.sounds = {
			move: '/sounds/move.mp3',
			capture: '/sounds/capture.mp3',
			check: '/sounds/check.mp3',
			checkmate: '/sounds/checkmate.mp3',
			castling: '/sounds/castling.mp3',
			promotion: '/sounds/promotion.mp3',
			gameStart: '/sounds/game-start.mp3',
			gameEnd: '/sounds/game-end.mp3',
			notification: '/sounds/notification.mp3',
			error: '/sounds/error.mp3'
		};

		this.audioCache = {};
		this.isClient = typeof window !== 'undefined';
		this.isInitialized = false;
		this.userInteracted = false;
		
		if (this.isClient) {
			this.preloadSounds();
			this.initializeAudioContext();
		}
	}

	initializeAudioContext() {
		// Wait for user interaction before enabling audio
		const enableAudio = () => {
			this.userInteracted = true;
			// Audio enabled after user interaction
			document.removeEventListener('click', enableAudio);
			document.removeEventListener('keydown', enableAudio);
			document.removeEventListener('touchstart', enableAudio);
		};

		document.addEventListener('click', enableAudio, { once: true });
		document.addEventListener('keydown', enableAudio, { once: true });
		document.addEventListener('touchstart', enableAudio, { once: true });
	}

	preloadSounds() {
		// Only preload if we're in the browser
		if (!this.isClient) return;
		
		// Loading sound files
		
		// Preload audio files for better performance
		Object.entries(this.sounds).forEach(([key, path]) => {
			try {
				const audio = new Audio();
				audio.preload = 'auto';
				audio.src = path;
				
				audio.addEventListener('canplaythrough', () => {
					this.audioCache[key] = audio;
					// Sound loaded
				});
				
				audio.addEventListener('loadeddata', () => {
					console.log(`📥 Sound data loaded: ${key}`);
				});
				
				audio.addEventListener('error', (e) => {
					console.warn(`🚫 Failed to load sound: ${key} (${path})`, e);
					// Create silent fallback
					this.audioCache[key] = { play: () => { }, pause: () => { }, volume: 0 };
				});
				
				// Start loading
				audio.load();
			} catch (error) {
				console.warn(`🚫 Error creating audio for ${key}:`, error);
				// Create silent fallback for SSR or unsupported environments
				this.audioCache[key] = { play: () => { }, pause: () => { }, volume: 0 };
			}
		});
	}



	play(soundName, volume = 0.5) {
		// Only play sounds in the browser
		if (!this.isClient) return;

		// Check if user has interacted with the page (required for audio)
		if (!this.userInteracted) {
			// Audio blocked - user interaction required
			return;
		}
		
		const audio = this.audioCache[soundName];
		if (audio && typeof audio.play === 'function') {
			try {
				audio.volume = Math.max(0, Math.min(1, volume));
				audio.currentTime = 0; // Reset to beginning
				
				// Playing sound
				
				const playPromise = audio.play();

				if (playPromise !== undefined) {
					playPromise
						.then(() => {
							// Sound played successfully
						})
						.catch(error => {
							console.warn('🚫 Audio play failed:', soundName, error);
						});
				}
			} catch (error) {
				console.warn('🚫 Error playing sound:', soundName, error);
			}
		} else {
			console.warn(`🚫 Audio not found or not ready: ${soundName}`);
		}
	}

	// Alternative method using Web Audio API for better compatibility
	playBeep(frequency = 440, duration = 200) {
		if (!this.isClient || !this.userInteracted) return;
		
		try {
			// Create audio context
			const audioContext = new (window.AudioContext || window.webkitAudioContext)();
			const oscillator = audioContext.createOscillator();
			const gainNode = audioContext.createGain();

			oscillator.connect(gainNode);
			gainNode.connect(audioContext.destination);

			oscillator.frequency.value = frequency;
			oscillator.type = 'sine';

			gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
			gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);

			oscillator.start(audioContext.currentTime);
			oscillator.stop(audioContext.currentTime + duration / 1000);
			
			// Played beep sound
		} catch (error) {
			console.warn('🚫 Beep failed:', error);
		}
	}

	// Convenience methods for specific game events
	playMove() {
				// Loading sound files
		this.play('move', 0.4);
		// Fallback beep
		setTimeout(() => this.playBeep(400, 150), 100);
	}

	playCapture() {

		this.play('capture', 0.5);
		// Fallback beep
		setTimeout(() => this.playBeep(600, 200), 100);
	}

	playCheck() {

		this.play('check', 0.6);
		// Fallback beep
		setTimeout(() => this.playBeep(800, 300), 100);
	}

	playCheckmate() {

		this.play('checkmate', 0.7);
		// Fallback beep sequence
		setTimeout(() => {
			this.playBeep(600, 200);
			setTimeout(() => this.playBeep(400, 200), 250);
			setTimeout(() => this.playBeep(200, 400), 500);
		}, 100);
	}

	playCastling() {

		this.play('castling', 0.5);
		// Fallback beep
		setTimeout(() => this.playBeep(500, 180), 100);
	}

	playPromotion() {

		this.play('promotion', 0.6);
		// Fallback beep sequence
		setTimeout(() => {
			this.playBeep(400, 100);
			setTimeout(() => this.playBeep(600, 100), 120);
			setTimeout(() => this.playBeep(800, 200), 240);
		}, 100);
	}

	playGameStart() {

		this.play('gameStart', 0.5);
		// Fallback beep sequence for game start
		setTimeout(() => {
			this.playBeep(600, 150);
			setTimeout(() => this.playBeep(800, 200), 200);
		}, 100);
	}

	playGameEnd() {

		this.play('gameEnd', 0.6);
		// Fallback beep sequence for game end
		setTimeout(() => {
			this.playBeep(400, 300);
			setTimeout(() => this.playBeep(300, 400), 350);
		}, 100);
	}

	playNotification() {

		this.play('notification', 0.4);
		// Fallback beep
		setTimeout(() => this.playBeep(700, 250), 100);
	}

	playError() {

		this.play('error', 0.3);
		// Fallback beep for error
		setTimeout(() => {
			this.playBeep(200, 150);
			setTimeout(() => this.playBeep(150, 150), 170);
		}, 100);
	}

	// Set master volume for all sounds
	setMasterVolume(volume) {
		if (!this.isClient) return;
		
		Object.values(this.audioCache).forEach(audio => {
			if (audio && typeof audio.volume !== 'undefined') {
				audio.volume = Math.max(0, Math.min(1, volume));
			}
		});
	}

	// Stop all currently playing sounds
	stopAll() {
		if (!this.isClient) return;
		
		Object.values(this.audioCache).forEach(audio => {
			if (audio && typeof audio.pause === 'function') {
				audio.pause();
				audio.currentTime = 0;
			}
		});
	}
}

// Create global instance
export const soundManager = new SoundManager();

// Export individual methods for convenience
export const playMoveSound = () => soundManager.playMove();
export const playCaptureSound = () => soundManager.playCapture();
export const playCheckSound = () => soundManager.playCheck();
export const playCheckmateSound = () => soundManager.playCheckmate();
export const playCastlingSound = () => soundManager.playCastling();
export const playPromotionSound = () => soundManager.playPromotion();
export const playGameStartSound = () => soundManager.playGameStart();
export const playGameEndSound = () => soundManager.playGameEnd();
export const playNotificationSound = () => soundManager.playNotification();
export const playErrorSound = () => soundManager.playError();

export default soundManager;
