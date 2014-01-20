chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.method == "getTooltipSettings") {
        var settings = {};
        ['saved', 'showURL', 'useCustom', 'allTips', 'moveWithMouse',
         'styleContainer', 'styleLink', 'styleLinkDomain', 'styleLinkSchemeSecure'].map(function (key) {
            if (localStorage[key] == null) {
                settings[key] = null;
            } else if (localStorage[key] == 'true') {
                settings[key] = true;
            } else if (localStorage[key] == 'false') {
                settings[key] = false;
            } else {
                settings[key] = localStorage[key];
            }
        });
        sendResponse(settings);
    } else {
        sendResponse({});
    }
});
