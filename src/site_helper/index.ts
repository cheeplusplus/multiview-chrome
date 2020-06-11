import * as site_picarto from "./picarto";
import * as site_twitch from "./twitch";

export interface GetFollowsResponse {
    id: string;
    service: string;
    name: string;
}

const current_domain = chrome.runtime.id;

export const models = [
    { "name": "YouTube", "embed": `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/%s" frameborder="0" allowfullscreen></iframe>` },
    { "name": "Twitch", "embed": `<iframe src="https://player.twitch.tv/?channel=%s&muted=true&parent=${current_domain}" frameborder="0" scrolling="no" height="100%" width="100%"></iframe>`, "hasChat": true },
    { "name": "Twitch Chat", "embed": `<iframe src="https://www.twitch.tv/embed/%s/chat?parent=${current_domain}" frameborder="0" scrolling="no" height="100%" width="100%"></iframe>` },
    { "name": "Picarto", "embed": `<iframe src="https://picarto.tv/streampopout/%s/public" frameborder="0" scrolling="no" height="100%" width="100%"></iframe>`, "hasChat": true },
    { "name": "Picarto Chat", "embed": `<iframe src="https://picarto.tv/chatpopout/%s/public" frameborder="0" scrolling="no" height="100%" width="100%"></iframe>` },
    { "name": "Tigerdile", "embed": `<iframe src="https://www.tigerdile.com/stream/%s?single=1&popout=1" frameborder="0" scrolling="no" height="100%" width="100%"></iframe>` },
    { "name": "Custom", "embed": "%s" },
];

export const check_twitch = site_twitch.get_follows;
export const get_twitch_oauth_url = site_twitch.get_oauth_url;
export const check_picarto = site_picarto.get_follows;
export const get_picarto_oauth_url = site_picarto.get_oauth_url;
