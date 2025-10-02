"use client";
import { createContext, useContext, useEffect, useState } from 'react';
import * as Ably from 'ably';

const AblyContext = createContext();

let ablyInstance = null;
let connectionCount = 0;

export function AblyProvider({ children }) {
	const [ably, setAbly] = useState(null);

	useEffect(() => {
		// Only create one Ably instance for the entire app
		if (!ablyInstance && process.env.NEXT_PUBLIC_ABLY_API_KEY) {
			connectionCount++;
			console.log('🚀 Creating Ably connection #', connectionCount);
			ablyInstance = new Ably.Realtime(process.env.NEXT_PUBLIC_ABLY_API_KEY);

			// Log connection state changes
			ablyInstance.connection.on('connected', () => {
				console.log('✅ Ably connected successfully');
			});

			ablyInstance.connection.on('disconnected', () => {
				console.log('❌ Ably disconnected');
			});

			ablyInstance.connection.on('failed', () => {
				console.log('💥 Ably connection failed');
			});

			setAbly(ablyInstance);
		} else if (ablyInstance) {
			console.log('♻️ Reusing existing Ably connection');
			setAbly(ablyInstance);
		}

		return () => {
			// Only close on app unmount, not component unmount
			console.log('🧹 AblyProvider cleanup called');
		};
	}, []);

	return (
		<AblyContext.Provider value={ably}>
			{children}
		</AblyContext.Provider>
	);
}

export function useAbly() {
	const ably = useContext(AblyContext);
	if (!ably) {
		console.warn('⚠️ useAbly called before Ably is ready');
	}
	return ably;
}
