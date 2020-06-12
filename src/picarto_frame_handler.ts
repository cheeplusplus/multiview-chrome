function inIframe() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

function autoplay(vid: HTMLVideoElement) {
    // HTML5 endpoints only since as a content script we're not allowed to access the real player on the page
    vid.muted = true; // mute?
    vid.play().catch((err) => {
        console.error("Got play() error", err);
    });
}

function inject() {
    // TODO: While embedding shouldn't be possible, we should find a way to check if it's the extension anyway
    if (!inIframe()) {
        return;
    }

    // Retry until the object becomes available
    let maxAttemptClock = 5000;
    const repeat = setInterval(() => {
        maxAttemptClock -= 100;

        if (maxAttemptClock < 0) {
            clearInterval(repeat);
            console.warn("Ran out of time to inject!");
            return;
        }

        const vid = document.getElementById("picarto-player-1_html5_api") as HTMLVideoElement;
        if (vid) {
            clearInterval(repeat);
            setTimeout(() => {
                // Delay a little to let content settle
                autoplay(vid);
            }, 500);
            return;
        }
    }, 100);
}

inject();
