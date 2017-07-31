const agent = require("superagent");


const PICARTO_ONLINE_URL = "https://api.picarto.tv/v1/online?adult=true&gaming=true";
const PICARTO_FOLLOW_URL = "https://api.picarto.tv/v1/user";
const PICARTO_CLIENT_ID = "LDnggcQcithHW0d2";
const PICARTO_OAUTH_REDIRECT = "https://andrewneo.github.io/multiview-chrome/picarto_oauth.html";


function get_all_online() {
    const headers = {
        "Content-Type": "application/json"
    };

    return agent.get(PICARTO_ONLINE_URL).set(headers).then((res) => {
        const body = res.body;
        if (!body || body.length < 1) {
            return [];
        }

        return body;
    });
}


function get_all_following(access_token) {
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${access_token}`
    };

    return agent.get(PICARTO_FOLLOW_URL).set(headers).then((res) => {
        const body = res.body;
        if (!body || body.length < 1) {
            return [];
        }

        const following = body.following;
        if (!following || following.length < 1) {
            return [];
        }

        return following;
    });
}


exports.get_follows = (access_token) => {
    if (!access_token) {
        return Promise.resolve([]);
    }

    return get_all_online().then((online) => {
        if (!online || online.length < 1) {
            return [];
        }

        return get_all_following(access_token).then((following) => {
            if (!following || following.length < 1) {
                return [];
            }

            return _.intersectionBy(online, following, "user_id");
        });
    }).then((interested) => {
        if (!interested || interested.length < 1) {
            return [];
        }

        return _.chain(interested).map((stream) => {
            return {
                "id": `pic_${stream.user_id}`,
                "service": "Picarto",
                "name": stream.name
            };
        }).filter("name").value();
    });
};


exports.get_oauth_url = () => {
    return `https://oauth.picarto.tv/authorize?response_type=token&client_id=${PICARTO_CLIENT_ID}&redirect_uri=${PICARTO_OAUTH_REDIRECT}&scope=readpub%20readpriv&state=OAuth2Implicit`;
};
