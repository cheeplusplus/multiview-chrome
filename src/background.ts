chrome.webRequest.onHeadersReceived.addListener(
    (info) => {
        // Only use for tabs belonging to this extension
        const views = chrome.extension.getViews({ "tabId": info.tabId, "type": "tab" } as any);
        if (!views || views.length < 1) {
            return;
        }

        const headers = info.responseHeaders || [];
        for (let i = headers.length - 1; i >= 0; --i) {
            const header = headers[i].name.toLowerCase();
            if (info.url.startsWith("https://player.twitch.tv/")) {
                if (header === "content-security-policy") {
                    // Fix protocol in header
                    headers[i].value = headers[i].value?.replace("frame-ancestors https://" + chrome.runtime.id, "frame-ancestors chrome-extension://" + chrome.runtime.id);
                }
            }
        }
        return { "responseHeaders": headers };
    },
    {
        "urls": [
            // Override frame options to allow embedding
            "https://player.twitch.tv/*",
        ],
        "types": ["sub_frame"]
    },
    ["blocking", "responseHeaders"]
);

export interface BackgroundMessage {
    type: string;
    site: string;
    token: string;
}

export interface BackgroundMessageResponse {
    handled: boolean;
}

chrome.runtime.onMessage.addListener((msg: BackgroundMessage, sender, sendResponse) => {
    if (msg.type === "oauth") {
        const site = msg.site;
        const token = msg.token;
        const key = `oauth.${site}`;

        chrome.storage.sync.set({ [key]: token }, () => {
            sendResponse({ "handled": true } as BackgroundMessageResponse);
        });

        return true;
    }
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({ "url": "multiview.html" });
});
