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
        console.log('set ' + key + ' = ' + localStorage[key].split('\n')[0]);
        updateUseCustom();
    });
    $('textarea').on('keyup', function () {
        var key = $(this).attr('id');
        if (localStorage[key] != $(this).val()) {
            $(this).change();
        }
    });
    $(document).ready(function() {
        // checkboxes
        ['showURL', 'useCustom', 'allTips', 'moveWithMouse'].map(function (el) {
            if (localStorage[el]) {
                if (localStorage[el] == 'true') {
                    $('#' + el).attr('checked', 'true');
                } else {
                    $('#' + el).removeAttr('checked');
                }
            }
        });
        // text fields
        ['styleContainer', 'styleLink', 'styleLinkDomain', 'styleLinkSchemeSecure'].map(function (el) {
            if (localStorage[el]) {
                $('#' + el).val(localStorage[el]);
            }
        });
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
