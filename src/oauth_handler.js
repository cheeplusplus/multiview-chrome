// Handle oauth redirect

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
for (let arg of args) {
    const tags = arg.split("=");
    if (tags[0] === "access_token") {
        token = tags[1];
    }
}

if (token) {
    console.log("Updating oauth token...");

    let msg = {"type": "oauth", "site": site, "token": token};

    chrome.runtime.sendMessage(undefined, msg, null, (res) => {
        if (res.handled) {
            console.log("Updated oauth token.");
            document.write("\nOAuth token saved. You may close this window.");
            window.close();
        }
    });
} else {
    document.write("\nError: No token found.");
    throw new Error("No token found.");
}
