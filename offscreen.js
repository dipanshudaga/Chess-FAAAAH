chrome.runtime.onMessage.addListener((msg) => {
    if (msg.action === 'do_play' && msg.src?.startsWith(chrome.runtime.getURL(''))) {
        const audio = new Audio(msg.src);
        audio.play().then(() => {
            audio.onended = () => window.close();
        }).catch(() => window.close());
    }
});
