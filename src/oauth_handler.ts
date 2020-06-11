// Handle oauth redirect

import type { BackgroundMessage, BackgroundMessageResponse } from "./background";

let site;

const p = document.location.pathname;
if (p.endsWith("twitch_oauth.html")) {
    site = "twitch";
} else if (p.endsWith("picarto_oauth.html")) {
    site = "picarto";
} else {
    throw new Error("Unknown oauth page.");
}

const h = document.location.hash;
if (!h || h.length < 2) {
    throw new Error("No oauth response.");
}

let token;

const args = h.substring(1).split("&");
for (const arg of args) {
    const tags = arg.split("=");
    if (tags[0] === "access_token") {
        token = tags[1];
    }
}

if (token) {
    console.log("Updating oauth token...");

    const msg: BackgroundMessage = { "type": "oauth", "site": site, "token": token };

    chrome.runtime.sendMessage(msg, (res: BackgroundMessageResponse) => {
        if (res.handled) {
            console.log("Updated oauth token.");
            const contentField = document.getElementById("content") as HTMLDivElement;
            if (contentField) {
                contentField.textContent = "OAuth token saved. You may close this window.";
            }
            window.close();
        }
    });
} else {
    const contentField = document.getElementById("content") as HTMLDivElement;
    if (contentField) {
        contentField.textContent = "Error: No token found.";
    }
    throw new Error("No token found.");
}
