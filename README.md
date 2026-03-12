# Chess FAAAAH 🔊♟️

A Chrome extension that plays the iconic **FAAAAH** sound effect whenever you lose a game on [Chess.com](https://chess.com) or [Lichess](https://lichess.org).

Because losing a game should *hurt* a little more.

## How It Works

The extension watches your live games in the background. When a game ends and you're on the losing side — **FAAAAH**. That's it. No setup, no configuration, no mercy.

- ♟️ Detects your color automatically (white or black)
- 📊 Reads the game result from the page (1-0, 0-1)
- 🔊 Plays the sound only when **you** lose
- 🤝 Draws and wins are safe — no sound

## Install

1. Download or clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode** (top right)
4. Click **Load unpacked** and select this folder
5. Go lose a game on Chess.com or Lichess

## Supported Sites

| Site | Status |
|------|--------|
| [Chess.com](https://www.chess.com) | ✅ |
| [Lichess.org](https://lichess.org) | ✅ |

## Privacy

This extension:
- ❌ Collects **zero** data
- ❌ Makes **no** network requests
- ❌ Uses **no** cookies or storage
- ✅ Only reads the board orientation and game result from the page DOM
- ✅ Only needs the `offscreen` permission (to play audio)

## Files

```
├── manifest.json          # Extension config
├── content-chess.js       # Loss detection for Chess.com
├── content-lichess.js     # Loss detection for Lichess
├── background.js          # Service worker, handles audio playback
├── offscreen.html/.js     # Offscreen document for playing sound
└── faaah.mp3              # The sound. You know the one.
```

## License

MIT — do whatever you want with it. Just don't mute the FAAAAH.
