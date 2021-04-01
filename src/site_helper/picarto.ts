import _ from "lodash";
import * as agent from "superagent";
import { GetFollowsResponse, SiteHelper } from "./interfaces";

const PICARTO_FOLLOW_URL = "https://api.picarto.tv/api/v1/user/following?page=1&priority_online=true";
const PICARTO_CLIENT_ID = "LDnggcQcithHW0d2";
const PICARTO_OAUTH_REDIRECT = "https://cheeplusplus.github.io/multiview-chrome/picarto_oauth.html";

type PicartoApiResponse = PicartoApiStream[];

interface PicartoApiStream {
    online: boolean;
    user_id: string;
    name: string;
}

export class PicartoSite extends SiteHelper {
    async GetFollows(): Promise<GetFollowsResponse[]> {
        const access_token = await this.getAccessToken();

        if (!access_token) {
            return [];
        }

        const headers = {
            "Accept": "application/json",
            "Authorization": `Bearer ${access_token}`
        };

        try {
            const res = await agent.get(PICARTO_FOLLOW_URL).set(headers);
            const body = (res.body as PicartoApiResponse);
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
        } catch (err) {
            if (err.status === 403) {
                this.revokeAccessToken();
            }
            throw err;
        }
    }

    GetOauthUrl(): string {
        return `https://oauth.picarto.tv/authorize?response_type=token&client_id=${PICARTO_CLIENT_ID}&redirect_uri=${PICARTO_OAUTH_REDIRECT}&scope=readpub%20readpriv&state=OAuth2Implicit`;
    }

    get OAuthSettingsKey() {
        return "oauth.picarto";
    }
}
