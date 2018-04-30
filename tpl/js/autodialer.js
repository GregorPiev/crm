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
  };

  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    for(var k in o)if(new RegExp("("+ k +")").test(format))
      format = format.replace(RegExp.$1,
        RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
    return format;
};

function selectRange(range) {

    if (!isNaN(range)) {

      var endDate = new Date();
      var startDate = new Date();

      startDate.setDate(startDate.getDate() - range);

      $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
      $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    } else {

      range = range.split('-');
      var endDate = new Date(range[1],range[0]-1,1);
      var startDate = new Date(range[1],range[0]-1,1);
      console.log(endDate);

      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
      $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    }
    
    getCustomersToCall();

}

function savePrefix(option) {
	var selection = option.value;
	$.cookie("selected-val-phone-number", selection, {expires: 365, path: '/'});
}

$(document).ready(function() {
	var globalData = "";
	var globalBynetAgentId = "";
	var globalSpotAgentId = "";
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
   
    $('#dpStart, #dpEnd').change(function(){
    	getCustomersToCall();
    });
    
    if ($.cookie('selected-val-phone-number')) {
        $('#prefixSelect').val($.cookie('selected-val-phone-number'));
    }
	
	getBynetAgentId();
	getRealUserSpotId();
    getCustomersToCall();
    
    getCallsStatusFromBynet();
});

function getCallsStatusFromBynet(){
	// fromDate "YYYY-DD-MM 00:00"
	params = {"campaignId": "0", "agentName": "", "fromDate": "2016-18-06 00:00", "toDate": ""};
	console.log('params', params);
	apiRequest('getCallsStatusFromBynet',params,null,function(data){
		getStatusFromBynet = JSON.parse(data['message']['result']);
		console.log('result of parse', getStatusFromBynet);
		for(var i=0,j=getStatusFromBynet.length; i<j; i++){
			console.log('accountNumber ', getStatusFromBynet[i]['accountNumber']);
			console.log('personalId ', getStatusFromBynet[i]['personalId']);
			console.log('status ', getStatusFromBynet[i]['status']);
			console.log('dial time ', getStatusFromBynet[i]['dialTime']);
			
			dialStatus = getDialStatus(getStatusFromBynet[i]['status']);
			
			if (dialStatus['spotStatus'] != '')
			{
				spotCallParams = {"id": getStatusFromBynet[i]['personalId'], "subject": 'Call from autodialer', "content": 'Call made by autodialer in '+getStatusFromBynet[i]['dialTime'], "salestatus": dialStatus['spotStatus']};
				//apiRequest('addCustomerCall', spotCallParams, null, function (data) {
					//console.log('data return in add customer call to spot', data);
		            //if (data) {
		            	
		            //}
		        //});
			}
			dialTimeNew = getStatusFromBynet[i]['dialTime'].replace('T', ' ');
			params = {"accountNumber": getStatusFromBynet[i]['accountNumber'], "callTime": dialTimeNew, "dialStatus": dialStatus['bynetStatus']};
			apiRequest('updateCallInDialAutoDialer',params,null,function(data){
				//console.log('updateCallInDialAutoDialer', data);
			});
		}
	});
}

function getDialStatus($dialStatus){
	var status = [];
	status['spotStatus'] = '';

	switch($dialStatus) {
	    case 'handled':
	        status['bynetStatus'] = 1;
	        status['spotStatus'] = '';
	        break;
	    case 'no_answer':
	        status['bynetStatus'] = 2;
	        status['spotStatus'] = 'noAnswer';
	        break;
	    case 'wrong_number':
	        status['bynetStatus'] = 3;
	        status['spotStatus'] = 'checkNumber';
	        break;
	    case 'busy':
	        status['bynetStatus'] = 4;
	        status['spotStatus'] = 'noCall';
	        break;
	    case 'fax':
	        status['bynetStatus'] = 5;
	        status['spotStatus'] = 'checkNumber';
	        break;
	    case 'answer_machine':
	        status['bynetStatus'] = 6;
	        status['spotStatus'] = 'checkNumber';
	        break;
	    case 'skipped_by_agent':
	        status['bynetStatus'] = 7;
	        status['spotStatus'] = 'noCall';
	        break;
	    case 'retry':
	        status['bynetStatus'] = 8;
	        break;
	    case 'in_queue':
	        status['bynetStatus'] = 9;
	        break;
	    case 'waiting':
	        status['bynetStatus'] = 10;
	        break;
	    case 'aborted':
	        status['bynetStatus'] = 11;
	        status['spotStatus'] = 'noCall';
	        break;
	    default:
	    	status['bynetStatus'] = 12;
	        break;
	}
	return status;
}

function getBynetAgentId(){
	apiRequest('getBynetAgentId',null,null,function(data){
    	globalBynetAgentId = data;
	});
}

function getRealUserSpotId(){
	apiRequest('getRealUserSpotId',null,null,function(data){
    	globalSpotAgentId = data;
	});
}

function insertNewCall($customerID){
	
	var return_data;
	params = {"agentID": globalSpotAgentId, "customerID": $customerID};
	apiRequestSync('insertNewCall',params,null,function(data){
		console.log('data insert new call', data);
		return_data = data;
		//return data;
	});
	return return_data;
}

function insertCallsToBynet(bynetDataCalls){
	params = {"bynetDataCalls": bynetDataCalls};
	apiRequest('insertCallsToBynet',params,null,function(data){
		
		console.log('data message ', data['message']);
		
		for(var i=0,j=data['message'].length; i<j; i++){
			return_data = data['message'][i];
			console.log('return data', return_data);
			var status = 0;
			var errorMsg = "";
			if (return_data['status'] == "OK")
			{
				status = 2;
			}else{
				status = 3;
				errorMsg = return_data['status'];
			}
			params = {"accountNumber": return_data['accountNumber'], "status": status, "rowID": return_data['C'], "errorMsg": errorMsg};
			//console.log('params ', params);
			apiRequest('updateCallInUploadAutoDialer',params,null,function(data){
				console.log('updateCallInUploadAutoDialer', data);
			});  
		};
	});
}

function sendToAutoDialer(){
	var bynetDataCalls = new Array;
	
	var prefix =  $('#prefixSelect').val();
	var callerID =  $('#callerIDSelect').val();
	var chooseCustomers = false;
	
	var phoneEndPrefix = '';
	if (prefix == '0*') {
        phoneEndPrefix = phoneEndPrefix + prefix + callerID;
    }else{
    	phoneEndPrefix = phoneEndPrefix + prefix;
    }
    
    globalData[0].chooseToCall=true;
    globalData[0].realCustomerID = 265765;
    globalData[0].PhoneNumber = 972544793007;
    globalData[0].href = 'http://dev-eyal-ns.ott-dev.tech/agenttools/customer_card/?id=265765';
    
    globalData[1].chooseToCall=true;
    globalData[1].realCustomerID = 427461;
    globalData[1].PhoneNumber = 972545493923;
    globalData[1].href = 'http://dev-eyal-ns.ott-dev.tech/agenttools/customer_card/?id=427461';
    
    globalData[2].chooseToCall=true;
    globalData[2].realCustomerID = 430076;
    globalData[2].PhoneNumber = '972545af493923';
    globalData[2].href = 'http://dev-eyal-ns.ott-dev.tech/agenttools/customer_card/?id=430076';
    
	for(var i=0,j=globalData.length; i<j; i++){
		if (globalData[i].chooseToCall)
		{
			chooseCustomers = true;
			var MobilePhone = "";
			if (globalData[i].MobileNumber != "")
			{
				MobilePhone = phoneEndPrefix+globalData[i].MobileNumber;
			}
			
			$raw_ID = 0;
			$raw_ID = insertNewCall(globalData[i].realCustomerID);
			console.log('raw id => '+$raw_ID);
			
			if ($raw_ID != 0 || !$raw_ID)
			{
				$dial_data = {
					'status' : '',
					'uniqueField' : '',
					'campaignId' : '',
					'agentName' : globalBynetAgentId,
					'overFlowAgent' : '',
					'dialTime' : '',
					'phone1' : phoneEndPrefix+globalData[i].PhoneNumber,
					'phone2' : MobilePhone,
					'phone3' : '',
					'personalId' : globalData[i].realCustomerID,
					'priority' : '',
					'returnFields': 'C',
					'A' : globalData[i].href,
					'B' : globalSpotAgentId,
					'C' : $raw_ID,
				};
				
				console.log('dial data json', $dial_data);
				bynetDataCalls.push($dial_data);
			}
		}
	}
	
	console.log('data in all calls to bynet', bynetDataCalls);
	
	if (chooseCustomers)
	{
		insertCallsToBynet(bynetDataCalls);
	}
}

function choosePhone(value){
	for(var i=0,j=globalData.length; i<j; i++){
		if (globalData[i].realCustomerID == value)
		{
			globalData[i].chooseToCall = !globalData[i].chooseToCall;
		}
	}
}

function getCustomersToCall(){
  apiRequest('getCustomerToCAll',$('#range-form').serialize(),'#autoDailer_table_holder',function(data){
      	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      	var href = '';
      for(var i=0,j=data.length; i<j; i++){
      		data[i].chooseToCall = false;
      		data[i].realCustomerID = data[i].id;
      		href = url + '/?id='+data[i].id;
		 	data[i].id = '<a href="'+href+'" >'+data[i].id+'</a>' ;
		 	data[i].customerName = '<a href="'+href+'" >'+data[i].customerName+'</a>' ;
		 	data[i].href = href;
		 	console.log('href', href);
		};
      
    $('#autoDailer_table').dataTable({
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
              },
              {"sExtends": "select","sButtonText": "Send calls to AutoDialer",
              	 "fnClick": function (nButton, oConfig, oFlash) {
                 	sendToAutoDialer();
                 }
              }
        ]
      },
      "bDestroy": true,
      "bLengthChange": true,
      "aaData": data,
      "aaSorting": [[ 0, "desc" ]],                    
      "aoColumns": [
      { "mData": "realCustomerID", "sTitle": "#", "mRender": function (data, type, row) {
                    return '<input type="checkbox" name="check1" onclick="choosePhone(' + data + ')">';
                }},
      { "mData": "id", "sTitle": "Customer Id" , "sType": "numeric"},
      { "mData": "customerName", "sTitle": "Customer Name"},
      { "mData": "PhoneNumber", "sTitle": "Phone Number"},
      { "mData": "MobileNumber", "sTitle": "Mobile Number"},
      { "mData": "firstDepositDate", "sTitle": "FDD", "sType": "date"},
      { "mData": "lastLoginDate", "sTitle": "Last Login", "sType": "date"},
      //{ "mData": "country", "sTitle": "Country"},
      //{ "mData": "amountUSD", "sTitle": "Amount (USD)"},
      //{ "mData": "currency", "sTitle": "Currency"},      
      //{ "mData": "employee", "sTitle": "Employee"},      
      
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
        $(".show").removeClass("show");
        $(".clear").addClass("show");
      }
    } );
    globalData = data;
  });
}
