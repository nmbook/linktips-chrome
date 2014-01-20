(function () {
    $('input, textarea').on('change', function () {
        var key = $(this).attr('id');
        switch ($(this).attr('type')) {
          case 'checkbox':
            localStorage[key] = $(this).is(':checked');
            break;
          default: // text, textarea
            if ($(this).val() == localStorage[key]) {
                return;
            }
            localStorage[key] = $(this).val();
            break;
        }
        //console.log('set ' + key + ' = ' + localStorage[key].split('\n')[0]);
        updateUseCustom();
    });
    $('textarea').on('keyup', function () {
        var key = $(this).attr('id');
        if (localStorage[key] != $(this).val()) {
            $(this).change();
        }
    });
    $(document).ready(function() {
        // fill fields with values from localStorage if localStorage has them
        //     if not, set localStorage to values currently on page (the default values)
        // then set localStorage[saved] so that settings (in linktips.js) knows to use localStorage values
        //     instead of overwriting settings with the default values
        // checkboxes
        $('a#test_link').click(function (e) {
            e.preventDefault();
        });
        ['showURL', 'useCustom', 'allTips', 'moveWithMouse'].map(function (el) {
            if (localStorage[el]) {
                if (localStorage[el] == 'true') {
                    $('#' + el).attr('checked', 'true');
                } else {
                    $('#' + el).removeAttr('checked');
                }
            } else {
                localStorage[el] = $('#' + el).is(':checked');
            }
        });
        // text fields
        ['styleContainer', 'styleLink', 'styleLinkDomain', 'styleLinkSchemeSecure'].map(function (el) {
            if (localStorage[el]) {
                $('#' + el).val(localStorage[el]);
            } else {
                localStorage[el] = $('#' + el).val();
            }
        });
        localStorage['saved'] = true;
        updateUseCustom();
    });
    function updateUseCustom() {
        var disabled = false;
        var css = {
            'color': disabled ? 'grey' : 'black'
        };
        if ($('#useCustom:checked').length == 0) {
            disabled = true;
        }
        $('#customFields h2').css(css);
        $('#customFields input').attr('disabled', disabled).css(css);
        $('#customFields textarea').attr('readonly', disabled).css(css);
        css.cursor = disabled ? 'default' : 'pointer';
        $('#customFields label').css(css);
    }
})();
