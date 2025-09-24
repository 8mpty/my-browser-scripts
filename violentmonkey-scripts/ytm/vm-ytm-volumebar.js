// ==UserScript==
// @name        YTM Enable Volume Bar
// @namespace   8mpty YTM Script
// @match        *://music.youtube.com/watch*
// @grant       none
// @version     1.0
// @author      8mpty
// @description Attempts enable/show the volume bar in the website
// ==/UserScript==

/**
 * Credits
 * https://github.com/8mpty/WebYTM-Expo/blob/master/assets/scripts/YTM_Search.js
 */

(function() {
    'use strict';
    
    const createSlider = () => {
        if (document.querySelector("#yt-custom-volume-slider")) return;

        const sliderContainer = document.createElement("div");
        sliderContainer.id = "yt-custom-volume-slider-container";

        const slider = document.createElement("input");
        slider.id = "yt-custom-volume-slider";
        slider.type = "range";
        slider.min = 0;
        slider.max = 1;
        slider.step = 0.01;

        const video = document.querySelector(".html5-main-video");
        if (video) {
            slider.value = video.volume;
        }

        slider.addEventListener("input", (e) => {
            const video = document.querySelector(".html5-main-video");
            const sliderBar = document.getElementById("sliderBar");
            const volumeSlider = document.getElementById("volume-slider");
            const expandMenu = document.querySelector('#right-controls #expanding-menu #expand-volume-slider');

            if (video) {
                let value = Math.round(e.target.value * 100); // Convert to 0-100 range and round to nearest whole number
                value = Math.min(100, Math.max(10, value)); // Force the value to be between 10 and 100

                if (expandMenu) {
                    expandMenu.setAttribute("value", value);
                    expandMenu.setAttribute("aria-valuenow", value);
                }

                if (sliderBar) {
                    sliderBar.setAttribute("value", value);
                    sliderBar.setAttribute("aria-valuenow", value);
                }
                
                if (volumeSlider) {
                    volumeSlider.setAttribute("value", value);
                    volumeSlider.setAttribute("aria-valuenow", value);
                }

                video.volume = value / 100; // Map the value back to a 0-1 scale for video volume
            }
        });

        sliderContainer.appendChild(slider);

        const style = document.createElement("style");
        style.textContent = `
            #yt-custom-volume-slider-container {
                position: fixed;
                bottom: 70px;
                left: 50%;
                transform: translateX(-50%);
                z-index: 9999;
                background: transparent;
                padding: 8px 12px;
                border-radius: 8px;
                display: flex;
                align-items: center;
            }

            #yt-custom-volume-slider {
                -webkit-appearance: none;
                appearance: none;
                width: 300px;
                height: 4px;
                background: #ccc;
                border-radius: 2px;
                outline: none;
                transition: background 0.2s;
                cursor: pointer;
            }

            #yt-custom-volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                border: 2px solid #888;
                cursor: pointer;
                transition: background 0.2s, border 0.2s;
            }

            #yt-custom-volume-slider::-webkit-slider-thumb:hover {
                background: #f1f1f1;
                border: 2px solid #666;
            }

            #yt-custom-volume-slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: white;
                border: 2px solid #888;
                cursor: pointer;
                transition: background 0.2s, border 0.2s;
            }

            #yt-custom-volume-slider::-moz-range-thumb:hover {
                background: #f1f1f1;
                border: 2px solid #666;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(sliderContainer);
        checkPlayerState();
    };

    const hideSlider = () => {
        const slider = document.querySelector("#yt-custom-volume-slider-container");
        if (slider) {
            slider.style.display = "none";
        }
    };

    const showSlider = () => {
        const slider = document.querySelector("#yt-custom-volume-slider-container");
        if (slider) {
            slider.style.display = "flex";
        }
    };

    const checkPlayerState = () => {
        const playerPage = document.querySelector("ytmusic-player-page#player-page.style-scope.ytmusic-app");
        
        if (playerPage) {
            const state = playerPage.getAttribute("player-page-ui-state");
            
            if (state === "FULL_PLAYER_VIEW") {
                showSlider();
            } else if (state === "TABS_VIEW") {
                hideSlider();
            }
        }
    };

    const observePlayerState = () => {
        const playerPage = document.querySelector("ytmusic-player-page#player-page.style-scope.ytmusic-app");
        
        if (playerPage) {
            const observer = new MutationObserver((mutationsList) => {
                for (const mutation of mutationsList) {
                    if (mutation.type === "attributes" && mutation.attributeName === "player-page-ui-state") {
                        checkPlayerState();
                    }
                }
            });
            
            observer.observe(playerPage, { attributes: true, attributeFilter: ["player-page-ui-state"] });
            checkPlayerState();
        }
    };

    const observeAriaHidden = () => {
        const targetElement = document.querySelector(
            ".av.style-scope.ytmusic-player-page"
        );

        if (targetElement) {
            const observer = new MutationObserver((mutationsList) => {
                mutationsList.forEach((mutation) => {
                    if (mutation.attributeName === "aria-hidden") {
                        if (targetElement.getAttribute("aria-hidden") !== null) {
                            hideSlider();
                        } else {
                            checkPlayerState(); // Use checkPlayerState instead of directly showing
                        }
                    }
                });
            });

            observer.observe(targetElement, { attributes: true });
        }
    };

    const observeVisibility = () => {
        const testEl = document.querySelector(
            "ytmusic-player-bar.style-scope.ytmusic-app"
        );

        if (testEl) {
            const observer = new MutationObserver(() => {
                const visibility = window.getComputedStyle(testEl).visibility;
                if (visibility === "visible") {
                    hideSlider();
                } else if (visibility === "hidden") {
                    checkPlayerState(); // Use checkPlayerState instead of directly showing
                }
            });

            observer.observe(testEl, { attributes: true, attributeFilter: ["style"] });
        }
    };

    const init = () => {
        createSlider();
        observeAriaHidden();
        observeVisibility();
        observePlayerState();

        const observer = new MutationObserver(() => createSlider());
        observer.observe(document.body, { childList: true, subtree: true });

        let signin = document.querySelector('a.sign-in-link.style-scope.ytmusic-nav-bar');
        if (signin) {
            signin.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="#707070"><path d="M3,3v18h18V3H3z M20,20H4v-0.08c0.44-3.2,2.87-5.74,7.28-5.99C9.42,13.59,8,11.96,8,10c0-2.21,1.79-4,4-4 c2.21,0,4,1.79,4,4c0,1.96-1.42,3.59-3.28,3.93c4.41,0.25,6.84,2.8,7.28,5.99V20z"></path></svg>';
        }
    };

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Prevent page visibility changes from affecting the slider
    document.addEventListener("visibilitychange", (e) => e.stopImmediatePropagation(), true);
    
    return true;
})();