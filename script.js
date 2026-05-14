document.addEventListener('DOMContentLoaded', () => {
    // Steam Code Copy Functionality
    const copyBtn = document.getElementById('copy-btn');
    const steamCode = document.getElementById('steam-code');

    if (copyBtn && steamCode) {
        copyBtn.addEventListener('click', async () => {
            const originalIconHtml = copyBtn.innerHTML;
            const code = steamCode.innerText;

            try {
                await navigator.clipboard.writeText(code);
                
                // Visual Feedback
                copyBtn.innerHTML = '<span style="color: #10b981; font-size: 0.7rem; font-weight:800; white-space:nowrap;">COPIED!</span>';
                
                setTimeout(() => {
                    copyBtn.innerHTML = originalIconHtml;
                }, 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        });
    }

    // Burger Menu Toggle
    const burgerMenu = document.getElementById('burger-menu');
    const mobileOverlay = document.getElementById('mobile-overlay');

    if (burgerMenu && mobileOverlay) {
        burgerMenu.addEventListener('click', () => {
            burgerMenu.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            document.body.style.overflow = mobileOverlay.classList.contains('active') ? 'hidden' : '';
        });

        // Close menu when clicking a link
        mobileOverlay.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                burgerMenu.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

});
