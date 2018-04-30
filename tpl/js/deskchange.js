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

Array.prototype.contains = function(obj) {
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
  
  getDeskchangeReport();
  
}

function getDeskchangeReport() {
	    apiRequest('getDeskchangeReport',$('#range-form').serialize(),'#transactions_table_holder',function(data){
        //console.log(data);
         //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime
         
        
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
           "bLengthChange": true,
           "aaData": data,
           "aaSorting": [[ 0, "desc" ]],                    
           "aoColumns": [
            { "mData": "changeDate", "sTitle": "Change Time","sType": "date"},
            { "mData": "actionEmployee", "sTitle": "Performed By"},
            { "mData": "customerId", "sTitle": "Customer ID", "sType": "numeric"},
            { "mData": "regTime", "sTitle": "Customer Reg Time","sType": "date"},
            { "mData": "countDeposits", "sTitle": "Deposits", "sType": "numeric"},            
            { "mData": "amountUSD", "sTitle": "Amount Deposited"},            
            { "mData": "originalEmployee", "sTitle": "Original Employee"},
            { "mData": "originalDesk", "sTitle": "Original Desk"},
            { "mData": "newEmployee", "sTitle": "New Employee"},
            { "mData": "newDesk", "sTitle": "New Desk"}
           ]
           
           
    } );
    
    
    
      });
}


function geoPlugin(data){

  total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
  $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

}