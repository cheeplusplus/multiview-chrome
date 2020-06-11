chrome.webRequest.onHeadersReceived.addListener(
    (info) => {
        const headers = info.responseHeaders || [];
        for (let i = headers.length - 1; i >= 0; --i) {
            const header = headers[i].name.toLowerCase();
            if (header === "x-frame-options" || header === "frame-options") {
                headers.splice(i, 1); // Remove header
            }
        }
        return { "responseHeaders": headers };
    },
    {
        "urls": ["https://picarto.tv/streampopout/*", "https://picarto.tv/chatpopout/*", "https://www.twitch.tv/*/chat*"], // Override frame options to allow embedding
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
