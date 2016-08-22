var models = [
    {"name": "YouTube", "embed": "<iframe width=\"100%\" height=\"100%\" src=\"http://www.youtube.com/embed/%s\" frameborder=\"0\" allowfullscreen></iframe>"},
    {"name": "Twitch", "embed": "<iframe src=\"http://www.twitch.tv/%s/embed\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Twitch Chat", "embed": "<iframe src=\"http://www.twitch.tv/%s/chat?popout=\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Picarto", "embed": "<iframe src=\"https://picarto.tv/streampopout/%s/public\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Picarto Chat", "embed": "<iframe src=\"https://picarto.tv/chatpopout/%s/public\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Join.me", "embed": "<iframe src=\"https://join.me/%s\" frameborder=\"0\" scrolling=\"no\" height=\"100%\" width=\"100%\"></iframe>"},
    {"name": "Custom", "embed": "%s"},
];

$(document).ready(function() {
    var zones = ["zone1", "zone2", "zone3", "zone4"];

    for (var i = zones.length - 1; i >= 0; i--) {
        zonename = zones[i];

        var zoneop = $("#" + zonename + "_op");
        $.each(models, function(n, m) {
            $("<option>").text(m.name).val(m.embed).appendTo(zoneop);
        });

        var zonebtn = $("#" + zonename + "_btn");
        zonebtn.data("zonename", zonename);
        zonebtn.click(handleZoneClick);
    }

    $("#control_save").click(function() {
        $("#table_control").hide();
        $("#control_save").hide();
        $("#control_edit").show();
    });
    $("#control_edit").click(function() {
        $("#table_control").show();
        $("#control_save").show();
        $("#control_edit").hide();
    });
});

function handleZoneClick(e) {
    var zonebtn = $(e.target);
    var zonename = zonebtn.data("zonename");
    var zonetd = $("#" + zonename);
    var zoneop = $("#" + zonename + "_op");
    var zoneti = $("#" + zonename + "_in");

    var dest = zoneop.val().replace("%s", zoneti.val());

    console.log("Setting " + zonename + " to " + dest);
    zonetd.html(dest);
}
