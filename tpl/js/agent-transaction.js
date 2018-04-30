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
var globalSpotId;
var employeeField;

$("#range-form").append('<input type="hidden" name="currentdesk" value="0" />');
$("#range-form").append('<input type="hidden" name="currentemployee" value="0" />');

$(document).ready(function() {
	getDesk();
	getUserSpotId();
	getAffiliates();
	$('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getTransactions();
    
    $('#dpStart, #dpEnd, #affiliate,#transactiondesk,  #transactionemployee').change(function() 
    {
    	
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
        getTransactions();
       
    });

    $('#transactiondesk').change(function() 
    {
      getTransactionEmployees();
    });
    
});

function getAffiliates() {
	
	$('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#transaction_table_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
      });

    });
}
function getTransactions() {	
            
	apiRequest('getTransactions',$('#range-form').serialize(),'#transaction_table_holder',function(data){
    	
      var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      var href = '';
      for(var i=0,j=data.length; i<j; i++){
          href = url + '/?id='+data[i].customerId;
          data[i].customerId = '<a href="'+href+'" target="_blank">'+data[i].customerId+'</a>' ;
          data[i].customerName = '<a href="'+href+'" target="_blank">'+data[i].customerName+'</a>' ;
      };

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
           "aaData": data,
           "aaSorting": [[ 5, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "countryName", "sTitle": "Country"},
            //{ "mData": "NewCustomer", "sTitle": "New"},
            //{ "mData": "regTime", "sTitle": "reg Time", "sType": "date"},
            { "mData": "requestTime", "sTitle": "Date Request", "sType": "date"},          
            { "mData": "confirmTime", "sTitle": "Date Confirmed", "sType": "date"},            
            { "mData": "FTD", "sTitle": "FTD"},
            { "mData": "paymentMethod", "sTitle": "Payment Method"},
            { "mData": "clearedBy", "sTitle": "Cleared By"},
            { "mData": "ttype", "sTitle": "Type"},
            { "mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "aff_id", "sTitle": "Affiliate"},
            { "mData": "transactionemployee", "sTitle": "Transaction Employee"}
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
           	
              
            var total_deposits = 0;
            var total_deposits_new = 0;
            var total_withdrawals = 0;
            var total_bonuses = 0;
            var total_bonuses_w = 0;
            var total_deposits_ftd = 0;
            var total_fdts = 0;
            var total_chargebacks = 0;
            var total_fees = 0;
            var clearing_obj = {};
            var clearing_key = '';
            
			       for ( var i=0 ; i<aiDisplay.length ; i++ )
			       {
				      if (aaData[ aiDisplay[i] ]['paymentMethod']!='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Deposit') {
                total_deposits += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                if (aaData[ aiDisplay[i] ]['FTD']=='Yes') {
                total_deposits_ftd += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                total_fdts++;
                }
                
                }
                
              if (aaData[ aiDisplay[i] ]['paymentMethod']=='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Deposit')
                total_bonuses += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
              
              if (aaData[ aiDisplay[i] ]['paymentMethod']=='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Withdrawal')
                total_bonuses_w += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                
              if (aaData[ aiDisplay[i] ]['paymentMethod']!='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Withdrawal')
                total_withdrawals += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                
              if (aaData[ aiDisplay[i] ]['paymentMethod']=='chargeBack' && aaData[ aiDisplay[i] ]['ttype']=='Withdrawal')
                total_chargebacks += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                
              if (aaData[ aiDisplay[i] ]['ttype']=='Fees')
                total_fees += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                
              /*
              if (aaData[ aiDisplay[i] ]['paymentMethod']!='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Deposit' && aaData[ aiDisplay[i] ]['NewCustomer']=='Yes')
                total_deposits_new += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                */
                
              if(aaData[ aiDisplay[i] ]['clearedBy'].length <=0 && aaData[ aiDisplay[i] ]['paymentMethod'] == 'Credit Card') {
                clearing_key = 'Unspecified PSP';
              } else {
                clearing_key = aaData[ aiDisplay[i] ]['clearedBy'];
              }
              
              if(clearing_obj[clearing_key]) {
                clearing_obj[clearing_key] += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
              } else {
                clearing_obj[clearing_key] = parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
              }
              
			       }
             
             //var nCells = nRow.getElementsByTagName('th');
			       //  nCells[1].innerHTML = 'asd';
        
             
             $('#total_deposits').html('$'+total_deposits.toLocaleString());
             $('#total_withdrawals').html('$'+total_withdrawals.toLocaleString());
             $('#total_bonuses').html('$'+total_bonuses.toLocaleString());
             $('#total_bonuses_w').html('$'+total_bonuses_w.toLocaleString());
             $('#total_deposits_ftd').html('$'+total_deposits_ftd.toLocaleString());
             $('#total_ftds').html(total_fdts.toLocaleString());
             $('#total_chargebacks').html('$'+total_chargebacks.toLocaleString());
             $('#total_fees').html('$'+total_fees.toLocaleString());
             
             clearing_obj = sortObject(clearing_obj);
             $('#clearings').html("");
             for (var key in clearing_obj) {
               if(key.length > 0) {
                $('#clearings').append("<span style=\"float:left;\">"+key+":</span> <span style=\"float:right;\">$"+clearing_obj[key].toLocaleString()+"</span><br />");
               }
             }
             
            
            
           } 
           
           
    });
    	
    	
    	
      
    });
	
}

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

function getTransactionEmployees () {

    $('#transactionemployee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getTransactionEmployees',$('#range-form').serialize(),'#transaction_table_holder',function(data){

      jQuery.each(data, function() {
        $('#transactionemployee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
    
}

function  getUserSpotId(){
  	apiRequest('getUserSpotId',$('#range-form').serialize(),'#transaction_table_holder',function(spotId){
  		globalSpotId = spotId;
  		if (spotId==0) {
  			getTransactionEmployees();
			$(".tranctionemployee").show();
  			$(".transactiondesk").show();
  			$("#transactionemployee").change(function(){
  				if($("#spotId")){
  					$("#spotId").remove();
  				}
		         $("#summery-form").append('<input id="spotId" type="hidden" name="transactionemployee" value="'+this.value+'"/>');
		   });
  		}else{
  			$(".transactionemployee").remove();
  			$(".tranactiondesk").remove();
  			$("#range-form").append('<input type="hidden" name="transactionemployee" value="'+spotId+'"/>');
  			$("#summery-form").append('<input type="hidden" name="transactionemployee" value="'+spotId+'"/>');
  			
  		}
  		
  	});	
}

/*function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployeesShort',$('#range-form').serialize(),'#transaction_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
} */

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
  
  getTransactions();
  
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#transactiondesk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#transactiondesk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

