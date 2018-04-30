/**
 * Created by user on 26/09/16.
 */

function turnOnDesks(cId, tpId, tpName) {

    ul = $('#td_' + cId + ' #desk_menu');

    $.each($(ul).children('li'), function (index, value) {
        if( $('a', value).attr('data-value') > 0 ) {

            if(tpId == '3') {
                if ($('a', value).attr('data-binary') == '1' && $('a', value).attr('data-forex') == '1') {
                    $(value).removeClass('disabled');
                } else {
                    $(value).addClass('disabled');
                }
            } else {
                if ($('a', value).attr('data-' + tpName) == '1') {
                    $(value).removeClass('disabled');
                } else {
                    $(value).addClass('disabled');
                }
            }
        }
    });

}

function enableSaveKey(cId) {
    tpId = $('input[name="trading_platform_' + cId + '"]:checked').val();

    deskId = $('#save_' + cId).attr('value-desk');
    deskOn = $('#td_' + cId + ' #desk_menu a[data-value=' + deskId + ']').parents('li').attr('class');

    if( $('input[name="trading_platform_' + cId + '"]:checked').val() && tpId && (deskOn === '' || deskOn == undefined)) {
        $('#save_' + cId).attr( 'disabled', false );
    } else {
        $('#save_' + cId).attr( 'disabled', true );
    }
}

function deskListToDefault(cId) {
    // back to defaults
    $('#save_' + cId).attr('value-desk', '');
    $('#btn_' + cId).text('Assign to');
}

function assignDesk(cId, dId) {
    tpId = $('input[name="trading_platform_' + cId + '"]:checked').val();
    countries = $('#countries_' + cId).val();

    if(countries == null)
        countries = 0;

    apiRequest('assignCampaignDesk', 'cid=' + cId + '&did=' + dId + '&tpid=' + tpId + '&countries=' + countries, '#campaignTBL', function (data) {
        $("#tr_" + cId + " td[name=date_assign]").html(data.date_assign);
        $('#save_' + cId).attr( 'disabled', true );

        if(dId === '0') {
            countriesToDefault(cId);
            $('input[name="trading_platform_' + cId + '"]').attr('checked', false);
            deskListToDefault(cId);
            $('#save_' + cId).attr( 'disabled', true );
        }

    });
}

$('#desk_menu a').on('click', function() {

    if( $(this).parent('li').attr('class') == 'disabled' ) {
        return false;
    }

    parent = $(this).parents('.button-group-set');
    desk_id = $(this).attr('data-value');
    desk_name = $(this).text();
    campaign_id = parent.attr('id').replace('td_', '');
    $('#btn_' + campaign_id).text( desk_name );
    $('#save_' + campaign_id).attr( 'value-desk', desk_id );
    enableSaveKey(campaign_id);
});

$('a[id^="save_"]').on('click', function () {
    assignDesk($(this).attr('value-campaign'), $(this).attr('value-desk'))
});

$('td[name="trading_platform"] input:radio').on('change', function () {
    cId = $(this).attr('name').replace('trading_platform_', '');
    turnOnDesks( cId, $(this).val(), $(this).attr('data-tpname') );
    countriesToDefault(cId);
    getCountry( cId, $(this).attr('data-tpname') );
    deskListToDefault(cId);
    enableSaveKey(cId);
});

$("select[name^='countries_']").on('change', function () {
    cId = $(this).attr('id').replace('countries_', '');
    if( $('input[name="trading_platform_' + cId + '"]:checked') ) {
        $('#save_' + cId).attr( 'disabled', false );
    }
});

$(document).ready(function() {

    $("select[id='campaign']").select2({
        placeholder: "Select Campaigns and hit \"Run\"",
        allowClear: true,
        width: "100%"
    });

    if( assignedPlatforms.length > 0 ) {
        $.each(assignedPlatforms, function (index, value) {
            turnOnDesks(value.cId, value.tpId, value.tpName);
            getCountry(value.cId, value.tpName);
        });
    }

    $("select[name^='countries_']").select2({
        placeholder: "Select Countries or leave blank for all",
        allowClear: true,
        width: "100%"
    });

    $('[data-toggle="popover"]').popover();

    $('.change_min_deposit').on('click', function () {
        cId = $(this).attr('data-id');
        minDeposit = $(this).attr('data-min-deposit');
        minDeposit = (minDeposit == undefined || minDeposit == '') ? 0 : minDeposit;

        var form_data = '<form class="form-horizontal" id="editMinAmount">' +
            '<div class="form-group">' +
            '<label class="col-md-4 control-label" for="min_deposit" style="font-size:16px">Amount</label> ' +
            '<div class="col-md-6">' +
            '<input class="form-control" required  placeholder="Insert Integer Amount" id="min_deposit" name="min_deposit" value="' + minDeposit + '" min="1" maxlength="5" required />' +
            '<input type="hidden" name="campaign_id" value="' + cId + '"/>' +
            '</div></div>' +
            '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-6 col-sm-6 col-xs-6">' +                   
            '<span id="min_deposit_error" style="color:red;"></span>'+
            '</div>'+
            '</form>';

        bootbox.dialog({
            title: "Change Minimum Deposit Amount",
            message: form_data,
            buttons: {
                success: {
                    label: "OK",
                    className: "btn-success",
                    callback: function () {
                        var id_json = $('#editMinAmount').serialize();

                        newMin = $('#min_deposit').val();

                        if( newMin.match(/^(\d){1,}$/) == null ) {
                            $('#min_deposit_error').text('Insert Integer Amount');
                    	    $('#min_deposit').addClass('red-border');
                            return false;
                        }

                        apiRequest('changeMinDepositByCampaign', id_json, '#min_deposit_' + cId, function (data) {
                            if (data.success === true) {
                                $('#min_deposit_' + cId).text( newMin );
                                $('.change_min_deposit[data-id="' + cId + '"]').attr('data-min-deposit', newMin);
                                $('.drop_min_deposit[data-id="' + cId + '"]').attr('disabled', false);
                            }
                        });
                    }
                },
                danger: {
                    label: "Cancel",
                    className: "btn-danger",
                    callback: function () {

                    }
                }
            }

        });

        return false;
    });

    $('.drop_min_deposit').on('click', function () {
        cId = $(this).attr('data-id');

        var data = '<form class="form-horizontal" id="dropMinAmount">' +
            '<div class="form-group" style="margin: auto 2em">' +
            '<h4>You are about to delete Minimum Deposit Amount.</h4> ' +
            '<h4>Value will be set to predefined default</h4>' +
            '<div class="col-md-6">' +
            '<input type="hidden" name="campaign_id" value="' + cId + '"/>' +
            '</div></div>' +
            '</form>';

        bootbox.dialog({
            title: "Drop Minimum Amount",
            message: data,
            buttons: {
                success: {
                    label: "OK",
                    className: "btn-success",
                    callback: function () {
                        var id_json = $('#dropMinAmount').serialize();

                        apiRequest('dropMinDepositByCampaign', id_json, '#min_deposit_' + cId, function (data) {
                            if (data.success === true) {
                                $('#min_deposit_' + cId).text( '---' );
                                $('.change_min_deposit[data-id="' + cId + '"]').attr('data-min-deposit', '');
                                $('.drop_min_deposit[data-id="' + cId + '"]').attr('disabled', true);
                            }
                        });
                    }
                },
                danger: {
                    label: "Cancel",
                    className: "btn-danger",
                    callback: function () {

                    }
                }
            }

        });
        
        $('#min_deposit').off('keyup paste change').on('keyup paste change',function(e){
        	$(this).removeClass('red-border');
        	$('#min_deposit_error').html('');    
        });

        return false;
    });

});

function countriesToDefault(cId) {
    $('#countries_' + cId).empty();
    $('#countries_' + cId).select2().val(null).trigger("change");
}

function getCountry(cId, tpName) {

    countriesToDefault(cId);

    if(tpName == 'both') {
        appendList = countries_list[0]['binary'].concat(countries_list[0]['forex']);
    } else {
        appendList = countries_list[0][tpName];
    }

    $.each(appendList, function() {
        $('#countries_' + cId).append($('<option>', { value : this.id , text : this.platform + ' - ' + this.name}));
    });
    $.each(assignedCountries, function (index, value) {
        if(value.cId == cId) {
            $('#countries_' + cId).select2('val', value.countries.split(","));
        }
    });

}