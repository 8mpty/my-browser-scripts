// ==UserScript==
// @name        Univeral Video Download Button
// @namespace   8mpty Universal Script
// @match       *://*/*
// @exclude     *://*.youtube.com/*
// @exclude     *://*.twitch.tv/*
// @grant       none
// @version     1.0
// @author      8mpty
// @description Attempts to show user available video links on the webpage
// ==/UserScript==

(function() {
    'use strict';

    const MEDIA_EXTENSIONS = ['.mp4', '.webm'];
    const MIN_FILE_SIZE = 100000;
    let detectedURLs = new Set();
    let isPopupOpen = false;

    const style = document.createElement('style');
    style.textContent = `
        #media-detector-button {
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            width: 40px; height: 40px; border-radius: 50%; border: none;
            background: #ff4444; color: white; font-size: 18px; cursor: pointer;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3); transition: all 0.3s ease;
        }
        #media-detector-button:hover { transform: scale(1.1); background: #ff6666; }
        #media-detector-badge {
            position: absolute; top: -5px; right: -5px; background: #4CAF50;
            color: white; border-radius: 10px; padding: 2px 6px; font-size: 10px;
            font-weight: bold; min-width: 18px; text-align: center; display: none;
        }
        #media-detector-popup {
            position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
            background: #1f1f1f; border-radius: 12px; padding: 25px; z-index: 10001;
            box-shadow: 0 8px 32px rgba(0,0,0,0.6); min-width: min(400px, 90vw);
            max-width: min(600px, 95vw); max-height: 80vh; overflow-y: auto; color: white;
        }
        .media-url-item { background: #2f2f2f; padding: 12px; margin: 8px 0; border-radius: 6px; }
        .copy-btn { background: #2196F3; color: white; border: none; padding: 6px 12px;
            border-radius: 4px; cursor: pointer; font-size: 11px; margin-left: 8px; }
        .copy-btn:hover { background: #1976D2; }
        .copy-btn.copied { background: #4CAF50; }
        .file-type-badge { background: #FF9800; color: white; padding: 2px 6px;
            border-radius: 4px; font-size: 10px; margin-left: 8px; }
    `;
    document.head.appendChild(style);

    const button = Object.assign(document.createElement('button'), {
        id: 'media-detector-button',
        innerHTML: '+<div id="media-detector-badge"></div>',
        title: 'Show detected .mp4 and .webm URLs'
    });
    button.onclick = showMediaURLsPopup;
    document.body.appendChild(button);

    const originalFetch = window.fetch;
    window.fetch = (...args) => originalFetch(...args).then(response => {
        if (response.url && isMediaURL(response.url)) processMediaURL(response.url);
        return response;
    });

    const OriginalXHR = window.XMLHttpRequest;
    window.XMLHttpRequest = class extends OriginalXHR {
        open(method, url) {
            this._url = url;
            super.open(method, url);
        }
        send(data) {
            this.addEventListener('load', () => {
                if (this.responseURL && isMediaURL(this.responseURL)) processMediaURL(this.responseURL);
            });
            super.send(data);
        }
    };

    new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    (node.tagName === 'VIDEO' || node.tagName === 'AUDIO' || node.tagName === 'SOURCE')
                        && monitorMediaElement(node);
                    node.querySelectorAll?.('video, audio, source').forEach(monitorMediaElement);
                }
            });
        });
    }).observe(document, { childList: true, subtree: true });

    document.querySelectorAll('video, audio, source').forEach(monitorMediaElement);

    function monitorMediaElement(element) {
        if (element.src && isMediaURL(element.src)) processMediaURL(element.src);

        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.attributeName === 'src' && element.src) processMediaURL(element.src);
            });
        }).observe(element, { attributes: true, attributeFilter: ['src'] });
    }

    function isMediaURL(url) {
        return /\.(mp4|webm)(\?|$)|format=(mp4|webm)|type=(mp4|webm)/i.test(url);
    }

    function processMediaURL(url) {
        const cleanURL = url.split('#')[0];
        if (!detectedURLs.has(cleanURL) && !url.includes('blob:') && isMediaURL(url)) {
            detectedURLs.add(cleanURL);
            updateBadge();
        }
    }

    function updateBadge() {
        const badge = document.getElementById('media-detector-badge');
        const btn = document.getElementById('media-detector-button');
        if (badge && btn) {
            const count = detectedURLs.size;
            badge.textContent = count;
            badge.style.display = count > 0 ? 'block' : 'none';
            btn.style.background = count > 0 ? '#4CAF50' : '#ff4444';
        }
    }

    function showMediaURLsPopup() {
        if (isPopupOpen) return;
        isPopupOpen = true;

        const overlay = Object.assign(document.createElement('div'), {
            style: 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);z-index:10000;'
        });

        const popup = Object.assign(document.createElement('div'), { id: 'media-detector-popup' });

        const closeBtn = Object.assign(document.createElement('button'), {
            id: 'media-detector-close',
            innerHTML: '×',
            style: 'position:absolute;top:15px;right:20px;background:none;border:none;color:#aaa;font-size:20px;cursor:pointer;'
        });

        const content = document.createElement('div');
        if (detectedURLs.size === 0) {
            content.innerHTML = '<div style="text-align:center;color:#888;padding:20px;font-style:italic">No .mp4 or .webm files detected yet.</div>';
        } else {
            Array.from(detectedURLs).forEach(url => {
                const item = document.createElement('div');
                item.className = 'media-url-item';
                item.innerHTML = `
                    <div style="display:flex;align-items:center;margin-bottom:8px">
                        <a href="${url}" target="_blank" style="flex:1;color:#4CAF50;text-decoration:none">${url}</a>
                        <span class="file-type-badge">${url.includes('.mp4') ? 'MP4' : 'WebM'}</span>
                    </div>
                    <button class="copy-btn">Copy URL</button>
                `;
                item.querySelector('.copy-btn').onclick = async function() {
                    try {
                        await navigator.clipboard.writeText(url);
                        this.textContent = 'Copied!';
                        this.classList.add('copied');
                        setTimeout(() => {
                            this.textContent = 'Copy URL';
                            this.classList.remove('copied');
                        }, 2000);
                    } catch (err) {
                        console.error('Failed to copy URL:', err);
                    }
                };
                content.appendChild(item);
            });
        }

        popup.innerHTML = `<h3 style="margin:0 0 20px 0;color:#fff;border-bottom:1px solid #444;padding-bottom:10px;">
            Detected MP4/WebM URLs (${detectedURLs.size})</h3>`;
        popup.appendChild(closeBtn);
        popup.appendChild(content);

        const removePopup = () => {
            document.body.removeChild(popup);
            document.body.removeChild(overlay);
            isPopupOpen = false;
        };

        closeBtn.onclick = removePopup;
        overlay.onclick = e => e.target === overlay && removePopup();
        document.addEventListener('keydown', e => e.key === 'Escape' && removePopup(), { once: true });

        document.body.appendChild(overlay);
        document.body.appendChild(popup);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', updateBadge);
    } else {
        updateBadge();
    }
})();