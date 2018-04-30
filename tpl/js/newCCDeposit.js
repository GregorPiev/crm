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

$(document).ready(function() {
	getNewCCDeposit();
	$('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
	$('#dpStart, #dpEnd, #customerId').change(function() 
    {
        getNewCCDeposit();
    });
	
});


function getNewCCDeposit() {
	apiRequest('getNewCCDeposit',$('#range-form').serialize(),'#newCCDeposit_table_holder',function(data) {
		console.log(data);
		$('#newCCDeposit_table').dataTable({
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
           "aaSorting": [[ 10, "desc" ]],
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "FullVerificationStatus", "sTitle": "Full Verification Status Date" , "sType": "date"},
            { "mData": "Newdepositdate", "sTitle": "New Deposit Date", "sType": "date"},
            { "mData": "NumCard", "sTitle": "Num Card"}]
    });
 }); 
}


