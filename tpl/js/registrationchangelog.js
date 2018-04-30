Date.prototype.format = function(format) {	
  
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

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};




function getRegistrationChangeLog () {
	apiRequest('getRegistrationChangeLog', $('#range-form').serialize(),'#VerificationChangeLog_table_holder', function(data) {
		$('#VerificationChangeLog_table').dataTable( {
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
       	{ "mData": "customerId", "sTitle": "Customer Id"},
        { "mData": "customerName", "sTitle": "Customer Name"},
        { "mData": "oldValue", "sTitle": "Old Value"},
        { "mData": "newValue", "sTitle": "New Value"},
        { "mData": "date", "sTitle": "Date"},       
        { "mData": "source", "sTitle": "Source"},            
        { "mData": "sourcePlatform", "sTitle": "Source Platform Id"},        
        { "mData": "user", "sTitle": "User"},
        { "mData": "userIp", "sTitle": "UserIp"}]
        
		
  
		
		});
  
	});
}


