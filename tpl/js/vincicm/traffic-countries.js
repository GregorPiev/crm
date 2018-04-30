Date.prototype.format = function (format) //author: meizz
{
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}


function selectRange(range) {
    if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
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

    getLeadsByCampaigns();

}

$(document).ready(function() {

    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"))
                         .datepicker();
    $("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    getLeverateCampaigns();
    getLeadsByCampaigns();

    $('#dpStart, #dpEnd, #campaign').change(function() 
    {
        getLeadsByCampaigns();
    });

});

$(document).on('click','a.getUncalledCustomers',function(){
       var country = $(this).attr('data-country');
       getUncalledCustomers(country);
});

$(document).on('click','a.getFailedAttempts',function(){
       var country = $(this).attr('data-country');
       getFailedAttempts(country);
});

function getLeverateCampaigns(){
  
  apiRequestBrand('getLeverateCampaigns','','',true,capitalBrandName,function(data){
  	 $.each(data,function(){
  	 	  $('#campaign').append($('<option>', { value : this.name, text : this.name }));
  	 });
  });  
}

function getUncalledCustomers(country){
	var url = location.protocol + '//' + location.host + '/'+globalBrandName+'/agenttools/customer_card';
	
	bootbox.dialog({
		title:   'Uncalled Customers for '+country,
		message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<div id="uncalled_table_holder">'+
                 '<div class="table-responsive">' +
				 '<table class=" table table-striped table-bordered table-hover table-highlight " id="uncalled_table">' +
				 '</table>'+
				 '</div>'+		
                 '</div></div></div>',
        buttons:{
        	success:{
        		label: "OK",
                className: "btn-success"
        	}
        }         
                    
	});
	var post_data = {'dpStart': $('#dpStart').val(),'dpEnd': $('#dpEnd').val(),'field': JSON.stringify({'value':country,'name':'country'}),'campaign': $('#campaign').val()};
	
	apiRequestBrand('getUncalledCustomers',post_data,'#uncalled_table_holder',true,capitalBrandName,function(data){
		$('#uncalled_table').dataTable({
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
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[0, "asc"]],
            "aoColumns": [
                {"mData": "AccountId", "sTitle": "Customer ID",
                 "mRender": function( data, type, row ){
                 	 href = url + '/?id='+data;
                 	 if(type ==='display')
                 	    return '<a href="'+href+'" target="_blank">'+data+'</a>';
                 	    
                 	 return data;   
                 }
                }, 
                {"mData": "customerName", "sTitle": "Customer Name"}
	        ]
	        }); 
	});
}

function getFailedAttempts(country){
	var url = location.protocol + '//' + location.host + '/'+globalBrandName+'/agenttools/customer_card';
	
	bootbox.dialog({
		title:   'Failed Attempts for '+country,
		message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<div id="failed_table_holder">'+
                 '<div class="table-responsive">' +
				 '<table class=" table table-striped table-bordered table-hover table-highlight " id="failed_table">' +
				 '</table>'+
				 '</div>'+		
                 '</div></div></div>',
        buttons:{
        	success:{
        		label: "OK",
                className: "btn-success"
        	}
        }         
                    
	});
	var post_data = {'dpStart': $('#dpStart').val(),'dpEnd': $('#dpEnd').val(),'field': JSON.stringify({'value':country,'name':'country'}),'campaign': $('#campaign').val()};
	
	apiRequestBrand('getFailedAttempts',post_data,'#failed_table_holder',true,capitalBrandName,function(data){
		$('#failed_table').dataTable({
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
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[0, "asc"]],
            "aoColumns": [
                {"mData": "AccountId", "sTitle": "Customer ID",
                 "mRender": function( data, type, row ){
                 	 href = url + '/?id='+data;
                 	 if(type ==='display')
                 	    return '<a href="'+href+'" target="_blank">'+data+'</a>';
                 	    
                 	 return data;   
                 }
                }, 
                {"mData": "customerName", "sTitle": "Customer Name"},
                {"mData": "reason", "sTitle": "Reason","sClass": "columnX"},
                {"mData": "depositAmount", "sTitle": "Amount"},
                {"mData": "date", "sTitle": "Date"}
	        ]
	        }); 
	});
}


function getLeadsByCampaigns() {
    $post_data = $('#range-form').serialize()+'&field=country';

    apiRequestBrand('getLeadsByField',$post_data,'#transactions_table_holder',true,capitalBrandName,function(data){

        $('#transactions_table').dataTable({
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
            "bLengthChange": true,
            "bAutoWidth": false,
            "aaData": data,
            "aaSorting": [[9, "desc"]],
            "aoColumns": [
                {"mData": "leadAggregateField", "sTitle": "Country"},
                {"mData": "totalLeads", "sTitle": "Leads", "sType": "numeric"},
                {"mData": "totalCustomers", "sTitle": "Customers", "sType": "numeric"},
                {"mData": "totalCalled", "sTitle": "Called", "sType": "numeric"},
                {"mData": "totalNotCalledCutOff", "sTitle": "NC C.OFF", "sType": "numeric"},
                {"mData": "percentCalled", "sTitle": "Called (%)", "sType": "numeric",
                 "mRender" : function( data, type, row ){
                 	 if(type ==='display')
                 	    return data+' <a class="btn btn-xs btn-blue btn-block getUncalledCustomers" data-country="'+row.leadAggregateField+'">View</a>';
                 	    
                 	 return data;   
                 } 
                  },
                {"mData": "totalNotCalled", "sTitle": "Not Called", "sType": "numeric"},
                {"mData": "totalNoAnswer", "sTitle": "No Answer", "sType": "numeric"},
                {"mData": null, "sTitle": "No Answer (%)", "sType": "numeric",
                 "mRender": function(data,type, row){
                     return row.totalCustomers == 0 ? (0).toFixed(2) : ((parseFloat(row.totalNoAnswer)/parseFloat(row.totalCustomers))*100).toFixed(2) ; 	
                  }  
                },
                {"mData": "ftds", "sTitle": "FTDs", "sType": "numeric"},
                {"mData": null, "sTitle": "Conversion (%)", "sType": "numeric",
                 "mRender": function(data,type, row){
                     return row.totalCustomers == 0 ? (0).toFixed(2) : ((parseFloat(row.ftds)/parseFloat(row.totalCustomers))*100).toFixed(2) ; 	
                  }  
                },
                {"mData": "attemptCount", "sTitle": "Failed Attempts", "sType": "numeric",
                 "mRender": function(data,type, row){
                 	 if(type ==='display')
                 	    return data+' <a class="btn btn-xs btn-blue btn-block getFailedAttempts" data-country="'+row.leadAggregateField+'">View</a>';
                 	    
                 	 return data;
                 } 
                },
                {"mData": null, "sTitle": "Approval Rate (%)", "sType": "numeric",
                 "mRender": function(data,type, row){
                     return parseInt(row.ftds)+parseInt(row.attemptCount) == 0 ? (0).toFixed(2) : ((parseInt(row.ftds)/(parseInt(row.ftds)+parseInt(row.attemptCount)))*100).toFixed(2) ; 	
                  }  
                },
                {"mData": "numberDeposits", "sTitle": "Deposits (#)", "sType": "numeric"},
                {"mData": "numberSelfDeposits", "sTitle": "Self D (#)", "sType": "numeric"},               
                {"mData": "depositsUSD", "sTitle": "Deposits ($)", "sType": "numeric"},
                {"mData": "depositCancelledUSD", "sTitle": "Deposits Cancelled ($)", "sType": "numeric"},
                {"mData": "ftdDepositsUSD", "sTitle": "FTD ($)", "sType": "numeric"},
                {"mData": "selfDepositsUSD", "sTitle": "Self D ($)", "sType": "numeric"},
                {"mData": "withdrawalsUSD", "sTitle": "Withdrawals ($)", "sType": "numeric"}
            ],

            "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {
                var total_leads = 0;
                var total_customers = 0;
                var total_ftds = 0;
                var conversion_rate = 0;
                var total_failed_attempts = 0;
                var approval_rate = 0;
                var number_deposits = 0;
                var number_self_deposits = 0;
                var total_depositsUSD = 0;
                var total_self_depositsUSD = 0;
                var total_ftd_depositsUSD = 0;
                var total_deposit_cancelledUSD = 0;
                var total_withdrawalsUSD = 0; 

                for (var i = 0; i < aiDisplay.length; i++) {
                    total_leads += parseFloat(aaData[aiDisplay[i]]['totalLeads']);
                    total_customers += parseFloat(aaData[aiDisplay[i]]['totalCustomers']);
                    total_ftds += parseFloat(aaData[aiDisplay[i]]['ftds']);
                    total_failed_attempts += parseFloat(aaData[aiDisplay[i]]['attemptCount']);
                    number_deposits += parseFloat(aaData[aiDisplay[i]]['numberDeposits']);
                    number_self_deposits += parseFloat(aaData[aiDisplay[i]]['numberSelfDeposits']);
                    total_depositsUSD += parseFloat(aaData[aiDisplay[i]]['depositsUSD']);
                    total_self_depositsUSD += parseFloat(aaData[aiDisplay[i]]['selfDepositsUSD']);
                    total_ftd_depositsUSD += parseFloat(aaData[aiDisplay[i]]['ftdDepositsUSD']);
                    total_deposit_cancelledUSD += parseFloat(aaData[aiDisplay[i]]['depositCancelledUSD']);
                    total_withdrawalsUSD += parseFloat(aaData[aiDisplay[i]]['withdrawalsUSD']);
                }
                if(total_customers != 0)
                    conversion_rate = ((total_ftds/total_customers)*100).toFixed(2);
                if(total_ftds + total_failed_attempts != 0)
                    approval_rate = ((total_ftds/(total_ftds + total_failed_attempts))*100).toFixed(2);
                          
                $('#total_leads').html(total_leads.toLocaleString());
                $('#total_customers').html(total_customers.toLocaleString());
                $('#total_ftds').html(total_ftds.toLocaleString());
                $('#conversion_rate').html('% '+conversion_rate.toLocaleString());
                $('#total_failed_attempts').html(total_failed_attempts.toLocaleString());
                $('#approval_rate').html('% '+approval_rate.toLocaleString());
                $('#number_deposits').html(number_deposits.toLocaleString());
                $('#number_self_deposits').html(number_self_deposits.toLocaleString());
                $('#total_depositsUSD').html('$ '+total_depositsUSD.toLocaleString());
                $('#total_self_depositsUSD').html('$ '+total_self_depositsUSD.toLocaleString());
                $('#total_ftd_depositsUSD').html('$ '+total_ftd_depositsUSD.toLocaleString());
                $('#total_deposit_cancelledUSD').html('$ '+total_deposit_cancelledUSD.toLocaleString());
                $('#total_withdrawalsUSD').html('$ '+total_withdrawalsUSD.toLocaleString());
            }
        });
    });
}
