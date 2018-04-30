window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.info('%cScript Error: See Browser Console for Detail','font-size:18px;color:darkred');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log("%c Error JS:" + message,"font-size:18px;color:pink");
    }

    return true;
};
var disable = false;

var isConversion;
var isVinci;
var isPlatformSwitch;
var deskId;
var isLeverate;
var isDepositChange;

$(document).ready(function () {
    $("#vinciLogo").css('display', 'none');
    $("div[name=customerBlockDepositVinci]").css('display', 'none');
    $("div[name=customerBlockAddCommunicationVinci]").css('display', 'none');
	$("#submitDeposit").prop('disabled', true);
	$("#submitCommunication").prop('disabled', true);
    
    getUserDataCustomerCard();

    var customerId = getUrlVars();
    var selfLocation, subselfLocation;
    if (customerId.id) {
        $('#customerId').val(customerId.id);
        $('#submit').attr('disabled', true);
        getCustomer(true);
    }

    $("#submit").click(function (e) {
        e.preventDefault();
        var re = new RegExp('^[0-9]+$');

        id = $('#customerId').val();
        email = $('#customerEmail').val();        
        if ((id != '' && email != '') || (id == '' && email == '')) {
            msgbox('<i class="icon-warning-sign"></i> Oops!', "please fill customer id or customer email", "Close");
            $(this).attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        }else if(email == '' && !re.test(id)){
        	msgbox('<i class="icon-warning-sign"></i> Oops!', "please fill customer id as integer", "Close");
        	$(this).attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        } else {
            $(this).attr("disabled", true);
            getCustomer(true);
        }
        
        
    });
	
	$("#communication").focusout(function(e){
		subject = $('#Subject').val();
        details = $('#Details').val();
        spotId = $('#spotIdComm').val();
        lavarateId = $('#lavarateIdComm').val();
        TPAccountId = $('#TPAccountIdComm').val();
        
        if(subject != '' && details != '' && spotId != '' && lavarateId != '' && TPAccountId != '')
        {
        	$("#submitCommunication").prop('disabled', false);
        }else{
        	$("#submitCommunication").prop('disabled', true);
        }
	});
	
	$('#deposit').focusout(function(e){
		firstName = $('#firstName').val();
        lastName = $('#lastName').val();
        country = $('#country').val();
        depositEmail = $('#depositEmail').val();
        postalCode = $('#postalCode').val();
        address = $('#address').val();
        phone = $('#phone').val();
        city = $('#city').val();
        currency = $('#currency').val();
        amount = $('#amount').val();
        spotId = $('#spotId').val();
        lavarateId = $('#lavarateId').val();
        TPAccountId = $('#TPAccountId').val();
        
		if (firstName != '' && lastName != '' && country != '' && depositEmail != '' && postalCode != '' && address != '' && phone != '' && city != '' && amount != '' && currency != '' && spotId != '' && lavarateId != '') {
			$("#submitDeposit").prop('disabled', false);
		}else{
			$("#submitDeposit").prop('disabled', true);
		}
	});
	
	$("#communication").on('click', '#cancelCommunication', function (e) {
    	e.preventDefault();
    	$("div[name=customerBlockAddCommunicationVinci]").css('display', 'none');
    });
    
    $("#communication").on('click', '#submitCommunication', function (e) {
    	//showLoad('#communication');
    	//$("#submitCommunication").attr('disabled', true);
    	e.preventDefault();
    	console.log('communication data', $("#communication").serialize());
    	
    	subject = $('#Subject').val();
        details = $('#Details').val();
        spotId = $('#spotIdComm').val();
        lavarateId = $('#lavarateIdComm').val();
        TPAccountId = $('#TPAccountIdComm').val();
        
        if(subject != '' && details != '' && spotId != '' && lavarateId != '' && TPAccountId != '')
        {
        	addCustomerVinciCommunication(spotId, lavarateId, TPAccountId, subject, details);
        }else{
        	msgbox('<i class="icon-warning-sign"></i> Oops!', "Missing arguments", "Close");
        }
    });
	
    $("#deposit").on('click', '#cancelDeposit', function (e) {
    	e.preventDefault();
    	$("div[name=customerBlockDepositVinci]").css('display', 'none');
    });
    
    $("#deposit").on('click', '#submitDeposit', function (e) {
        e.preventDefault();

        console.log('submit deposit');
        console.log('deposit data', $("#deposit").serialize());
		
        /*firstName = $('#firstName').val();
        lastName = $('#lastName').val();
        country = $('#country').val();
        address = $('#address').val();
        postalCode = $('#postalCode').val();
        city = $('#city').val();
        spotId = $('#spotId').val();
        lavarateId = $('#lavarateId').val();
       */

		depositEmail = $('#depositEmail').val();
		amount = $('#amount').val();
		phone = $('#phone').val();
        currency = $('#currency').val();
        TPAccountId = $('#TPAccountId').val();

		if (!validateEmail(depositEmail)){
			msgbox('<i class="icon-warning-sign"></i> Oops!', "Email not validate", "Close");
		} else if (!$.isNumeric(amount) || !$.isNumeric(phone)) {
            msgbox('<i class="icon-warning-sign"></i> Oops!', "Amount and phone must be numeric", "Close");
        } else if (amount >= 10001) {
        	msgbox('<i class="icon-warning-sign"></i> Oops!', "Deposit amount can be up to 10000. Please try again using a lower deposit amount", "Close");
        }else{
        	//console.log('all ok!');
            apiRequest('addDepositVinciLog', $('#deposit').serialize(), '', function (data) {
                if (data.success) {
                    var serialize_data = $("#deposit").serialize() + '&depositId=' + data.depositId;
                    SafechargeIframe(serialize_data, data.depositId, TPAccountId, amount, currency);

                }

            });
        }
    });
});

function validateEmail(sEmail) {
	var filter = /^[\w\-\.\+]+\@[a-zA-Z0-9\.\-]+\.[a-zA-z0-9]{2,4}$/;
	if (filter.test(sEmail)) {
		return true;
	}
	else {
		return false;
	}
}

function changeURL(id) {
    url = "?id=" + id;
    var obj = {Page: 'Id', Url: url};
    history.pushState(obj, obj.Page, obj.Url);
}
function getApproachs(default_id) {
    if (typeof default_id === 'undefined' || default_id === null) {
        default_id == 1;
    }

    $('#assignApproach').find('option').remove().end();

    apiRequest('getApproachs', '', '#assignApproach', function (data) {

        $.each(data, function (key) {
            $('#assignApproach').append($('<option>', {value: this.status_id, text: this.status_description}));
        });

        $('#assignApproach').select2('val',default_id);
    });
}

function getCustomer(refreshAllPageData) {

    $("#customerData, #customerSpotData").html('');
    if (refreshAllPageData) {
        $("#Deposits , #DepositLog , #Calls , #LoginLog , #CreditCard , #Communications , #accountBalance , #Positions, #DepositLogVinci, #CommunicationsVinci").html('');
    }
    $(".customerSpotData").addClass('visibility');
    apiRequest('getCustomer', $('#range-form').serialize(), '#customerData', function (data) {
        var realEmail = data[0]['Email'];
        var realPhone = data[0]['Phone_Number'];
        console.log('data', data);
        if (data == -1) {
            msgbox('<i class="icon-warning-sign"></i> Access Denied!', "you are not authorised to see this customer card", "Close");
            $('#submit').attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        } else if (data[0].id == 0 || data[0].id == null) {
            msgbox('<i class="icon-warning-sign"></i> Oops!', "wrong id or email", "Close");
            $('#submit').attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        } else {
            changeURL(data[0]['id']);
            var edit_permission = data[0].edit_permission;
            var edit_bonus = data[0].edit_bonus;
            var edit_assign = data[0].edit_assign;
            var edit_approach = data[0].edit_approach;
            var edit_risk = data[0].edit_risk;
            var isForbidden = data.isForbidden;
            var isComplience = data.isComplience;
            deskId = data[0].DeskId;
            isLeverate = data[0].LavarateId;

            data[0].Birthday = data[0].Birthday == '0000-00-00' ? '' : data[0].Birthday;
            data[0].Demo = data[0].Demo == 0 ? 'No' : 'Yes';
          //  data[0].Spot_Platform = data[0].Spot_Platform == '1' ? ['1', 'Binary'] : ['2', 'Forex'];

            Object.keys(data[0]).forEach(function (key) {

                if (key == 'Email' || key == 'Phone_Number' || key == 'Mobile' || key == 'Communication_Email') {
                    data[0][key] = '<b id="id_' + key + '" class="change_view">' + data[0][key] + '</b>';
                }
                if (key == 'Turnover' || key == 'Account_Balance' || key == 'Total_Deposit' || key == 'Total_Withdrawals' || key == 'Total_Net_Bonus') {
                    data[0][key] = parseFloat(data[0][key]).toLocaleString();
                }

                Key = key.replace(/_/g, " ");

                $("#customerContent").show();
                if (Key == 'Email' && edit_permission == 1) {
                    $("#customerData").append('' +
                        '<div class="col-md-3"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_email"><b>' + Key + ' </b>: ' + data[0][key] + '</span> <i class="fa fa-pencil-square-o edit" onclick="editCustomerEmail(' + data[0]["id"] + ')"></i> </div></div></div>');
                } else if (Key == 'Communication Email' && edit_permission == 1) {
                    $("#customerData").append('' +
                        '<div class="col-md-3">' +
                        '<div class="list-group">' +
                        '<div href="" class="list-group-item ">' +
                        '<span id="change_view_communication_email"><b>' + Key + ' </b>: ' + data[0][key] + '</span> ' +
                        '<i class="fa fa-pencil-square-o edit" onclick="editCustomerCommunicationEmail(' + data[0]["id"] + ')" ></i>' +
                        ' </div>' +
                        '</div>' +
                        '</div>');
                } else if (Key == 'Phone Number') {
                    $("#customerData").append('' +
                        '<div class="col-md-3"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_phone"><b>' + Key + ' </b>: ' + data[0][key] + '</span>' +
                        '<div id="phone_number_utills" class="col-md-12 col-lg-12">' +
                        '<i class="fa fa-plus-square edit" id="squarePencilPhoneNumber" title="show elements" onclick="showClickToCall(\'' + Key + '\')"></i>' +
                        '<i class="fa fa-phone-square edit" title="click to call" onclick="clickToCall(\'' + Key + '\',\'' + data[0]["id"] + '\')"></i></div>' +
                        '<div id="clickToCallPhoneNumber" class="clickToCallElements col-md-12 col-lg-12"><span id="prefix" class="elementToCall col-md-6 col-lg-6"><b>Prefix:</b></span><select id="prefixSelectPhoneNumber" name="prefix" class="elementToCall col-md-6 col-lg-6" onchange="savePrefix(this)"><option value="0*" >0*</option></select>' +
                        '<span id="callerID" class="elementToCall col-md-6 col-lg-6"><b>callerID:</b></span><select id="callerIDSelect" name="callerID" class="elementToCall col-md-6 col-lg-6"><option value="17" >UK</option><option value="50" >Australia</option><option value="51" >France</option><option value="53" >Canada</option><option value="55" >New Zealand</option></select>' +
                        '</div></div></div></div>'
                    );

                    if (edit_permission == 1) {
                        $("#phone_number_utills").append(" " +
                            '<i class="fa fa-pencil-square-o edit" onclick="editCustomerPhone(' + data[0]["id"] + ')"></i>'
                        );
                    }
                    if ($.cookie('selected-val-phone-number')) {
                        $('#prefixSelectPhoneNumber').val($.cookie('selected-val-phone-number'));
                    }
                }
                else if (Key == 'Mobile') {
                    $("#customerData").append('' +
                        '<div class="col-md-3">' +
                        '<div class="list-group">' +
                        '<div href="" class="list-group-item ">' +
                        '<span id="change_view_mobile"><b>' + Key + ' </b>: ' + data[0][key] + '</span> ' +
                        '<div id="mobile_number_utills" class="col-md-12 col-lg-12"> ' +
                        '<i class="fa fa-plus-square edit" id="squarePencilMobile" title="show elements" onclick="showClickToCall(\'' + Key + '\')"></i>' +
                        '<i class="fa fa-phone-square edit" title="click to call" onclick="clickToCall(\'' + Key + '\',\'' + data[0]["id"] + '\')"></i></div>' +
                        '<div id="clickToCallMobile" class="clickToCallElements col-md-12 col-lg-12">' +
                        '<span id="prefix" class="elementToCall col-md-6 col-lg-6"><b>Prefix:</b></span>' +
                        '<select id="prefixSelectMobile" name="prefix" class="elementToCall col-md-6 col-lg-6" onchange="savePrefix(this)"><option value="0*" >0*</option></select>' +
                        '<span id="callerID" class="elementToCall col-md-6 col-lg-6"><b>callerID:</b></span><select id="callerIDSelect" name="callerID" class="elementToCall col-md-6 col-lg-6"><option value="17" >UK</option><option value="50" >Australia</option><option value="51" >France</option><option value="53" >Canada</option><option value="55" >New Zealand</option></select>' +
                        '</div></div></div></div>'
                    );

                    if (edit_permission == 1) {
                        $("#mobile_number_utills").append(" " +
                            '<i class="fa fa-pencil-square-o edit" onclick="editCustomerMobile(' + data[0]["id"] + ')"></i>'
                        );

                    }
                    if ($.cookie('selected-val-mobile')) {
                        $('#prefixSelectMobile').val($.cookie('selected-val-mobile'));
                    }
                }
                else if (Key == 'LavarateId') {
                    if (data[0][key] != '') {
                        $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>' + Key + ' </b>: ' + data[0][key] + '</span> </div></div></div>');
                    }
                }
             /*   else if(Key == 'Spot Platform') {
                    $("#customerData").append('' +
                        '<div class="col-md-3"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_' + key + '"><b>' + Key + ' </b>: <b class="change_view" data-value="' + data[0][key][0] + '">' + data[0][key][1] + '</b></span></div></div></div>');

                    if(edit_permission == 1 && data[0][key][0] == '2') {
                        $('#customerData').find('#change_view_' + key).append(' <i class="fa fa-pencil-square-o edit" onclick="editCustomerSpotPlatform(' + data[0]["id"] + ')"></i>')
                    }

               } */
                else if (Key != 'edit permission' && Key != 'edit bonus' && Key != 'edit assign' && Key != 'SpotPhoneNumber' && Key != 'SpotEmail' && Key != 'SpotMobile' && Key != 'edit approach' && Key != 'edit risk'
                         && Key != 'approach status description' && Key != 'approach status id' && Key != 'approach comment' && Key != 'VIP Group' && Key != 'Risk Status' && Key != 'EmployeeId' && Key != 'DeskId' && Key != 'LavarateId' && Key != 'AccountLeverateId' && Key != 'TPAccountId') {
                    $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>' + Key + ' </b>: ' + data[0][key] + '</span> </div></div></div>');
                }

            });
            //assign for bonus permissions
            if (edit_bonus == 1) {
                $("#customerData").append('<div class="col-md-3">' +
                    '<div class="list-group">' +
                    '<div href="" class="list-group-item"><span><b>Bonus</b>:</span>' +
                    '<a href="" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" data-currency="' + data[0]["Currency"] + '" class="btn btn-xs btn-danger pull-right withdrawalBonus">Withdrawal</a>' +
                    '<span class="pull-right">&nbsp;</span>' +
                    '<a href="" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" data-currency="' + data[0]["Currency"] + '" class="btn btn-xs btn-success pull-right depositBonus">Deposit</a>' +
                    '</div></div></div>' +
                    (!isForbidden || edit_assign == 1 ?
                    '<div class="col-md-3">' +
                    '<div class="list-group">' +
                    '<div href="" class="list-group-item"><span><b>Assignment</b>:</span>' +
                    '<a href="" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" data-desk="' + data[0]["Desk"] + '" data-employee="' + data[0]["Employee"] + '" ' +
                    'data-employeeId= "' + data[0]["EmployeeId"] + '" class="btn btn-xs btn-secondary pull-right assignEmployee">Assign</a>' +
                    '</div></div></div>' : '') +
                    '<div class="col-md-3">' +
                    '<div class="list-group">' +
                    '<div href="" class="list-group-item"><span><b>Password</b>:</span>' +
                    '<a href="" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" class="btn btn-xs btn-secondary pull-right changePassword" onclick="event.preventDefault();">Change</a>' +
                    '</div></div></div>');
            }

            $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>Communication</b>:</span>' +
                '<a href="" data-lavarateId="' + data[0]["LavarateId"] + '" data-accountleverateId="'+ data[0]["AccountLeverateId"] +'" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" data-saleStatus="' + data[0]["Sale_Status"] + '" class="btn btn-xs btn-secondary pull-right addCommunication" onclick="event.preventDefault();">Add</a>' +
                '</div></div></div>');

            var VIP_group_append = '<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>VIP Group</b>: ' + data[0]['VIP_Group'] + '</span>';
            if (edit_bonus == 1) {
                VIP_group_append += '<a href="#" data-id="' + data[0]["id"] + '" data-customer="' + data[0]["First_Name"] + ' ' + data[0]["Last_Name"] + '" data-vip="' + data[0]['VIP_Group'] + '" class="btn btn-xs btn-secondary pull-right vip_group" onclick="event.preventDefault();">Change</a>';
            }
            VIP_group_append += '</div></div>';
            $("#customerData").append(VIP_group_append);

            if (edit_approach == 1) {
            	var comment = (data[0]["approach_comment"]).replace(/&/g, "&amp;")
                                      .replace(/</g, "&lt;")
                                      .replace(/>/g, "&gt;")
                                      .replace(/"/g, "&quot;")
                                      .replace(/'/g, "&#039;"); 
                $("#customerData").append("<div class='col-md-3'><div class='list-group'><div class='list-group-item'><span><b>Approach</b> : " + data[0]['approach_status_description'] + "</span>" +
                    '<a href="#" data-id="' + data[0]["approach_status_id"] + '" data-comment="' + comment+ '" class="btn btn-xs btn-secondary pull-right assignApproach">Set</a>' +
                    '</div></div></div>');
            } else if (edit_approach == 0) {
                $("#customerData").append("<div class='col-md-3'><div class='list-group'><div class='list-group-item'><span><b>Approach</b> : " + data[0]['approach_status_description'] + "</span>" +
                    '</div></div></div>');
            }
            
            var riskStatusAppend = "<div class='col-md-3'><div class='list-group'><div class='list-group-item'><span><b>Risk Status</b> : " + data[0]['Risk_Status'] + "</span>";
            
            if(edit_risk == 1)
               riskStatusAppend += '<a href="#" data-id="' + data[0]["id"] + '" class="btn btn-xs btn-secondary pull-right assignRiskStatus">Set</a>';  
            riskStatusAppend += '</div></div></div>';
            $("#customerData").append(riskStatusAppend);

            Object.keys(data[0]).forEach(function (key) {
                if (key == 'SpotEmail' || key == 'SpotPhoneNumber' || key == 'SpotMobile') {
                    data[0][key] = '<b id="id' + key + '"class="change_view">' + data[0][key] + '</b>';
                    $(".customerSpotData").removeClass('visibility');
                }
                Key = key.replace("_", " ");

                if (Key == 'SpotEmail' && edit_permission == 1) {
                    $("#customerSpotData").append('' +
                        '<div class="col-md-3 email"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_spot_email"><b>' + Key + ' </b>: ' + data[0][key] + '</span> <i class="fa fa-pencil-square-o edit" onclick="editSpotCustomerEmail(' + data[0]["id"] + ')"></i> </div></div></div>');
                } else if (Key == 'SpotPhoneNumber' && edit_permission == 1) {
                    $("#customerSpotData").append('' +
                        '<div class="col-md-3 phone"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_spot_phone"><b>' + Key + ' </b>: ' + data[0][key] + '</span> <i class="fa fa-pencil-square-o edit" onclick="editSpotCustomerPhone(' + data[0]["id"] + ')"></i> </div></div></div>');
                }
                else if (Key == 'SpotMobile' && edit_permission == 1) {
                    $("#customerSpotData").append('' +
                        '<div class="col-md-3 mobile"><div class="list-group">' +
                        ' <div href="" class="list-group-item ">' +
                        '<span id="change_view_spot_mobile"><b>' + Key + ' </b>: ' + data[0][key] + '</span> <i class="fa fa-pencil-square-o edit" onclick="editSpotCustomerMobile(' + data[0]["id"] + ')"></i> </div></div></div>');
                }
                else if (Key == 'SpotPhoneNumber' || Key == 'SpotEmail' || Key == 'SpotMobile') {

                    $("#customerSpotData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>' + Key + ' </b>: ' + data[0][key] + '</span> </div></div></div>');
                }

            });

	        if (!isVinci && isLeverate > 0)
	        {
	        	$("#vinciLogo").css('display', 'none');
	        	$("#redAlertVinci").css('display', 'block');
	        	$("#customerContent").css('display', 'none');
	        	
	        	$('#submit').attr("disabled", false);
	        }
	        else if (isVinci && isLeverate > 0)
	        {
                customerCommunications();
	        	$(".withdrawalBonus").css('display', 'none');
	        	$(".depositBonus").css('display', 'none');
	        	$(".assignApproach").css('display', 'none');
	        	$(".vip_group").css('display', 'none');
	        	//$(".addCommunication").css('display', 'none');
                $("#phone_number_utills i.fa-phone-square ").hide();
                $("#mobile_number_utills i.fa-phone-square ").hide();
                $("#squarePencilMobile").hide();
                $("#squarePencilPhoneNumber").hide();
	        	$("#vinciLogo").css('display', 'block');
	        	$(".customerSpotData").css('display', 'none');
	        	$("div[name=customerBlockBalance]").css('display', 'none');
	        	$("div[name=customerBlockDeposit]").css('display', 'none');
	        	$("div[name=customerBlockBonuses]").css('display', 'none');
                $("div[name=customerBlockCommunication]").insertAfter($("div[name=customerBlockCommunicationVinci]"));
	        	$("div[name=customerBlockCalls]").css('display', 'none');
	        	$("div[name=customerBlockDepositLog]").css('display', 'none');
	        	$("div[name=customerBlockCC]").css('display', 'none');
	        	$("div[name=customerBlockLoginLog]").css('display', 'none');
	        	$("div[name=customerBlockPosition]").css('display', 'none');
	        	
	        	$("div[name=customerBlockCommunicationVinci]").css('display', 'block');
	        	$("div[name=customerBlockDepositLogVinci]").css('display', 'block');
	        	
	        	GetAcountData(data[0]["LavarateId"], data[0]["AccountLeverateId"], data[0]["TPAccountId"], data[0], realEmail, realPhone);
	        	
	        	//console.log('tp account', data[0]["TPAccountId"]);
	        	//updateVinciCustomerBalance(1, data[0]["TPAccountId"], '1125269341476358521', 'EUR');
	        	
	        	$('#submit').attr("disabled", false);
                if(isPlatformSwitch &&  document.getElementById('switchPlatform') == null){
                    $( "#customerContent" ).first().before( '<input style="margin-top: -3em;" class="btn btn-secondary" value="Switch Customer to Binary" id="switchPlatform" type="submit">' );
                }
	        }
	        else{
	        	$("#vinciLogo").css('display', 'none');
	        	$("div[name=customerBlockCommunicationVinci]").css('display', 'none');
	        	$("div[name=customerBlockDepositLogVinci]").css('display', 'none');
	        	
	        	$(".customerSpotData").css('display', 'block');
	        	$("div[name=customerBlockBalance]").css('display', 'block');
	        	$("div[name=customerBlockDeposit]").css('display', 'block');
	        	$("div[name=customerBlockBonuses]").css('display', 'block');
	        	$("div[name=customerBlockCommunication]").css('display', 'block');
	        	$("div[name=customerBlockCalls]").css('display', 'block');
	        	$("div[name=customerBlockDepositLog]").css('display', 'block');
	        	$("div[name=customerBlockCC]").css('display', 'block');
	        	$("div[name=customerBlockLoginLog]").css('display', 'block');
	        	$("div[name=customerBlockPosition]").css('display', 'block');
	        	
		        if (refreshAllPageData) {
	                getCustomerRealAcountBalance(data[0].Currency);
	                getCustomerDeposits(data[0].Currency);
	                getCustomerBonuses(data[0].Currency);
	                getCustomerDepositLog(data[0].Currency);
	                getCustomerCalls(data[0]["id"]);
	                getCustomerLoginLog();
	                getCustomerCreditCard();
	                getCustomerPositions();
	                customerCommunications();
	            }
	        }
        }
        
        if (isForbidden) {
            $("#dontApproach").css('display', 'block'); 
            $("#dontApproach").removeClass('yellow-alert');
            $("#dontApproach").addClass('red-alert');
            $("#dontApproach").html("Retention/Conversion Teams' agents <div><b>Shouldn't approach</b></div> the customer by any means");
        }else if(isComplience){
            $("#dontApproach").css('display', 'block');
            $("#dontApproach").removeClass('red-alert');
            $("#dontApproach").addClass('yellow-alert');
            $("#dontApproach").html("Please check with a manager if he allows you to call this client");
        } else {
            $("#dontApproach").css('display', 'none');
            $("#dontApproach").removeClass();
        }
    });


}


$(document).on("click", "#switchPlatform", function () {
    event.preventDefault();
    var withdrawalBonus_modal = bootbox.dialog({
        title: "Switch Customer to Binary",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> Are you sure you want to switch customer LavarateId: '+ isLeverate +' to binary</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {

                    apiRequest('switchCustomerToBinary', {"leverateId": isLeverate}, '', function (data) {
                        if (data === true) {
                            location.reload();
                        } else {
                            bootbox.alert("<h4>ERROR " + data + ". Contact RND Department</h4>");
                        }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
            }
        }
    });
});

function getCustomerRealAcountBalance(currency) {
    apiRequest('getCustomerRealAcountBalance', $('#range-form').serialize(), '#accountBalance', function (data) {
        if (!data[0].Total_Withdrawals || data[0].Total_Withdrawals == null)
            data[0].Total_Withdrawals = "0.00";
        if (!data[0].Total_Fees || data[0].Total_Fees == undefined)
            data[0].Total_Fees = "0.00";

        var realBalance = parseFloat(data[0].Total_Deposit) - parseFloat(data[0].Total_Withdrawals) - parseFloat(data[0].pnl) - parseFloat(data[0].Total_Fees);

        if (!realBalance || realBalance < 0)
            data[0].realAcountBalance = "0.00";
        else
            data[0].realAcountBalance = realBalance;

        for (var i = 0, j = data.length; i < j; i++) {
            data[i].Total_Deposit += ' ' + currency;
            data[i].Total_Withdrawals += ' ' + currency;
            data[i].Total_Fees += ' ' + currency;
            data[i].realAcountBalance += ' ' + currency;
        }
        ;

        $('#accountBalance').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [

                {"mData": "Total_Deposit", "sTitle": "Total Deposit", "sType": "numeric"},
                {"mData": "Total_Withdrawals", "sTitle": "Total Withdrawals", "sType": "numeric"},
                {"mData": "Total_Fees", "sTitle": "Total Fees", "sType": "numeric"},
                {"mData": "pnl", "sTitle": "PNL"},
                {"mData": "realAcountBalance", "sTitle": "Real Acount Balance", "sType": "numeric"}

            ]

        });

    });
}

function getCustomerDeposits(currency) {
    apiRequest('getCustomerDeposits', $('#range-form').serialize(), '#Deposits', function (data) {

        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + currency;
        }
        ;

        $('#Deposits').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[4, "desc"]],
            "aoColumns": [
                {"mData": "id", "sTitle": "id", "bVisible": false},
                {"mData": "paymentMethod", "sTitle": "Method"},
                {"mData": "clearedBy", "sTitle": "Cleared By"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "requestTime", "sTitle": "Request Date"},
                {"mData": "status", "sTitle": "Status"},
                {"mData": "transactionEmployee", "sTitle": "Transaction Employee",  "sClass": "columnX center",
                 "fnRender": function(oObj){
                 	var tEmployee = oObj.aData.transactionEmployee;
                 	if(isDepositChange)
                 	  return (tEmployee!='' ? tEmployee+'<br>' : '')+'<a class="btn btn-xs btn-blue changeTransactionEmployee" data-depositId="'+oObj.aData.id+'" data-transactionEmployeeId = "'+oObj.aData.receptionEmployeeId+'" data-transactionEmployee="'+tEmployee+'">Change</a>';
                 	else
                 	  return tEmployee;         
                 } 
                },
                {"mData": "processEmployee", "sTitle": "Process Employee",  "sClass": "columnX center"}

            ],

        });

    });
}

function getCustomerBonuses(currency) {
    apiRequest('getCustomerBonuses', $('#range-form').serialize(), '#Bonuses', function (data) {

        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + currency;
        }
        ;

        $('#Bonuses').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[3, "desc"]],
            "aoColumns": [
                {"mData": "id", "sTitle": "ID"},
                {"mData": "bonusType", "sTitle": "Bonus Type"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "requestTime", "sTitle": "Request Date"},
                {"mData": "status", "sTitle": "Status"},
                {"mData": "processEmployeeName", "sTitle": "Process Employee", "sType": "numeric"},

            ],

        });

    });
}

function getCustomerWithdrawals(currency) {
    apiRequest('getCustomerWithdrawals', $('#range-form').serialize(), '#Withdrawals', function (data) {


        for (var prop in data) {
            if (data.hasOwnProperty(prop)) {
                for (var key in data[prop]) {
                    if (data[prop][key] === "0000-00-00 00:00:00") {
                        data[prop][key] = "";
                    }
                }
            }
        }


        $('#withdrawals').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "amount", "sTitle": "Amount"},
                {"mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
                {"mData": "paymentMethod", "sTitle": "Payment Method"},
                {"mData": "requestTime", "sTitle": "Request Time"},
                {"mData": "status", "sTitle": "Status"},
                {"mData": "confirmTime", "sTitle": "Confirm Time"},
                {"mData": "cancellationTime", "sTitle": "Cancellation Time"},
                {"mData": "cancelReason", "sTitle": "Cancel Reason"},


            ],

        });


    });
}

function getCustomerDepositLogVinci(customerData, realEmail, realPhone, TPAccountId, showDeposit){
	var currency = customerData["Currency"];

	apiRequest('getCustomerVinciDepositLog', $('#range-form').serialize(), '#DepositLogVinci', function (data) {
        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + currency;
        }
        
        if (showDeposit)
        {
        	$('#DepositLogVinci').dataTable({
	            "sDom": 'T<"clear">lfrtip',
	            "oTableTools": {
	                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
	                "aButtons": [
	                    {
	                        "sExtends": "select", "sButtonText": "Add Deposit",
	                        "fnClick": function (nButton, oConfig, oFlash) {
	                            addVinciDeposit(customerData, realEmail, realPhone, TPAccountId);
	                        }
	                    },
	                ]
	            },
	            "bDestroy": true,
	            "bLengthChange": true,
	            "aaData": data,
	            "aaSorting": [[4, "desc"]],
	            "aoColumns": [
	            	{"mData": "depositId", "sTitle": "Deposit ID"},
	            	{"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
	            	{"mData": "requestDate", "sTitle": "Date"},
	            	{"mData": "status", "sTitle": "Status"},
	            	{"mData": "error", "sTitle": "Error"},
	            	{"mData": "user", "sTitle": "Process Employee"},	
	            ],
	
	        });
        }else{
        	$('#DepositLogVinci').dataTable({
	            "sDom": '<"clear">lfrtip',
	            "bDestroy": true,
	            "bLengthChange": true,
	            "aaData": data,
	            "aaSorting": [[10, "desc"]],
	            "aoColumns": [
	                {"mData": "depositId", "sTitle": "Deposit ID"},
	            	{"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
	            	{"mData": "requestDate", "sTitle": "Date"},
	            	{"mData": "status", "sTitle": "Status"},
	            	{"mData": "error", "sTitle": "Error"},
	            	{"mData": "user", "sTitle": "Process Employee"},
	            ],
	
	        });
        }
        
    });
}

function addVinciDeposit(customerData, realEmail, realPhone, TPAccountId) {
	
    $('#firstName').val(customerData['First_Name']);
    $('#lastName').val(customerData['Last_Name']);
    $('#country').val(customerData['Country']);
    $('#depositEmail').val(realEmail);
    $('#postalCode').val(customerData['Postal_Code']);
    $('#address').val(customerData['Street']);
    $('#phone').val(realPhone);
    $('#city').val(customerData['City']);
    $('#amount').val('');
    $('#currency').val(customerData['Currency']);
    $('#spotId').val(customerData['id']);
    $('#lavarateId').val(customerData['LavarateId']);
    $('#TPAccountId').val(TPAccountId);

	$("div[name=customerBlockDepositVinci]").css('display', 'block');
}


function updateVinciCustomerBalance(amount, tpLeverateId, depositId, currency)
{
	post = {"amount": amount, "tpLeverateId": tpLeverateId, "depositId": depositId};
	apiRequest('updateVinciCustomerBalance', post, '#CommunicationsVinci', function (data) {
		if (data.success)
		{
			// put success popup
            msgbox("success",'You successfully deposited Amount-'+amount+' (Currency:'+currency+' Transaction number '+depositId+':transaction icb was created', "Close");

		}else{
			// put success in processor but failed in vinci popup. 
			// data.message => the message of fialed
			// data.requestId => the Id on vinci (check if need to show??)
            msgbox("success in processor but failed in vinci",'the message of fialed', "Close");
		}
		
		postUpdateDeposit = {"depositId": depositId, "status": data.success, "message": data.message, "requestId": data.requestId};
		apiRequest('updateDepositVinciLog', postUpdateDeposit, '#CommunicationsVinci', function (updateReturnData) {
			
		});
		console.log('update balance', data);
	});
}

function getCustomerDepositLog(currency) {
    apiRequest('getCustomerDepositLog', $('#range-form').serialize(), '#DepositLog', function (data) {
        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + currency;
        }
        ;
        $('#DepositLog').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[4, "desc"]],
            "aoColumns": [
                {"mData": "cardNum", "sTitle": "Card Number"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "errorText", "sTitle": "Error"},
                {"mData": "rawError", "sTitle": "Row Error"},
                {"mData": "date", "sTitle": "Date"},
                {"mData": "ip", "sTitle": "IP"},

            ],

        });

    });

}

function customerCommunications() {
    apiRequest('customerCommunications', $('#range-form').serialize(), '#Communications', function (data) {
        if (data)
            $('#submit').attr("disabled", false);

        $('#Communications').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "createDate", "sTitle": "Date"},
                {"mData": "subject", "sTitle": "Subject"},
                {"mData": "content", "sTitle": "Content"},
                {"mData": "user", "sTitle": "User"},

            ],

        });

    });

}

function GetAcountData(leverateId, AccountLeverateId, TPAccountId, CustomerData, realEmail, realPhone)
{
	post = {"leverateId": leverateId, "AccountLeverateId": AccountLeverateId};
	apiRequest('GetBalanceLeverate', post, '#CommunicationsVinci', function (data) {
		if (data['Balance'] == 0 && data['approveDeposit'] == 0)
		{
			customerCommunicationsVinci(CustomerData['id'], leverateId, AccountLeverateId, true);
			getCustomerDepositLogVinci(CustomerData, realEmail, realPhone, TPAccountId, true);
		}else{
			customerCommunicationsVinci(CustomerData['id'], leverateId, AccountLeverateId, false);
			getCustomerDepositLogVinci(CustomerData, realEmail, realPhone, TPAccountId, false);
		}
	});
}

function addVinciCommunication(spotId, lavarateId, AccountLeverateId){
	$('#Subject').val('');
	$('#Details').val('');
	$('#spotIdComm').val(spotId);
    $('#lavarateIdComm').val(lavarateId);
    $('#TPAccountIdComm').val(AccountLeverateId);
    
	$("div[name=customerBlockAddCommunicationVinci]").css('display', 'block');
}

function customerCommunicationsVinci(spotId, lavarateId, AccountLeverateId, showAdd) {
	postData = {"spotId": spotId, "AccountLeverateId": AccountLeverateId};
	
    apiRequest('customerCommunicationsVinci', postData, '#CommunicationsVinci', function (data) {
    	if (showAdd)
    	{
    		$('#CommunicationsVinci').dataTable({
	            "sDom": 'T<"clear">lfrtip',
	            "oTableTools": {
		                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
		                "aButtons": [
		                    {
		                        "sExtends": "select", "sButtonText": "Add New",
		                        "fnClick": function (nButton, oConfig, oFlash) {
		                            addVinciCommunication(spotId, lavarateId, AccountLeverateId);
		                        }
		                    },
		                ]
		            },
	            "bDestroy": true,
	            "bLengthChange": true,
	            "aaData": data,
	            "aaSorting": [[10, "desc"]],
	            "aoColumns": [
	                {"mData": "date", "sTitle": "Date", "sWidth": "160px"},
	                {"mData": "subject", "sTitle": "Subject", "sWidth": "400px"},
	                {"mData": "content", "sTitle": "Content", "sWidth": "800px"},
	                {"mData": "user", "sTitle": "User", "sWidth": "185px"},
	
	            ],
	        });
    	}else{
    		$('#CommunicationsVinci').dataTable({
	            "sDom": '<"clear">lfrtip',
	            "bDestroy": true,
	            "bLengthChange": true,
	            "aaData": data,
	            "aaSorting": [[10, "desc"]],
	            "aoColumns": [
	                {"mData": "date", "sTitle": "Date", "sWidth": "160px"},
	                {"mData": "subject", "sTitle": "Subject", "sWidth": "400px"},
	                {"mData": "content", "sTitle": "Content", "sWidth": "800px"},
	                {"mData": "user", "sTitle": "User", "sWidth": "185px"},
	
	            ],
	        });
    	}
        
    });
}

function addCustomerVinciCommunication(spotId, lavarateId, AccountLeverateId, communicationSubject, communicationBody){
	post = {"id": spotId, "lavarateId": lavarateId, "accountLeverateId": AccountLeverateId, "subject": communicationSubject, "content": communicationBody};
	
	console.log('post', post);
	apiRequest('addVinciCustomerCommunication', post, '#communication', function (data) {
		console.log('add comunication data', data);
        if (data) {
            if (data['success'] == 2 || data['success'] == "2") {
            	$('#Subject').val('');
        		$('#Details').val('');
            	$("div[name=customerBlockAddCommunicationVinci]").css('display', 'none');
                msgbox('Success!', data['message'], "Close");
                customerCommunicationsVinci(spotId, lavarateId, AccountLeverateId);
                getCustomer(false);
            } else {
                var element = $('#customerData').find('#change_view_email').children('b.change_view');
                var data_email = data['email'];
                element.text(data_email);
            }
        } else {
            console.log('error');
        }
    });
}

function getCustomerCalls(id) {
    apiRequest('getCustomerCalls', $('#range-form').serialize(), '#Calls', function (data) {

        $('#Calls').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                "aButtons": [
                    {
                        "sExtends": "select", "sButtonText": "Add New",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            addCustomerCall(id);
                        }
                    },
                ]
            },
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "subject", "sTitle": "Subject"},
                {"mData": "content", "sTitle": "Content"},
                {"mData": "date", "sTitle": "Date"},
                {"mData": "user", "sTitle": "User"},

            ],

        });

    });
}

function addCustomerCall(id) {
    var form_data = '<form id="addCall"><h4>Subject</h4><input style="margin:0 25%" type="text" required  name="subject" value=""/>' +
        '<h4>Content</h4><textarea rows="10" cols="25" style="margin:0 25%; width: 296px" required  name="content" value=""></textarea>' +
        '<h4>change Customer Sales Status (required):</h4><select name="salestatus"><option value="new">new</option><option value="noAnswer">noAnswer</option><option value="checkNumber">checkNumber</option>' +
        '<option value="callAgain">callAgain</option><option value="inTheMoney">inTheMoney</option><option selected value="noCall">noCall</option>' +
        '<option value="notInterested">notInterested</option><option value="reassign">reassign</option></select>' +
        '<input type="hidden"  name="id" value="' + id + '"/><input type="hidden"  name="employeeId" value="' + id + '"/></form>';

    confirm("Add new call", form_data, "cancel", "add", function (data) {
        var id_json = $('#addCall').serialize();
        apiRequest('addCustomerCall', id_json, '#callBack', function (data) {
            if (data) {
                if (data['success'] == 2 || data['success'] == "2") {
                    msgbox('Success!', data['message'], "Close");
                    //alert(data['message']);
                    getCustomerCalls(id);
                    getCustomer(false);
                } else {
                    var element = $('#customerData').find('#change_view_email').children('b.change_view');
                    var data_email = data['email'];
                    element.text(data_email);
                }
            } else {
                console.log('error');
            }
        });
        return true;
    });
}

function getCustomerLoginLog() {
    apiRequest('getCustomerLoginLog', $('#range-form').serialize(), '#LoginLog', function (data) {


        $('#LoginLog').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "dateLogin", "sTitle": "Date"},
                {"mData": "ip", "sTitle": "IP"},
                {"mData": "referer", "sTitle": "Referer"},

            ],

        });

    });
}

function getCustomerCreditCard() {
    apiRequest('getCustomerCreditCard', $('#range-form').serialize(), '#CreditCard', function (data) {

        $('#CreditCard').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[11, "desc"]],
            "aoColumns": [
                {"mData": "id", "sTitle": "ID"},
                {"mData": "ccType", "sTitle": "Credit Card Type"},
                {"mData": "ExpMonth", "sTitle": "Expiration Month"},
                {"mData": "ExpYear", "sTitle": "Expiration Year"},
                {"mData": "cardNum", "sTitle": "Card Number"},
                {"mData": "currency", "sTitle": "Currency"},
                {"mData": "FirstName", "sTitle": "First Name"},
                {"mData": "LastName", "sTitle": "Last Name"},
                {"mData": "Phone", "sTitle": "Phone Number"},
                {"mData": "LastUpdateDate", "sTitle": "Last Update"},
                {"mData": "Status", "sTitle": "Status"},
                {
                    "sDefaultContent": "", "fnRender": function (o) {
                    return "<div class='col-md-12 text-center'><a href='?id=" + o.aData["customerid"] + "&cc=" + o.aData["id"] + "&cmd=removeCC' class='btn btn-secondary'>Remove</a></div>";
                }, "sTitle": "Remove Credit Card"
                },

            ],

        });

    });
}

function getCustomerPositions() {
    apiRequest('getCustomerPositions', $('#range-form').serialize(), '#Positions', function (data) {


        $('#Positions').dataTable({

            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "name", "sTitle": "Name"},
                {"mData": "date", "sTitle": "Date"},
                {"mData": "endDate", "sTitle": "End Date"},
                {"mData": "status", "sTitle": "Status"},
                {"mData": "position", "sTitle": "Position"},
                {"mData": "CanWin", "sTitle": "Can Win", "sType": "numeric"},
                {"mData": "CanLoose", "sTitle": "Can Loose", "sType": "numeric"},
                {"mData": "payout", "sTitle": "PayOut"},
                {"mData": "rate", "sTitle": "Rate", "sType": "numeric"},
                {"mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
                {"mData": "employee", "sTitle": "Employee"},


            ],

        });

    });

}

function getUrlVars() {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function editCustomerSpotPlatform(id) {

    var form_data = '<form class="form-horizontal" id="editSpotPlatform">' +
        '<div class="form-group" style="margin: auto 2em">' +
        '<h4>You are switching Customer to <u>Binary</u> Spot Platform</h4> ' +
        '<h4 class="text-warning">THIS ACTION CANNOT BE UNDONE!</h4> ' +
        '<div class="col-md-6">' +
        '<input type="hidden" name="spot_platform" value="1"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Spot Platform",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var id_json = $('#editSpotPlatform').serialize();

                    console.log(id_json);

                    apiRequest('editLocalSpotPlatform', id_json, '#customerData', function (data) {
                        if (data) {
                            displayToolTip('success', 'Spot Platform', function () {
                                var element = $('#customerData').find('#change_view_Spot_Platform').children('b.change_view');
                                element.text(data['name']);
                                $('#customerData').find('#change_view_Spot_Platform i').remove();
                            });
                        } else {
                            console.log('error');
                            displayToolTip('danger', 'Spot Platform');
                        }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Spot Platform');
                }
            }
        }

    });
}

function editCustomerEmail(id) {
    var email = $('#id_Email').html();

    var form_data = '<form class="form-horizontal" id="editEmail">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="email" style="font-size:16px">Email</label> ' +
        '<div class="col-md-6">' +
        '<input type="email" class="form-control" required  name="email" value="' + email + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Email",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var id_json = $('#editEmail').serialize();
                    apiRequest('editLocalEmail', id_json, '#customerData', function (data) {
                        if (data) {
                            if (data['success'] == 2) {
                                alert(data['message']);
                            } else {


                                displayToolTip('success', 'Email', function () {
                                    var element = $('#customerData').find('#change_view_email').children('b.change_view');
                                    var data_email = data['email'];
                                    element.text(data_email);
                                });
                            }

                        } else {
                            console.log('error');
                            displayToolTip('danger', 'Email');
                        }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Email');
                }
            }
        }

    });

}

function editCustomerPhone(id) {
    var phone = $('#id_Phone_Number').html();
    var form_data = '<form class="form-horizontal" id="editPhone">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="phone" style="font-size:16px">Phone</label> ' +
        '<div class="col-md-6">' +
        '<input type="text" class="form-control" required  id="editPhoneInput" name="phone" value="' + phone + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Phone Number",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = /^[0-9()\-+ ]+$/;
                    var myPhone = $('#editPhoneInput').val();
                    var valid = re.test(myPhone);

                    if (valid) {
                        var id_json = $('#editPhone').serialize();
                        apiRequest('editLocalPhone', id_json, '#customerData', function (data) {
                            if (data) {
                                if (data['success'] == 2) {
                                    alert(data['message']);
                                } else {
                                    displayToolTip('success', 'Phone', function () {
                                        var element = $('#customerData').find('#change_view_phone').children('b.change_view');
                                        var phone = data['phone'];
                                        element.text(phone);
                                    });


                                }

                            } else {
                                console.log('error');
                                displayToolTip('danger', 'Phone');
                            }
                        });
                    } else {
                        alert('Phone Number Is Not Valid');
                    }
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Phone');
                }
            }
        }

    });
}

function showClickToCall(key) {

    if (key == 'Phone Number') {
        document.getElementById('clickToCallPhoneNumber').style.display = "inline-block";
        document.getElementById('squarePencilPhoneNumber').style.display = "none";
    } else {
        document.getElementById('clickToCallMobile').style.display = "inline-block";
        document.getElementById('squarePencilMobile').style.display = "none";
    }

}

function clickToCall(key, customerId) {

    var phone = '';
    if (key == 'Phone Number') {
        var prefixIndex = document.getElementById('prefixSelectPhoneNumber').selectedIndex;
        var prefixOptions = document.getElementById('prefixSelectPhoneNumber').options;
    } else {
        var prefixIndex = document.getElementById('prefixSelectMobile').selectedIndex;
        var prefixOptions = document.getElementById('prefixSelectMobile').options;
    }
    var callerIDIndex = document.getElementById('callerIDSelect').selectedIndex;
    var callerIDOptions = document.getElementById('callerIDSelect').options;

    var prefixValue = prefixOptions[prefixIndex].value;
    var callerIdValue = callerIDOptions[callerIDIndex].value;

    phone = phone + prefixValue;

    if (prefixValue == '0*') {
        phone = phone + callerIdValue;
    }
    if (key == 'Phone Number') {
        phone = phone + $('#id_Phone_Number').html();
    } else {
        phone = phone + $('#id_Mobile').html();
    }

    post = {"phone": phone, "customerId": customerId};
    apiRequest('clickToCall', post, '#callBack', function (data) {

    });
}

function editCustomerMobile(id) {
    var mobile = $('#id_Mobile').html();
    var form_data = '<form class="form-horizontal" id="editMobile">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="mobile" style="font-size:16px">Mobile</label> ' +
        '<div class="col-md-6">' +
        '<input type="text" class="form-control" required  id="editMobileInput" name="mobile" value="' + mobile + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Mobile",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = /^[0-9()\-+ ]+$/;
                    var myMobile = $('#editMobileInput').val();
                    var valid = re.test(myMobile);

                    if (valid) {
                        var id_json = $('#editMobile').serialize();
                        apiRequest('editLocalMobile', id_json, '#customerData', function (data) {
                            if (data) {
                                if (data['success'] == 2) {
                                    alert(data['message']);
                                } else {
                                    displayToolTip('success', 'Mobile', function () {
                                        var element = $('#customerData').find('#change_view_mobile').children('b.change_view');
                                        var mobile = data['mobile'];
                                        element.text(mobile);
                                    });


                                }

                            } else {
                                console.log('error');
                                displayToolTip('danger', 'Mobile');
                            }
                        });
                    } else {
                        alert('Mobile Is Not Valid');
                    }
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Mobile');
                }
            }
        }

    });

}

function editSpotCustomerEmail(id) {

    var email = $('#idSpotEmail').html();

    var form_data = '<form class="form-horizontal" id="editSpotEmail">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="email" style="font-size:16px">Spot Email</label> ' +
        '<div class="col-md-6">' +
        '<input type="email" class="form-control" required  name="email" value="' + email + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Spot Email",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var id_json = $('#editSpotEmail').serialize();
                    apiRequest('editSpotEmail', id_json, '#customerSpotData', function (data) {
                        if (data) {
                            if (data['success'] == 2) {
                                alert(data['message']);
                            } else {


                                displayToolTip('success', 'Spot Email', function () {
                                    var element = $('#customerSpotData').find('#change_view_spot_email').children('b.change_view');
                                    var data_email = data['email'];
                                    element.text(data_email);
                                });
                            }

                        } else {
                            console.log('error');
                            displayToolTip('danger', 'Spot Email');
                        }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Spot Email');
                }
            }
        }

    });

}

function editSpotCustomerPhone(id) {

    var phone = $('#idSpotPhoneNumber').html();

    var form_data = '<form class="form-horizontal" id="editSpotPhone">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="phone" style="font-size:16px">Spot Phone</label> ' +
        '<div class="col-md-6">' +
        '<input type="text" class="form-control" required  id="editSpotPhoneInput" name="phone" value="' + phone + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Spot Phone Number",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = /^[0-9()\-+ ]+$/;
                    var myPhone = $('#editSpotPhoneInput').val();
                    var valid = re.test(myPhone);

                    if (valid) {
                        var id_json = $('#editSpotPhone').serialize();
                        apiRequest('editSpotPhone', id_json, '#customerSpotData', function (data) {
                            if (data) {
                                if (data['success'] == 2) {
                                    alert(data['message']);
                                } else {
                                    displayToolTip('success', 'Spot Phone', function () {
                                        var element = $('#customerSpotData').find('#change_view_spot_phone').children('b.change_view');
                                        var phone = data['phone'];
                                        element.text(phone);
                                    });


                                }

                            } else {
                                console.log('error');
                                displayToolTip('danger', 'Spot Phone');
                            }
                        });
                    } else {
                        alert('Spot Phone Number Is Not Valid');
                    }
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Spot Phone');
                }
            }
        }

    });

}
function editSpotCustomerMobile(id) {

    var mobile = $('#idSpotMobile').html();

    var form_data = '<form class="form-horizontal" id="editSpotMobile">' +
        '<div class="form-group">' +
        '<label class="col-md-4 control-label" for="mobile" style="font-size:16px">Spot Mobile</label> ' +
        '<div class="col-md-6">' +
        '<input type="text" class="form-control" required  id="editSpotMobileInput" name="mobile" value="' + mobile + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Spot Mobile",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = /^[0-9()\-+ ]+$/;
                    var myMobile = $('#editSpotMobileInput').val();
                    var valid = re.test(myMobile);

                    if (valid) {
                        var id_json = $('#editSpotMobile').serialize();
                        apiRequest('editSpotMobile', id_json, '#customerSpotData', function (data) {
                            if (data) {
                                if (data['success'] == 2) {
                                    alert(data['message']);
                                } else {
                                    displayToolTip('success', 'Spot Mobile', function () {
                                        var element = $('#customerSpotData').find('#change_view_spot_mobile').children('b.change_view');
                                        var mobile = data['mobile'];
                                        element.text(mobile);
                                    });


                                }

                            } else {
                                console.log('error');
                                displayToolTip('danger', 'Spot Mobile');
                            }
                        });
                    } else {
                        alert('Spot Mobile Is Not Valid');
                    }
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Spot Mobile');
                }
            }
        }

    });

}

function editCustomerCommunicationEmail(id) {
    var communicationEmail = $('#id_Communication_Email').html();
    var form_data = '<form class="form-horizontal" id="editCommunicationEmail">' +
        '<div class="form-group">' +
        '<label class="col-md-6 control-label" for="communicationEmail" style="font-size:16px">Communication Email</label> ' +
        '<div class="col-md-6">' +
        '<input type="email" class="form-control" required  name="communicationEmail" value="' + communicationEmail + '"/>' +
        '<input type="hidden" name="id" value="' + id + '"/>' +
        '</div></div>' +
        '</form>';

    bootbox.dialog({
        title: "Edit Communication Email",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var id_json = $('#editCommunicationEmail').serialize();
                    apiRequest('editCommunicationEmail', id_json, '#customerData', function (data) {
                        if (data) {
                            if (data['success'] == 2) {
                                alert(data['message']);
                            } else {

                                displayToolTip('success', 'Communication Email', function () {
                                    var element = $('#customerData').find('#change_view_communication_email').children('b.change_view');
                                    var data_email = data['email'];
                                    element.text(data_email);
                                });
                            }

                        } else {
                            console.log('error');
                            displayToolTip('danger', 'Communication Email');
                        }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    displayToolTip('danger', 'Communication Email');
                }
            }
        }

    });

}

function Toggle(elemId) {

    $("#" + elemId).next().toggle();
    var elemClassAttr = $("#" + elemId).attr("class");
    var arrowDown = elemClassAttr.indexOf('down') >= 0;


    if (!arrowDown) {
        $("#" + elemId).addClass("fa-caret-square-o-down");
        $("#" + elemId).removeClass("fa-caret-square-o-up");

    } else {
        $("#" + elemId).removeClass("fa-caret-square-o-down");
        $("#" + elemId).addClass("fa-caret-square-o-up");
    }

}
function savePrefix(option) {
    var selection = option.value;
    var id = option.id;
    if (id == "prefixSelectPhoneNumber") {
        $.cookie("selected-val-phone-number", selection, {expires: 365, path: '/'});
    } else {
        $.cookie("selected-val-mobile", selection, {expires: 365, path: '/'});
    }

}

$(document).on("click","a.changeTransactionEmployee",function(){
	event.preventDefault();
	var depositId = $(this).attr('data-depositId');
	var tEmployeeId = $(this).attr('data-transactionEmployeeId');
	var tEmployee = $(this).attr('data-transactionEmployee');
	var edit_deposit_modal = bootbox.dialog({
                                 title: "Change Transaction Employee",
                                 message: '<div class="row">  ' +
                                          '<div class="col-md-12"> ' +
        								  '<form class="form-horizontal" id="transactionEmployee-form"> ' +
                                          '<div class="form-group"> ' +
                                          '<label class="col-md-4 control-label" for="depositId">Deposit ID</label> ' +
                                          '<div class="col-md-4"> ' +
                                          '<input id="depositId" name="depositId"  value="' + depositId + '"   class="form-control input-md" onfocus="this.blur()"> ' +
                                          '</div> ' +
                                          '</div> ' +
                                          '<div class="form-group"> ' +
                                          '<label class="col-md-4 control-label">Transaction Assigned To</label> ' +
                                          '<div class="col-md-5"> ' +
                                          '<input value="' + tEmployee + '"   class="form-control input-md" onfocus="this.blur()"> ' +
                                          '</div> ' +
                                          '</div> ' +
                                          '<div class="form-group"> ' +
                                          '<label class="col-md-4 control-label" for="transactionEmployee">Choose Employee</label> ' +
                                          '<div class="col-md-5"> ' +
                                          '<select id="transactionEmployee" name="transactionEmployee" class="js-example-tokenizer">' +
                                          '</select>' +
                                          '</div>' +
                                          '</div>' +
                                          '</form>' +
                                          '</div></div>',
                                 buttons: {
                                    success: {
                                        label: "OK",
                                        className: "btn-success",
                                        callback: function () {
                                        var url = window.location.href;
                                        var deposits = [{"depositId": depositId,"receptionEmployeeId": tEmployeeId}];
                                        var change_fields = {receptionEmployeeId: $('#transactionEmployee').val()};
                                        var post_data = {
                                          "deposits": JSON.stringify(deposits),
                                          "change_fields": JSON.stringify(change_fields),
                                          "url": window.location.href
                                        };

                                        apiRequest('editDeposit', post_data, '', function (data) {
                                           if(typeof data.deposit_error != 'undefined'){
                                           	   setTimeout(function(){ 
                                           	   	            bootbox.alert('<h4>'+data.deposit_error+'</h4>');
                                           	   	          },300);
                                           }
                                           else if (data == true) {
                                           	  displayToolTip('success', 'Transaction Employee', function () {
                                                        getCustomer(true);
                                              });
                                           
                                           } else
                                              displayToolTip('danger', 'Transaction Employee');

                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
            }
        }
    });
    $(edit_deposit_modal[0]).removeAttr('tabindex');
    $("#transactionEmployee").select2({width: "100%"});
    getEmployees(0);  
});

$(document).on("click", "a.assignEmployee", function () {
    event.preventDefault();
    var customers = [{customerId: $(this).attr("data-id"), employeeInChargeId: $(this).attr('data-employeeId')}];
    var assign_modal = bootbox.dialog({
        title: "Employee Assignment",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="employee-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="assignCustomers">Customer ID</label> ' +
        '<div class="col-md-4"> ' +
        '<input id="assignCustomers" name="assignCustomers"  value="' + $(this).attr("data-id") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="assignCustomerName">Customer Name</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="assignCustomerName" value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="currentEmployee">Current Employee</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="currentEmployee" value="' + $(this).attr("data-employee") + '" class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div>' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="assignDesk">Choose Desk</label> ' +
        '<div class="col-md-5"> ' +
        '<select id="assignDesk" name="desk"  class="form-control"><option value="0" >All</option></select>' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="assignEmployee">Choose Employee</label> ' +
        '<div class="col-md-5"> ' +
        '<select id="assignEmployee" name="assignEmployee" class="js-example-tokenizer">' +
        '</select>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var url = window.location.href;
                    var change_fields = {employeeInChargeId: $('#assignEmployee').val()};
                    var post_data = {
                        "customers": JSON.stringify(customers),
                        "change_fields": JSON.stringify(change_fields),
                        "url": window.location.href
                    };

                    apiRequest('editCustomer', post_data, '', function (data) {
                        if (data == true) {
                            bootbox.alert('<h4>The employee is changed</h4>', function () {
                                getCustomer(false);
                            });
                        } else
                            bootbox.alert("<h4>The employee is NOT changed</h4>");

                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    bootbox.alert("<h4>The employee is NOT changed</h4>");
                }
            }
        }
    });
    $(assign_modal[0]).removeAttr('tabindex'); // @Eli: necessary for focus to the search field of $("#changeEmployee") select2;
    $("#assignEmployee").select2({width: "100%"});
    getDesk($(this).attr('data-desk'));
    $('#assignDesk').change(function () {
        getEmployees($(this).val());
    });

});

function getDesk(desk) {
    apiRequest('getDesk', '', '#assignDesk', function (data) {
        $.each(data, function (key, value) {
            $('#assignDesk').append($('<option>', {value: data[key]["id"], text: data[key]["name"]}));
        });
        $('#assignDesk option').filter(function () {
            return $(this).text() == desk;
        }).attr('selected', true);
        getEmployees($('#assignDesk').val());
    });
}

function getEmployees(desk) {
    $('#assignEmployee').find('option').remove().end();
    
    var post_data = {desk: desk}; 
    apiRequest('getEmployeesShort', post_data, '', function (data) {
        $.each(data, function (key) {
            $('#assignEmployee,#transactionEmployee').append($('<option>', {
                id: 'employee_' + key,
                value: this.userId,
                text: this.userId + ' - ' + this.employeeName
            }));
        });
        data.length != 0 ? $('#s2id_assignEmployee .select2-chosen,#s2id_transactionEmployee .select2-chosen').text($('#employee_0').text()) 
                           : $('#s2id_assignEmployee .select2-chosen,#s2id_transactionEmployee .select2-chosen').text(''); // display first chosen employee;
    });

}

$(document).on("click", "a.addCommunication", function () {
	var dataId = $(this).attr("data-id");
	var lavarateId = $(this).attr("data-lavarateId");
	var accountLavarateId = $(this).attr("data-accountleverateId");
	
    var self = this;

    var modal_buttons = {};
    var vinci_modal_buttons = {};

    if (isConversion) {
        modal_buttons.answer = {
            label: "Answer",
            className: "btn-success",
            callback: function () {
                communicationSuccessCallBack('answer');
            }
        };
        modal_buttons.noAnswer = {
            label: "No Answer",
            className: "btn-danger",
            callback: function () {
                //	bootbox.alert('<h4>New Communication is NOT added</h4>');
                communicationSuccessCallBack('noAnswer');
            }
        };
    }
    
    modal_buttons.submit = {
        label: "Submit",
        className: "btn-secondary",
        callback: function () {
            communicationSuccessCallBack('submit');
        }
    };
    
	bootbox.dialog({
        title: "Add New Communication",
        message: '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="communication-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="customerId">Customer ID</label> ' +
        '<div class="col-md-8"> ' +
        '<input name="customerId"  value="' + $(this).attr("data-id") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="customerName">Customer Name</label> ' +
        '<div class="col-md-8"> ' +
        '<input value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        /*    '<div class="form-group"> ' +
         '<label class="col-md-4 control-label" for="type">Communication Type</label> ' +
         '<div class="col-md-8"> ' +
         '<select id="communicationtypes" name="type" class="form-control input-md"> ' +
         '</select>'+
         '</div> ' +
         '</div> ' +
         '<div class="form-group"> ' +
         '<label class="col-md-4 control-label" for="direction">Direction</label> ' +
         '<div class="col-md-8"> ' +
         '<select id="communicationdirections" name="direction" class="form-control input-md"> ' +
         '</select>'+
         '</div> ' +
         '</div> ' +
         '<div class="form-group"> ' +
         '<label class="col-md-4 control-label" for="category">Category</label> ' +
         '<div class="col-md-8"> ' +
         '<select id="communicationcategories" name="category" class="form-control input-md"> ' +
         '</select>'+
         '</div> ' +
         '</div> ' +
         '<div class="form-group"> ' +
         '<label class="col-md-4 control-label" for="status">Status</label> ' +
         '<div class="col-md-8"> ' +
         '<select id="communicationstatuses" name="status" class="form-control input-md"> ' +
         '</select>'+
         '</div> ' +
         '</div> ' + */
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="subject">Subject</label> ' +
        '<div class="col-md-8"> ' +
        '<input id="communicationSubject" name="subject"  placeholder="Insert Subject"   class="form-control input-md"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="body">Content</label> ' +
        '<div class="col-md-8"> ' +
        '<textarea id="communicationBody" name="body"  placeholder="Insert Content"  autocorrect="off" class="form-control input-md"> ' +
        '</textarea>' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="saleStatus">Sale Status</label> ' +
        '<div class="col-md-8"> ' +
        '<input type="hidden" name="oldSaleStatus" value="' + $(this).attr("data-saleStatus") + '"/>' +
        '<select id="saleStatus" name="saleStatus" class="form-control input-md"> ' +
        '<option value="new">new</option>' +
        '<option value="noAnswer">No Answer</option>' +
        '<option value="checkNumber">Check Number</option>' +
        '<option value="callAgain">Call Again</option>' +
        '<option value="inTheMoney">In The Money</option>' +
        '<option value="noCall">No Call</option>' +
        '<option value="notInterested">Not Interested</option>' +
        '<option value="reassign">Reassign</option>' +
        '</select>' +
        '</div> ' +
        '</div> ' +
        '</form>' +
        '</div>',
        buttons: modal_buttons

    });
    
    $('#saleStatus option[value="' + $(this).attr("data-saleStatus") + '"]').attr('selected', true);
//	getCommunicationParameters();

});

function communicationSuccessCallBack(callStatus) {
    var communicationSubject = ($('#communicationSubject').val()).trim();
    var communicationBody = ($('#communicationBody').val()).trim();
    $('#communicationSubject').val(communicationSubject);
    $('#communicationBody').val(communicationBody);

    if (communicationSubject == '') {
        setTimeout(function () {
            bootbox.alert('<h4>Please insert a communication subject</h4>');
        }, 500);
        return;
    }
    else if (communicationBody == '') {
        $('#communicationBody').val(' '); // @Eli: Micky requirement, user may submit an empty communication body; since spotApi does not accept, I send a whitespace string;
        // bootbox.alert('<h4>Please insert a communication content</h4>');
        //  return;	
    }

    var post_data = $('#communication-form').serialize();
    if (callStatus != 'submit') {
        post_data += '&callStatus=' + callStatus;
    }
    apiRequest('addNewCommunicationForCustomer', post_data, '', function (data) {
        if (data) {
            //	bootbox.alert('<h4>New Communication is added</h4>');
            setTimeout(function () {
                $('.tooltip').removeClass('tooltip-danger')
                    .addClass('tooltip-success')
                    .html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp; Communication added')
                    .animate({opacity: 1}, function () {
                        $(this).animate({opacity: 0}, 5000);
                    });
            }, 500);
            getCustomer(true);
        } else {
            //	bootbox.alert('<h4>Please try again. New Communication is NOT added</h4>');
            setTimeout(function () {
                $('.tooltip').removeClass('tooltip-success')
                    .addClass('tooltip-danger')
                    .html('<i class="fa fa-times" aria-hidden="true"></i>&nbsp; Communication NOT added')
                    .animate({opacity: 1}, function () {
                        $(this).animate({opacity: 0}, 5000);
                    });
            }, 500);
        }
    });
}

function getCommunicationParameters() {

    var select = {'types': 'phone', 'directions': 'outbound', 'categories': 'None', 'statuses': 'None'};

    apiRequest('getCommunicationParameters', '', '', function (data) {
        $.each(data, function (key) {
            $.each(data[key], function () {
                $('#communication' + key).append($('<option>', {
                    value: this.id,
                    text: this.value
                }));
            });
            $('#communication' + key + ' option').filter(function () {
                return $(this).text() == select[key];
            }).attr('selected', true);
        });
    });
}

$(document).on("click", "a.changePassword", function () {
    event.preventDefault();
    bootbox.dialog({
        title: "Change Password",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="password-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="passwordCustomer">Customer Name</label> ' +
        '<div class="col-md-5"> ' +
        '<input type="hidden" name="customerId" value="' + $(this).attr("data-id") + '">' +
        '<input id="passwordCustomer"  value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="password">New Password</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="password" name="password" class="form-control input-md"> ' +
        '</div> ' +
        '</div> ' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var reg = new RegExp(/^(?=.*\d)[\S]{6,13}$/);
                    var password = $('#password').val();
                    if (!reg.test(password)) {
                        setTimeout(function () {
                            bootbox.alert('<h4>Password should be between 6-13 characters and contain at least 1 digit without whitespace.</h4>');
                        }, 500);
                        return;
                    }
                    apiRequest('changePasswordForCustomer', $('#password-form').serialize(), '', function (data) {
                        if (data) {
                            setTimeout(function () {
                                $('.tooltip').removeClass('tooltip-danger')
                                    .addClass('tooltip-success')
                                    .html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp; Password changed')
                                    .animate({opacity: 1}, function () {
                                        $(this).animate({opacity: 0}, 5000);
                                    });
                            }, 500);
                            getCustomer(false);
                        } else {
                            setTimeout(function () {
                                $('.tooltip').removeClass('tooltip-success')
                                    .addClass('tooltip-danger')
                                    .html('<i class="fa fa-times" aria-hidden="true"></i>&nbsp; Password NOT changed')
                                    .animate({opacity: 1}, function () {
                                        $(this).animate({opacity: 0}, 5000);
                                    });
                            }, 500);
                        }


                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    setTimeout(function () {
                        $('.tooltip').removeClass('tooltip-success')
                            .addClass('tooltip-danger')
                            .html('<i class="fa fa-times" aria-hidden="true"></i>&nbsp; Password NOT changed')
                            .animate({opacity: 1}, function () {
                                $(this).animate({opacity: 0}, 5000);
                            });
                    }, 500);
                }
            }
        }
    });

});

$(document).on("click", "a.vip_group", function () {
    event.preventDefault();
    var customers = [{customerId: $(this).attr("data-id"), vipGroup: $(this).attr("data-vip")}];
    var vip_modal = bootbox.dialog({
        title: "VIP Group Change",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="vip-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="vipCustomer">Customer Name</label> ' +
        '<div class="col-md-4"> ' +
        '<input type="hidden" name="customerId" value="' + $(this).attr("data-id") + '">' +
        '<input id="vipCustomer"  value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="currentVIP">Current VIP Group</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="currentVIP" name="currentVIP" value="' + $(this).attr("data-vip") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="group">Change VIP Group</label> ' +
        '<div class="col-md-5"> ' +
        '<select class="form-control" id="group" name="group">' +
        '<option value="VIP">VIP</option>' +
        '<option value="Gold">Gold</option>' +
        '<option value="Silver">Silver</option>' +
        '<option value="Regular">Regular</option>' +
        '</select>' +
        '</div> ' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var url = window.location.href;
                    var change_fields = {vipGroup: $('#group').val()};
                    var post_data = {
                        "customers": JSON.stringify(customers),
                        "change_fields": JSON.stringify(change_fields),
                        "url": window.location.href
                    };

                    apiRequest('editCustomer', post_data, '', function (data) {
                        if (data == true) {
                            bootbox.alert('<h4>VIP Group is changed</h4>', function () {
                                getCustomer(false);
                            });
                        } else {
                            bootbox.alert("<h4>Please try again. VIP Group could NOT be changed</h4>");
                        }


                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    bootbox.alert("<h4>VIP Group is NOT changed</h4>");
                }
            }
        }
    });

});

$(document).on("click", "a.assignApproach", function () {
    event.preventDefault();
    var comment = $(this).attr('data-comment');
    var assign_modal_approach = bootbox.dialog({
        title: "Approach Assignment",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="approach-form"> ' +
        '<input type="hidden" id="approach_customerId" name="approach_customerId" value="">' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="assignDesk">Choose Approach Status</label> ' +
        '<div class="col-md-5"> ' +
        '<select id="assignApproach" name="approach"  class="form-control"></select>' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="comment">Comment</label> ' +
        '<div class="col-md-5"> ' +
        '<textarea rows="4" cols="50" class="col-md-12 form-control" maxlength="255" placeholder="Insert maximum 255 characters (Optional)" id="approachComment" name="approachComment"></textarea>' +
        '</div> ' +
        '</div> ' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {

                    $('#approach-form #approach_customerId').val($('#customerId').val());
                    apiRequest('setApproachs', $('#approach-form').serialize(), '', function (data) {
                        bootbox.alert("<h4>Succesfully Updated Approach</h4>", function () {
                            getCustomer(true);
                        });
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
                
            }
        }
    });

    $(assign_modal_approach[0]).removeAttr('tabindex');
    $('#approachComment').html(comment);
    $("#assignApproach").select2({width: "100%"})
                        .change(function(){
                        	$('#approachComment').html('');
                        });

    getApproachs($(this).data('id'));

});

$(document).on("click", "a.assignRiskStatus", function () {
    event.preventDefault();
    var customerId = $(this).attr('data-id');
    var assign_modal = bootbox.dialog({
                       title: "Set Risk Status",
                       message: '<div class="row">  ' +
                                '<div class="col-md-12"> ' +
                                '<form class="form-horizontal" id="risk-form"> ' +
                                '<input type="hidden" name="customerId" value="'+customerId+'">' +
                                '<div class="form-group"> ' +
                                '<label class="col-md-4 control-label" for="riskStatus">Choose Risk Status</label> ' +
                                '<div class="col-md-5"> ' +
                                '<select id="riskStatus" name="riskStatus"  class="form-control"></select>' +
                                '</div> ' +
                                '</div> ' +
                                '</form>' +
                                '</div></div>',
                       buttons: {
                       success: {
                         label: "OK",
                             className: "btn-success",
                             callback: function () {
                                  
                               apiRequest('setRiskStatus', $('#risk-form').serialize(), '', function (data) {
                                  if(data){
                                    displayToolTip('success','Risk Status');
                                    getCustomer(true);
                                 }else
                                    displayToolTip('danger','Risk Status'); 
                               });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
                
            }
        }
    });

    $(assign_modal[0]).removeAttr('tabindex');
    
    $("#riskStatus").select2({width: "100%"});

    apiRequest('getRiskStatus', '', '', function (data) {
    	var first = 0;
    	$.each(data, function (key) {
            $('#riskStatus').append($('<option>', {value: this.id, text: this.riskStatus}));
            if(!first) first = this.id;
        });
        $('#riskStatus').select2('val',first);
    });

});

$(document).on("click", "a.depositBonus", function () {
    event.preventDefault();
    var depositBonus_modal = bootbox.dialog({
        title: "Deposit Bonus",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="db-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="dbCustomerId">Customer ID</label> ' +
        '<div class="col-md-4"> ' +
        '<input id="dbCustomerId" name="customerId"  value="' + $(this).attr("data-id") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="dbCustomerName">Customer Name</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="dbCustomerName" value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="dbAmount">Bonus Amount</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="dbAmount" name="amount" class="form-control input-md"/>' +
        '</div> ' +
        '<label class="control-label" for="dbAmount"> ' + $(this).attr("data-currency") + '</label>' +
        '<input id="dbCurrency" name="currency"  value="' + $(this).attr("data-currency") + '"  type="hidden""> ' +
        '</div>' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="leverage">Leverage</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="leverage" name="leverage"  value="20" class="form-control input-md">' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="description">Description</label> ' +
        '<div class="col-md-5"> ' +
        '<textarea type="text"  id="description" name="description" placeholder="Write Description (Optional)" class="form-control">' +
        '</textarea>' +
        '</div>' +
        '</div>' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
                    var trim_amount = ($('#dbAmount').val()).trim();
                    var trim_leverage = ($('#leverage').val()).trim();
                    $('#dbAmount').val(trim_amount);
                    $('#leverage').val(trim_leverage);
                    if (!re.test($('#dbAmount').val())) { // check the input amount is a number with at most two decimal points
                        bootbox.alert('<h4>Insert a NUMBER with at most 2 decimals as Bonus Amount </h4>');
                        return;
                    } else if (!re.test($('#leverage').val())) { // check the input leverage is a number with at most two decimal points
                        bootbox.alert('<h4>Insert a NUMBER with at most 2 decimals as Leverage </h4>');
                        return;
                    } else {
                        ($('#description').val()).replace(/"/g, '\"');
                        apiRequest('addBonusDepositByEmployee', $('#db-form').serialize(), '', function (data) {

                            if (data)
                                bootbox.alert("<h4>Succesfull Bonus Deposit</h4>", function () {
                                    getCustomer(true);
                                });
                            else
                                bootbox.alert("<h4>Bonus Deposit could NOT be added</h4>");
                        });
                        console.log($('#db-form').serialize());
                    }

                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    bootbox.alert("<h4>Bonus Deposit is not added</h4>");
                }
            }
        }
    });

});

$(document).on("click", "a.withdrawalBonus", function () {
    event.preventDefault();
    var withdrawalBonus_modal = bootbox.dialog({
        title: "Withdrawal Bonus",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="wb-form"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="wbCustomerId">Customer ID</label> ' +
        '<div class="col-md-4"> ' +
        '<input id="wbCustomerId" name="customerId"  value="' + $(this).attr("data-id") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="wbCustomerName">Customer Name</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="wbCustomerName" value="' + $(this).attr("data-customer") + '"   class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="wbAmount">Bonus Amount</label> ' +
        '<div class="col-md-5"> ' +
        '<input id="wbAmount" name="amount" class="form-control input-md"/>' +
        '</div> ' +
        '<label class="control-label" for="wbAmount"> ' + $(this).attr("data-currency") + '</label>' +
        '</div>' +
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = new RegExp("^[0-9]+(\.[0-9]{1,2})?$");
                    var trim_amount = ($('#wbAmount').val()).trim();
                    $('#wbAmount').val(trim_amount);
                    if (!re.test($('#wbAmount').val())) { // check the input amount is a number with at most two decimal points
                        bootbox.alert('<h4>Insert a NUMBER with at most 2 decimals as Bonus Amount </h4>');
                        return;
                    } else {
                        apiRequest('addBonusWithdrawalSpotApi', $('#wb-form').serialize(), '', function (data) {
                            if (data)
                                bootbox.alert("<h4>Succesfull Bonus Withdrawal</h4>", function () {
                                    getCustomer(true);
                                });
                            else
                                bootbox.alert("<h4>Bonus Withdrawal could NOT be added</h4>");
                        });
                    }
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    bootbox.alert("<h4>Bonus Withdrawal is not added</h4>");
                }
            }
        }
    });

});

function displayToolTip(type, text, cbFunction) {
    setTimeout(function () {
        console.log($('.tooltip').css('opacity'));
        //  if($('.tooltip').css('opacity')!=0) $('.tooltip').css('opacity',0);
        $('.tooltip').stop(true, true)
            .attr('class', 'tooltip')
            .addClass('tooltip-' + type)
            .html('<i class="fa fa-' + (type == "success" ? 'check' : 'times') + '" aria-hidden="true"></i>&nbsp; ' + (text + (type == "success" ? '' : ' NOT')) + ' changed')
            .css({opacity: 1})
            .animate({opacity: 0}, 5000);
        if (cbFunction) cbFunction();
    }, 300);

}

function getUserDataCustomerCard() {
    apiRequestSync('getUserData', '', '', function (data) {
        isConversion = parseFloat(data.per_conversion);
        isVinci = parseFloat(data.per_vinci);
        isPlatformSwitch = parseFloat(data.per_platform_switch);
        isDepositChange = parseFloat(data.per_depositchange);
    });
}

function SafechargeIframe(form_oject, depositid, TPAccountId, amount, currency) {

    var openedWindow;
    apiRequest('SafeCharge', form_oject, '', function (data) {
        console.log(data.url);
        var opt = 'location=0,resizable=0,scrollbars=0,toolbar=0,menubar=0,height=700,width=900';
        openedWindow = window.open(data.url, 'safecharge_ch'+depositid, opt);

    });

    myObject = window.addEventListener('message', onMessage);

   /* if(openedWindow.closed && myObject == 'undefined'){
        console.log("closed by user onMessage", myObject);
    }*/

    console.log("onMessage ", myObject);
    function onMessage(event) {
        console.log("onMessage ", event.data);
        openedWindow.close();
        var request = event.data;

        request.depositid = depositid;
        delete request.cmd;
        apiRequest('SafeChargeUpdate', request, '', function (data) {
            console.log("SafeChargeUpdate ", data);
            if(data.success == 'success')
                updateVinciCustomerBalance(amount, TPAccountId, depositid, currency);
             else
                msgbox("Safecharge",data.msg, "Close");

        });

    }
}





