/**
	* Simple Logger Utility for Frontend
	* Just pass any data and get automatic file/line location
	* Usage: log(data) or log(data, 'optional label')
	*/

function log(data, label = null) {
	// Get stack trace to find caller location
	const stack = new Error().stack;
	const stackLines = stack.split('\n');

	// Find the caller (skip this function and Error constructor)
	let callerInfo = 'Unknown location';
	if (stackLines.length > 2) {
		const callerLine = stackLines[2].trim();

		// Extract file path and line number using regex
		const match = callerLine.match(/at .* \((.+):(\d+):(\d+)\)/) ||
			callerLine.match(/at (.+):(\d+):(\d+)/);

		if (match) {
			const filePath = match[1];
			const lineNumber = match[2];
			const columnNumber = match[3];

			// Get just the filename from full path
			const fileName = filePath.split(/[/\\]/).pop();
			callerInfo = `${fileName}:${lineNumber}:${columnNumber}`;
		}
	}

	// Format timestamp
	const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

	// Create formatted output with different colors for browser console
	const prefix = `[${timestamp}] 📍 ${callerInfo}`;

	if (label) {
		console.log(`%c${prefix} 🏷️  ${label}:`, 'color: #10b981; font-weight: bold;');
	} else {
		console.log(`%c${prefix} 📊 Data:`, 'color: #3b82f6; font-weight: bold;');
	}

	// Log the actual data with proper formatting
	if (typeof data === 'object' && data !== null) {
		console.log(data); // Browser console handles objects nicely
	} else {
		console.log(data);
	}

	console.log('─'.repeat(60));
}

// Additional utility functions for different types of logging
function logError(error, context = null) {
	const stack = new Error().stack;
	const stackLines = stack.split('\n');

	let callerInfo = 'Unknown location';
	if (stackLines.length > 2) {
		const callerLine = stackLines[2].trim();
		const match = callerLine.match(/at .* \((.+):(\d+):(\d+)\)/) ||
			callerLine.match(/at (.+):(\d+):(\d+)/);

		if (match) {
			const fileName = match[1].split(/[/\\]/).pop();
			callerInfo = `${fileName}:${match[2]}:${match[3]}`;
		}
	}

	const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

	console.error(`%c[${timestamp}] 📍 ${callerInfo} ❌ ERROR:`, 'color: #ef4444; font-weight: bold;');
	if (context) console.error(`Context: ${context}`);
	console.error(error);
	console.error('─'.repeat(60));
}

function logSuccess(message, data = null) {
	const stack = new Error().stack;
	const stackLines = stack.split('\n');

	let callerInfo = 'Unknown location';
	if (stackLines.length > 2) {
		const callerLine = stackLines[2].trim();
		const match = callerLine.match(/at .* \((.+):(\d+):(\d+)\)/) ||
			callerLine.match(/at (.+):(\d+):(\d+)/);

		if (match) {
			const fileName = match[1].split(/[/\\]/).pop();
			callerInfo = `${fileName}:${match[2]}:${match[3]}`;
		}
	}

	const timestamp = new Date().toISOString().replace('T', ' ').split('.')[0];

	console.log(`%c[${timestamp}] 📍 ${callerInfo} ✅ SUCCESS: ${message}`, 'color: #10b981; font-weight: bold;');
	if (data) {
		console.log(data);
	}
	console.log('─'.repeat(60));
}

// For ES6 modules (if needed)
export { log, logError, logSuccess };

// For CommonJS (if needed)
if (typeof module !== 'undefined' && module.exports) {
	module.exports = {
		log,
		logError,
		logSuccess
	};
}
