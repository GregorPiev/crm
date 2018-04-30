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

$(document).ready(function() {
	 
	 getUserSpotId();
	 getDesk();
	 
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
   getEmployeesForRetention();
   init_option();
   getCountry();
  
   $('#desk').change(function(){
   	getEmployeesForRetention();
   	
   });
   
   $(document).on("click","a.status",function(event){
	event.preventDefault();
    return false;
});	

   $(document).on("click","a.openPositions",function(event){
	event.preventDefault();
	console.log( event.target);
	console.log(this);
	$('#openCustomerId').val($(this).attr('data-id'));
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


   $(document).on("click","a.pendingWithdrawals",function(event){
	 event.preventDefault();
	 $('#pendingCustomerId').val($(this).attr('data-id')); 
	 pendingWithdrawals();
	 
   });

   $(document).on("click","a.getNotes",function(event){
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
  


function getCountry(){
	$('#countries,#excludeCountries')
    .find('option')
    .remove();
    
    
	apiRequest('getCountry',$('#range-form').serialize(),'',function(data){
		
		jQuery.each(data, function() {
        $('#countries, #excludeCountries').append($('<option>', { value : this.name })
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
 
function getTradeStatus(){
	
	 $.ajax({
  	    	 url: "/api.php?cmd=getUserSpotId",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(spotId){
  	    	  if(spotId!=0){	
  	    	  	var selected=$("#employee option:selected").map(function(){ return this.value; }).get();
  	    	  	selected.push(spotId);
  	    	  	$('#employee').val(selected);
  	    	  }	
  	    	}	
  	    }).done(function(){	
  	  console.log($('#employee').val());  	
	apiRequest('getTradeStatus',$('#parameters-form').serialize(),$('#loader'),function(data){
	 
	 for(var i=0 ; i<data.length ; i++){
	      	data[i].tradeStatus2 = data[i].tradeStatus;
	      	data[i].id2=data[i].id;
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
           "bFilter": true,
           "bLengthChange": true,
           "bAutoWidth": false,
           "iDisplayLength": 100,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 6, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "", "sType": "numeric","bVisible": false},
            { "mData": "id2", "sTitle": "Customer Id", "sType": "numeric",
             "fnRender": function(oObj){
             	
             	return '<a href="https://spotcrm.onetwotrade.com/crm/customers/page/'+oObj.aData.id+'" target="_blank">'+oObj.aData.id+'</a>';
             }
            },
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "Country", "sTitle": "Country"},
            { "mData": "Currency", "sTitle": "Curr"},
            { "mData": "AccountBalanceUSD", "sTitle": "AB USD"},
            { "mData": "realAccountBalanceUSD", "sTitle": "RAB USD"},
            { "mData": "CurrentEmployee", "sTitle": "Employee"},
            { "mData": "regStatus", "sTitle": "Reg Status","sWidth": "100px"},  
            { "mData": "verification", "sTitle": "Verification"},
            { "mData": "registrationDate", "sTitle": "Registration", "sType": "date"},      
            { "mData": "lastLoginDate", "sTitle": "Last Login", "sType": "date"},
            { "mData": "lastNoteDate", "sTitle": "Last Note", 
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
                  
                  }},
            { "mData": "comment", "sTitle": "Comment","sWidth": "150px"},
            { "mData": "commentDate", "sTitle": "Comment Date", "sType": "date", "bUseRendered":false, 
              "fnRender": function(oObj){
              	 return '<a href="#" data-id="'+oObj.aData.id+'" class="getComments">'+oObj.aData.commentDate+'</a>'; 
              }
            }          
             ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                 var total_rab=0;
                 var total_safelist=0;
                 var total_na=0;
                 var total_wd=0;
                 var total_fresh=0;
                 var total_openpositions=0;
                 var total_regular=0;
                 var total_done=0;
                 var total_academy=0;
                 var total_waitingdeposit=0;
                 var total_robot=0;
                 var total_nodocs=0;
                 var total_nextmonth=0;
                 var total_trade=0;
                 
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
	});
	
}

function  getUserSpotId(){
  	apiRequest('getUserSpotId',$('#range-form').serialize(),'#transaction_table_holder',function(spotId){
  		
  		if (spotId==0) {
  			$('#desk_div').show();
  			$('#employee_div').show();
       }
    });
   }
   
function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}   
