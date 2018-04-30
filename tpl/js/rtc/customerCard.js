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

        console.log("%c Error JS:" + message,"font-size:12px;color:indigo");
    }

    return true;
};
var disable = false;

var isConversion;
var isPlatformSwitch;
var deskId;
var isDepositChange;
Date.prototype.format = function(format) //author: meizz
{
  
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }
  


  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}

$(document).ready(function () {    
    
    //getUserDataCustomerCard();
    var customerId ='';

    customerId =getUrlVars();
    var selfLocation, subselfLocation;
    if (customerId.id) {
        $('#customerId').val(customerId.id);
        $('#submit').attr("disabled", true);
        getCustomer(true,false,customerId.id,null);
    }
    
    $("#submit").click(function (e) {
        e.preventDefault();
        
        var id = $('#customerId').val();
        var email = $('#customerEmail').val();        
        var re = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
        
        if ((id != '' && email != '') || (id == '' && email == '')) {
            removeURL();
            msgbox('<i class="icon-warning-sign"></i> Oops!', "please fill customer id or customer email", "Close");
            $(this).attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        }else if(email == '' && !re.test(id)){  
            removeURL();
            msgbox('<i class="icon-warning-sign"></i> Oops!', "please fill valid customer id", "Close");
            $(this).attr("disabled", false);
            $('#customerId,#customerEmail').val('');
            $("#customerContent ").hide();
        } else {
            $(this).attr("disabled", true);
            getCustomer(true,false,id,email);
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
function removeURL() {
    url = window.location.href.replace(window.location.search, '');
    var obj = {};
    history.pushState(obj, 'page', url);
}

function escape(string){
	return string.replace(/&/g, "&amp;")
                 .replace(/</g, "&lt;")
                 .replace(/>/g, "&gt;")
                 .replace(/"/g, "&quot;")
                 .replace(/'/g, "&#039;");
}

function getCustomer(refreshAllPageData,flagTbl,idCust,emailCust) {
    $("#customerData").html('');
    if (refreshAllPageData) {       
        $("#Deposits , #DepositLog , #LoginLog , #Communications , #accountBalance , #Positions","#Bonuses_wrapper").html('');
        $("#accountBalance_wrapper ,#Deposits_wrapper,#DepositLog_wrapper, #Bonuses_wrapper,#Communications_wrapper,#Positions_wrapper").hide();
    }
    
    var param = {customerId:idCust,customerEmail:emailCust};    
     
    apiRequestBrand('getLeverateCustomer', param, '#customerData',true, capitalBrandName,function (data) {
                
                if (data.length==0) {
                    msgbox('<i class="icon-warning-sign"></i> Oops!', "wrong id or email", "Close");
                    $('#submit').attr("disabled", false);
                    $('#customerId,#customerEmail').val('');
                    $("#customerContent ").hide();
                }else if (data.hasOwnProperty('multiple email')) {  
                    showMultiplyResult(data['multiple email']);
                } else if (data == -1) {
                    msgbox('<i class="icon-warning-sign"></i> Access Denied!', "you are not authorised to see this customer card", "Close");
                    $('#submit').attr("disabled", false);
                    $('#customerId,#customerEmail').val('');
                    $("#customerContent ").hide();
                } else if (data[0].Id == 0 || data[0].Id == null) {
                    msgbox('<i class="icon-warning-sign"></i> Oops!', "wrong id or email", "Close");
                    $('#submit').attr("disabled", false);
                    $('#customerId,#customerEmail').val('');
                    $("#customerContent ").hide();
                } else {
                                var d = new Date();
                                var utcTime = d.getTime() + (d.getTimezoneOffset() * 60000);
                                var currencyDate=new Date(utcTime).format("yyyy-MM-dd");  	     
                                var base = 'https://openexchangerates.org/api';
                                var method = 'historical';
                                var date = currencyDate;
                                var keyRate = 'e658b8bd7566446eb9e141c0082b7ed6';
                                var api = base+'/'+method+'/'+date+'.json?app_id='+keyRate;
                                var rates = 0;

                                $.getJSON( api, function( dataRate ) {                                 
                                         rates = dataRate.rates;            
                                }).done(function(){
                                    changeURL(data[0]['Id']);
                                    var edit_permission = data[0].edit_permission;
                                    var edit_bonus = data[0].edit_bonus;
                                    var edit_assign = data[0].edit_assign;
                                    var edit_approach = data[0].edit_approach;
                                    var add_deposit = data[0].add_deposit;
                                    var isForbidden = data.isForbidden;
                                    var isComplience = data.isComplience;
                                    var deskId = data[0].DeskId;
                                    var custId = data[0]['Id'];


                                    Object.keys(data[0]).forEach(function (key) {

                                   /*     if (key == 'Email' || key == 'Phone_Number' || key == 'Mobile' || key == 'Communication_Email') {
                                            data[0][key] = '<b id="id_' + key + '" class="change_view">' + data[0][key] + '</b>';
                                       } */
                                        if (key == 'Turnover' || key == 'Account_Balance' || key == 'Total_Deposits' || key == 'Total_Withdrawals' || key == 'Total_Net_Credit' ||
                                            key == 'Total_Balance' || key == 'Total_Equity' || key == 'Total_Pnl' || key == 'Real_Pnl') {
                                            data[0][key] = parseFloat(data[0][key]).toLocaleString();
                                        }

                                        Key = key.replace(/_/g, " ");

                                        $("#customerContent").show();
                                        if (Key == 'First Name' || Key == 'Last Name' || Key == 'Email' || Key == 'Country Code' || Key == 'Area Code' || Key == 'Phone Number' || Key == 'Lead Status') {
                                            var editData = escape(data[0][key]);
                                            $("#customerData").append('' +
                                                '<div class="col-md-3"><div class="list-group">' +
                                                ' <div href="" class="list-group-item ">' +
                                                '<span><b>' + Key + ' </b>: ' + editData + '</span>&nbsp '+
                                                '<i class="fa fa-pencil-square-o edit" id="edit_'+key+'" data-editData = "'+editData+'" onclick="editCustomer(\'' + data[0]["Id"] + '\',\''+ key +'\')"></i> </div></div></div>');
                                        }                     
                                        else if (Key != 'edit permission' && Key != 'edit bonus' && Key != 'edit assign' && Key != 'edit approach' && Key != 'add deposit'
                                                 && Key != 'First Name' && Key != 'Last Name' && Key != 'Email' && Key != 'Phone Number' 
                                                 && Key != 'EmployeeId' && Key != 'DeskId' && Key != 'EmployeeId' && Key != 'DeskId' && Key != 'TPAccountId') {
                                            $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>' + Key + ' </b>: ' + data[0][key] + '</span> </div></div></div>');
                                        }

                                    });

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
                                    var tpAccountDetailsSum={
                                        totalDeposits:0,
                                        totalWithdrawals:0,
                                        totalNetCredit:0,                                        
                                        balance:0,
                                        equity:0,
                                        closedPNL:0,
                                        openPNL:0,
                                        pnl:0,
                                        realPNL:0,
                                        realAccountBalance:0,
                                        openPositions:0
                                        
                                    };
                                    Object.keys(data.tpAccountDetails).forEach(function (key) {
                                        $.each(data.tpAccountDetails[key],function(ind,val){                                                                 

                                            if($.inArray(ind,['tpAccount','updateTime','currency','openPositions'] ) == -1){
                                                
                                                tpAccountDetailsSum[ind] +=parseFloat(val/rates[data.tpAccountDetails[key]['currency']]);
                                                
                                            }else if(ind=='openPositions'){
                                            	tpAccountDetailsSum[ind] += parseFloat(val);
                                            }    
                                        });
                                    });
                                    
                                    Object.keys(tpAccountDetailsSum).forEach(function (keySum) {
                                        switch(keySum){
                                            case 'totalDeposits':
                                                var keySumName='Total Deposits';
                                                break;
                                            case 'totalWithdrawals':
                                                var keySumName='Total Withdrawals';
                                                break;
                                            case 'totalNetCredit':
                                                var keySumName='Total Net Credit';
                                                break;                                            
                                            case 'balance':
                                                var keySumName='Balance';
                                                break;
                                            case 'equity':
                                                var keySumName='Equity';
                                                break;
                                            case 'closedPNL':
                                                var keySumName='Closed PNL';
                                                break;
                                            case 'openPNL':
                                                var keySumName='Open PNL';
                                                break;
                                            case 'pnl':
                                                var keySumName='PNL';
                                                break;
                                            case 'realPNL':
                                                var keySumName='Real PNL';
                                                break;
                                            case 'realAccountBalance':
                                                var keySumName='Real Account Balance';
                                                break;
                                            case 'openPositions':
                                                var keySumName='Open Positions';
                                                break;           
                                        }
                                        if(keySum!='openPositions')
                                           $("#customerData").append('<div class="col-md-3"><div class="list-group">'+
                                                                     ' <div href="" class="list-group-item"><span><b>' + keySumName + ' </b>: ' + 
                                                                     tpAccountDetailsSum[keySum].toLocaleString('en-US', { minimumFractionDigits: 2,maximumFractionDigits: 2 }) + ' USD</span>'+
                                                                     (keySum=='totalNetCredit' && edit_bonus == 1 ?
                                                                     '<span>&nbsp;</span>'+
                                                                     '<a href="" data-id="' + data[0]["Id"] + '" data-type="Credit" class="btn btn-xs btn-success editCredit">Credit</a>'+
                                                                     '<span >&nbsp;</span>' +
                                                                     '<a href="" data-id="' + data[0]["Id"] + '" data-type="Debit" class="btn btn-xs btn-danger editCredit">Debit</a>'
                                                                      :
                                                                     '')+
                                                                     ' </div></div></div>');
                                         else
                                           $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>Open Positions</b>: ' + tpAccountDetailsSum[keySum].toLocaleString()+'</span> </div></div></div>');  
                                    });
                                    
                                    if (edit_assign == 1) {
                                        $("#customerData").append(
                                            '<div class="col-md-3">' +
                                            '<div class="list-group">' +
                                            '<div href="" class="list-group-item"><span><b>Assignment</b>:</span>' +
                                            '<a href="" data-id="' + data[0]["Id"] + '" data-customer="' + escape(data[0]["First_Name"]) + ' ' + escape(data[0]["Last_Name"]) + '" data-desk="' + data[0]["Desk"] + '" data-employee="' + data[0]["Employee"] + '" ' +
                                            'data-employeeId= "' + data[0]["EmployeeId"] + '" class="btn btn-xs btn-secondary pull-right assignEmployee">Assign</a>' +
                                            '</div></div></div>');
                                    }
                                    
                                     $("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>Communication</b>:</span>' +
                                        '<a href="" " data-id="' + data[0]["Id"] + '" data-customerName="' + escape(data[0]["First_Name"]) + ' ' + escape(data[0]["Last_Name"]) + '" data-leadStatus="' + data[0]["Lead_Status"] + '" class="btn btn-xs btn-secondary pull-right addCommunication" onclick="event.preventDefault();">Add</a>' +
                                        '</div></div></div>'+
                                        '<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>TP Accounts</b>:</span>' +
                                        '<a href="" class="btn btn-xs btn-secondary pull-right" onclick="event.preventDefault(); getTPAccounts(\''+data[0]["Id"]+'\',\'tpAccounts\')">View</a>' +
                                        '</div></div></div>');
                                    if(add_deposit == 1){
                                    	$("#customerData").append('<div class="col-md-3"><div class="list-group"> <div href="" class="list-group-item"><span><b>Deposit</b>:</span>' +
                                        '<a href="" class="btn btn-xs btn-secondary pull-right" onclick="event.preventDefault(); getTPAccounts(\''+data[0]["Id"]+'\',\'deposit\')">View</a>' +
                                        '</div></div></div>');
                                    }    
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
                                    getActiveTPAccounts(custId);
                                    getCustomerDeposits(custId);
                                    getCustomerBonuses(custId);
                                    getCustomerDepositLog(custId);
                                    getCustomerPositions(custId);
                                    getCustomerCommunications(custId);
                                    $("#accountBalance_wrapper ,#Deposits_wrapper,#DepositLog_wrapper,#Bonuses_wrapper,#Communications_wrapper,#Positions_wrapper").show();
                                }
                        
                                if(!flagTbl)
                                    ($('#customerId').val()!=='')?cleanInputBoxes(1):cleanInputBoxes(0);
                                else
                                    cleanInputBoxes(0);
                                    
                                }); 
                                
                        
                    //}); 

                                
                }
    });


}

function editCustomer(customerId,editField){
	var field = editField.replace(/_/g, " ");
	var editData = $('#edit_'+editField).attr('data-editData');
	var parameters = {'First Name': {'parameter':{'name':'FirstName','fieldName':'Lv_FirstName'},'node':{'tag':'input','maxlength':'100'}},
	                  'Last Name' : {'parameter':{'name':'LastName','fieldName':'Lv_LastName'},'node':{'tag':'input','maxlength':'100'}},
	                  'Email' :  {'parameter':{'name':'Email','fieldName':'EmailAddress1'},'node':{'tag':'input','maxlength':'100'}},
	                  'Country Code' : {'parameter':{'name':'PhoneCountryCode','fieldName':'Lv_Phone1CountryCode'},'node':{'tag':'input','maxlength':'30'}},
	                  'Area Code' : {'parameter':{'name':'PhoneAreaCode','fieldName':'Lv_Phone1AreaCode'},'node':{'tag':'input','maxlength':'30'}},
	                  'Phone Number' : {'parameter':{'name':'PhoneNumber','fieldName':'Lv_Phone1Phone'},'node':{'tag':'input','maxlength':'30'}},
	                  'Lead Status' : {'parameter':{'name':'LeadStatus','fieldName':'lv_leadstatus'},'node':{'tag':'select'}}
	                 };
	var form_data = '<form class="form-horizontal" id="editCustomer">' +
	                '<input type="hidden" name="customerId" value="' + customerId + '"/>' +
                    '<div class="form-group">' +
                    '<label class="col-md-4 control-label" style="font-size:16px">'+field+'</label> ' +
                    '<div class="col-md-6">';
    var node_id = parameters[field]['parameter']['name'];
    var node = parameters[field]['node'];
    var parameter = parameters[field]['parameter'];                
    if(node['tag'] == 'input'){
    	form_data += '<input type="text" class="form-control" id="'+node_id+'" placeholder="Insert '+field+'" maxlength="'+node['maxlength']+'" onblur="this.value = this.value.trim();"/>';
    }else{
    	form_data += '<select class="form-control" id="'+node_id+'"></select>';
    }                
    form_data += '</div></div>' +
                 '</form>'+
                 '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-8 col-sm-8 col-xs-8">' +                   
                 '<span id="'+node_id+'_error" style="color:red;"></span>'+
                 '</div>';
    bootbox.dialog({
        title: "Edit "+field,
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                	if(field == 'Email'){
                		var reEmail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
                		if(!reEmail.test($('#'+node_id).val())){
                			$('#'+node_id).addClass('red-border');
                			$('#'+node_id+'_error').html('Insert valid '+field);
                			return false;
                		}
                	}
                	if($('#'+node_id).val() == ''){
                		$('#'+node_id).addClass('red-border');
                		$('#'+node_id+'_error').html('Insert '+field);
                		return false;
                	}
                	var post_parameters = [{"name":parameter['name'],"fieldName":parameter['fieldName'],"value":$('#'+node_id).val()}];
                	if(field == 'Lead Status')
                	   post_parameters[0]['additionalAttributeType'] = 'Picklist';
                	post_data = {'customerId': customerId, 'params': JSON.stringify(post_parameters)};   
                	apiRequestBrand('editCustomer', post_data, '#customerData',true, capitalBrandName,function (data) {
                	      if(data.Code != undefined && data.Code == 'Success')
                            displayToolTip('success', field, 'changed',function(){
                            	getCustomer(false,false,customerId,null);
                            });   
                          else{
                            displayToolTip('danger', field,'changed'); 
                          }
                	});	   
                	
                }             
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
            }
        }
     });
     if(node['tag'] == 'select'){
     	var param = {'table':'AccountBase','field':parameters[field]['parameter']['fieldName']};
        apiRequestBrand('getStringData', param, '',true, capitalBrandName,function (data) {
        	$.each(data,function(key,value){
        		$('#'+node_id).append($('<option>',{value: value.id, text: value.value}));
        	});
        	$('#'+node_id+' option').filter(function(){ return $(this).text() == editData; }).prop('selected',true);
        });	
     }else{
     	$('#'+node_id).val(editData);
     }
     
     $('#'+node_id).off('keyup paste change').on('keyup paste change',function(e){
        	$(this).removeClass('red-border');
        	var selector = $(this).attr('id');
        	$('#'+selector+'_error').html('');    
     });
                                      
}

function getActiveTPAccounts(custId) {
    var param = "customerId="+custId;
    
    
    apiRequestBrand('getActiveTPAccounts', param, '#accountBalance',true, capitalBrandName,function (data) {
          
                var table = $('#accountBalance').dataTable({
                    "sDom": 'T<"clear">lfrtip',
                    "bDestroy": true,
                    "bLengthChange": true,
                    "bAutoWidth": false,
                    "aaData": data,
                    "aaSorting": [[0, "asc"]],
                    "aoColumns": [
                        {"mData": "tpAccount", "sTitle": "TP Account", "sType": "numeric"},
                        {"mData": "currency", "sTitle": "Currency"},
                        {"mData": "totalDeposits", "sTitle": "Total Deposit", "sType": "numeric"},                        
                        {"mData": "totalWithdrawals", "sTitle": "Total Withdrawals", "sType": "numeric"},
                        {"mData": "totalCredit", "sTitle": "Total Credit", "sType": "numeric"},
                        {"mData": "totalDebit", "sTitle": "Total Debit", "sType": "numeric"},
                        {"mData": "balance", "sTitle": "Balance", "sType": "numeric"},
                        {"mData": "equity", "sTitle": "Equity", "sType": "numeric"},
                        {"mData": "closedPNL", "sTitle": "Closed PNL"},                        
                        {"mData": "openPNL", "sTitle": "Open PNL"},                        
                        {"mData": "pnl", "sTitle": "PNL"},
                        {"mData": "realPNL", "sTitle": "Real PNL"},
                        {"mData": "realAccountBalance", "sTitle": "Real Account Balance"},
                        {"mData": "updateTime", "sTitle": "Update Time"}
                    ]
                });

    });
}

function getCustomerDeposits(custId) {
    var param = "customerId="+custId;
    
    
    apiRequestBrand('getCustomerDeposits', param, '#Deposits',true, capitalBrandName,function (data) {
         
        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + data[i].currency;
        }

        $('#Deposits').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[3, "desc"]],
            "aoColumns": [
                {"mData": "tpAccount", "sTitle": "Tpl Account","bVisible": false},
                {"mData": "transactionType", "sTitle": "Transaction Type"},
                {"mData": "methodOfPayment", "sTitle": "Method"},
                {"mData": "ApprovedOn", "sTitle": "Approved On"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
                {"mData": "transactionEmployee", "sTitle": "Transaction Employee",  "sClass": "columnX center",
                 "fnRender": function(oObj){
                 	var tEmployee = oObj.aData.transactionEmployee;
                 	if(isDepositChange)
                 	  return (tEmployee!='' ? tEmployee+'<br>' : '')+'<a class="btn btn-xs btn-blue changeTransactionEmployee" data-depositId="'+oObj.aData.id+'" data-transactionEmployeeId = "'+oObj.aData.receptionEmployeeId+'" data-transactionEmployee="'+tEmployee+'">Change</a>';
                 	else
                 	  return tEmployee;         
                 } 
                },
                {"mData": "createEmployee", "sTitle": "Process Employee","sClass": "columnX center"},
                {"mData": "is3D", "sTitle": "Id 3D"},
                {"mData": "processor", "sTitle": "Processor"}
            ],

        });

    });
}

function getCustomerDepositLog(custId) {
    var param = "customerId="+custId;
    
    apiRequestBrand('getCustomerDepositLog', param, '#DepositLog',true, capitalBrandName,function (data) {
        
        $('#DepositLog').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[0, "desc"]],
            "aoColumns": [
                {"mData": "date", "sTitle": "Date"},
                {"mData": "cardNum", "sTitle": "Card Number"},
                {"mData": "processor", "sTitle": "Processor"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "reason", "sTitle": "Reason", "sClass": "columnX"},
                {"mData": "ipAddress", "sTitle": "IP"}
            ],

        });

    });

}

function getCustomerBonuses(custId) {
    var param = "customerId="+custId;
    //console.info("%cParam:" + param,"color:green;");
    
    apiRequestBrand('getCustomerBonus', param, '#Bonuses',true, capitalBrandName,function (data) {
       //console.info("%cgetCustomerBonuses:" + JSON.stringify(data),"color:orange;"); 
        for (var i = 0, j = data.length; i < j; i++) {
            data[i].amount += ' ' + data[i].currency;
        }
        

        $('#Bonuses').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[10, "desc"]],
            "aoColumns": [
                {"mData": "tpAccount", "sTitle": "Tpp Account","bVisible": false},
                {"mData": "transactionType", "sTitle": "Transaction Type"},
                {"mData": "methodOfPayment", "sTitle": "Method"},                
                {"mData": "ApprovedOn", "sTitle": "Approved On"},                
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},                
                {"mData": "transactionEmployee", "sTitle": "Transaction Employee"},
                {"mData": "createEmployee", "sTitle": "Process Employee"}
            ],

        });

    });
}

function getCustomerCommunications(custId) {
    var param = "customerId="+custId;
    
    apiRequestBrand('getCustomerCommunications', param, '#Communications',true, capitalBrandName,function (data) {
        
        if (data)
            $('#submit').attr("disabled", false);

        $('#Communications').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[0, "desc"]],
            "aoColumns": [
                {"mData": "createDate", "sTitle": "createDate"},
                {"mData": "subject", "sTitle": "Subject", "sClass": "columnX"},
                {"mData": "noteText", "sTitle": "Content", "sClass": "columnX"},
                {"mData": "userName", "sTitle": "User"},
                {"mData": "OldLeadStatus", "sTitle": "Old Lead Status"},
                {"mData": "NewLeadStatus", "sTitle": "NewLeadStatus"}
            ],

        });

    });

}
function getCustomerPositions(custId) {
    var param = "customerId="+custId;
    //console.info("%cParam:" + param,"color:green;");
    
    apiRequestBrand('getCustomerPositions', param, '#Positions',true, capitalBrandName,function (data) {
    //console.info("%cGetCustomerPositions:" + JSON.stringify(data),"color:orange;"); 

        $('#Positions').dataTable({

            "sDom": 'T<"clear">lfrtip',
            "bDestroy": true,
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[2, "desc"]],
            "aoColumns": [
                {"mData": "platform_user_id", "sTitle": "TPAccount"},
                {"mData": "instrument", "sTitle": "Instrument"},                
                {"mData": "startDate", "sTitle": "Start Date"},
                {"mData": "endDate", "sTitle": "End Date"},
                {"mData": "open", "sTitle": "Open"},
                {"mData": "rate_opened", "sTitle": "Rate Opened", "sType": "numeric"},
                {"mData": "rate_closed", "sTitle": "Rate closed", "sType": "numeric"},
                {"mData": "amount", "sTitle": "Amount", "sType": "numeric"},
                {"mData": "pnl", "sTitle": "PNL", "sType": "numeric"},
                {"mData": "totalPnl", "sTitle": "Total PNL", "sType": "numeric"}
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
                    apiRequestBrand('editLocalEmail', id_json, '#customerData',true, capitalBrandName,function (data) {
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
                        apiRequestBrand('editLocalPhone', id_json, '#customerData',true, capitalBrandName,function (data) {
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
    apiRequestBrand('clickToCall', post, '#callBack',true, capitalBrandName,function (data) {

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
                        apiRequestBrand('editLocalMobile', id_json, '#customerData',true, capitalBrandName,function (data) {
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
                    apiRequestBrand('editSpotEmail', id_json, '#customerSpotData',true, capitalBrandName,function (data) {
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
                        apiRequestBrand('editSpotPhone', id_json, '#customerSpotData',true, capitalBrandName,function (data) {
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
                        apiRequestBrand('editSpotMobile', id_json, '#customerSpotData',true, capitalBrandName,function (data) {
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
                    apiRequestBrand('editCommunicationEmail', id_json, '#customerData',true, capitalBrandName,function (data) {
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

                                        apiRequestBrand('editDeposit', post_data, '',true, capitalBrandName,function (data) {
                                           if(typeof data.deposit_error != 'undefined'){
                                           	   setTimeout(function(){ 
                                           	   	            bootbox.alert('<h4>'+data.deposit_error+'</h4>');
                                           	   	          },300);
                                           }
                                           else if (data == true) {
                                           	  displayToolTip('success', 'Transaction Employee', function () {
                                                        getCustomer(true,false,tEmployeeId,null);
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
    var customerId = $(this).attr("data-id");
    console.log($(this).attr("data-id"));
    var assign_modal = bootbox.dialog({
        title: "Employee Assignment",
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="employee-form"> ' +
       /* '<div class="form-group"> ' +
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
        '</div> ' + */
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
                    var employeeId = $('#assignEmployee').val();
                    var employeeName = $('#assignEmployee option:selected').text();
                    var post_data = {
                        "customers": JSON.stringify([customerId]),
                        "employee": employeeId,
                        "leadStatus": JSON.stringify({"Value":"1","Name":"New"})
                    };

                    apiRequestBrand('changeOwnerForCustomers', post_data, '#customerData',true, capitalBrandName,function (data) {
                        
                        if(data.leverateApiError != undefined || data.totalCustomers != data.successfulRequests)
                            displayToolTip('danger', 'Employee','changed');
                        else{
                            displayToolTip('success', 'Employee', 'changed',function(){
                            	getCustomer(false,false,customerId,null);
                            }); 
                        }	                                  
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
            }
        }
    });
    $(assign_modal[0]).removeAttr('tabindex'); // @Eli: necessary for focus to the search field of $("#assignEmployee") select2;
    $("#assignEmployee").select2({width: "100%"});
    getDesk($(this).attr('data-desk'));
    $('#assignDesk').change(function () {
        getEmployees($(this).val());
    });

});

function getDesk(desk) {
    apiRequestBrand('getLeverateDesk', '', '#assignDesk',true, capitalBrandName,function (data) {
        $.each(data, function (key, value) {
            $('#assignDesk').append($('<option>', {value: data[key]["id"], text: data[key]["Name"]}));
        });
        $('#assignDesk option').filter(function () {
            return $(this).text() == desk;
        }).attr('selected', true);
        getEmployees($('#assignDesk').val());
    });
}

function getEmployees(desk) {
    $('#assignEmployee').find('option').remove();
    var post_data = {desk: desk, short: true}; 
    apiRequestBrand('getLeverateEmployees', post_data, '',true, capitalBrandName,function (data) {
        $.each(data, function (key) {
            $('#assignEmployee,#transactionEmployee').append($('<option>', {
                id: 'employee_' + key,
                value: this.userId,
                text: this.employeeName
            }));
        });
        data.length != 0 ? $('#s2id_assignEmployee .select2-chosen,#s2id_transactionEmployee .select2-chosen').text($('#employee_0').text()) 
                           : $('#s2id_assignEmployee .select2-chosen,#s2id_transactionEmployee .select2-chosen').text(''); // display first chosen employee;
    });

}

var prevValues =[];

$(document).on("click", "a.addCommunication", function () {
	var customerId = $(this).attr("data-id");
	var customerName = $(this).attr("data-customerName");
	var leadStatus = $(this).attr("data-leadStatus"); 
    var self = this;    
    var post_data;
    var template_id;
    prevValues[0]={'communicationTitle':'','communicationDescription':''};
    
    bootbox.dialog({
        title: "Add New Communication",
        message: '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="communication-form"> ' +
        '<input type="hidden" name="customer"  value="' + customerId + '"> ' +
         '<input type="hidden" name="templateId" id="templateId"  value="0"> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="customerName">Customer Name</label> ' +
        '<div class="col-md-8"> ' +
        '<input id="communicationCustomer" class="form-control input-md" onfocus="this.blur()"> ' +
        '</div> ' +
        '</div> ' +
        
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="template">Choose Template</label> ' +
        '<div class="col-md-8"> ' +
        '<select id="template" name="template" class="form-control input-md"> ' +
        '</select>' +
        '</div> ' +
        '</div> ' +
        
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="title">Title</label> ' +
        '<div class="col-md-8"> ' +
        '<input id="communicationTitle" name="title"  placeholder="Insert Title" maxlength="100"  class="form-control input-md communication" onblur="this.value = (this.value).trim();"> ' +
        '</div> ' +
        '</div> ' +
        '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-8 col-sm-8 col-xs-8">' +                   
        '<span id="communicationTitle_error" style="color:red;"></span>'+
        '</div>'+
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="description">Content</label> ' +
        '<div class="col-md-8"> ' +
        '<textarea id="communicationDescription" name="description"  placeholder="Insert Content" maxlength="300" autocorrect="off" class="form-control input-md communication" onblur="this.value = (this.value).trim();"></textarea>' +
        '</div> ' +
        '</div> ' +
        '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-8 col-sm-8 col-xs-8">' +                   
        '<span id="communicationDescription_error" style="color:red;"></span>'+
        '</div>'+
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="leadStatus">Lead Status</label> ' +
        '<div class="col-md-8"> ' +
        '<select id="leadStatus" name="leadStatus" class="form-control input-md"> ' +
        '</select>' +
        '</div> ' +
        '</div> ' +
        '</form>' +
        '</div>',
        buttons: {
        	submit: {
                label: "Submit",
                className: "btn-secondary confirmCommun",
                
                callback: function () {
                    var invalid = 0;
                    if($('#communicationTitle').val()==''){
                    	$('#communicationTitle_error').text('Insert Communication Title');
                    	$('#communicationTitle').addClass('red-border');
                    	invalid = 1;
                    }
                    if($('#communicationDescription').val()==''){
                    	$('#communicationDescription_error').text('Insert Communication Description');
                    	$('#communicationDescription').addClass('red-border');
                    	invalid = 1;
                    }
                    if(invalid)
                        return false;
                    
                    post_data = $('#communication-form').serialize();
                       
                    apiRequestBrand('addNewCommunication', post_data, '#customerData',true, capitalBrandName,function (data) {
                    	if(data.userError){
                    		bootbox.alert('<h4>'+data.userError+'</h4>');
                    		return;
                    	}else if(data.Code != undefined && data.Code == 'Success')
                            displayToolTip('success', 'Communication', 'added',function(){
                            	getCustomer(true,true,customerId,null);
                            });
                            
                        else{
                            displayToolTip('danger', 'Communication', 'added');  
                        }
                    });  
                }
            }        	
       }
    });
    $('#communicationCustomer').val(customerName);
    $(".confirmCommun").attr("disabled",true);
    getLeadStatus(leadStatus);
    getTemplateValues();
    
    
    $('.communication').off('keyup paste change cut').on('keyup paste change cut',function(e){
        	$(this).removeClass('red-border');
        	var selector = $(this).attr('id');
        	$('#'+selector+'_error').html('');
        	var that = this;
        	setTimeout(function () {
                prevValues[$("#template").find(':selected').attr('data-id')][selector] = $(that).val();
             }, 100);    
    });
    
    $("#template").change(function(){
        $('.communication').trigger('change');
        populateValues('template');
    });
    
    $("#leadStatus").change(function(){
        $('.communication').trigger('change');
        populateValues('leadStatusSelect');
    });
         
});


function getLeadStatus(leadStatus){
	var param ="table=AccountBase&field=lv_leadstatus";
    apiRequestBrand('getStringData',param,'#leadStatus',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#leadStatus').append($('<option>',{value: value.id, text: value.value}));
		});
		$('#leadStatus option[value="' + leadStatus + '"]').attr('selected', true);		
    });
}

function getTemplateValues(){
     apiRequestBrand('getTemplateList', '', '#template',true, capitalBrandName,function (data) {         
         var option_first = $('<option>',{value: 0, text: 'Blank'});
         option_first.attr('data-id','0');
         option_first.attr('data-title','');
         option_first.attr('data-content','');
         option_first.attr('data-lead-status','');
                
         $('#template').append(option_first);                   
         $.each(data, function (ind, value) {
           var option_cur_app = $('<option>',{value: value.Name, text: value.Name});
           option_cur_app.attr('data-id',value.id);
           option_cur_app.attr('data-title',value.Name);
           option_cur_app.attr('data-content',value.NoteText);
           option_cur_app.attr('data-lead-status',value.LeadStatus);
           $('#template').append(option_cur_app);            
            prevValues[value.id]={'communicationTitle':value.Name,'communicationDescription':value.NoteText};
         });
         $("#templateId").val(0);
         populateValues('template'); 
         $(".confirmCommun").attr("disabled",false);
     });
}


function populateValues(source){ 
    var leadStatus;
    var selLeadStatus;    
    var flag;
    if(source=="template"){ 
        leadStatus = $("#template").find(":selected").attr("data-lead-status");       
         $("#leadStatus option[value='"+leadStatus+"'").prop("selected",true);        
         $("#communicationTitle").val(prevValues[$("#template").find(':selected').attr('data-id')].communicationTitle);
         $("#communicationDescription").val(prevValues[$("#template").find(':selected').attr('data-id')].communicationDescription);        
     }else{
         selLeadStatus = $("#leadStatus").find(":selected").val();         
         $("#template option[data-lead-status='"+selLeadStatus+"'").prop("selected",true);
         $("#communicationTitle").val(prevValues[$("#template").find(':selected').attr('data-id')].communicationTitle);
         $("#communicationDescription").val(prevValues[$("#template").find(':selected').attr('data-id')].communicationDescription);
     }
      $("#templateId").val($("#template").find(":selected").attr("data-id"));
    
      if($("#template").val()!=0){
          $('#communicationTitle').attr('onfocus','blur()');          
      }else{
          $('#communicationTitle').removeAttr('onfocus');         
      }
                
      leadStatus = $("#template").find(":selected").attr("data-lead-status");
      selLeadStatus = $("#leadStatus").find(":selected").val();
              
              if(leadStatus==selLeadStatus){                
                  $(".confirmCommun").attr("disabled",false);                           
              }else{
                  flag=0;
                  $("#template option").each(function(){                      
                        if($(this).attr("data-lead-status")==selLeadStatus){
                            flag =1;
                        } 
                   });
                   
                   $("#leadStatus option").each(function(){                      
                        if($(this).val()==leadStatus){
                            flag =1;
                        } 
                   });
                   
                   if(flag==1){
                       $(".confirmCommun").attr("disabled",true);
                   }else{
                       $(".confirmCommun").attr("disabled",false);
                   }
                  
              }
}

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
    apiRequestBrand('addNewCommunicationForCustomer', post_data, '',true, capitalBrandName,function (data) {
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
            getCustomer(true,false,$('#customerId').val(),null);
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

    apiRequestBrand('getCommunicationParameters', '', '',true, capitalBrandName,function (data) {
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

function getTPAccounts(customerId,type){
	var title = type == 'tpAccounts' ? 'TP Accounts' : 'Deposit';
	var tpModal = bootbox.dialog({
                  title: title,
                  message:  
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="tp_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="tp_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'          
                   
    });
    
    $(tpModal[0]).attr('id','tpModal');
    var post_data = 'customerId='+customerId;
    apiRequestBrand('getTPAccounts', post_data , '#tp_table_holder',true,capitalBrandName, function (data) {
    	 $('#tp_table').dataTable( {
             "sDom": 'T<"clear">lfrtip',
             "oTableTools": {
             "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
            "aButtons": [				
				      {
					       "sExtends": "pdf",
					       "sButtonText": "Save as PDF"
				      },
				      {
					       "sExtends": "xls",
					       "sButtonText": "Save for Excel"
				      }                
            ]
        },
           "bDestroy": true,
           "bFilter": true,
           "bLengthChange": true,
           "bAutoWidth":false,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "tpId", "sTitle": "TP ID", "bUseRendered":false,
              "fnRender": function (oObj) {

                    if(type !== 'deposit')
                       return oObj.aData.tpId;
                    return '<a href="#" data-guid="'+oObj.aData.tpGUID+'" data-id="'+oObj.aData.tpId+'" class="addDeposit">'+oObj.aData.tpId+'</a>';
              }
            },
            { "mData": "tradingPlatform", "sTitle": "Trading Platform"},
            { "mData": "mainTP", "sTitle": "Main TPAccount"}
           ]
            
            });
    });
}

$(document).on("click", "a.addDeposit", function () {
    event.preventDefault();
    var tpId= $(this).attr('data-id');
    var tpGuid = $(this).attr('data-guid');
    $('#tpModal .close').click();
    setTimeout(function(){
    	var depositModal = bootbox.dialog({
                             title: "Deposit For TP Account "+tpId,
                             message: '<div class="row">  ' +
                                      '<div class="col-md-12"> ' +
                                      '<iframe height="680" width="750" frameborder="0" src="https://www.rtcfinance.com/deposit/inapp_deposit.php?tp_name='+tpGuid+'">'+
                                      '</iframe>'+
                                      '</div></div>',
                             closeButton: false,         
                             buttons: {
                                success: {
                                  label: "Close",
                                  className: "btn-danger",
                                  callback: function () {
                                      getCustomer(true,false,$('#customerId').val(),null);    	
                                  }
                                 } 
                   }         
          });
          depositModal=depositModal[0];
	      $(depositModal.getElementsByClassName('modal-dialog')).addClass('modal-large');
    }, 300);
});    

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
                    apiRequestBrand('changePasswordForCustomer', $('#password-form').serialize(), '',true,capitalBrandName, function (data) {
                        if (data) {
                            setTimeout(function () {
                                $('.tooltip').removeClass('tooltip-danger')
                                    .addClass('tooltip-success')
                                    .html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp; Password changed')
                                    .animate({opacity: 1}, function () {
                                        $(this).animate({opacity: 0}, 5000);
                                    });
                            }, 500);
                            getCustomer(false,false,$('#customerId').val(),null);
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
                    apiRequestBrand('setApproachs', $('#approach-form').serialize(), '',true, capitalBrandName,function (data) {
                        bootbox.alert("<h4>Succesfully Updated Approach</h4>", function () {
                            getCustomer(true,false,$('#customerId').val(),null);
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

$(document).on("click", "a.editCredit", function () {
    event.preventDefault();
    var customerId = $(this).attr('data-id');
    var type = $(this).attr('data-type');
    
    apiRequestBrand('getTPAccounts', 'customerId='+customerId, '#customerData',true, capitalBrandName,function (tpAccounts) {
    
    if(tpAccounts.length == 0){
    	bootbox.alert('<h4>This customer does not have TP Accounts</h4>');
    	return false;
    }	
    
    var editCredit = bootbox.dialog({
        title: "Add "+type,
        message: '<div class="row">  ' +
        '<div class="col-md-12"> ' +
        '<form class="form-horizontal" id="editCredit-form"> ' +
        '<input type="hidden" name="type" value="'+type+'">' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="tpAccountGUID">Choose TP Account</label> ' +
        '<div class="col-md-5"> ' +
        '<select id="creditTpAccount" name="tpAccountGUID"  class="form-control"></select>' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="creditCurrency">Currency</label> ' +
        '<div class="col-md-5"> ' +
        '<input class="form-control input-md" onfocus="this.blur();" id="creditCurrency">' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="netCredit">Net Credit</label> ' +
        '<div class="col-md-5"> ' +
        '<input class="form-control input-md" onfocus="this.blur();" id="netCredit">' +
        '</div> ' +
        '</div> ' +
        '<div class="form-group"> ' +
        '<label class="col-md-4 control-label" for="creditAmount">'+type+' Amount</label> ' +
        '<div class="col-md-5"> ' +
        '<input class="form-control input-md" id="creditAmount" name="amount" placeholder="Insert Amount">' +
        '</div> ' +
        '</div> ' +
        '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
        '<span id="creditAmount_error" style="color:red;"></span>'+
        '</div>'+
        '</form>' +
        '</div></div>',
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var re = new RegExp(/^((([1-9][0-9]*))+(\.[0-9]{1,2})?|0\.[0-9]{1,2})$/);
                    var creditAmount = $('#creditAmount').val();
                    if (!re.test(creditAmount) || creditAmount == '' || parseFloat(creditAmount) <= 0){
                    	$('#creditAmount_error').html('Insert a positive NUMBER with at most 2 decimals');
                    	$('#creditAmount').addClass('red-border');
                    	return false;
                    }
                    apiRequestBrand('editCredit', $('#editCredit-form').serialize(), '#customerData',true, capitalBrandName,function (data) {
                        if(data.Code != undefined && data.Code == 'Success')
                            displayToolTip('success', type, 'added',function(){
                            	setTimeout(function(){
                            	  getCustomer(true,false,customerId,null);
                            	},
                            	500);
                            });   
                          else{
                            displayToolTip('danger', type,'added'); 
                          }
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
                
            }
        }
    });
    
    
     $.each(tpAccounts,function(key,value){
        		$('#creditTpAccount').append($('<option>',{value: value.tpGUID, text: value.tpId}));
        		if(value.mainTP=='Yes')
        		   $('#creditTpAccount option[value="'+value.tpGUID+'"]').prop('selected',true);
     });
     getTpAccountNetCredit($('#creditTpAccount').val());
     $('#creditTpAccount').change(function(){
    	getTpAccountNetCredit($(this).val());
     });
    
     $('#creditAmount').off('keyup paste cut change').on('keyup paste cut change',function(e){
        	$(this).removeClass('red-border');
        	var selector = $(this).attr('id');
        	$('#'+selector+'_error').html('');    
     });
    
    });
    
    
});

function getTpAccountNetCredit(tpAccountGUID){
	var post_data = 'tpAccountGUID='+tpAccountGUID;
	apiRequestBrand('getTpAccountNetCredit', post_data, '',true, capitalBrandName,function (data) {
		 $('#creditCurrency').val(data[0]['currency']);
		 $('#netCredit').val(data[0]['totalNetCredit']);
	});
}

    
function displayToolTip(type,text,action,cbFunction){
	setTimeout(function(){
		         
		         $('.tooltip').stop( true, true )
		         .attr('class','tooltip')
                 .addClass('tooltip-'+type)
                 .html('<i class="fa fa-'+(type=="success" ? 'check' : 'times')+'" aria-hidden="true"></i>&nbsp; '+(text+(type=="success" ? ' ': ' NOT '))+action)
                 .css({opacity:1})
                 .animate({opacity:0},5000);
                 if(cbFunction) cbFunction();  
                },300);
    
}

function showMultiplyResult(dataSet) {
    
    removeURL();    
    hideAllBloks();
    
    var form_data = '<div class="portlet-content" id="multiCustomer">'+
                     '<div class="table-responsive">'+
                      '<table class="table table-striped table-bordered table-hover table-highlight" style="table-layout: fixed"'+
                          'data-display-rows="10"'+
                          'data-info="true"'+
                          'data-search="true"'+
                          'data-length-change="true"'+
                          'data-paginate="true"'+
                          'id="multiCustomerRow">';
    form_data +='<colgroup><col style="width:45%"><col style="width:40%"><col style="width:15%"></colgroup>  ';
          form_data += '</table>'+
                      '</div>'+
                    '</div>';
            
               

    bootbox.dialog({
        title: "Choose Customer",
        message: form_data,
        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var customerId = $('input[name=customerChoosed]:checked').val();
                    //console.info("%cCustomerId:" + customerId,"color:fuchsia;font-size:14px;");                    
                    getCustomer(true,true,customerId,null);
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                    $('#submit').attr("disabled", false);
                    $('#customerId,#customerEmail').val('');
                    $("#customerContent").hide();
                }
            }
        }

    }); 
    var choosItem =0;
     $('#multiCustomerRow').dataTable({
                    "sDom": 'T<"clear">lfrtip',
                    "bDestroy": true,
                    "bLengthChange": true,
                    "aaData": dataSet,
                    "aaSorting": [[0, "asc"]],
                    "aoColumns": [
                        {"mData": "AccountId", "sTitle": "CUSTOMER ID"},
                        {"mData": "Name", "sTitle": "CUSTOMER NAME","bSortable" : false},
                        {"mData": null, "sTitle": "Choose","bSortable" : false,"sClass": "columnX center",
                            "fnRender": function(oObj){
                                 return '<input name="customerChoosed" data-row="'+oObj.iDataRow+'" type="radio" value="'+oObj.aData.AccountId+'">';       
                            }
                        }
                    ],
                        "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                            //console.info("%caiDisplay[0]:" + aiDisplay[0],"color:blue;");
                            //console.info("%caiDisplay:" + aiDisplay,"color:green;");
                             choosItem = aiDisplay[0];
                        }

                });
                //console.info("%cchoosItem:" + choosItem,"color:blue;");
                $("input:radio[data-row='"+choosItem+"']").attr('checked', 'checked');
}

function cleanInputBoxes(flag){
    (flag===1)?($('#customerEmail').val('')):($('#customerId').val(''));
}
function hideAllBloks(){
    $("div[id=customerContent]").css('display', 'none');
    $("div[name=customerBlockBalance]").css('display', 'none');
    $("div[name=customerBlockDeposit]").css('display', 'none');
    $("div[name=customerBlockBonuses]").css('display', 'none');
    $("div[name=customerBlockCommunication]").css('display', 'none');
    $("div[name=customerBlockCalls]").css('display', 'none');
    $("div[name=customerBlockDepositLog]").css('display', 'none');
    $("div[name=customerBlockCC]").css('display', 'none');
    $("div[name=customerBlockLoginLog]").css('display', 'none');
    $("div[name=customerBlockPosition]").css('display', 'none');
}