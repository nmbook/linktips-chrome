(function () {
    var currTip = null;
    var style = '';
    $(document).ready(function () {
        loadSettings(handleTips);
    });
    
    function makeLinkTitle(url, oldTitle, withHTML) {
        var isTitle = oldTitle && oldTitle.length > 0;
        // if "use current scheme", then prepend current scheme
        if (url.substr(0, 2) === '//') {
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
        var selector;
        var styled = {};

        // use default values if the user never set any settings
        if (!settings.saved) {
            settings.showURL = true;
            settings.useCustom = false;
            settings.allTips = false;
            settings.moveWithMouse = false;
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
            settings.styleLink = 'color: #888;\
text-indent: -1em;\
margin-left: 1em;';
            settings.styleLinkDomain = 'color: #000;';
            settings.styleLinkSchemeSecure = 'color: #080;';
        }
        if (settings.useCustom && settings.allTips) {
            // select all external links and elements with titles
            // to apply custom styles to
            selector = 'a:not([href^="#"]), [title]';
        } else if (!settings.showURL) {
            // select all external links with titles
            selector = 'a:not([href^="#"])[title]';
        } else {
            // select all external links
            selector = 'a:not([href^="#"])';
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
            if (!('id' in link)) {
                $(link).attr('id', 'lt__genid__' + (nid++));
            }
            var id = link.id;
            // value of title attribute, currently
            var title = $(link).attr('title');
            // check: if not known (we did not makeLink() it)
            // check: if title is not empty and not what's stored, then the website changed it, redo it
            if (!(id in styled) || (title !== '' && title !== styled[id])) {
                var href = $(link).attr('href');
                if (settings.showURL && href !== null) {
                    title = makeLinkTitle(href, title, settings.useCustom);
                }
                if (settings.useCustom) {
                    $(link).removeAttr('title');
                } else {
                    $(link).attr('title', title);
                }
                styled[id] = title;
            }
            if (settings.useCustom) {
                if (title.length) {
                    if (currTip !== null) {
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
            if (settings.useCustom && currTip !== null) {
                if (settings.moveWithMouse) {
                    currTip.show().offset({ top: e.pageY + 12, left: e.pageX + 12 });
                } else if (!moved) {
                    currTip.show().offset({ top: e.pageY + 12, left: e.pageX + 12 });
                    moved = true;
                }
            }
        }).on('mouseout', selector, function (e) {
            if (settings.useCustom && currTip !== null) {
                currTipTimeout = setTimeout(function () {
                    currTip.remove();
                    currTip = null;
                }, 300);
            }
        }).on('mouseover', '__lt__', function () {
            clearTimeout(currTipTimeout);
        }).on('mouseout', '__lt__', function () {
            if (settings.useCustom && currTip !== null) {
                currTipTimeout = setTimeout(function () {
                    currTip.remove();
                    currTip = null;
                }, 300);
            }
        });
    }
})();
