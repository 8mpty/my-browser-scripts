// ==UserScript==
// @name        Reddit NSFW Unblocker
// @namespace   8mpty Script
// @match        *://*.reddit.com/r/*
// @match        *://*.reddit.com/r/*
// @match        *://*.reddit.com/user/*
// @match        *://*.reddittorjg6rue252oqsxryoxengawnmo46qy4kyii5wtqnwfj4ooad.onion/r/*
// @match        *://*.reddittorjg6rue252oqsxryoxengawnmo46qy4kyii5wtqnwfj4ooad.onion/user/*
// @grant       none
// @version     1.1
// @author      8mpty
// @description Unblurs Reddits NSFW contents on web browsers and removes login requirements
// ==/UserScript==

unblock();

var observer = new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
        if (mutation.target.nodeName.toLowerCase() === "shreddit-app") {
            unblock();
        }
    });
});

observer.observe(document.querySelector("shreddit-app"), {
    childList: true,
});

function unblock() {
    // Remove body style restrictions
    document.body.style = "";

    // Remove blur elements
    document.querySelector("div[style*='blur(4px)']")?.remove();
    document.querySelector("div[style^='position: fixed; inset: 0px; backdrop-filter: blur(4px)']")?.remove();

    // Remove dialogs and modals
    document.getElementById("nsfw-qr-dialog")?.remove();
    document.getElementById("blocking-modal")?.remove();
    document.getElementById("nsfw-desktop-auth-blocking-modal-overlay-element")?.remove();
    document.getElementById("nsfw-desktop-auth-blocking-modal-dialog")?.remove();
    document.getElementById("nsfw-desktop-auth-blocking-modal")?.remove();

    // Remove xpromo elements (login prompts)
    document.getElementsByTagName("xpromo-nsfw-blocking-modal-desktop")[0]?.remove();
    document.getElementsByTagName("xpromo-desktop-blocking-modal")[0]?.remove();

    // Remove shreddit async loaders that contain blocking modals
    document.getElementById("desktop_rpl_nsfw_blocking_modal")?.remove();
    document.querySelector("shreddit-async-loader.desktop_rpl_nsfw_blocking_modal")?.remove();
    document.getElementById("theme-beta")?.remove();
    document.querySelector("shreddit-async-loader.theme-beta")?.remove();

    // Remove protected community modal
    document.querySelector("rpl-dialog.protected-community-modal")?.remove();

    // Remove untagged content blocking modal
    document.getElementsByTagName("xpromo-untagged-content-blocking-modal")[0]?.remove();

    /**
     * Handle shadow DOM elements - these are often used for the main blocking containers
     * On navigating into a post or from a post into a cross-post,
     * wait a minimum amount before trying to delete the post overlay prompt
     */
    setTimeout(() => {
        // Remove xpromo blocking containers (shadow DOM approach)
        var blockingContainers = document.getElementsByTagName("xpromo-nsfw-blocking-container");
        for (var container of blockingContainers) {
            try {
                container?.shadowRoot?.children[1]?.remove();
            } catch (e) {
                // If shadow root is closed, try removing the entire container
                container?.remove();
            }
        }

        // Additional attempt to find and remove blocking overlays
        var overlays = document.querySelectorAll('div[style*="backdrop-filter"], div[style*="blur"]');
        overlays.forEach(overlay => {
            if (overlay.style.backdropFilter?.includes('blur') ||
                overlay.style.filter?.includes('blur') ||
                overlay.getAttribute('style')?.includes('blur')) {
                overlay.remove();
            }
        });

        // Remove any remaining fixed position overlays
        var fixedOverlays = document.querySelectorAll('div[style*="position: fixed"]');
        fixedOverlays.forEach(overlay => {
            if (overlay.style.zIndex > 1000 || overlay.getAttribute('style')?.includes('inset: 0px')) {
                overlay.remove();
            }
        });
    }, 10);

    // Continuous monitoring for new blocking elements that might appear
    setTimeout(() => {
        unblock(); // Run again after a short delay to catch dynamically loaded elements
    }, 100);
}

// Additional observer for dynamically added content
var contentObserver = new MutationObserver(function(mutations) {
    for (let mutation of mutations) {
        for (let node of mutation.addedNodes) {
            if (node.nodeType === 1) { // Element node
                if (node.tagName && (
                    node.tagName.toLowerCase().includes('xpromo') ||
                    node.tagName.toLowerCase().includes('nsfw') ||
                    node.id?.includes('nsfw') ||
                    node.id?.includes('blocking') ||
                    node.getAttribute('style')?.includes('blur')
                )) {
                    setTimeout(unblock, 10);
                }
            }
        }
    }
});

// Start observing the document for changes
contentObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});