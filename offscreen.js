let currentAudio = null;

chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'do_play') {
        processPlay(msg.src);
    }
});

function processPlay(src) {
    if (!src || typeof src !== 'string') return;

    if (!src.startsWith(chrome.runtime.getURL(''))) return;

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    
    currentAudio = new Audio(src);
    currentAudio.play().catch(() => {});
}
