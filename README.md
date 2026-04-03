# Chess FAAAAH 🔊♟️

A high-performance Chrome extension that plays the iconic **FAAAAH** sound effect whenever you lose a game on [Chess.com](https://chess.com) or [Lichess](https://lichess.org).

Because losing a game should *hurt* a little more.

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-v1.2-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/chess-faaaah/nobdehegokblgofghjcmjnbcfokccopa)

## 🛠️ How It Works

The extension stays silent in the background and only speaks up when things go wrong.

- **Automatic Side Detection**: It knows if you're playing White or Black, so it only triggers if *you* are the one who lost.
- **Instant Feedback**: It's optimized for speed, playing the sound the exact moment the game result appears on your screen.
- **Works Everywhere**: Whether it's a live match, a tournament, or even a game against the computer, it's got you covered.

## 📦 Install

**[Install from Chrome Web Store](https://chromewebstore.google.com/detail/chess-faaaah/nobdehegokblgofghjcmjnbcfokccopa)**

*Alternatively, for development:*
1. Clone this repo
2. Open `chrome://extensions` in Chrome
3. Enable **Developer mode**
4. Click **Load unpacked** and select this folder

## 🛰️ Supported Sites

| Site | Status |
|------|--------|
| [Chess.com](https://www.chess.com) | ✅ |
| [Lichess.org](https://lichess.org) | ✅ |

## 🔒 Privacy

This extension is built with your privacy in mind:
- **Zero Tracking**: It doesn't collect any data or monitor your games beyond detecting the final score.
- **No Network Activity**: It never talks to any servers. Everything happens entirely on your machine.
- **Minimal Permissions**: Only uses the absolute bare minimum permissions needed to play audio.

## 📂 File Structure

```
├── manifest.json          # Extension configuration
├── content-chess.js       # Game detection for Chess.com
├── content-lichess.js     # Game detection for Lichess
├── background.js          # Audio coordinator
├── offscreen.html/.js     # High-speed audio player
└── faaah.mp3              # The sound asset
```

## 📜 License

MIT — do whatever you want with it. Just don't mute the FAAAAH.
