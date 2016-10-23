chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ 'https://picarto.tv/streampopout/*', 'https://picarto.tv/chatpopout/*' ], // Override Picarto's frame options to allow embedding
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);


chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "oauth") {
        const site = msg.site;
        const token = msg.token;
        const key = `oauth.${site}`;

        chrome.storage.sync.set({[key]: token}, () => {
            sendResponse(true);
        });
    }
});


chrome.browserAction.onClicked.addListener(() => {
    chrome.tabs.create({"url": "multiview.html"});
});
