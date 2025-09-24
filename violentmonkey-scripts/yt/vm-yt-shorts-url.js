// ==UserScript==
// @name        YT Shorts URL
// @namespace   8mpty YTM Script
// @match        *://*.youtube.com/shorts/*
// @grant       none
// @version     1.0
// @author      8mpty
// @description Attempts to show the original URL for the YT Shorts
// ==/UserScript==

(function () {
    'use strict';

    function waitForElement(selector, timeout = 10000) {
        return new Promise((resolve, reject) => {
            const start = Date.now();
            const interval = setInterval(() => {
                const el = document.querySelector(selector);
                if (el) {
                    clearInterval(interval);
                    resolve(el);
                } else if (Date.now() - start > timeout) {
                    clearInterval(interval);
                    reject(new Error(`Timeout waiting for selector: ${selector}`));
                }
            }, 200);
        });
    }

    function copyToClipboard(text) {
        return new Promise((resolve, reject) => {
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(text).then(resolve).catch(reject);
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    resolve();
                } catch (err) {
                    reject(err);
                } finally {
                    document.body.removeChild(textArea);
                }
            }
        });
    }

    function createPopup(fullURL) {
        const overlay = document.createElement('div');
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.background = 'rgba(0, 0, 0, 0.6)';
        overlay.style.display = 'flex';
        overlay.style.alignItems = 'center';
        overlay.style.justifyContent = 'center';
        overlay.style.zIndex = '9999';

        const box = document.createElement('div');
        box.style.position = 'relative';
        box.style.background = '#1f1f1f';
        box.style.padding = '25px 30px';
        box.style.borderRadius = '12px';
        box.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)';
        box.style.textAlign = 'center';
        box.style.minWidth = 'min(400px, 90vw)'; // Responsive min-width
        box.style.maxWidth = 'min(600px, 95vw)'; // Responsive max-width
        box.style.boxSizing = 'border-box';

        const close = document.createElement('div');
        close.textContent = '✕';
        close.style.position = 'absolute';
        close.style.top = '15px';
        close.style.right = '20px';
        close.style.fontSize = '20px';
        close.style.color = '#aaa';
        close.style.cursor = 'pointer';
        close.style.fontWeight = 'bold';
        close.style.width = '30px';
        close.style.height = '30px';
        close.style.display = 'flex';
        close.style.alignItems = 'center';
        close.style.justifyContent = 'center';
        close.style.borderRadius = '50%';
        close.style.transition = 'background 0.2s';
        close.title = 'Close';

        close.addEventListener('mouseover', () => {
            close.style.color = '#fff';
            close.style.background = 'rgba(255,255,255,0.1)';
        });
        close.addEventListener('mouseout', () => {
            close.style.color = '#aaa';
            close.style.background = 'transparent';
        });

        close.addEventListener('click', () => document.body.removeChild(overlay));

        const title = document.createElement('h3');
        title.textContent = 'YouTube Video URL';
        title.style.color = '#fff';
        title.style.margin = '0 0 20px 0';
        title.style.fontSize = '18px';
        title.style.fontWeight = '500';

        const linkContainer = document.createElement('div');
        linkContainer.style.background = '#2f2f2f';
        linkContainer.style.padding = '15px';
        linkContainer.style.borderRadius = '8px';
        linkContainer.style.marginBottom = '20px';
        linkContainer.style.wordBreak = 'break-all';
        linkContainer.style.textAlign = 'left';

        const link = document.createElement('a');
        link.href = fullURL;
        link.textContent = fullURL;
        link.target = '_blank';
        link.style.color = '#3ea6ff';
        link.style.fontSize = 'clamp(14px, 3vw, 16px)'; // Responsive font size
        link.style.textDecoration = 'none';
        link.style.lineHeight = '1.4';
        link.style.display = 'block';

        link.addEventListener('mouseover', () => {
            link.style.textDecoration = 'underline';
        });
        link.addEventListener('mouseout', () => {
            link.style.textDecoration = 'none';
        });

        linkContainer.appendChild(link);

        const copyButton = document.createElement('button');
        copyButton.textContent = 'Copy Link';
        copyButton.style.background = '#3ea6ff';
        copyButton.style.color = '#fff';
        copyButton.style.border = 'none';
        copyButton.style.padding = '12px 24px';
        copyButton.style.borderRadius = '20px';
        copyButton.style.fontSize = '14px';
        copyButton.style.fontWeight = '500';
        copyButton.style.cursor = 'pointer';
        copyButton.style.transition = 'background 0.2s';
        copyButton.style.width = '100%';
        copyButton.style.maxWidth = '200px';

        copyButton.addEventListener('mouseover', () => {
            copyButton.style.background = '#2d96ff';
        });
        copyButton.addEventListener('mouseout', () => {
            copyButton.style.background = '#3ea6ff';
        });

        copyButton.addEventListener('click', async () => {
            try {
                await copyToClipboard(fullURL);
                const originalText = copyButton.textContent;
                copyButton.textContent = 'Copied!';
                copyButton.style.background = '#4caf50';

                setTimeout(() => {
                    copyButton.textContent = originalText;
                    copyButton.style.background = '#3ea6ff';
                }, 2000);
            } catch (err) {
                console.error('Failed to copy URL:', err);
                copyButton.textContent = 'Failed to copy';
                copyButton.style.background = '#f44336';

                setTimeout(() => {
                    copyButton.textContent = 'Copy Link';
                    copyButton.style.background = '#3ea6ff';
                }, 2000);
            }
        });

        // Close on overlay click (outside the box)
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
            }
        });

        // Close on Escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                document.body.removeChild(overlay);
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);

        box.appendChild(close);
        box.appendChild(title);
        box.appendChild(linkContainer);
        box.appendChild(copyButton);
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        // Focus the copy button for accessibility
        copyButton.focus();
    }

    async function insertCircularShowURLButton() {
        try {
            const actions = await waitForElement('ytd-reel-player-overlay-renderer #actions');
            const shareButton = actions.querySelector('#share-button');

            if (!actions || !shareButton || document.querySelector('#custom-show-url-button')) return;

            const wrapper = document.createElement('div');
            wrapper.id = 'custom-show-url-button';
            wrapper.className = 'button-container style-scope ytd-reel-player-overlay-renderer';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'center';
            wrapper.style.marginTop = '12px';

            const circleButton = document.createElement('div');
            circleButton.style.width = '40px';
            circleButton.style.height = '40px';
            circleButton.style.borderRadius = '50%';
            circleButton.style.backgroundColor = '#272727';
            circleButton.style.display = 'flex';
            circleButton.style.alignItems = 'center';
            circleButton.style.justifyContent = 'center';
            circleButton.style.cursor = 'pointer';
            circleButton.style.transition = 'background 0.3s';
            circleButton.style.boxShadow = '0 1px 2px rgba(0,0,0,0.2)';
            circleButton.style.flexShrink = '0';

            const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            icon.setAttribute("width", "24");
            icon.setAttribute("height", "24");
            icon.setAttribute("viewBox", "0 0 24 24");
            icon.setAttribute("fill", "white");
            icon.innerHTML = `<path d="M8 5v14l11-7z"/>`;

            circleButton.appendChild(icon);

            circleButton.addEventListener('mouseover', () => {
                circleButton.style.backgroundColor = '#3c3c3c';
            });
            circleButton.addEventListener('mouseout', () => {
                circleButton.style.backgroundColor = '#272727';
            });

            circleButton.addEventListener('click', () => {
                const shortsUrl = window.location.href;
                const videoId = shortsUrl.split('/shorts/')[1]?.split(/[/?&]/)[0];
                const fullURL = `https://www.youtube.com/watch?v=${videoId}`;
                createPopup(fullURL);
            });

            const label = document.createElement('div');
            label.textContent = 'Show URL';
            label.style.color = 'white';
            label.style.fontSize = '13px';
            label.style.fontWeight = '400';
            label.style.marginTop = '4px';
            label.style.textAlign = 'center';

            wrapper.appendChild(circleButton);
            wrapper.appendChild(label);

            shareButton.insertAdjacentElement('afterend', wrapper);

        } catch (err) {
            console.warn('[YT Shorts Custom Button]', err);
        }
    }

    const observer = new MutationObserver(() => {
        if (window.location.href.includes('/shorts/')) {
            insertCircularShowURLButton();
        }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    insertCircularShowURLButton();
})();