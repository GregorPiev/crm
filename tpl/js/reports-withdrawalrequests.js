
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

function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
      });

    });
    
}

function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployees',$('#range-form').serialize(),'#transactions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
    
}

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
  
  getWithdrawalRequests();
  
}

$(document).ready(function() {
	getDesk();
    getAffiliates();
    getEmployees();
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getWithdrawalRequests();

    $('#dpStart, #dpEnd, #desk, #affiliate, #employee').change(function() 
    {
        getWithdrawalRequests();
    });
    
    $('#desk').change(function() 
    {
      getEmployees();
    });
    
});

function getWithdrawalRequests(){

    apiRequest('getWithdrawalRequests',$('#range-form').serialize(),'#transactions_table_holder',function(data){
        
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
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "requestTime", "sTitle": "Date Requested", "sType": "date"},            
            { "mData": "paymentMethod", "sTitle": "Payment Method"},
            { "mData": "amountUSD", "sTitle": "Amount USD", "sType": "numeric"},
            { "mData": "real_account_balance", "sTitle": "Real Account Balance", "sType": "numeric"},
            { "mData": "deposits", "sTitle": "Deposit Methods"},
            { "mData": "clearings", "sTitle": "Deposist Cleared By"},
            { "mData": "employeeInChargeName", "sTitle": "Employee"},
            { "mData": "aff_id", "sTitle": "Affiliate"}
            
            
            
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            var total_count = 0;
            var total_amount = 0;
      			for ( var i=0 ; i<aiDisplay.length ; i++ ) {
      					total_count++;
              	total_amount += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
      			}
             
             $('#total_count').html(total_count.toLocaleString());
             $('#total_amount').html('$'+total_amount.toLocaleString());
           } 
           
           
    } );
    
    
    
      });
      
      
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
