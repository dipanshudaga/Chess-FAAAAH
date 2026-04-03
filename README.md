# Chess FAAAAH 🔊♟️

A high-performance Chrome extension that plays the iconic **FAAAAH** sound effect whenever you lose a game on [Chess.com](https://chess.com) or [Lichess](https://lichess.org).

Because losing a game should *hurt* a little more.

[![Chrome Web Store](https://img.shields.io/badge/Chrome_Web_Store-v1.2-blue?logo=google-chrome&logoColor=white)](https://chromewebstore.google.com/detail/chess-faaaah/nobdehegokblgofghjcmjnbcfokccopa)

## 🛠️ How It Works (Technical)

The extension utilizes a lightweight, asynchronous detection engine to ensure near-zero latency playback without impacting board performance.

1.  **DOM Observation**: Employs a `MutationObserver` on the `document.body` to monitor for the specific appearance of game-result containers (`.result-row-component` or game-over modals) across SPA transitions.
2.  **Orientation Detection**: Introspects the `wc-chess-board` component's state to determine player color (detecting the `.flipped` class for Black) to accurately identify the losing side.
3.  **Heuristic Result Parsing**: Executes case-insensitive text analysis on game-over artifacts to support various outcomes (1-0, 0-1, Resignation, Timeout) across both Live and Computer matches.
4.  **Offscreen Audio Pipeline**: Leverages the Chrome Manifest V3 `offscreen` API. Audio is managed in a dedicated context to bypass Service Worker limitations, with an optimized "hot-start" mechanism that eliminates the 100ms initialization bottleneck.

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

This extension follows strict privacy-first principles:
- **Zero Data Collection**: No user metrics or game data are ever stored or transmitted.
- **Local Enforcement**: All result detection happens entirely within the local DOM context.
- **Minimal Permissions**: Only requires the `offscreen` permission for audio playback functionality.

## 📂 File Structure

```
├── manifest.json          # Manifest V3 configuration
├── content-chess.js       # DOM monitor and heuristic engine (Chess.com)
├── content-lichess.js     # DOM monitor and heuristic engine (Lichess)
├── background.js          # Service Worker audio event coordinator
├── offscreen.html/.js     # Audio playback context
└── faaah.mp3              # Iconic sound asset
```

## 📜 License

MIT — do whatever you want with it. Just don't mute the FAAAAH.
