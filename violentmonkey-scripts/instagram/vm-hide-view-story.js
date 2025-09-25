// ==UserScript==
// @name        Anonymously View Instagram Stories
// @namespace   8mpty Instagram Script
// @match       *://*.instagram.com/*
// @version     1.0
// @author      8mpty
// @run-at      document-start
// @grant       none
// @description Attempts to hide the view status (anonymously view) of instagram stories 
// ==/UserScript==

(function() {
    'use strict';
    
    // Intercept XMLHttpRequest (for older requests)
    const originalXHROpen = XMLHttpRequest.prototype.open;
    const originalXHRSend = XMLHttpRequest.prototype.send;
    
    XMLHttpRequest.prototype.open = function(method, url) {
        this._url = url;
        return originalXHROpen.apply(this, arguments);
    };
    
    XMLHttpRequest.prototype.send = function(body) {
        if (this._url && this._url.includes("viewSeenAt")) {
            console.log("Blocked XHR story view request");
            return;
        }
        if (body && typeof body === "string" && body.includes("viewSeenAt")) {
            console.log("Blocked XHR story view request (body)");
            return;
        }
        return originalXHRSend.apply(this, arguments);
    };
    
    // Intercept Fetch API (modern requests)
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
        const url = args[0];
        const options = args[1] || {};
        
        // Check URL
        if (typeof url === "string" && url.includes("viewSeenAt")) {
            console.log("Blocked fetch story view request");
            return Promise.reject(new Error("Blocked by story view blocker"));
        }
        
        // Check request body
        if (options.body && typeof options.body === "string" && options.body.includes("viewSeenAt")) {
            console.log("Blocked fetch story view request (body)");
            return Promise.reject(new Error("Blocked by story view blocker"));
        }
        
        return originalFetch.apply(this, args);
    };
})();