import _ from "lodash";
import * as agent from "superagent";
import { GetFollowsResponse, SiteHelper } from "./interfaces";

const TWITCH_FOLLOW_URL = "https://api.twitch.tv/kraken/streams/followed?limit=100&stream_type=live";
const TWITCH_CLIENT_ID = "lvbo5m1mea23v189xze52lzz04pzhgf";
const TWITCH_OAUTH_REDIRECT = "https://cheeplusplus.github.io/multiview-chrome/twitch_oauth.html";

interface TwitchApiResponse {
    _total: number;
    streams: {
        channel: {
            _id: string;
            name: string;
        }
    }[];
}

export class TwitchSite extends SiteHelper {
    GetFollows(access_token?: string): Promise<GetFollowsResponse[]> {
        if (!access_token) {
            return Promise.resolve([]);
        }

        const headers = {
            "Content-Type": "application/json",
            "Client-ID": TWITCH_CLIENT_ID,
            "Authorization": `OAuth ${access_token}`
        };

        return agent.get(TWITCH_FOLLOW_URL).set(headers).accept("application/vnd.twitchtv.v5+json").send().then((res) => {
            const body = res.body as TwitchApiResponse;
            if (!body || body["_total"] < 1 || !body["streams"]) {
                return [];
            }

            return _.chain(body.streams).map((stream) => {
                return {
                    "id": `tw_${stream.channel._id}`,
                    "service": "Twitch",
                    "name": stream.channel.name
                } as GetFollowsResponse;
            }).filter("name").value();
        });
    }

    GetOauthUrl(): string {
        return `https://id.twitch.tv/oauth2/authorize?response_type=token&client_id=${TWITCH_CLIENT_ID}&redirect_uri=${TWITCH_OAUTH_REDIRECT}&scope=user_read&force_verify=true"`;
    }
}
