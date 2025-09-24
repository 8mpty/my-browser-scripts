// ==UserScript==
// @name        YTM Adblocker
// @namespace   8mpty YTM Script
// @match        *://music.youtube.com/watch*
// @grant       none
// @version     1.0
// @author      8mpty
// @description Attempts to block ads on YTM
// ==/UserScript==

/**
 * Credits
 * https://github.com/8mpty/WebYTM-Expo/blob/master/assets/scripts/YTM_AdBlocker.js
 */

(function() {
    'use strict';

    console.log("Starting Ad Blocker > ");

    const style = document.createElement('style');
    style.textContent = `
        /* Hide ads via CSS */
        ytm-promoted-video-renderer,
        ytm-companion-slot,
        .ytp-ad-overlay-container,
        .ytp-ad-progress,
        .ytp-ad-progress-list,
        ytm-companion-ad-renderer,
        .companion-ad-container,
        ytm-promoted-sparkles-text-search-renderer,
        ytm-promoted-sparkles-web-renderer {
            display: none !important;
        }
    `;
    document.head.appendChild(style);

    function skipAds() {
        if (document.querySelector('.ad-showing')) {
            const video = document.querySelector('video');
            if (video && video.duration) {
                video.currentTime = video.duration;
                setTimeout(() => {
                    const skipBtn = document.querySelector('button.ytp-ad-skip-button');
                    if (skipBtn) skipBtn.click();
                }, 100);
            }
        }
    }

    function setupJsonOverride() {
        try {
            const originalParse = JSON.parse;
            JSON.parse = function() {
                const obj = originalParse.apply(this, arguments);
                if (obj && typeof obj === 'object') {
                    if (obj.adPlacements) obj.adPlacements = [];
                    if (obj.playerAds) obj.playerAds = [];
                }
                return obj;
            };
            console.log("JSON parse overridden");
        } catch (e) {
            console.error("Failed to override JSON.parse:", e);
        }
    }

    function setupObservers() {
        const observer = new MutationObserver(() => {
            skipAds();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        if (window.location.hostname === 'music.youtube.com') {
            setInterval(() => {
                const ytMusicLogo = document.querySelector('.ytmusic-nav-bar#left-content ytmusic-logo');
                if (ytMusicLogo && !document.getElementById('ad-blocker-logo')) {
                    const logo = document.createElement('span');
                    logo.id = 'ad-blocker-logo';
                    logo.textContent = 'Premium';
                    logo.style.marginLeft = '5px';
                    logo.style.color = '#ffffff';
                    logo.style.fontWeight = 'bold';
                    logo.style.fontSize = '5px';
                    logo.style.opacity = '0.8';
                    ytMusicLogo.parentNode.insertBefore(logo, ytMusicLogo.nextSibling);
                    console.log("Premium text added to logo");
                }

                const titleElement = document.querySelector('ytmusic-nav-bar .title');
                if (titleElement && !document.getElementById('title-premium-text')) {
                    const premiumText = document.createElement('span');
                    premiumText.id = 'title-premium-text';
                    premiumText.textContent = 'Premium';
                    premiumText.style.marginLeft = '5px';
                    premiumText.style.color = '#ffffff';
                    premiumText.style.fontWeight = 'bold';
                    premiumText.style.fontSize = '5px';
                    premiumText.style.opacity = '0.8';
                    titleElement.appendChild(premiumText);
                    console.log("Premium text added to title");
                }
            }, 1000);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            skipAds();
            setupJsonOverride();
            setupObservers();
        });
    } else {
        skipAds();
        setupJsonOverride();
        setupObservers();
    }

    // Enable Background / Foregound Playback
    document.addEventListener("visibilitychange", (e) => e.stopImmediatePropagation(), true);
    Object.defineProperties(document, { hidden: { value: false }, visibilityState: { value: "visible" } });
})();