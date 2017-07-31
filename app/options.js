const _ = require("lodash");
const sites = require("./sites");


let loaded = false;
let sitelist = [];
let blocklist = [];


$(document).ready(() => {
    $("#connect_twitch").attr("href", sites.get_twitch_oauth_url());
    $("#enable_twitch").change((e) => {
        update_sitelist("Twitch", $(e.target).prop("checked"));
    });
    $("#connect_picarto").attr("href", sites.get_picarto_oauth_url());
    $("#enable_picarto").change((e) => {
        update_sitelist("Picarto", $(e.target).prop("checked"));
    });
    $("#filter_add").click(() => {
        const service = $("#filter_add_service").val();
        const name_field = $("#filter_add_name");
        const name = name_field.val().toLowerCase();
        add_blocklist(service, name);
        name_field.val("");
    });
});


function add_blocklist(service, name) {
    if (!loaded) return;

    const item = {service, name};

    if (_.find(blocklist, item)) {
        return;
    }

    blocklist.push(item);

    console.log("Setting blocklist to", blocklist);
    chrome.storage.sync.set({"user.blacklist": blocklist});
}


function remove_blocklist(service, name) {
    const item = {service, name};

    _.pull(blocklist, _.find(blocklist, item));

    console.log("Setting blocklist to", blocklist);
    chrome.storage.sync.set({"user.blacklist": blocklist});
}


function update_blocklist(list) {
    blocklist = list || [];

    const tbody = $("table#filter_table tbody#filter_body");
    tbody.empty();

    for (let item of list) {
        const row = $("<tr>");
        
        $("<td>").text(item.service).appendTo(row);
        $("<td>").text(item.name).appendTo(row);
        const removeButton = $("<input>").attr("type", "button").val("-").data("item", item).click((e) => {
            const target = $(e.target);
            const i = target.data("item");
            remove_blocklist(i.service, i.name);
        });
        $("<td>").append(removeButton).appendTo(row);

        tbody.append(row);
    }
}


function update_sitelist(name, state) {
    if (!loaded) return;

    if (!state) {
        _.pull(sitelist, name);
    } else {
        sitelist.push(name);
    }

    console.log("Setting sitelist to", sitelist);
    chrome.storage.sync.set({sitelist});
}


function update_vars(keys) {
    for (let key in keys) {
        const value = keys[key];

        if (key === "oauth.twitch") {
            if (value) {
                $("#twitch_status").text("Connected to Twitch.\n" + value);
            } else {
                $("#twitch_status").text("Not connected to Twitch.");
            }
        } else if (key === "oauth.picarto") {
            if (value) {
                $("#picarto_status").text("Connected to Picarto.\n" + value);
            } else {
                $("#picarto_status").text("Not connected to Picarto.");
            }
        } else if (key === "sitelist") {
            sitelist = value || [];
            $("#enable_twitch").prop("checked", _.includes(value, "Twitch"));
            $("#enable_picarto").prop("checked", _.includes(value, "Picarto"));
        } else if (key === "user.blacklist") {
            update_blocklist(value);
        }
    }

    loaded = true;
}


chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === "sync") {
        const vals = _.mapValues(changes, (val) => {
            return val.newValue;
        });

        update_vars(vals);
    }
});


chrome.storage.sync.get(["sitelist", "user.blacklist", "oauth.twitch", "oauth.picarto"], update_vars);
