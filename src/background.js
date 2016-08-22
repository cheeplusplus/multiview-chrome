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