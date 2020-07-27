import $ from "jquery";
import _ from "lodash";
import type { SettingsKeys, SiteItem } from "./options";
import * as sites from "./site_helper";

// Chat!

function toggle_chat(id: string) {
    const mainWindow = flex_pen[id];
    const chatZone = $(".chat", mainWindow);
    const chatId = `chat_${id}`;

    if (chat_pen[chatId]) {
        // Exists, remove
        chatZone.empty();
        chatZone.addClass("invisible");
        delete chat_pen[chatId];
        return;
    }

    const mainItem = _.find(current_streams, { "id": id });
    if (mainItem) {
        const chatDiv = create_div({
            "id": chatId,
            "service": `${mainItem.service} Chat`,
            "name": mainItem.name,
        }, true);

        if (chatDiv) {
            chat_pen[chatId] = chatDiv;
            chatZone.replaceWith(chatDiv);
        }
    }
}


// Content

type StreamItem = SiteItem & { id: string; isManual?: boolean; };

let all_streams: StreamItem[] = [];
const all_streams_by_provider: { [name: string]: StreamItem[] } = {};
let strip_stream_list: SiteItem[] = [];
const strip_stream_list_local: StreamItem[] = [];
let current_streams: StreamItem[] = [];
const manual_streams: StreamItem[] = [];


function format_streams(provider: string, results: StreamItem[]) {
    // Update the provider
    all_streams_by_provider[provider] = results;

    // Pass all values into formatter
    const all_results = _.chain(all_streams_by_provider).values().flatten().value();
    return format_streams_all(all_results);
}

function format_streams_all(results: StreamItem[]) {
    all_streams = results;

    // TODO: Add reordering based on a priority
    const stripList = _.union(strip_stream_list, strip_stream_list_local);
    console.log("Blocking streams", stripList);

    for (const strip of stripList) {
        _.pull(results, _.find(results, strip));
    }

    if (manual_streams.length > 0) {
        results = _.concat(results, manual_streams);
    }

    current_streams = results;
    return results;
}


let twitch_enabled: boolean;
let picarto_enabled: boolean;


async function update_monitor() {
    if (twitch_enabled) {
        try {
            const twitchStreams = await sites.Twitch.GetFollows();
            update_display(format_streams("twitch", twitchStreams));
        } catch (e) {
            console.error("Twitch update failed", e);
        };
    }

    if (picarto_enabled) {
        try {
            const picartoStreams = await sites.Picarto.GetFollows();
            update_display(format_streams("picarto", picartoStreams));
        } catch (e) {
            console.error("Picarto update failed", e);
        };
    }
}


function manual_add(service: string, value: string) {
    const model = _.find(sites.models, { "name": service });
    if (!model) return;

    const stream = {
        "id": `manual_${service}_${value}`,
        "service": service,
        "name": value,
        "isManual": true,
    };

    manual_streams.push(stream);
    update_display(format_streams("manual", all_streams));
}


// Layout

type PenItem = { [name: string]: JQuery<HTMLElement> };

const FLEX_MAX = 9; // max number of items to show at once
const flex_pen: PenItem = {};
const chat_pen: PenItem = {};


function update_layout() {
    const is_horiz = window.innerWidth >= window.innerHeight;
    const count = _.size(flex_pen);
    let rows: number;
    let cols: number;

    const empty = $("#empty");
    if (count < 1) {
        empty.show();
    } else {
        empty.hide();
    }

    if (count === 1) {
        [rows, cols] = [1, 1];
    } else if (count === 2) {
        [rows, cols] = [1, 2];
    } else if (count <= 4) {
        [rows, cols] = [2, 2];
    } else if (count <= 6) {
        [rows, cols] = [2, 3];
    } else if (count <= 8) {
        [rows, cols] = [2, 4];
    } else {
        [rows, cols] = [3, 3];
    }

    // Flip
    if (!is_horiz) [rows, cols] = [cols, rows];

    const items = _.keys(flex_pen);

    const width = window.innerWidth / cols;
    const height = window.innerHeight / rows;

    // Do layout
    for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
            const i = (y * cols) + x;
            const item_id = items[i];
            const item = flex_pen[item_id];
            if (!item) continue;

            item.css("position", "absolute");

            if (item.data("isExpanded")) {
                item.css("top", 0).css("left", 0).css("width", window.innerWidth).css("height", window.innerHeight).addClass("ontop");
                continue;
            }

            const top = height * y;
            const left = width * x;

            item.css("top", top).css("left", left).css("width", width).css("height", height).removeClass("ontop");
        }
    }
}


function create_div(result: StreamItem, is_chat = false) {
    const model = _.find(sites.models, { "name": result.service });
    if (!model) return;

    const div = $("<div>").attr("id", result.id);

    if (is_chat) {
        div.addClass("chat");
    } else {
        div.addClass("stream");
    }

    const embed = model.embed.replace("%s", result.name);
    const embedElem = $(embed) as JQuery<HTMLIFrameElement>;
    embedElem.appendTo(div);

    if (!is_chat) {
        if (model.hasChat) {
            $("<div>").addClass("chat").addClass("invisible").appendTo(div);
        }

        create_control(result, model.hasChat, div).appendTo(div);
    }

    return div;
}


function create_control(item: StreamItem, hasChat: boolean = false, parent: JQuery<HTMLElement>) {
    const div = $("<div>").addClass("control");
    $("<div>").addClass("title").text(item.name).appendTo(div);

    if (hasChat) {
        $("<input>").appendTo(div).attr("type", "button").val("Toggle chat").click(() => {
            toggle_chat(item.id);
        });
    }

    $("<input>").appendTo(div).attr("type", "button").val("Hide").click(() => {
        if (item.isManual) {
            const str = _.find(manual_streams, { "id": item.id });
            _.pull(manual_streams, str);
        } else {
            strip_stream_list_local.push(item);
        }

        update_display(format_streams_all(all_streams));
    });

    $("<input>").appendTo(div).attr("type", "button").val("Expand").click(() => {
        const isExpanded = parent.data("isExpanded");
        parent.data("isExpanded", !isExpanded);
        update_layout();
    });

    /*$("<input>").appendTo(div).attr("type", "button").val("Block").click(() => {
        // TODO: Block
    });*/

    return div;
}


function update_display(results: StreamItem[]) {
    console.log("Got streams", results);

    // Add new streams
    for (const result of results) {
        if (!flex_pen[result.id] && _.size(flex_pen) < FLEX_MAX) {
            console.log("Adding streamer " + result.id);

            const pen = create_div(result);
            if (pen) {
                flex_pen[result.id] = pen;
                $("#container").append(pen);
            }
        }
    }

    // Prune removed streams
    for (const id in flex_pen) {
        if (!_.some(results, { id })) {
            console.log("Removing streamer " + id);

            flex_pen[id].remove();
            delete flex_pen[id];

            // Remove chat
            const chatId = `chat_${id}`;
            if (chat_pen[chatId]) {
                delete chat_pen[chatId];
            }
        }
    }

    update_layout();
}


// Alarm handlers

function alarm_callback(alarm: chrome.alarms.Alarm) {
    if (alarm.name === "mv-monitor") {
        update_monitor().catch((err) => {
            console.error("Failed to update_monitor", err);
        });
    }
}


chrome.alarms.create("mv-monitor", {
    "delayInMinutes": 1,
    "periodInMinutes": 1
});


// Storage handler

function update_vars(keys: SettingsKeys) {
    Object.keys(keys).forEach((key) => {
        if (key === "sitelist") {
            const value = keys[key];
            twitch_enabled = _.includes(value, "Twitch");
            picarto_enabled = _.includes(value, "Picarto");
        } else if (key === "user.blacklist") {
            const value = keys[key];
            strip_stream_list = value || [];
        }
    });

    update_monitor().catch((err) => {
        console.error("Failed to update_monitor", err);
    });
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
        const vals = _.mapValues(changes, (val) => {
            return val.newValue;
        }) as SettingsKeys;

        update_vars(vals);
    }
});


// Page handlers

$(document).ready(() => {
    chrome.alarms.onAlarm.addListener(alarm_callback);
    chrome.storage.sync.get(["sitelist", "user.blacklist", "oauth.twitch", "oauth.picarto"], (k) => update_vars(k as SettingsKeys));

    $("#settings_widget").click(() => $("#settings_container").toggle());
    $("#settings_reload").click(
        () => update_monitor().catch((err) => {
            console.error("Failed to update_monitor", err);
        })
    );

    for (const model of sites.models) {
        $("<option>").text(model.name).appendTo("#settings_add_type");
    }

    $("#settings_add").click(() => {
        manual_add($("#settings_add_type option:selected").text(), $("#settings_add_value").val() as string);
    });
});


$(window).resize(() => {
    update_layout();
});
