
$( document ).ready(function() {
	
	$(".table-responsive").hide();
	
    $("#all").click(
    	function(event){
    		$("#customer_id").val('');
    		$('#AllDocuments').dataTable().fnClearTable();
    		$("#AllDocuments_wrapper").show();
    		getAllCustomerDocuments();
    	}
    	
    );
    
    $("#customer").click(
    	function(event){
    		event.preventDefault();
    		$('#CustomerDocuments').dataTable().fnClearTable();
    		$("#CustomerDocuments_wrapper").show();
    		validate($("#customer_id").val());
    	}
    	
    );
    
    
});

function validate(id){
	if(id==''){
		msgbox('<i class="icon-warning-sign"></i>', "CUSTOMER ID FIELD CAN NOT BE EMPTY", "Close");
		clear_page();
		
	}else if(!id.match(/^[0-9]*$/)){
		msgbox('<i class="icon-warning-sign"></i>', "ONLY NUMBERS PLEASE", "Close");
		clear_page();
		$("#customer_id").val('');	
	}else
		getCustomerDocuments(id);
}	

function clear_page(){	
	$(".table-responsive").show();

	if($("#customer_details").length)
		$("#customer_details").remove();
}	

function getAllCustomerDocuments() {
		
        $("#CustomerDocuments_wrapper").hide();
        clear_page();
		var content_identifier = '#AllDocuments';
	
		
        apiRequest('customers-documents', '', content_identifier, function (data) {

            for (var row in data) {

                data[row].view = '<a href="http://www.onetwotrade.com/ott?cmd=downloadUserFile&userid=' + data[row].user + '&token=' + data[row].token + '&file=' + data[row].file + '" class="btn btn-xs btn-tertiary">View &nbsp;&nbsp;<iclass="fa fa-chevron-right"></i></a>';

                data[row].user = '<a target="_blanc" href="https://spotcrm.onetwotrade.com/crm/customers/page/' + data[row].user +'">' + data[row].user + '</a>';
            }

           
            $(content_identifier).dataTable({
                            "sDom": 'T<"clear">lfrtip',
                            "bDestroy": true,
                            "bLengthChange": true,
                            "aaData": data,
                            "aaSorting": [[0, "desc"]],
                            "aoColumns": [
                                {"mData": "time", "sTitle": "TIME", "sType": "numeric"},
                                {"mData": "user", "sTitle": "ID"},
                                {"mData": "file", "sTitle": "FILE"},
                                {"mData": "view", "sTitle": "View"},
                                {"mData": "verif", "sTitle": "VERIFICATION"}
                            ]
                        });
            
			$( "table" ).css( "width", "100%" );
			
            $('.DTTT_container').hide();
        });
    }
    
function getCustomerDocuments(id) {
		 $("#AllDocuments_wrapper").hide();	
		 clear_page();
        var content_identifier = '#CustomerDocuments';
       	
        
        apiRequest('customerDocuments', $('#range-form').serialize() , content_identifier, function (data) {
        	
        		   files_arr = data.customer.files;
        		   createDateFiles_arr = data.customer.createDateFiles;
                   verification = data.customer.verification;
                   var hostName = window.location.hostname;
                   files = [];
        			
        			if(files_arr.length == 0){
        				msgbox('<i class="icon-warning-sign"></i>', "No Files Where Found ", "Close");
        				clear_page();
        				return false;
        			}
        				
        			
                   
                 	
                   for (var row in files_arr) {
                   		files_arr[row] = {
                   							fileDate: createDateFiles_arr[row],
                   							file: files_arr[row],
                   							view: '<a href="http://www.onetwotrade.com/ott?cmd=downloadUserFile&userid=' + id + '&token=' + data.token + '&file=' + files_arr[row] + '" class="btn btn-xs btn-tertiary">View &nbsp;&nbsp;<iclass="fa fa-chevron-right"></i></a>'
                   						};
                   		files.push(files_arr[row]);
                       }
        
                        $(content_identifier).dataTable({
                           "sDom": 'T<"clear">lfrtip',
                           "bDestroy": true,
                           "bLengthChange": true,
                           "aaData": files,
                           "aaSorting": [[0, "desc"]],
                           "aoColumns": [
                           	   {"mData": "fileDate", "sTitle": "DATE"},
                               {"mData": "file", "sTitle": "FILE"},
                               {"mData": "view", "sTitle": "View"},  
                           ]
                       });   
                        $('.DTTT_container').hide();
    
                        $( "table" ).css( "width", "100%" );
                        
                        $(".portlet-content").before('<h3 id="customer_details"  style="background:#444;border: 1px solid #d5d5d5;border-radius: 4px;color:#fff;margin: 10px 0px; font-weight: bold; padding: 10px;">Verification : '+verification+' <a target="_blanc" href=https://spotcrm.onetwotrade.com/crm/customers/page/' + id +' style="float:right;color:#fff;">To Spot CRM : ' + id + '</a></h3>');
});
                    
                    
        
    }
  
