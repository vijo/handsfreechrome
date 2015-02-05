String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var commands = ["map",      //paints numbers next to anchor tags, images, forms, and buttons
                "guide",    //paints numbers next to spans and images
                "show",     //paints numbers next to anchor tags, forms, buttons, images, and spans, regardless of whether they're visible
                "home",     //navigates directly to your homepage
                "up",       //scrolls up 200 pixels
                "down",     //scrolls down 200 pixels
                "right",    //scrolls right 200 pixels
                "left",     //scrolls left 200 pixels
                "rise",     //page up
                "fall",     //page down
                "back",     //last page in history
                "forward",  //next page in history
                "top",      //scroll to top of page
                "bottom",   //scroll to bottom of page
                "reload",   //refresh page
                "refresh",  //refresh page
                "switch",   //changes to the next tab in the queue
                "exit",     //closes all Chrome windows
                "quit",     //closes all Chrome windows
                "done",     //close help, or turn off extension
                "faster",   //increases speed of continuous scrolling
                "slower",   //decreases speed of continuous scrolling
                "stop",     //stops continuous scrolling
                "help",     //brings up help page, or hides it
                "minimize", //minimize main chrome windows (should deactivate extension)
               ];

function save_options() {
    var commandAliases = {};

    commands.forEach(function(command) {
        var aliases = $("#"+command+"-aliases").val();
        aliases = aliases.split(",");
        aliases.forEach(function(alias) {
            alias = alias.replace(/(^\s*)|(\s*$)/g, '');
            commandAliases[alias] = command;
        });
    });

    var timeoutDuration = 60000*$('#timeout-duration').val();
    var openInTab = $('#open-in-tab').prop('checked');

    chrome.storage.sync.set({
        commandAliases: commandAliases,
        timeoutDuration: timeoutDuration,
        openInTab: openInTab
    }, function() {
        var status = $('#status');

        status.html('Options saved. If the input page is open, you must refresh it for new aliases to take effect.');
        setTimeout(function() {
            status.html('');
        }, 3500);
    });
}

function restore_options() {
    commands.forEach(function(command) {
        $("#aliases").append('<label>'+command.capitalize()+' Aliases: <textarea id="'+command+'-aliases"></textarea></label><br>');
    });

    chrome.storage.sync.get({
        commandAliases: {},
        timeoutDuration: 180000,
        openInTab: false
    }, function(items) {
        aliasLists = {}; // dictionary from command to list of aliases
        for (alias in items.commandAliases) {
            if (!Object.prototype.hasOwnProperty.call(items.commandAliases, alias)) continue;
            command = items.commandAliases[alias];
            if (aliasLists[command] == null) {
                aliasLists[command] = [alias];
            } else {
                aliasLists[command].push(alias);
            }
        }
        commands.forEach(function(command) {
            if(command in aliasLists) $('#'+command+'-aliases').val(aliasLists[command].join(', '));
        });
        $('#timeout-duration').val(items.timeoutDuration/60000);
        $('#open-in-tab').prop('checked', items.openInTab);
    });
}

$(function() {
    restore_options();
    $('#save').click(save_options);
});