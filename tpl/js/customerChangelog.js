$(document).ready(function () {
	$("#submit").click(function (e){
		e.preventDefault();
		getCustomerChangeLog();
	});
	
	$('#type').change(function() {
    	getCustomerChangeLog();      
    });
	
	
  
});

function getCustomerChangeLog () {
	
	apiRequest('getCustomerChangeLog',$('#range-form').serialize(),'#customerChangeLog_table_holder', function (data) {
        $('#customerChangeLog_table').dataTable( {
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

