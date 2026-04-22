document.addEventListener('DOMContentLoaded', async () => {
    const options = document.querySelectorAll('.sound-option');
    const radios = document.querySelectorAll('input[name="sound"]');
    const previews = document.querySelectorAll('.play-btn');
    let currentPreview = null;

    const { selectedSound } = await chrome.storage.sync.get({ selectedSound: 'FAAAAH.mp3' });
    
    radios.forEach(radio => {
        if (radio.value === selectedSound) {
            radio.checked = true;
            radio.parentElement.classList.add('selected');
        }

        radio.addEventListener('change', (e) => {
            const value = e.target.value;
            chrome.storage.sync.set({ selectedSound: value });
            
            options.forEach(opt => opt.classList.remove('selected'));
            radio.parentElement.classList.add('selected');
        });
    });

    previews.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const soundFile = btn.getAttribute('data-sound');
            
            if (currentPreview) {
                currentPreview.pause();
                currentPreview.currentTime = 0;
            }

            currentPreview = new Audio(chrome.runtime.getURL(soundFile));
            currentPreview.play().catch(err => console.error('Preview failed:', err));
        });
    });
});
