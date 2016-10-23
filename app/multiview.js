const _ = require("lodash");
const sites = require("./sites");


// Stuff

let all_streams = [];
let strip_stream_list = [];
let strip_stream_list_local = [];
let current_streams = [];


function format_streams(results) {
    all_streams = results;

    // TODO: Add reordering based on a priority
    const stripList = _.union(strip_stream_list, strip_stream_list_local);
    console.log("Blocking streams", stripList);

    for (strip of stripList) {
        _.pull(results, _.find(results, strip));
    }
    current_streams = results;
    return results;
}


let twitch_enabled, twitch_api_key;
let picarto_enabled;


function update_monitor() {
    let check_list = [];
    if (twitch_enabled) check_list.push(sites.check_twitch(twitch_api_key));
    if (picarto_enabled) check_list.push(sites.check_picarto());

    Promise.all(check_list).then(_.flatten)
        .then(format_streams).then(update_display)
        .catch(e => console.error("update failed", e));
}


const FLEX_MAX = 9; // max number of items to show at once
let flex_pen = {};


function update_layout() {
    const is_horiz = window.innerWidth >= window.innerHeight;
    const count = _.size(flex_pen);
    let rows, cols;

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
    } else if (count >= 9) {
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
            const item = flex_pen[items[i]];
            if (!item) continue;

            const top = height * y;
            const left = width * x;

            item.css("position", "absolute").css("top", top).css("left", left).css("width", width).css("height", height);
        }
    }
}


function create_div(result) {
    const model = _.find(sites.models, {"name": result.service});
    if (!model) return;

    let div = $("<div>").attr("id", result.id).addClass("stream");

    let embed = model.embed.replace("%s", result.name);

    if (model.isHLS) {
        const video = $("<video>").prop("controls", true).prop("muted", true).css("width", "100%").css("height", "100%").appendTo(div);
        const vtag = video[0];

        const hls = new Hls();
        hls.loadSource(embed);
        hls.attachMedia(vtag);
        hls.on(Hls.Events.MANIFEST_PARSED, () => vtag.play());

        // TODO: attempt restarting if stopped, possibly only when update_layout is called
    } else {
        $(embed).appendTo(div);
    }

    create_control(result).appendTo(div);

    return div;
}


function create_control(item) {
    let div = $("<div>").addClass("control");
    $("<div>").addClass("title").text(item.name).appendTo(div);
    $("<input>").appendTo(div).attr("type", "button").val("Hide").click(() => {
        strip_stream_list_local.push(item);
        update_monitor(); // TODO: Cache the current results so we don't have to hard refresh to make this work
    });
    /*$("<input>").appendTo(div).attr("type", "button").val("Block").click(() => {
        // TODO: Block
    });*/
    return div;
}


function update_display(results) {
    console.log("Got streams", results);

    // Add new streams
    for (let result of results) {
        if (!flex_pen[result.id] && _.size(flex_pen) < FLEX_MAX) {
            console.log("Adding streamer " + result.id);

            let pen = create_div(result);
            flex_pen[result.id] = pen;
            $("#container").append(pen);
        }
    }

    // Prune removed streams
    for (let id in flex_pen) {
        if (!_.some(results, {id})) {
            console.log("Removing streamer " + id);

            flex_pen[id].remove();
            delete flex_pen[id];
        }
    }

    update_layout();
}


// Alarm handlers

function alarm_callback(alarm) {
    if (alarm.name == "mv-monitor") {
        update_monitor();
    }
}


chrome.alarms.create("mv-monitor", {
    "delayInMinutes": 1,
    "periodInMinutes": 1
});


// Storage handler

function update_vars(keys) {
    for (let key in keys) {
        const value = keys[key];

        if (key === "oauth.twitch") {
            if (value) {
                twitch_api_key = value;
            } else {
                twitch_api_key = null;
                twitch_enabled = false;
            }
        } else if (key === "sitelist") {
            twitch_enabled = _.includes(value, "Twitch");
            picarto_enabled = _.includes(value, "Picarto");
        } else if (key === "user.blacklist") {
            strip_stream_list = value || [];
        }
    }

    update_monitor();
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
        const vals = _.mapValues(changes, (val) => {
            return val.newValue;
        });

        update_vars(vals);
    }
});


// Page handlers

$(document).ready(() => {
    chrome.alarms.onAlarm.addListener(alarm_callback);
    chrome.storage.sync.get(["sitelist", "user.blacklist", "oauth.twitch"], update_vars);

    $("#settings_widget").click(() => $("#settings_container").toggle());
    $("#settings_reload").click(() => update_monitor());
});


$(window).resize(() => {
    update_layout();
});
