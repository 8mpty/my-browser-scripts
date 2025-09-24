// ==UserScript==
// @name        YTM Enable Search
// @namespace   8mpty YTM Script
// @match        *://music.youtube.com/watch*
// @grant       none
// @version     1.0
// @author      8mpty
// @description Attempts enable/show the search bar
// ==/UserScript==

/**
 * Credits
 * https://github.com/8mpty/WebYTM-Expo/blob/master/assets/scripts/YTM_Search.js
 */

(function() {
    'use strict';
    
    function addSearchIcon() {
        const navBar = document.querySelector("ytmusic-nav-bar");
        if (navBar) {
            navBar.setAttribute("user-logged-in", '""');
            console.log("Search icon added beside the login button.");
        } else {
            console.log("Navigation bar not found.");
            // If navigation bar not found yet, try again after a delay
            setTimeout(addSearchIcon, 1000);
        }
    }
    
    function removeInstallApp() {
        const observer = new MutationObserver(() => {
            const installLink = document.querySelector(
                "ytmusic-app ytmusic-app-layout ytmusic-nav-bar div.center-content a.app-install-link"
            );
            if (installLink) {
                installLink.style.display = "none";
                console.log('"Install App" link removed.');
                observer.disconnect(); // Stop observing once the element is found and modified
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addSearchIcon();
            removeInstallApp();
        });
    } else {
        addSearchIcon();
        removeInstallApp();
    }
})();