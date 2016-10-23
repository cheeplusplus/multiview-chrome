const agent = require("superagent");


const PICARTO_FOLLOW_URL = "https://picarto.tv/process/explore";


exports.get_follows = (session_cookie) => {
    const headers = {};

    if (session_cookie) {
        headers["Cookie"] = `PHPSESSID=${session_cookie}; complianceCookie=accepted; nsfw_confirmed=true`;
    }

    return agent.post(PICARTO_FOLLOW_URL).set(headers).accept("application/json, text/javascript, */*; q=0.01")
        .send("follows=true").then((res) => {
            // Picarto is dumb
            const body = JSON.parse(res.text);

            if (!body || body.length < 1) {
                return [];
            }

            return _.chain(body).map((stream) => {
                return {
                    "id": `pic_${stream.id}`,
                    "service": "Picarto",
                    "name": stream.channel_name
                };
            }).filter("name").value();
    });
};
