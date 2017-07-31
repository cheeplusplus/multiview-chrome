const agent = require("superagent");
const site_twitch = require("./site_helper/twitch");
const site_picarto = require("./site_helper/picarto");


// Constants

exports.models = [
    {"name": "YouTube", "embed": "<iframe width=\"100%\" height=\"100%\" src=\"http://www.youtube.com/embed/%s\" frameborder=\"0\" allowfullscreen></iframe>"},
    {"name": "Twitch", "embed": "<iframe src=\"http://player.twitch.tv/?channel=%s&muted=true\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>", "hasChat": true},
    {"name": "Twitch Chat", "embed": "<iframe src=\"http://www.twitch.tv/%s/chat?popout=\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Picarto", "embed": "<iframe src=\"https://picarto.tv/streampopout/%s/public\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>", "hasChat": true},
    {"name": "Picarto Chat", "embed": "<iframe src=\"https://picarto.tv/chatpopout/%s/public\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    //{"name": "Tigerdile", "embed": ""},
    {"name": "Join.me", "embed": "<iframe src=\"https://join.me/%s\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Custom", "embed": "%s"},
];


exports.check_twitch = site_twitch.get_follows;
exports.get_twitch_oauth_url = site_twitch.get_oauth_url;
exports.check_picarto = site_picarto.get_follows;
