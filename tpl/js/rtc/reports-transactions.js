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
  
  getTransactions();  
}

$(document).ready(function() {
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    $("#campaigns").select2( {
      placeholder: "Select Campaigns",
      allowClear: true,
      width: "100%"
     });
    $("#employee").select2({width: "100%"});
    getLeverateDesk();
    getLeverateEmployees(); 
    getLeverateCampaigns();
    getTransactions();   
    
    $('#dpStart,#dpEnd,#campaigns,#desk,#employee,#current').change(function() 
    {
        getTransactions();       
    });

    $('#desk').change(function(){
        getLeverateEmployees();
    });
    
});



function sortObject(object){  
      var sortedObj = {},
          keys = Object.keys(object);
  
      keys.sort(function(key1, key2){
          key1 = key1.toLowerCase(), key2 = key2.toLowerCase();
          if(key1 < key2) return -1;
          if(key1 > key2) return 1;
          return 0;
      });
  
      for(var index in keys){
          var key = keys[index];
          if(typeof object[key] == 'object' && !(object[key] instanceof Array)){
              sortedObj[key] = sortObject(object[key]);
          } else {
              sortedObj[key] = object[key];
          }
      }
  
      return sortedObj;
  }

function getLeverateEmployees () {
    $('#employee').find('option').remove().end().append('<option value="0">All</option>').val('0');
    
    var param ={desk : $("#desk").val()};
    apiRequestBrand('getLeverateEmployees',param,'#transaction_table_holder',true,capitalBrandName,function(data){         
        
      jQuery.each(data, function() {
        $('#employee').append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });

    });    
}
function getLeverateDesk(){
	apiRequestBrand('getLeverateDesk', $('#range-form').serialize(), '#transactiondesk',true,capitalBrandName,function(data) {			
	   $.each(data, function(key, value) { 
		$('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
	   });
	});
}

function getLeverateCampaigns(){
    
	apiRequestBrand('getLeverateCampaigns',$('#range-form').serialize(),'#transactiondesk',true,capitalBrandName,function(data){
            
	  $.each(data, function() {
                        $('#campaigns').append($('<option>', { value : this.name }).text(this.name)); 
                    });
	});
}
 
function getTransactions() {	
          
  apiRequestBrand('getLeverateTransactions',$('#range-form').serialize(),'#transaction_table_holder',true,capitalBrandName,function(data){  
      var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';      

    	    $('#transaction_table').dataTable( {
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
               "bAutoWidth": false,
               "aaData": data,
               "aaSorting": [[ 2, "desc" ]],
               "aoColumns": [                
                { "mData": "transactionId", "sTitle": "Transaction Id","sType": "numeric"},
                { "mData": "customerName", "sTitle": "Customer Name", "bUseRendered": false,
                  "fnRender":function(oObj){
                     return "<a href='"+ url +"/?id="+oObj.aData.customerId +"'  target='_blank'>"+oObj.aData.customerName+"</a>";
                  }
                },
                { "mData": "country", "sTitle": "Country"}, 
                { "mData": "ApprovedOn", "sTitle": "Approved On", "sType": "date"}, 
                { "mData": "tpAccount", "sTitle": "TPAccount"},
                { "mData": "currency", "sTitle": "Currency"}, 
                { "mData": "amount", "sTitle": "Amount","sType": "numeric"},               
                { "mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
                { "mData": "FTD", "sTitle": "FTD"},        
                { "mData": "transactionType", "sTitle": "Transaction Type"},        
                { "mData": "methodOfPayment", "sTitle": "Payment Method"},
                { "mData": "tpAccountUpdate", "sTitle": "tpAccount Update"},
                { "mData": "is3D", "sTitle": "Is 3D"},
                { "mData": "processor", "sTitle": "Processor"},
                { "mData": "PSPTransactionId", "sTitle": "PSP TransactionId"},
                { "mData": "promoCode", "sTitle": "Promo Code", "sType":"string"},  
                { "mData": "businessUnit", "sTitle": "Business Unit"},
                { "mData": "currentEmployee", "sTitle": "Current Employee"},
                { "mData": "transactionEmployee", "sTitle": "Transaction Employee"},
                 { "mData": "campaign", "sTitle": "campaign"}
               ],
               "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                    var total_deposits = 0;
                    var total_deposits_cancelled=0;
                    var total_deposits_ftd = 0;
                    var total_ftds = 0; 
                    var total_credits = 0;
                    var total_credits_cancelled = 0;                    
                    var total_debits = 0;
                    var total_debits_cancelled = 0;
                    var total_withdrawal=0;                                        
                    var total_withdrawal_cancelled =0;
                    var total_chargeback=0;
                    var total_chargeback_cancelled=0;
                    var total_internal_deposits = 0;
                    var total_internal_deposits_cancelled = 0;
                    var total_internal_withdrawal = 0;
                    var total_internal_withdrawal_cancelled = 0;

                    for ( var i=0 ; i<aiDisplay.length ; i++ ) {
                               if (aaData[ aiDisplay[i] ]['tpAccountUpdate']=='Yes') {
                                           if (aaData[ aiDisplay[i] ]['transactionType']=='Deposit' && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal') {
                                                    total_deposits += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                                    if (aaData[ aiDisplay[i] ]['FTD']=='Yes') {
                                                            total_deposits_ftd += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                                            total_ftds++;                                           
                                                    }                                   
                                           }else if(aaData[ aiDisplay[i] ]['transactionType']=='Deposit Cancelled' && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal'){
                                           	        total_deposits_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Credit' || aaData[ aiDisplay[i] ]['transactionType']=='Bonus' || aaData[ aiDisplay[i] ]['transactionType']=='Credit Line') {
                                                    total_credits += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Credit Cancelled' || aaData[ aiDisplay[i] ]['transactionType']=='Bonus Cancelled' || aaData[ aiDisplay[i] ]['transactionType']=='Credit Line Cancelled') {
                                                    total_credits_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Debit") {
                                                    total_debits += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);                                  
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Debit Cancelled") {
                                                    total_debits_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);                                  
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Withdrawal" && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal') {
                                                    total_withdrawal += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);                                  
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Withdrawal Cancelled" && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal') {
                                                    total_withdrawal_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);                                  
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Charge Back" && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal') {
                                                    total_chargeback += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=="Charge Back Cancelled" && aaData[ aiDisplay[i] ]['methodOfPayment'] != 'Internal') {
                                                    total_chargeback_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']); 
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Deposit' && aaData[ aiDisplay[i] ]['methodOfPayment'] == 'Internal') {
                                                    total_internal_deposits += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);   
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Deposit Cancelled' && aaData[ aiDisplay[i] ]['methodOfPayment'] == 'Internal') {
                                                    total_internal_deposits_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);   
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Withdrawal' && aaData[ aiDisplay[i] ]['methodOfPayment'] == 'Internal') {
                                                    total_internal_withdrawal += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);   
                                           }else if (aaData[ aiDisplay[i] ]['transactionType']=='Withdrawal Cancelled' && aaData[ aiDisplay[i] ]['methodOfPayment'] == 'Internal') {
                                                    total_internal_withdrawal_cancelled += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);   
                                           }
                                 }
                        }
                        
                 $('#total_deposits').html('$'+total_deposits.toLocaleString());
                 $('#total_deposits_cancelled').html('$'+total_deposits_cancelled.toLocaleString());
                 $('#total_deposits_ftd').html('$'+total_deposits_ftd.toLocaleString());
                 $('#total_ftds').html(total_ftds.toLocaleString());
                 $('#total_credits').html('$'+total_credits.toLocaleString());
                 $('#total_credits_cancelled').html('$'+total_credits_cancelled.toLocaleString());
                 $('#total_debits').html('$'+total_debits.toLocaleString());
                 $('#total_debits_cancelled').html('$'+total_debits_cancelled.toLocaleString());
                 $('#total_withdrawal').html('$'+total_withdrawal.toLocaleString());                                   
                 $('#total_withdrawal_cancelled').html('$'+total_withdrawal_cancelled.toLocaleString());
                 $('#total_chargeback').html('$'+total_chargeback.toLocaleString());
                 $('#total_chargeback_cancelled').html('$'+total_chargeback_cancelled.toLocaleString());
                 $('#total_internal_deposits').html('$'+total_internal_deposits.toLocaleString());
                 $('#total_internal_deposits_cancelled').html('$'+total_internal_deposits_cancelled.toLocaleString());
                 $('#total_internal_withdrawal').html('$'+total_internal_withdrawal.toLocaleString());
                 $('#total_internal_withdrawal_cancelled').html('$'+total_internal_withdrawal_cancelled.toLocaleString());
               }
    });
    });
	
}