function save_dt_view (oSettings, oData) {
  localStorage.setItem( 'DataTables_'+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings) {
  return JSON.parse( localStorage.getItem('DataTables_'+window.location.pathname) );
}
function reset_dt_view() {
  localStorage.removeItem('DataTables_'+window.location.pathname);
}


$("#content-container").append('<div style="display:none">'+
			                     '<form id="pending-form">'+
				                 '<input class="form-control" type="text" name="pendingCustomerId" id="pendingCustomerId">'+
			                      '</form>'+
		                            '</div>'+
		                        '<div style="display:none">'+
			                     '<form id="open-form">'+
				                 '<input class="form-control" type="text" name="customerId" id="openCustomerId">'+
			                      '</form>'+
		                            '</div>'   
		                            );
var userData=[];
var total_rab=0, total_safelist=0, total_na=0, total_wd=0, total_fresh=0, total_openpositions=0, total_regular=0, total_done=0, total_academy=0, total_waitingdeposit=0, total_robot=0, total_nodocs=0, total_nextmonth=0, total_trade=0;

$(document).ready(function() {
	 
	 getUserData();
	 
	 $("#regStatus").select2( {
   	  placeholder: "Select Registration Status or leave blank for all",
      allowClear: true,
      width: "100%"
     
   });
	 $("#tradeStatus").select2( {
   	  placeholder: "Select Trading Status or leave blank for all",
      allowClear: true,
      width: "100%"
     
      
   });
   
    $("#employee").select2( {
   	  placeholder: "Select Employees or leave blank for all",
      allowClear: true,
      width: "100%"
     
      
   });
   
   $("#countries").select2( {
   	  placeholder: "Select countries or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   $("#excludeCountries").select2( {
   	  placeholder: "Select countries to exclude",
      allowClear: true,
      width: "100%"
   });
   $("#verification").select2( {
   	  placeholder: "Select verification or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   
   getDesk();
   init_option();
   getCountry();
   
   $('#desk').change(function(){
   	getEmployeesForRetention();
   	
   });
   
   $('#RAB_from,#RAB_to,#bonus_percent_from,#bonus_percent_to').off('keyup paste').on('keyup paste',function(e){ 	     	  
           $(this).removeClass('red-border');	 	   
   });
   
  
});

function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove();   

    apiRequest('getEmployeesForRetention',$('#parameters-form').serialize(),'',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
      });
          
       });
    
  } 

function getUserData(){
	apiRequest('getUserData','','',function(data){
		userData=data;
	});
}

$("a.list-group-item").not('.total').hover(function(){
	if($(this).hasClass('available')){
	  $('a.list-group-item.available').addClass('hover');
	  $('a.list-group-item').not('.available').removeClass('hover');	
	}else {
	  $('a.list-group-item.available').removeClass('hover');
	  $('a.list-group-item').not('.available,.total').addClass('hover');		
	}
},function(){
	$("a.list-group-item").removeClass('hover');
});

$("a.list-group-item").focus(function(){
	var total=0;
	if($(this).hasClass('available')){
	  total = total_safelist + total_academy + total_waitingdeposit + total_fresh + total_openpositions + total_regular + total_nextmonth + total_trade; 	
	  $('a.list-group-item.available').addClass('focus').animate({opacity:1},500);
	  $('a.list-group-item').not('.available,.total').animate({opacity:0.25},500);
	  $('#total_rab').animate({opacity:0},500,function(){
	  	 $(this).html('$'+total.toLocaleString());
	  	 $(this).animate({opacity:1},500);
	  });
	  $('#total_rab_text').animate({opacity:0},500,function(){
	  	 $(this).html('Total Available RAB');
	  	 $(this).animate({opacity:1},500);
	  });		
	}else if($(this).hasClass('total')){
	  $('a.list-group-item.total').addClass('focus');
	  $('#total_rab').animate({opacity:0},500,function(){
	  	 $(this).html('$'+total_rab.toLocaleString());
	  	 $(this).animate({opacity:1},500);
	  });
	  $('#total_rab_text').animate({opacity:0},500,function(){
	  	 $(this).html('Total Real Account Balance');
	  	 $(this).animate({opacity:1},500);
	  });	
	}
	else {
	  total = total_done + total_na + total_wd + total_robot + total_nodocs;	
	  $('a.list-group-item').not('.available,.total').addClass('focus').animate({opacity:1},500);
	  $('a.list-group-item.available').animate({opacity:0.25},500);
	  $('#total_rab').animate({opacity:0},500,function(){
	  	 $(this).html('$'+total.toLocaleString());
	  	 $(this).animate({opacity:1},500);
	  });
	  $('#total_rab_text').animate({opacity:0},500,function(){
	  	 $(this).html('Total Non-Available RAB');
	  	 $(this).animate({opacity:1},500);
	  });			
	}
}).blur(function(){
	$('a.list-group-item').removeClass('focus').animate({opacity:1},500);
	$('#total_rab').animate({opacity:0},500,function(){
	  	 $(this).html('$'+total_rab.toLocaleString());
	  	 $(this).animate({opacity:1},500);
	  });
	  $('#total_rab_text').animate({opacity:0},500,function(){
	  	 $(this).html('Total Real Account Balance');
	  	 $(this).animate({opacity:1},500);
	  });
});
  
$(document).on("click","a.openPositions",function(){
	event.preventDefault();
	$('#openCustomerId').val($(this).attr('data-id'));
	console.log($('#open-form').serialize());
	bootbox.dialog({
        title: "Open Positions",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="positions_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="positions_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getOpenPositionsForTable();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
});  

$(document).on("click","a.changeStatus",function(){
	 event.preventDefault();
	 bootbox.dialog({
        title: "Change Trading Status",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="status-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="open_positions">&nbsp;</label> ' +
                    '<div class="col-md-5"> ' +
                    '<a href="#" id="open_positions" name="open_positions" onclick="event.preventDefault(); getOpenPositions();return false;"  class="btn btn-small btn-openpositions">Open Positions</a>'+
                    '</div>'+
                    '</div>  ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerId">Customer ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="customerId" name="customerId"  value=" ' + $(this).attr("data-id") + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerName">CustomerName</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="customerName" name="customerName" value=" '+ $(this).attr("data-customerName") +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="new_tradeStatus">Choose Trade Status</label> ' +
                    '<div class="col-md-5"> ' +
                    '<select id="new_tradeStatus" name="new_tradeStatus" class="form-control">' + 
                       '<option value="Regular" >Regular</option>'+
                       '<option value="Open Positions" >Open Positions</option>'+
                       '<option value="Fresh" >Fresh</option>' +
                       '<option value="Safe List" >Safe List</option>' +
                       '<option value="Next Month" >Next Month</option>' +
                       '<option value="Trade" >Trade</option>' +
                       '<option value="Waiting Deposit" >Waiting Deposit</option>'+
                       '<option value="Academy" >Academy</option>'+
                       '<option value="No Docs" >No Docs</option>'+
                       '<option value="Robot" >Robot</option>'+
                       '<option value="Never Available" >Never Available</option>' +
                       '<option value="WD + DWTT" >WD + DWTT</option>' +
                       '<option value="Done" >Done</option>'+
                     '</div> ' +
                     '</div>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	changeTradeStatus();
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       bootbox.alert("<h5>Trading Status is NOT changed</h5>");
      }
    },
    delete: {
      label: "DELETE",
      className: "btn-secondary",
      callback: function() {
       deleteTradeStatus();	
      }
   } 
    }});
	
});

$(document).on("click","a.addComment",function(){
	 event.preventDefault();
	 bootbox.dialog({
        title: "Add Comment",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="comment-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerId">Customer ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="customerId" name="customerId"  value=" ' + $(this).attr("data-id") + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerName">CustomerName</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="customerName" name="customerName" value=" '+ $(this).attr("data-customerName") +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="comment">Comment</label> ' +
                    '<div class="col-md-5"> ' +
                    '<textarea type="text"  id="comment" name="comment" placeholder="Write Comment" class="form-control">' + 
                    '</textarea>'+ 
                     '</div> ' +
                    '</div>' +
                    '</div> </div>' +
                    '</form> </div>  </div>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	
      	addCustomerComment();
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       bootbox.alert("<h5>Comment is NOT changed</h5>");
      }
    }
 /*   delete: {
      label: "DELETE",
      className: "btn-secondary",
      callback: function() {
       deleteComment();	
      }
   } */
    }});
	
});

$(document).on("click","a.pendingWithdrawals",function(){
	 event.preventDefault();
	 $('#pendingCustomerId').val($(this).attr('data-id')); 
	 pendingWithdrawals();
	 
});

$(document).on("click","a.getNotes",function(){
	 event.preventDefault();
	 bootbox.dialog({
        title: "Retention Notes",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="notes_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="notes_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getNotesForStatus('+$(this).attr("data-id")+');</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
	 
});

$(document).on("click","a.getComments",function(){
	 event.preventDefault();
	 bootbox.dialog({
        title: "Trader Comments",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="comments_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="comments_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getCommentsForStatus('+$(this).attr("data-id")+');</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success"
    }
    
    }});
	 
});

$(document).on("click","a.getSessions",function(){
	 event.preventDefault();
     $('body').addClass('modal-scroll');	
	 var session_bootbox=
	    bootbox.dialog({
         title: "Trading Sessions",
         message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form id="session-form"> ' +
                    '<div class="col-md-2"> ' +
                    '<h5>Customer ID</h5>'+
                    '<input id="sessionCustomerId" name="sessionCustomerId" value="'+$(this).attr("data-id")+'" class="form-control" onfocus="this.blur();"/>'+
                    '</div>  ' +
                    '<div class="col-md-2"> ' +
                    '<h5>Customer Name</h5>'+
                    '<input id="sessionCustomerName" name="sessionCustomerName" value="'+$(this).attr("data-customerName")+'" class="form-control" onfocus="this.blur();"/>'+
                    '</div>  ' +
                    '<div class="col-md-2">'+
				    '<h5>&nbsp;</h5>'+	
			        '<a href="" class="btn btn-secondary disabled" id="openSession" onclick="event.preventDefault(); openSession(); return false;">Open Session</a>'+
			        '</div>'+	
                    '</form>'+
                    '<div class="col-md-12"><h4></h4></div>'+
                    '<div class="col-md-5">'+
                    '<div class="portlet" id="session_table_holder">'+
                    '<div class="portlet-header"><h3><i class="fa fa-table"></i>Sessions</h3></div>'+
                    '<div class="portlet-content">'+
                    '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="session_table">' +
					 '</table>'+
					 '</div>'+	
                    '</div> <!-- portlet-content -->'+
                    '</div> <!-- portlet -->'+
                    '</div> <!-- col-md-5 -->'+
                    '<div class="col-md-7">'+
                    '<div class="portlet" id="sessionPositions_table_holder">'+
                    '<div class="portlet-header"><h3><i class="fa fa-table"></i>Session Positions</h3></div>'+
                    '<div class="portlet-content">'+
                    '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sessionPositions_table">' +
					 '</table>'+
					 '</div>'+	
                    '</div> <!-- portlet-content -->'+
                    '</div> <!-- portlet -->'+
                    '</div> <!-- col-md-7 -->'+
                    '</div></div>'+
                    '<script>getSessionsForStatus()</script>',
      closeButton:false,           
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function(){
      	$('body').removeClass('modal-scroll');	
      	getTradeStatus();
      }
    }
    
    }});
    $(session_bootbox[0]).attr("id","session_bootbox");
    $('#session_bootbox .modal-dialog').addClass("modal-xlarge");
	 
});

$(document).on("click","a.changeSessionStatus",function(){
	 event.preventDefault();
	 var id=$(this).attr('data-id');
	 if($(this).attr('data-status')=='closed'){
	 	bootbox.alert("<h4>The Session is already closed</h4>");
	 	return;
	 }
	 bootbox.confirm('<h4>Are you sure to close the session?</h4>',function(result){
	 	if(result)
	 	   closeSession(id);
	 });
});	

$(document).on("click","a.getSessionPositions",function(){
	event.preventDefault();
	var sessionId=$(this).attr('data-id');
	post_data={sessionId:sessionId};
	getTradeSessionPositions(post_data);
}); 

function getCountry(){
	$('#countries,#excludeCountries')
    .find('option')
    .remove();
    
    
	apiRequest('getCountry',$('#range-form').serialize(),'',function(data){
		
		jQuery.each(data, function() {
          $('#countries,#excludeCountries')
          .append($('<option>', { value : this.name })
          .text(this.iso + ' - ' + this.name));
	    });
	});
}

function init_option(){
	$("#regStatus,#tradeStatus").find('option')
    .remove();
  
    $('#regStatus').append('<option value="activated" >Activated</option>',
                           '<option value="noTrade" >No Trade</option>',
                            '<option value="pending" >Pending</option>',
                             '<option value="deactivated" >Deactivated</option>');
                             
    $('#tradeStatus').append('<option value="Regular" >Regular</option>',
                             '<option value="Open Positions" >Open Positions</option>',
                             '<option value="Fresh" >Fresh</option>',
                             '<option value="Safe List" >Safe List</option>',
                             '<option value="Next Month" >Next Month</option>' ,
                             '<option value="Trade" >Trade</option>',
                             '<option value="Waiting Deposit" >Waiting Deposit</option>',
                             '<option value="Academy" >Academy</option>',
                             '<option value="No Docs" >No Docs</option>',
                             '<option value="Robot" >Robot</option>',
                             '<option value="Never Available" >Never Available</option>',
                             '<option value="WD + DWTT" >WD + DWTT</option>',
                             '<option value="Done" >Done</option>');            	
	$('#verification').append('<option value="None" >None</option>',
                              '<option value="Partial" >Partial</option>',
                              '<option value="Full" >Full</option>');
}

function changeTradeStatus(){
	 $.ajax({
  	    	 url: "/api.php?cmd=changeTradeStatus",
  	    	 type: "POST",
  	    	 data: $('#status-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	bootbox.alert("<h5>Trading Status is changed</h5>");
            	
            }
  	    	 }
  	    	
  	    	
  	    	
  	    ).done(function(){
	     getTradeStatus();
	});
	
}

function deleteTradeStatus(){
	 $.ajax({
  	    	 url: "/api.php?cmd=deleteTradeStatus",
  	    	 type: "POST",
  	    	 data: $('#status-form').serialize(),
  	    	 dataType:"text",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	console.log(data);
  	    	 	if(data==0){
  	    	 	bootbox.alert("<h5>Trading Status is never changed</h5>");	
  	    	 	}else{
  	    	 	bootbox.alert("<h5>Trading Status is deleted</h5>");
            }
            }
  	    	 }
  	    	
  	    	
  	    	
  	    ).done(function(){
	     getTradeStatus();
	});
	
}

function addCustomerComment(){
	$.ajax({
  	    	 url: "/api.php?cmd=addComment",
  	    	 type: "POST",
  	    	 data: $('#comment-form').serialize(),
  	    	 dataType:"json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	
  	    	 	bootbox.alert("<h5>Comment is added</h5>");
            
            }
  	    	 }
  	    	
  	    	
  	    	
  	    ).done(function(){
	     getTradeStatus();
	});
	
}

function deleteComment(){
	 $.ajax({
  	    	 url: "/api.php?cmd=deleteComment",
  	    	 type: "POST",
  	    	 data: $('#comment-form').serialize(),
  	    	 dataType:"text",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	console.log(data);
  	    	 	if(data==0){
  	    	 	bootbox.alert("<h5>Customer has NO comment to delete</h5>");	
  	    	 	}else{
  	    	 	bootbox.alert("<h5>Comment is deleted</h5>");
            }
            }
  	    	 }
  	    	
  	    	
  	    	
  	    ).done(function(){
	     getTradeStatus();
	});
	
}

function getOpenPositions(){
		bootbox.dialog({
        title: "Open Positions",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="positions_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="positions_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getOpenPositionsForStatus();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
	
}

function getOpenPositionsForStatus(){
	apiRequest('getOpenPositionsForStatus',$('#status-form').serialize(),$('#positions_table_holder'),function(data){
		console.log("sucesssssss");
		$('#positions_table').dataTable( {
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
         // "bPaginate":false,
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 2, "asc" ]],                    
           "aoColumns": [
            { "mData": "name", "sTitle": "Asset Name"},
            { "mData": "startDate", "sTitle": "Execution Date", "sType": "date"},
            { "mData": "endDate", "sTitle": "End Date", "sType": "date"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "direction", "sTitle": "Direction"},
            { "mData": "rate", "sTitle": "EntryRate"},
            { "mData": "amountUSD", "sTitle": "Amount USD"}
            
            ]
    });
		
	});
	
}

function getOpenPositionsForTable(){
	apiRequest('getOpenPositionsForStatus',$('#open-form').serialize(),$('#positions_table_holder'),function(data){
	
		$('#positions_table').dataTable( {
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
         // "bPaginate":false,
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 2, "asc" ]],                    
           "aoColumns": [
            { "mData": "name", "sTitle": "Asset Name"},
            { "mData": "startDate", "sTitle": "Execution Date", "sType": "date"},
            { "mData": "endDate", "sTitle": "End Date", "sType": "date"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "direction", "sTitle": "Direction"},
            { "mData": "rate", "sTitle": "EntryRate"},
            { "mData": "amountUSD", "sTitle": "Amount USD"}
            
            ]
    });
		
	});
	
}

function pendingWithdrawals(){
		bootbox.dialog({
        title: "Pending Withdrawals",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="pending_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="pending_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getPendingWithdrawals();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
	
}

function getPendingWithdrawals(){
	apiRequest('getPendingWithdrawals',$('#pending-form').serialize(),$('#pending_table_holder'),function(data){
		$('#pending_table').dataTable( {
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
         // "bPaginate":false,
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount", "sType":"numeric"},
            { "mData": "amountUSD", "sTitle": "Amount USD", "sType":"numeric"},
            { "mData": "status", "sTitle": "Status"}, 
            { "mData": "requestTime", "sTitle": "Request Time","sType":"date"},
            { "mData": "transactionEmployee", "sTitle": "Transaction Employee"}
            
            ]
    });
		
		
	});
	
}

function getNotesForStatus(customerId){
	
	post_data = {customerId: customerId, type: ['retention']};
	apiRequest('getNotes',post_data,'#notes_table_holder',function(data){
		
	  $('#notes_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "body", "sTitle": "Body"},
            { "mData": "createDate", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"}
           ]
            
            });	
	});
}

function getCommentsForStatus(customerId){
	
	apiRequest('getCommentsForStatus','customerId='+customerId,$('#comments_table_holder'),function(data){
	  $('#comments_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "comment", "sTitle": "Comment"},
            { "mData": "date", "sTitle": "Date","sType":"date"}
           ]
            
            });	
	});
}

function getSessionsForStatus(){
  
   $('#openSession').addClass('disabled');	 	
   apiRequest('getSessionsForStatus',$('#session-form').serialize(),$('#session_table_holder'),function(data){
	  if(typeof data[0] == 'undefined' || data[0].status=='closed')
	       $('#openSession').removeClass('disabled');
	  $('#session_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID", "bVisible":false},
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "startTime", "sTitle": "Start Date","sType":"date"},
            { "mData": "endTime", "sTitle": "End Date","sType":"date"},
            { "mData": "userId", "sTitle": "Trader ID","bVisible":false},
            { "mData": "userName", "sTitle": "Trader"},
            { "mData": "status", "sTitle": "Status", "bUseRendered":false,
              "fnRender": function(oObj){
              	var color=oObj.aData.status=='open' ? 'success' : 'danger';
              	return '<a href="#" data-id="'+oObj.aData.id+'" data-status="'+oObj.aData.status+'" class="btn btn-'+color+' btn-xs btn-block changeSessionStatus">'+oObj.aData.status+'</a>';
              }   
            },
            { "mData": "positions", "sTitle": "Positions", "bUseRendered":false,
              "fnRender": function(oObj){
              	return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-secondary btn-xs btn-block getSessionPositions">View</a>';
              }   
            }
           ]
            
            });	
	});	
}

function closeSession(id){
	apiRequest('closeTradeSessionForStatus','id='+id,$('#session_table_holder'),function(data){
		if(data=='Different UserName')
		  bootbox.alert('<h4>The Session is opened by another user. </h4>'+
		                '<h4> Current user do NOT have access to close this session.</h4>');
		getSessionsForStatus();
	});
}

function openSession(){
	bootbox.dialog({
        title: "Open Session",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="openSession-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="openSessionCustomerId">Customer ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="openSessionCustomerId" name="openSessionCustomerId"  value=" ' + $('#sessionCustomerId').val() + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="openSessionCustomerName">CustomerName</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="openSessionCustomerName" name="openSessionCustomerName" value=" '+ $('#sessionCustomerName').val() +' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="userName">Trader</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="userName" name="userName" value="'+userData["username"]+'" class="form-control" onfocus="this.blur();">' + 
                     '</div> ' +
                    '</div>' +
                    '<input type="hidden" id="userId" name="userId" value="'+userData["id"]+'">'+
                    '</form> </div></div>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	openTradeSessionForStatus();
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
      	bootbox.alert("<h4>Session is NOT opened</h4>");
      }
    }}
    });
} 

function openTradeSessionForStatus(){
	apiRequest('openTradeSessionForStatus',$('#openSession-form').serialize(),$('#session_table_holder'),function(data){
		bootbox.alert("<h4>Session is opened</h4>");
		getSessionsForStatus();
	});
}

function getTradeSessionPositions(post_data){
	apiRequest('getTradeSessionPositions',post_data,$('#sessionPositions_table_holder'),function(data){
		for(var i=0;i<data.length;i++){
			data[i].rate=parseFloat(data[i].rate);
		}
		$('#sessionPositions_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Position ID"},
            { "mData": "assetName", "sTitle": "Asset Name"}, 
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "endDate", "sTitle": "Expiry Date","sType":"date"},
            { "mData": "rate", "sTitle": "Entry Rate"},
            { "mData": "amount", "sTitle": "Investment"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "payout", "sTitle": "Payout"},
            { "mData": "product", "sTitle": "Product"}
            ]
         });
	});
}

function getTradeStatus(){
	
    var real_data=[];
    var alert_modal = false;
    var percent_max = false;
    var percent_sort = false;
    var re = new RegExp(/^((([1-9][0-9]*))+(\.[0-9]{2})?|0\.[0-9]{2})$/);
    
    $('#RAB_from,#RAB_to,#bonus_percent_from,#bonus_percent_to').each(function(){
    	var trim_value = ($(this).val()).trim();
    	$(this).val(trim_value);
    	if($(this).val()!='' && !re.test($(this).val())){
    		$(this).addClass('red-border');
    		alert_modal = true;
    	} 
    });
    var is_percent_from = $('#bonus_percent_from').val()!='';
    var is_percent_to = $('#bonus_percent_to').val()!='';
    var percent_from = parseFloat($('#bonus_percent_from').val());
    var percent_to = parseFloat($('#bonus_percent_to').val());
    
    $('#bonus_percent_from,#bonus_percent_to').each(function(){
    	if($(this).val()!='' && parseFloat($(this).val())>100){
    		$(this).addClass('red-border');
    		percent_max = true;
    	}
    });
    console.log($('#bonus_percent_to').val()+' '+$('#bonus_percent_from').val()+' '+$('#bonus_percent_to').val()<$('#bonus_percent_from').val());
    if(is_percent_from && is_percent_to && percent_to<percent_from){
        $('#bonus_percent_from,#bonus_percent_to').addClass('red-border');
        percent_sort = true;
    }
    if(alert_modal){
    	bootbox.alert('<h4>Leave Blank or Fill with positive number with maximum 2 decimals</h4>');
    	return false;
    }else if(percent_max){
    	bootbox.alert('<h4>Bonus Percents should be less than 100</h4>');
    	return false;
    }else if(percent_sort){
    	bootbox.alert('<h4>"Bonus Percent From" should be less than "Bonus Percent To"</h4>');
    	return false;
    }
    $('#RAB_from,#RAB_to,#bonus_percent_from,#bonus_percent_to').removeClass('red-border');
    
	apiRequest('getTradeStatus',$('#parameters-form').serialize(),$('#loader'),function(data){
	 
	 for(var i=0 ; i<data.length ; i++){
	      	data[i].tradeStatus2 = data[i].tradeStatus;
	      	data[i].id2=data[i].id;
	      	data[i].percent= data[i].totalDepositUSD == 0 ? 'No Deposit': ((parseFloat(data[i].totalBonusUSD)/parseFloat(data[i].totalDepositUSD))*100).toFixed(2);
	      	if(is_percent_from){
	      		if(is_percent_to){
	      		  if(data[i].percent!='No Deposit' && parseFloat(data[i].percent) >= percent_from && parseFloat(data[i].percent) <= percent_to)
	      		    real_data.push(data[i]);  	
	      		}else{
	      		  if(data[i].percent!='No Deposit' && parseFloat(data[i].percent) >= percent_from)
	      		    real_data.push(data[i]);	
	      		}
	      	}else{
	      	    if(is_percent_to){
	      	   	  if(data[i].percent!='No Deposit' && parseFloat(data[i].percent) <= percent_to)
	      	   	     real_data.push(data[i]);
	      	    }else{
	      	    	real_data.push(data[i]);
	      	    }  	
	      	}  
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
         // "bPaginate":false,
           "bFilter": true,
           "bLengthChange": true,
           "bAutoWidth": false,
           "iDisplayLength": 100,
           "aaData": real_data,
           "dom": '<"toolbar">frtip',
           "bStateSave": true,
           "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData); },
           "fnStateLoad": function(oSettings) { return load_dt_view(oSettings); },
           "aaSorting": [[ 6, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "", "sType": "numeric","bVisible": false},
            { "mData": "id2", "sTitle": "Customer Id", "sType": "numeric",
             "fnRender": function(oObj){
             	
             	return '<a href="https://spotcrm.hedgestonegroup.com/crm/customers/page/'+oObj.aData.id+'" target="_blank">'+oObj.aData.id+'</a>';
             }
            },
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "Country", "sTitle": "Country"},
            { "mData": "Currency", "sTitle": "Curr"},
            { "mData": "AccountBalanceUSD", "sTitle": "AB USD"},
            { "mData": "realAccountBalanceUSD", "sTitle": "RAB USD"},
            { "mData": "percent", "sTitle": "Bonus Percent", "sType": "numeric", "bUseRendered": false,
              "fnRender": function(oObj){
                 var return_value=oObj.aData.percent!='No Deposit' ? '%'+oObj.aData.percent : oObj.aData.percent;
                 return return_value;                	
              } 
            },
            { "mData": "CurrentEmployee", "sTitle": "Employee"},
            { "mData": "regStatus", "sTitle": "Reg Status","sWidth": "100px"},  
            { "mData": "verification", "sTitle": "Verify"},
            { "mData": "registrationDate", "sTitle": "Registration", "sType": "date"},      
            { "mData": "lastLoginDate", "sTitle": "Last Login", "sType": "date"},
            { "mData": "lastNoteDate", "sTitle": "Last Note", "bUseRendered":false, 
              "fnRender": function(oObj){
              	 var return_value='';
              	 return_value = '<a href="#" data-id="'+oObj.aData.id+'" class="getNotes">'+oObj.aData.lastNoteDate+'</a>';
              	 if(oObj.aData.today_lastNoteDate!=0)
              	 {
              	 	return_value += '<a href="#" class="btn btn-xs btn-danger btn-block " onclick="event.preventDefault(); return false;">'+oObj.aData.today_lastNoteDate+'</a>'; 
              	 } 
              	 
              	 return return_value;
              } 
            },
            { "mData": "openPositions", "sTitle": "Open Positions", "bVisible": false},
            { "mData": "pendingWithdrawals", "sTitle": "Pending Withdrawals", "bVisible": false},
            { "mData": "tradeStatus2", "sTitle": "Trade Status2", "bVisible": false},
            { "mData": "tradeStatus", "sTitle": "Trade Status",  "sWidth": "100px",
               "fnRender": function (oObj) {
              	    
              	    var color='';
              	    var return_value='';
              	    
              	    switch(oObj.aData.tradeStatus){
              	     case 'Safe List':
              	       	color='safelist';
              	       	break ;
              	     case 'Never Available':
              	       color='na';
              	        break ;  
              	     case 'Regular':
              	       color='default';
              	       break ;
              	     case 'Fresh':
              	       color='secondary';
              	       break ;   
              	     case 'WD + DWTT':
              	       color='danger';
              	       break ;
              	     case 'Open Positions':
              	       color='openpositions';
              	       break ; 
              	     case 'Done':
              	       color='success';
              	       break ;
              	     case 'Academy':
              	       color='academy';
              	       break;
              	     case 'Waiting Deposit':
              	       color='waitingdeposit';
              	       break;
              	     case 'Robot':
              	       color='robot';
              	       break;
              	     case 'No Docs':
              	       color='nodocs';
              	       break;
              	     case 'Next Month':
              	       color='nextmonth';
              	       break;
              	     case 'Trade':
              	       color='trade';
              	       break;                    	
              	    }
              	    
              	    return_value='<a href="#" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'" class="btn btn-xs btn-'+color+' btn-block changeStatus">'+oObj.aData.tradeStatus+'</a>';
              	    
              	    if(oObj.aData.openPositions=='Open Positions' && oObj.aData.tradeStatus!='Open Positions'){
              	                  	    
                    return_value+='<a href="#" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'" class="btn btn-xs btn-openpositions openPositions">OP</a>';
                   }
                   if(oObj.aData.pendingWithdrawals=='pending'){
                   	return_value+='<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-danger pendingWithdrawals">PW</a>';
                   } 
                   
                   return return_value;
                  //  return '<a href="#" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'"  class="btn btn-xs btn-'+color+' btn-block changeStatus">'+oObj.aData.tradeStatus+'</a>';
                  }},
            { "mData": "comment", "sTitle": "Comment","sWidth": "150px"},
            { "mData": "commentDate", "sTitle": "Comment Date", "sType": "date", "bUseRendered":false, 
              "fnRender": function(oObj){
              	 return '<a href="#" data-id="'+oObj.aData.id+'" class="getComments">'+oObj.aData.commentDate+'</a>'; 
              }
            },
            { "mData": "addComment", "sTitle": "Add Comment",
               "fnRender": function (oObj) {
               	 var text=0;
               	 if(oObj.aData.comment==''){
               	 	text='Add';
               	 }else{
               	 	text='Edit';
               	 }
               	 return '<a href="#" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'"  class="btn btn-xs btn-secondary btn-block addComment">'+text+'</a>';
               }            
            },
            { "mData": "session_status", "sTitle": "Session Status", "bVisible":false},
            { "mData": "session", "sTitle": "Sessions","bUseRendered":false,
              "fnRender": function(oObj){
              	 var color=oObj.aData.session==0 ? 'default' : oObj.aData.session_status=='open' ? 'success' : 'safelist';
              	 return '<a href="#" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'"  class="btn btn-xs btn-'+color+' btn-block getSessions">'+oObj.aData.session+' Session(s)</a>';
              }
            }
            
            ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                 total_rab=0;
                 total_safelist=0;
                 total_na=0;
                 total_wd=0;
                 total_fresh=0;
                 total_openpositions=0;
                 total_regular=0;
                 total_done=0;
                 total_academy=0;
                 total_waitingdeposit=0;
                 total_robot=0;
                 total_nodocs=0;
                 total_nextmonth=0;
                 total_trade=0;
                 
                 for(var i=0; i<aiDisplay.length; i++){
                 	total_rab += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Safe List')
                 	  total_safelist += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Never Available')
                 	  total_na += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='WD + DWTT')
                 	  total_wd += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Fresh')
                 	  total_fresh += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Open Positions')
                 	  total_openpositions += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Regular')
                 	  total_regular += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Done')
                 	  total_done += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Academy')
                 	  total_academy += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Waiting Deposit')
                 	  total_waitingdeposit += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Robot')
                 	  total_robot += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='No Docs')
                 	  total_nodocs += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Next Month')
                 	  total_nextmonth += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);
                 	if(aaData[aiDisplay[i]]['tradeStatus2']=='Trade')
                 	  total_trade += parseFloat(aaData[aiDisplay[i]]['realAccountBalanceUSD']);                                    
                 }  
                $('#total_rab').html('$'+total_rab.toLocaleString());
                $('#total_safelist').html('$'+total_safelist.toLocaleString());
                $('#total_na').html('$'+total_na.toLocaleString());
                $('#total_wd').html('$'+total_wd.toLocaleString());
                $('#total_fresh').html('$'+total_fresh.toLocaleString());
                $('#total_openpositions').html('$'+total_openpositions.toLocaleString());
                $('#total_regular').html('$'+total_regular.toLocaleString());
                $('#total_done').html('$'+total_done.toLocaleString());
                $('#total_academy').html('$'+total_academy.toLocaleString());
                $('#total_waitingdeposit').html('$'+total_waitingdeposit.toLocaleString());
                $('#total_robot').html('$'+total_robot.toLocaleString());
                $('#total_nodocs').html('$'+total_nodocs.toLocaleString());
                $('#total_nextmonth').html('$'+total_nextmonth.toLocaleString());
                $('#total_trade').html('$'+total_trade.toLocaleString());
                
           }
    });
	});
	
	
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk option[value="4"]').attr('selected',true);
			getEmployeesForRetention();
	});
}
