(function () {
    var currTip = null;
    var style = '';
    $(document).ready(function () {
        loadSettings(handleTips);
    });
    
    function makeLinkTitle(url, oldTitle, withHTML) {
        var isTitle = oldTitle && oldTitle.length > 0;
        // if "use current scheme", then prepend current scheme
        if (url.substr(2) == '//') {
            url = window.location.protocol + url;
        }
        // if no scheme+authority, then prepend current values
        if (!/^[a-zA-Z]+:/.test(url)) {
            url =
                window.location.protocol + '//' +
                window.location.host +
                (window.location.port.length ? ':' + window.location.port : '') +
                (/^\//.test(url) ? '' : '/') +
                url;
        }
        // if scheme://domain with no ending / for empty path, append one
        if (/^[a-zA-Z]+:\/\/[^\/]+$/.test(url)) {
            url += '/';
        }
        
        url = $('<div/>').text(encodeURI(url)).html();
        
        // now match parts if withHTML set
        if (withHTML) {
            url = url.replace(/^([a-zA-Z]+:\/\/)([^/]*)(\/.*)/, '$1<span class="__lt__ __lt__domain">$2</span>$3');
            url = url.replace(/^(https)/, '<span class="__lt__ __lt__scheme_sec">$1</span>');
            url = '<span class="__lt__ __lt__link">' + url + '</span>';
            return url + (isTitle ? '<br/><br/>' + $('<div/>').text(oldTitle).html() : '');
        } else {
            return url + (isTitle ? '\r\n\r\n' + oldTitle : '');
        }
    }
    
    function loadSettings(cb) {
        chrome.runtime.sendMessage({method: "getTooltipSettings"},
        function (settings) {
            cb(settings);
        });
    }
    
    function handleTips(settings) {
        //console.log(settings);
        var currTipTimeout = null;
        var moved = false;
        var selector = 'a';
        if (settings.useCustom && settings.allTips) {
            selector = 'a, [title]';
        } else if (!settings.showURL) {
            selector = 'a[title]';
        }
        if (!settings.styleContainer) {
            settings.styleContainer = 'display: block;\
padding: 1em 1em 1em 1em;\
color: #000;\
background: #ffc;\
border: 1px solid #ffc;\
border-radius: 3px;\
max-width: 600px;\
word-wrap: break-word;\
box-shadow: 3px 3px 15px #888;\
-webkit-touch-callout: none;\
-webkit-user-select: none;\
user-select: none;\
cursor: default;';
        }
        if (!settings.styleLink) {
            settings.styleLink = 'color: #888;\
text-indent: -1em;\
margin-left: 1em;';
        }
        if (!settings.styleLinkDomain) {
            settings.styleLinkDomain = 'color: #000;';
        }
        if (!settings.styleLinkSchemeSecure) {
            settings.styleLinkSchemeSecure = 'color: #080;';
        }
        style = '<style>'+
        '.__lt__container {'+settings.styleContainer.replace(/;/g, ' !important;')+'}'+
        '.__lt__link {'+settings.styleLink.replace(/;/g, ' !important;')+'}'+
        '.__lt__domain {'+settings.styleLinkDomain.replace(/;/g, ' !important;')+'}'+
        '.__lt__scheme_sec {'+settings.styleLinkSchemeSecure.replace(';', ' !important;')+'}'+
        '</style>';
        $(document).on('mouseover', selector, function () {
            clearTimeout(currTipTimeout);
            var link = this;
            var isLT = $(link).attr('__lt__is_handled');
            if (isLT != 'true') {
                $(link).attr('__lt__is_handled', 'true');
                var title = $(link).attr('title');
                var href = $(link).attr('href');
                if (settings.showURL && href != null) {
                    title = makeLinkTitle(href, title, settings.useCustom);
                }
                if (settings.useCustom) {
                    $(link).removeAttr('title');
                    $(link).attr('__lt__title', title);
                } else {
                    $(link).attr('title', title);
                }
            }
            if (settings.useCustom) {
                var title = $(this).attr('__lt__title');
                if (title) {
                    if (currTip != null) {
                        currTip.html(style+title);
                        //currTip.show();
                    } else {
                        currTip = $(style+'<div class="__lt__container">'+title+'</div>');
                        $(document.body).append(currTip);
                        //currTip.show();
                    }
                }
                moved = false;
                //currTip.offset({ top: e.pageY + 5, left: e.pageX + 5 });
            }
        }).on('mousemove', selector, function (e) {
            clearTimeout(currTipTimeout);
            if (settings.useCustom && currTip != null) {
                if (settings.moveWithMouse) {
                    currTip.show().offset({ top: e.pageY + 12, left: e.pageX + 12 });
                } else if (!moved) {
                    currTip.show().offset({ top: e.pageY + 12, left: e.pageX + 12 });
                    moved = true;
                }
            }
        }).on('mouseout', selector, function (e) {
            if (settings.useCustom && currTip != null) {
                currTipTimeout = setTimeout(function () {
                    currTip.remove();
                    currTip = null;
                }, 300);
            }
        }).on('mouseover', '__lt__', function () {
            clearTimeout(currTipTimeout);
        }).on('mouseout', '__lt__', function () {
            if (settings.useCustom && currTip != null) {
                currTipTimeout = setTimeout(function () {
                    currTip.remove();
                    currTip = null;
                }, 300);
            }
        });
    }
})();
