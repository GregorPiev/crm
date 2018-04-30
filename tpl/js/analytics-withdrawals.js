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

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
  
    $('#wEnd').val(endDate.format("yyyy-MM-dd"));
    $('#wStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#wEnd').val(endDate.format("yyyy-MM-dd"));
  $('#wStart').val(startDate.format("yyyy-MM-dd"));
    
  } 
  getRetentionWithdrawals();
  
}

function save_dt_view (oSettings, oData,type) {
  localStorage.setItem( 'DataTables_'+type+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings,type) {
  return JSON.parse( localStorage.getItem('DataTables_'+type+window.location.pathname) );
}
function reset_dt_view(type) {
  localStorage.removeItem('DataTables_'+type+window.location.pathname);
}

var withdrawal_data=[];

$(document).ready(function(){
  reset_dt_view('withdrawal'); //reset state for withdrawal table
  reset_dt_view('onhold'); //reset state for onhold table	
  var day=new Date().getDate();
  var month=new Date().getMonth();
  var year=new Date().getFullYear();
  $('#wStart').val(new Date(year,month,1).format('yyyy-MM-dd'));
  $('#wEnd').val(new Date().format('yyyy-MM-dd'));
  $('#wStart,#wEnd').datepicker();	
  getDesk(); 
  $('#wStart,#wEnd,#desk').change(function(){
  	getRetentionWithdrawals();
  });

});

$(document).on("click","a.getPenalty",function(){
	event.preventDefault();
	var employee=$(this).attr('data-employeeId');
	getPenalty(employee);
});

$(document).on("click","a.addPenalty",function(){
	event.preventDefault();
	if($(this).attr('data-isAdded')==1){
		bootbox.alert('<h4>This Withdrawal is already added</h4>');
		return;
	}
	var withdrawalId=$(this).attr("data-id");
	var penaltyDate=$(this).attr("data-date");
	var penaltyEmployeeName=$(this).attr("data-employeeName");
	var penaltyEmployee=$(this).attr("data-employeeId");
	var penaltyCurrency=$(this).attr("data-currency");
	var penaltyAmount=$(this).attr("data-amount");
	var penaltyType=$(this).attr("data-type");
	var customerId=$(this).attr("data-customerId");
	bootbox.dialog({
        title: "Add Withdrawal",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="penalty-form"> ' +
                    '<input type="hidden" id="withdrawalId" name="withdrawalId" value="'+withdrawalId+'"/>'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyDate">Date</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input type="text" id="penaltyDate" name="penaltyDate" value="'+penaltyDate+'" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyEmployeeName">Employee</label>' +
                    '<div class="col-md-5"> ' +
                    '<input type="text" id="penaltyEmployeeName" name="penaltyEmployeeName" value="'+penaltyEmployeeName+'" class="form-control" onfocus="this.blur();">' +
                    '<input type="hidden" id="penaltyEmployee" name="penaltyEmployee" value="'+penaltyEmployee+'" class="form-control">' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyCurrency">Currency</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="penaltyCurrency" name="penaltyCurrency" value="'+penaltyCurrency+'" class="form-control" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyAmount">Amount</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="penaltyAmount" name="penaltyAmount" placeholder="Insert Amount" value="'+penaltyAmount+'" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyType">Transaction Type</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="penaltyType" name="penaltyType" value="'+penaltyType+'" class="form-control" onfocus="this.blur();">' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +                    
                    '<label class="col-md-4 control-label" for="reason">Reason</label> ' +
                    '<div class="col-md-5"> ' +
                    '<textarea type="text"  id="reason" name="reason" placeholder="Write Reason (Optional)" class="form-control">' +
                    'CID: '+customerId+' withdrawal'+ 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                     '$("#penaltyDate").datepicker(); '+ 
                     '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addPenaltyTable(penaltyEmployee);
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }
    }});
});

$(document).on("click","a.deletePenalty",function(){
	event.preventDefault();
	var id=$(this).attr('data-id');
	var retentionWithdrawalId=$(this).attr('data-retentionWithdrawalId');
	var employee=$(this).attr('data-employee');
	var post_data="id="+id+"&retentionWithdrawalId="+retentionWithdrawalId;
	apiRequest('deletePenalty',post_data,$('#penalty_table_holder'),function(){
		getPenalty(employee);
		getAgentWithdrawalsForEmployee(employee,false);
		getOnHoldTable();
    }); 
	
});	

$(document).on("click","a.getWithdrawalsForCustomer",function(){
   	var customerId=$(this).attr('data-customerId');
   	post_data=$('#range-form').serialize()+'&customerId='+customerId;
   	apiRequest('getRetentionWithdrawals',post_data,$('#withdrawals_table_holder'),function(data){
   		$('#withdrawals_table').dataTable( {
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
           'iDisplayLength': 10,
           "scrollCollapse": false,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "confirmTime", "sTitle": "Date", "sType": "date"},
            { "mData": "id", "sTitle": "#", "sType": "numeric"},
            { "mData": "customerId", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "AmountUSD", "sType": "numeric"},
            { "mData": "paymentMethod", "sTitle": "Payment Method"},
            { "mData": "clearedBy", "sTitle": "Cleared By"}
            ]
	   });
   	});
});

$(document).on("click","a.addWithdrawals",function(){
	event.preventDefault();
	var customerId=$(this).attr("data-customerId");
	var customerName=$(this).attr("data-customerName");
	var amount=$(this).attr("data-amount");
	var currency=$(this).attr("data-currency");
	var month=new Date($('#wEnd').val()).format('yyyy-MM');
	var bootbox_body='<div class="row">'+
	                 '<div class="col-md-8>"'+
	                 '<form>'+
	                 '<div class="col-md-1">'+
	                 '<h4>Customer ID</h4>'+
	                 '<input id="customerId" name="customerId" class="form-control" value="'+customerId+'" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h4>Customer Name</h4>'+
	                 '<input id="customerName" name="customerName" class="form-control" value="'+customerName+'" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '<div class="col-md-1">'+
	                 '<h4>Currency</h4>'+
	                 '<input id="currency" name="currency" class="form-control" value="'+currency+'" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h4>Withdrawal</h4>'+
	                 '<input id="amount" name="amount" class="form-control" value="'+amount+'" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '<div class="col-md-1">'+
	                 '<h4>Month</h4>'+
	                 '<input id="month" name="month" class="form-control" value="'+month+'" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '</form>'+
	                 '</div>'+
	                 '<div class="col-md-12"><h4></h4></div>'+
	                 '<div class="col-md-6">'+
	                 '<div class="portlet" id="transactions_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Transactions</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="transactions_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-6 -->'+
	                 '<div class="col-md-6">'+
	                 '<div class="portlet">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Set Withdrawals</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div id="set_withdrawal_div" style="display:none" >'+
	                 '<form id="setWithdrawal-form">'+
	                 '<div class="col-md-4">'+
	                 '<h5>Employee</h5>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h5>Date</h5>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h5>Amount</h5>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h5>Type</h5>'+
	                 '</div>'+
	                 '<div class="col-md-2"></div>'+
	                 '<div id="withdrawal_rows"></div>'+
	                 '<div class="col-md-10"></div>'+
	                 '<div class="col-md-2"><a href="" class="btn btn-secondary" onclick="event.preventDefault(); addRetentionWithdrawals(); return false;">Set Withdrawals</a></div>'+
	                 '</form>'+
	                 '</div><!-- set_withdrawal_div '+
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+   
	                 '<div class="col-md-5"><h4></h4></div>'+
	                 '<div class="portlet" id="agentWithdrawals_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Withdrawals</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<a href="" class="btn btn-danger" onclick="event.preventDefault(); deleteAgentWithdrawals(); return false;">Delete</a>'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="agentWithdrawals_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-5 -->'+
	                 '</div>'+
	                 '<script>getRealTransactionsForWithdrawals();</script>';
	var withdrawal_bootbox=bootbox.dialog({
		title: 'Add Withdrawal',
		message: bootbox_body,
		closeButton: false,
		buttons:{
		success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
         	getRetentionWithdrawals();	
		}}}
	});
	$(withdrawal_bootbox[0]).attr('id','withdrawal_bootbox');
	$('#withdrawal_bootbox .modal-dialog').addClass('modal-xlarge');
	for(var i=1;i<=10;i++){
		$('#withdrawal_rows').append('<div id="row_'+i+'" style="display:none">'+
		                         '<div class="row">'+
		                         '<input type="hidden" class="form-control" id="withdrawal_employeeId_'+i+'" name="withdrawal_employeeId_'+i+'"/>'+
		                         '<input type="hidden" class="form-control " id="withdrawal_currency_'+i+'" name="withdrawal_currency_'+i+'"/>'+
		                         '<div class="col-md-4"><input class="form-control " id="withdrawal_employee_'+i+'" name="withdrawal_employee_'+i+'" onfocus="this.blur();"/></div>'+
		                         '<div class="col-md-2"><input class="form-control " id="withdrawal_date_'+i+'" name="withdrawal_date_'+i+'" data-date-format="yyyy-mm-dd"/></div>'+
		                         '<div class="col-md-2"><input class="form-control " id="withdrawal_amount_'+i+'" name="withdrawal_amount_'+i+'"/></div>'+
		                         '<div class="col-md-2"><input class="form-control " id="withdrawal_type_'+i+'" name="withdrawal_type_'+i+'" onfocus="this.blur();"/></div>'+
		                         '<div class="col-md-2"><a href="" class="btn btn-danger" onclick="event.preventDefault();deleteWithdrawalRow('+i+'); return false;">Delete</a></div>'+
		                         '</div><div class="row"><h5></h5></div></div>'+
		                         '<script>$("#withdrawal_date_'+i+'").val($("#wEnd").val()); $("#withdrawal_date_'+i+'").datepicker(); </script>');
	}

});

$(document).on("click","a.addWithdrawalAgents",function(){
	event.preventDefault();
	var employee=$(this).attr('data-employee');
	var employeeId=$(this).attr('data-employeeId');
	var type=$(this).attr('data-type');
	var currency=$(this).attr('data-currency');
	if($('#set_withdrawal_div').css('display')=='none'){
	  $('#withdrawal_employeeId_1').val(employeeId);
	  $('#withdrawal_employee_1').val(employee);
	  $('#withdrawal_currency_1').val(currency);
	  $('#withdrawal_type_1').val(type);	
	  $('#set_withdrawal_div').slideDown(200,function(){	
	  	$('#row_1').slideDown(200);
	  });	
	}else{
	for(var i=2;i<=10;i++){
		if($('#row_'+i).css('display')=='none'){
		$('#withdrawal_employeeId_'+i).val(employeeId);
	  	$('#withdrawal_employee_'+i).val(employee);
	  	$('#withdrawal_currency_'+i).val(currency);
	  	$('#withdrawal_type_'+i).val(type);
	  	$('#row_'+i).slideDown(200);
	  	break;
	    }
	}
	}
});

function deleteWithdrawalRow(delete_row){
  for(var i=delete_row;i<=10;i++){
		$('#withdrawal_employeeId_'+i).val($('#withdrawal_employeeId_'+(i+1)).val());	
		$('#withdrawal_employee_'+i).val($('#withdrawal_employee_'+(i+1)).val());
		$('#withdrawal_currency'+i).val($('#withdrawal_currency_'+(i+1)).val());
		$('#withdrawal_date_'+i).val($('#withdrawal_date_'+(i+1)).val());
		$('#withdrawal_amount_'+i).val($('#withdrawal_amount_'+(i+1)).val());
	    $('#withdrawal_type_'+i).val($('#withdrawal_type_'+(i+1)).val());
		if($('#row_'+(i+1)).css('display')=='none' || i==10){
	      $('#row_'+i).slideUp(200);
	      break; 		
	    } 
    }
    if($('#row_2').css('display')=='none' && delete_row==1){ 
        $('#set_withdrawal_div').slideUp(200);
    }	 	
}

function addRetentionWithdrawals(){
  var withdrawals=[];
	for(var i=1;i<=10;i++){
		if($('#row_'+i).css('display')=='none')
		    break;    
		if(($('#withdrawal_amount_'+i).val()).trim()=='' || ($('#withdrawal_date_'+i).val()).trim()==''){
			bootbox.alert('<h4>Fill all the fields</h4>');
			return;
		}    
		withdrawals+='&'+$('#withdrawal_employeeId_'+i).serialize()+'&'+$('#withdrawal_date_'+i).serialize()+'&'+$('#withdrawal_type_'+i).serialize()+'&'+$('#withdrawal_amount_'+i).serialize();    
	}
	var post_data=$('#month').serialize()+'&'+$('#customerId').serialize()+'&'+$('#currency').serialize()+'&'+$('#amount').serialize()+withdrawals;	
    apiRequest('addRetentionWithdrawalsTable',post_data,$('#agentWithdrawals_table_holder'),function(){
    	$('#set_withdrawal_div').slideUp(200,function(){
    		for(var i=1;i<=10;i++){
    			if($('#row_'+i).css('display')=='none')
    			  break;
    			$('#row_'+i).css('display','none');  
    			$('#withdrawal_employeeId_'+i).val('');
    			$('#withdrawal_employee_'+i).val('');
    			$('#withdrawal_currency_'+i).val('');
    			$("#withdrawal_date_'+i+'").val($("#wEnd").val());
    			$('#withdrawal_amount_'+i).val('');
    			$('#withdrawal_type_'+i).val('');  
    		}
    	});
    	getAgentWithdrawals();
    });
}

function getAgentWithdrawals(){
	var post_data=$('#month').serialize()+'&'+$('#customerId').serialize();
	apiRequest('getAgentWithdrawalsForCustomer',post_data,$('#agentWithdrawals_table_holder'),function(data){
		$('#agentWithdrawals_table').dataTable( {
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
           "aaData": data,
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "date", "sTitle": "Date", "sType": "date"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Type"},
            { "mData": "userName", "sTitle": "User Name"},
            { "mData": "lastUpdate", "sTitle": "Update", "sType": "date"}
            ]
        });
	});
}

function deleteAgentWithdrawals(){
	var post_data=$('#customerId').serialize()+'&'+$('#month').serialize();
  	apiRequest('deleteAgentWithdrawals',post_data,$('#agentWithdrawals_table_holder'),function(){
  		getAgentWithdrawals();
  	});
}

function getRealTransactionsForWithdrawals(){
	apiRequest('getRealTransactionsForWithdrawals','customerId='+$('#customerId').val(),$('#transactions_table_holder'),function(data){
     getAgentWithdrawals();
     for(var i in data){
     	 if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D' || data[i].clearedBy=='Inatec3D' || data[i].clearedBy=='Fibonatix' || data[i].clearedBy=='Insight3D'){
                   data[i].clearedBy='Credit Card 3D Secure';
         }else if(data[i].paymentMethod=='Wire'){
                	data[i].clearedBy='Wire';
         }else{                	
                	data[i].clearedBy='Credit Card';
         }
         data[i].add='';
     }
     $('#transactions_table').dataTable( {
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
           "aaData": data,
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "confirmTime", "sTitle": "Date", "sType": "date"},
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Curr"},  
            { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},      
            { "mData": "clearedBy", "sTitle": "Transaction Type"},
            { "mData": "verification", "sTitle": "Verify"},
            { "mData": "employeeId", "sTitle": "Employee ID", "bVisible": false},
            { "mData": "employee", "sTitle": "Transaction Employee"},
            { "mData": "percentage", "sTitle": "Percent"},
            { "mData": "add", "sTitle": "Add",
              "fnRender": function(oObj){
              	 return '<a href="" data-currency="'+oObj.aData.currency+'" data-type="'+oObj.aData.clearedBy+'" data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" class="btn btn-blue btn-xs btn-block addWithdrawalAgents">Add</a>';
              }}
            ]
         });
    });
    	
}


function getRetentionWithdrawals(){
	var customer_withdrawals=[],unique=[];
	var total_withdrawals=0;
	apiRequest('getRetentionWithdrawals',$('#range-form').serialize(),$('#customers_table_holder'),function(data){
		for(var i in data){
		   if(unique[data[i].customerId]==1)
		   	 continue;
		   customer_withdrawals.push({"customerId"  : data[i].customerId,
		                              "customerName": data[i].customerName,
		                              "currency"    : data[i].currency,
		                              "amount"      : 0,
		                              "amountUSD"   : 0,
		                              "addedAmount" : parseFloat(data[i].addedAmount), 
		                              "add"         : '',
		                              "view"        : '',
		   	                });
		   unique[data[i].customerId]=1; 	                 	
		}
		for(var i in data){
		  for(var j in customer_withdrawals){
		  	if(data[i].customerId==customer_withdrawals[j].customerId){
		  	  customer_withdrawals[j].amount += parseFloat(data[i].amount);
		  	  customer_withdrawals[j].amountUSD += parseFloat(data[i].amountUSD);
		  	  
		  	}
		  }
		  total_withdrawals += parseFloat(data[i].amountUSD);	
		}
		$('#total_withdrawals').html('$ '+total_withdrawals.toLocaleString());
		for(var i in customer_withdrawals){
		  customer_withdrawals[i].amount=parseFloat(customer_withdrawals[i].amount).toFixed(2);	
		  customer_withdrawals[i].amountUSD=parseFloat(customer_withdrawals[i].amountUSD).toFixed(2);
		}
		$('#customers_table').dataTable( {
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
           "iDisplayLength": 10,
           "bStateSave": true,
           "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData,"withdrawal"); },
           "fnStateLoad": function(oSettings) { return load_dt_view(oSettings,"withdrawal"); },
           "scrollCollapse": false,
           "aaData": customer_withdrawals,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "AmountUSD", "sType": "numeric"},
            { "mData": "addedAmount", "sTitle": "Added Amount", "sType": "numeric", "bVisible":false},
            { "mData": "add", "sTitle": "Add", "bUseRendered": false,
              "fnRender": function(oObj){
              	 var text=[],color=[];
              	 if(oObj.aData.addedAmount==0){
              	 	text="Add";
              	 	color="secondary";
              	 }else{
              	 	text="Added";
              	 	color= oObj.aData.amount==oObj.aData.addedAmount ? 'success' : 'danger';
              	 }
                 return '<a href="#" data-customerId="'+oObj.aData.customerId+'" data-customerName="'+oObj.aData.customerName+'" data-currency="'+oObj.aData.currency+'"  data-amount="'+oObj.aData.amount+'" '+
                           'class="btn btn-'+color+' btn-xs btn-block addWithdrawals">'+text+'</a>'; 	
              }
            },
            { "mData": "view", "sTitle": "View", "bUseRendered": false,
              "fnRender": function(oObj){
                 return '<a href="#" data-customerId="'+oObj.aData.customerId+'" class="btn btn-secondary btn-xs btn-block getWithdrawalsForCustomer">View</a>'; 	
              }
            }
            ]
	   });
	 });
}

function getOnHold(){
	$('body').addClass('modal-scroll');
	var month=new Date($('#wEnd').val()).format('yyyy-MM');
	var bootbox_body='<div class="row">'+
	                 '<div class="col-md-8">'+
	                 '<div class="portlet" id="on_hold_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Agents</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="on_hold_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-8 -->'+
	                 '<div class="col-md-4">'+
	                 '<div class="portlet" id="penalty_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Commission Withdrawals</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="penalty_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-4 -->'+
	                 '</div>'+
	                 '<script>getOnHoldTable();</script>';
	var on_hold_bootbox=bootbox.dialog({
		title: 'Withdrawals And Commissions For '+month,
		message: bootbox_body,
		closeButton: false,
		buttons:{
		success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
         	$('body').removeClass('modal-scroll');
         	reset_dt_view('onhold');
         	getRetentionWithdrawals();	
		}}}
	});
	$(on_hold_bootbox[0]).attr('id','on_hold_bootbox');
	$('#on_hold_bootbox .modal-dialog').addClass('modal-xlarge');
}

function getOnHoldTable(){
	var agents=[],unique=[];
	withdrawal_data=[];
	var month=new Date($('#wEnd').val()).format('yyyy-MM');
	var desk=$('#desk').val();
	var post_data='month='+month+'&desk='+desk;
	var currencyDate=new Date().format("yyyy-MM-dd");
  	     
  	if(new Date().format("yyyy-MM")>new Date($('#wEnd').val()).format("yyyy-MM")){
  	     
     	currencyDate=new Date((new Date(new Date($('#wEnd').val()).getFullYear(),new Date($('#wEnd').val()).getMonth() + 1, 1)) - 1).format("yyyy-MM-dd");
  	     	
    }
  	    
  	var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var date = currencyDate;
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+date+'.json?app_id='+key;
    var rates = 0;
        
    $.getJSON( api, function( data ) {
         rates = data.rates;
    }).done(function(){
	$.ajax({
  	    	 url: "/api.php?cmd=getAgentWithdrawalsForCustomer",
  	    	 type: "POST",
  	    	 data: post_data,
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	   withdrawal_data=data;	
               for(var i in data){
                 if(unique[data[i].employeeId]==1)
                 	continue;
                 agents.push({"employeeId"        : data[i].employeeId,
                              "employee"          : data[i].employee,
                              "cc_withdrawals"    : 0,
                              "cc_3d_withdrawals" : 0,
                              "wire_withdrawals"  : 0,
                              "cc_deposits"       : 0,
                              "cc_3d_deposits"    : 0,
                              "wire_deposits"     : 0,
                              "actual_withdrawals": 0      
                           });
                 unique[data[i].employeeId]=1;          
                               	
               }
               
  	    	   for(var i in data){
  	    	   	 for(var j in agents){
  	    	   	   if(data[i].employeeId==agents[j].employeeId){
  	    	   	   	 switch(data[i].type){
  	    	   	   	   case 'Credit Card':
  	    	   	   	     agents[j].cc_withdrawals += parseFloat(data[i].amount)/rates[data[i].currency];
  	    	   	   	     break;
  	    	   	   	   case 'Credit Card 3D Secure':
  	    	   	   	     agents[j].cc_3d_withdrawals += parseFloat(data[i].amount)/rates[data[i].currency];
  	    	   	   	     break;
  	    	   	   	   case 'Wire':
  	    	   	   	     agents[j].wire_withdrawals += parseFloat(data[i].amount)/rates[data[i].currency];
  	    	   	   	     break;    	
  	    	   	   	 }
  	    	   	   }	
  	    	   	 }
  	    	   }
  	    	},
  	    	error: function(x, t, m) {
             console.log(x);
             console.log(t);
             console.log(m);
            }
        }).done(function(){
  	    var penalty_start= $('#wStart').val();
  	    var penalty_end= $('#wEnd').val();	
  	    var penalty_post_data="dpStart="+penalty_start+"&dpEnd="+penalty_end+"&desk="+desk+"&employee=0";
  	    $.ajax({
  	    	 url: "/api.php?cmd=getPenalty",
  	    	 type: "POST",
  	    	 data: penalty_post_data,
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	   for(var i in data){
  	    	   	 if(typeof unique[data[i].employeeId]=='undefined'){
  	    	   	 	agents.push({"employeeId"        : data[i].employeeId,
                              "employee"          : data[i].employee,
                              "cc_withdrawals"    : 0,
                              "cc_3d_withdrawals" : 0,
                              "wire_withdrawals"  : 0,
                              "cc_deposits"       : 0,
                              "cc_3d_deposits"    : 0,
                              "wire_deposits"     : 0,
                              "actual_withdrawals": 0        
                           });          
  	    	   	 }
  	    	   	 unique[data[i].employeeId]=1;
  	    	   	 for(var j in agents){
  	    	   	   if(data[i].employeeId==agents[j].employeeId){
  	    	   	     agents[j].actual_withdrawals +=  parseFloat(data[i].amount)/rates[data[i].currency];	 
  	    	   	   }
  	    	     }
  	    	   }
  	    	},
  	    	error: function(x, t, m) {
             console.log(x);
             console.log(t);
             console.log(m);
            }      
  	    }).done(function(){
  	    	var dpStart="dpStart="+$('#wStart').val();
  	    	var dpEnd="dpEnd="+$('#wEnd').val();
  	    	var desk="desk="+$('#desk').val();
  	    	var employee="employee=0";
  	    	var post_data=dpStart+'&'+dpEnd+'&'+desk+'&'+employee;
  	    	apiRequest('getTransactionsForCommission',post_data,$('#on_hold_table_holder'),function(data){
  	    	   for(var i in data){
  	    	   	if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D' || data[i].clearedBy=='Inatec3D' || data[i].clearedBy=='Fibonatix' || data[i].clearedBy=='Insight3D'){
                   data[i].clearedBy='Credit Card 3D Secure';
                }else if(data[i].paymentMethod=='Wire'){
                	data[i].clearedBy='Wire';
                }else{                	
                 	data[i].clearedBy='Credit Card';
                }
  	    	   	if(unique[data[i].employeeId]==1)
                 	continue;
                 agents.push({"employeeId"        : data[i].employeeId,
                              "employee"          : data[i].employee,
                              "cc_withdrawals"    : 0,
                              "cc_3d_withdrawals" : 0,
                              "wire_withdrawals"  : 0,
                              "cc_deposits"       : 0,
                              "cc_3d_deposits"    : 0,
                              "wire_deposits"     : 0,
                              "actual_withdrawals": 0       
                           });
                 unique[data[i].employeeId]=1;          
                               	
               }
               for(var i in data){
               	for(var j in agents){
               		if(data[i].employeeId==agents[j].employeeId){
               			if(data[i]['clearedBy']=='Credit Card' && (data[i]['verification']=='Full' || Math.ceil(daysBetween(new Date(data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14)){
               				agents[j].cc_deposits += parseFloat(data[i].amountUSD)*0.15;
               			}
               			if(data[i]['clearedBy']=='Credit Card 3D Secure' && (data[i]['verification']=='Full' || Math.ceil(daysBetween(new Date(data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14)){
               				agents[j].cc_3d_deposits += parseFloat(data[i].amountUSD)*0.15;
               			}
               			if(data[i]['clearedBy']=='Wire' && (data[i]['verification']=='Full' || Math.ceil(daysBetween(new Date(data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14)){
               				agents[j].wire_deposits += parseFloat(data[i].amountUSD)*0.15;
               			}
               		}
               	}
               }
               for(var i in agents){
               	agents[i].total_deposits= agents[i].cc_deposits + agents[i].cc_3d_deposits + agents[i].wire_deposits;
               	agents[i].total_withdrawals= agents[i].cc_withdrawals + agents[i].cc_3d_withdrawals + agents[i].wire_withdrawals;
               	agents[i].cc_deposits= parseFloat(agents[i].cc_deposits).toFixed(2);
              	agents[i].cc_3d_deposits= parseFloat(agents[i].cc_3d_deposits).toFixed(2);
               	agents[i].wire_deposits= parseFloat(agents[i].wire_deposits).toFixed(2);
               	agents[i].total_deposits= parseFloat(agents[i].total_deposits).toFixed(2);
               	agents[i].cc_withdrawals= parseFloat(agents[i].cc_withdrawals).toFixed(2);
              	agents[i].cc_3d_withdrawals= parseFloat(agents[i].cc_3d_withdrawals).toFixed(2);
               	agents[i].wire_withdrawals= parseFloat(agents[i].wire_withdrawals).toFixed(2);
               	agents[i].total_withdrawals= parseFloat(agents[i].total_withdrawals).toFixed(2);
                agents[i].actual_withdrawals= parseFloat(agents[i].actual_withdrawals).toFixed(2);
               }
  	    	   
  	    	   var on_hold_table=$('#on_hold_table').dataTable( {
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
                 "scrollCollapse": false,
                 "aaData": agents,
                 "bStateSave": true,
                 "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData,"onhold"); },
                 "fnStateLoad": function(oSettings) { return load_dt_view(oSettings,"onhold"); },
                 "dom": '<"toolbar">frtip',
                 "aaSorting": [[ 3, "desc" ]],                    
                 "aoColumns": [
                 { "mData": null, "sTitle": "Details", "sClass":'withdrawal-detail', "bSortable":false,"defaultContent": ''},
                 { "mData": "employeeId", "sTitle": "Employee ID", "bVisible":false},
                 { "mData": "employee", "sTitle": "Employee"},
                 { "mData": "total_withdrawals", "sTitle": "Total Withdrawals", "sType": "numeric"},
                 { "mData": "cc_withdrawals", "sTitle": "CC Withdrawals", "sType": "numeric"},
                 { "mData": "cc_3d_withdrawals", "sTitle": "3D Withdrawals", "sType": "numeric"},
                 { "mData": "wire_withdrawals", "sTitle": "Wire Withdrawals", "sType": "numeric"},
                 { "mData": "total_deposits", "sTitle": "Total On Hold", "sType": "numeric"},
                 { "mData": "cc_deposits", "sTitle": "CC On Hold", "sType": "numeric"},
                 { "mData": "cc_3d_deposits", "sTitle": "3D On Hold", "sType": "numeric"},
                 { "mData": "wire_deposits", "sTitle": "Wire On Hold", "sType": "numeric"},
                 { "mData": "actual_withdrawals", "sTitle": "Actual Withdrawals", "sType": "numeric"},
                 { "mData": null, "sTitle": "View Withdrawals", 
                   "fnRender": function(oObj){
                   	 return '<a href="" data-employeeId="'+oObj.aData.employeeId+'" class="btn btn-secondary btn-xs btn-block getPenalty">View</a>';
                   }  
                 }
                 ],
                 "fnRowCallback": function( nRow, aData, iDisplayIndex ) {
                 	$(nRow).removeClass('shown');
                 }
                 });
                 
                 $('#on_hold_table tbody').off("click").on("click","td.withdrawal-detail",function(){
                 	var tr = $(this).closest('tr');
                 	var id= tr.children('td').eq(1).text();
                	var split= id.split(' ');
                 	id=split[0];
                
                    if(!tr.hasClass('shown')){
                      tr.addClass('shown');
                      if(!$('#'+id).length){
                        tr.after('<tr id="'+id+'" style="display:none">'+
                                  '<td colspan="7">'+
                                  '<table class=" table table-striped table-bordered table-hover table-highlight " id="withdrawals_table_'+id+'">' +
                                  '</table>'+
                                  '</td>'+
                                  '</tr>'
                                  );
                      getAgentWithdrawalsForEmployee(id,true);
                      }                      
                      $('#'+id).slideDown(200);
                    }  
                    else{ 
                      if($('#'+id).length){	 
                      $('#'+id).slideUp(200,function(){
                        tr.removeClass('shown');	
                      });
                      }else{
                      	tr.removeClass('shown');
                      }
                    }  
                      
                     
                 });	
  	    	});
  	    });
  	    });
  	    });	
}

function getAgentWithdrawalsForEmployee(id,first){
    if(first){
    	drawAgentWithdrawalsForEmployee(id);
    }else{
    	var month=new Date($('#wEnd').val()).format('yyyy-MM');
	    var desk=$('#desk').val();
	    var post_data='month='+month+'&desk='+desk;
	    apiRequest('getAgentWithdrawalsForCustomer',post_data,$("#withdrawals_table_"+id),function(data){
	       withdrawal_data=data;	
	       drawAgentWithdrawalsForEmployee(id);
	    });    
    }	  
}

function drawAgentWithdrawalsForEmployee(id){
	var real_data=[];
	for(var i in withdrawal_data){
    	withdrawal_data[i].customer= withdrawal_data[i].customerId +' - ' + withdrawal_data[i].customerName;
    	if(withdrawal_data[i].employeeId==id){
    		real_data.push(withdrawal_data[i]);
    	}
    }
    $("#withdrawals_table_"+id).dataTable({
      "bDestroy":true,
      "bInfo": false,
      "bAutoWidth": false,	
      "bFilter": false,
      "bLengthChange": false,
      "bPaginate": false,	
      "aaData": real_data,
      "aoColumns": [
            { "mData": "id","sTitle":"ID", "bVisible": false},
            { "mData": "employeeId","sTitle":"Employee ID", "bVisible": false},
            { "mData": "employee","sTitle":"Employee"},
            { "mData": "date","sTitle": "Date", "sType": "date"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "type", "sTitle": "Type"},
            { "mData": "customerId", "sTitle": "CustomerId", "bVisible": false},
            { "mData": "customer", "sTitle": "Customer"},
            { "mData": "isAdded", "sTitle": "isAdded", "bVisible": false},
            { "mData": null, "sTitle": "Add", 
              "fnRender": function(oObj){
              	var color= oObj.aData.isAdded==1 ? 'success' : 'secondary';
              	var text= oObj.aData.isAdded==1 ? 'Added' : 'Add';
                return '<a href="" data-id="'+oObj.aData.id+'" data-date="'+oObj.aData.date+'" data-employeeId="'+oObj.aData.employeeId+'" data-employeeName="'+oObj.aData.employee+'" data-currency="'+oObj.aData.currency+'"  data-amount="'+oObj.aData.amount+'" data-customerId="'+oObj.aData.customerId+'" data-type="'+oObj.aData.type+'" data-isAdded="'+oObj.aData.isAdded+'" class="btn btn-'+color+' btn-xs btn-block addPenalty" >'+text+'</a>';	
              }
            }
      ]      	
    });	
}

function getPenalty(employee){
	var dpStart=new Date(new Date($('#wEnd').val()).getFullYear(),new Date($('#wEnd').val()).getMonth(),1).format('yyyy-MM-dd');
	var dpEnd=new Date(new Date(new Date($('#wEnd').val()).getFullYear(),new Date($('#wEnd').val()).getMonth()+1,1)-1).format('yyyy-MM-dd');
	var desk=$('#desk').val();
	var post_data='dpStart='+dpStart+'&dpEnd='+dpEnd+'&desk='+desk+'&employee='+employee;
	apiRequest('getPenalty',post_data,$('#penalty_table_holder'),function(data){
		$('#penalty_table').dataTable( {
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
           "bLengthChange": false,
           "scrollCollapse": false,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Employee ID", "bVisible": false},
            { "mData": "date", "sTitle": "Date", "sType": "date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Curr"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "type", "sTitle": "Type"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "retentionWithdrawalId", "sTitle": "With Screen", "bUseRendered": false,
              "fnRender": function(oObj){
              	var color= oObj.aData.retentionWithdrawalId!=0 ? 'success' : 'danger';
              	var text= oObj.aData.retentionWithdrawalId!=0 ? 'Yes' : 'No';
              	return '<a href="" class="btn btn-'+color+' btn-xs">'+text+'</a>';
              }
            },
            { "mData": null , "sTitle": "Delete",
              "fnRender": function(oObj){
                return '<a href="" data-id="'+oObj.aData.id+'" data-retentionWithdrawalId="'+oObj.aData.retentionWithdrawalId+'" data-employee="'+employee+'" class="btn btn-secondary btn-xs deletePenalty">Delete</a>';  	
             } 
            }
           ]
           }); 
	});
}

function addPenaltyTable(employee){
	apiRequest('addPenaltyTable',$('#penalty-form').serialize(),$('#penalty_table_holder'),function(){
		getPenalty(employee);
	 	getAgentWithdrawalsForEmployee(employee,false);
		getOnHoldTable();
	});
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk option[value="4"]').attr('selected',true);
			getRetentionWithdrawals();
	});
}
