# Chess Game Audio Files

This directory contains audio files for various chess game events:

## Required Audio Files:
- `move.mp3` - Regular piece movement sound =
- `capture.mp3` - Piece capture sound  =
- `check.mp3` - Check notification sound =
- `checkmate.mp3` - Checkmate/game end sound 
- `castling.mp3` - Castling move sound
- `promotion.mp3` - Pawn promotion sound
- `game-start.mp3` - Game start notification
- `game-end.mp3` - Game end notification
- `notification.mp3` - General notification sound
- `error.mp3` - Error/invalid move sound =

## Audio Requirements:
- Format: MP3 (for broad browser compatibility)
- Duration: 0.5-2 seconds per file
- Volume: Normalized, not too loud
- Quality: 44.1kHz, 128kbps minimum

## Implementation:
These sounds are managed by the `soundManager.js` utility and triggered based on user preferences in game events.

## Fallbacks:
If audio files are missing, the sound manager will gracefully handle errors and continue without sound effects.
