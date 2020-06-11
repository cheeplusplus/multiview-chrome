import * as _ from "lodash";
import * as agent from "superagent";
import type { GetFollowsResponse } from ".";

const PICARTO_FOLLOW_URL = "https://api.picarto.tv/v1/user/following?priority_online=true";
const PICARTO_CLIENT_ID = "LDnggcQcithHW0d2";
const PICARTO_OAUTH_REDIRECT = "https://cheeplusplus.github.io/multiview-chrome/picarto_oauth.html";

type PicartoApiResponse = PicartoApiStream[];

interface PicartoApiStream {
    online: boolean;
    user_id: string;
    name: string;
}

export function get_follows(access_token?: string): Promise<GetFollowsResponse[]> {
    if (!access_token) {
        return Promise.resolve([]);
    }

    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
    };

    return agent.get(PICARTO_FOLLOW_URL).set(headers).then((res) => {
        const body = res.body as PicartoApiResponse;
        if (!body || body.length < 1) {
            return [];
        }

        return _.chain(body).filter(f => f.online).map((stream) => {
            return {
                "id": `pic_${stream.user_id}`,
                "service": "Picarto",
                "name": stream.name
            } as GetFollowsResponse;
        }).filter("name").value();
    });
}

export function get_oauth_url(): string {
    return `https://oauth.picarto.tv/authorize?response_type=token&client_id=${PICARTO_CLIENT_ID}&redirect_uri=${PICARTO_OAUTH_REDIRECT}&scope=readpub%20readpriv&state=OAuth2Implicit`;
}
