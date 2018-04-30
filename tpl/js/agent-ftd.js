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

  
}

// $("#range-form").append('<input class="form-control" type="hidden" name="desk" id="desk" value="1">');

$(document).ready(function() {
	 getUserSpotId();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
     getEmployeesForRetention();
     $('#desk').change(function(){
     	getEmployeesForRetention();
     });
});

$( document ).on("click","a.getNotes",function() {
	$('#note_customer').val($(this).attr('data-customerId'));            
	$('#note_employee').val($(this).attr('data-employee'));
	console.log($('#note-form').serialize());
	bootbox.dialog({
        title: "Notes",
        message:  
                   '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="note_table_holder">'+
                    
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="note_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>'+
                    '<script>getNotesForFTD();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
	
});

function getNotesForFTD(){
	apiRequest('getNotesForFTD',$('#note-form').serialize(),'#note_table_holder',function(data){
		console.log("success note");
	     $('#note_table').dataTable( {
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
           "aaSorting": [[ 4, "asc" ]],                    
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

function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
    
    
   

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
  
      });
      
      
      
    });
    
  } 
 
function getFTDs(){
	apiRequest('getFTDsForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
	   
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 8, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer Id"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "date", "sTitle": "Assign Date","sType":"date"},  
            { "mData": "notes", "sTitle": "Total Notes","sType": "numeric", "bUseRendered": false,
               "fnRender": function (oObj) {
                    return '<a href="#" data-customerId="'+oObj.aData.customerId+'" data-employee="'+oObj.aData.employeeId+'" class="getNotes">'+oObj.aData.notes+'</a>';
                  } 
            
            },  
            
            
            { "mData": "dailyDepositUSD", "sTitle": "Daily Deposits USD","sType": "numeric"}, 
            { "mData": "weeklyDepositUSD", "sTitle": "Weekly Deposits USD","sType": "numeric"},
            { "mData": "totalDepositUSD", "sTitle": "Total Deposits USD","sType": "numeric"}
             ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            	var total_ftds=aiDisplay.length;
            	var closed_ftds=0;
            	var total_notes=0;
            	var without_notes=0;
            	var without_deposits=0;
            	var percent_without_notes=0;
            	var percent_without_deposits=0;
            	var total_daily=0;
            	var total_weekly=0;
            	var total_deposits=0;
            	var percent_daily=0;
            	var percent_weekly=0;
            	 for(var i=0;i<aiDisplay.length;i++){
            	 	if(aaData[aiDisplay[i]]['closed']=='YES'){
            	 		closed_ftds++;
            	 	}
            	 	if(aaData[aiDisplay[i]]['notes']==0){
            	 		without_notes++;
            	 	}
            	 	if(aaData[aiDisplay[i]]['totalDepositUSD']==0){
            	 		without_deposits++;
            	 	}
            	 	total_notes+=parseFloat(aaData[aiDisplay[i]]['notes']);
            	 	total_daily+=parseFloat(aaData[aiDisplay[i]]['dailyDepositUSD']);
            	 	total_weekly+=parseFloat(aaData[aiDisplay[i]]['weeklyDepositUSD']);
            	 	total_deposits+=parseFloat(aaData[aiDisplay[i]]['totalDepositUSD']);
            	 }
            	 if(total_ftds==0){
            	 	percent_without_notes=0;
            	 	percent_without_deposits=0;
            	 }else{
            	 percent_without_notes=((without_notes/total_ftds)*100).toFixed(2);
            	 percent_without_deposits=((without_deposits/total_ftds)*100).toFixed(2);
            	 }
            	 if(total_deposits==0){
            	 	percent_daily=0;
            	 	percent_weekly=0;
            	 }else{
            	 	percent_daily=((total_daily/total_deposits)*100).toFixed(2);
            	 	percent_weekly=((total_weekly/total_deposits)*100).toFixed(2);
            	 	
            	 	
            	 }
            	 $('#total_ftds').html(total_ftds.toLocaleString());
            	 $('#closed_ftds').html(closed_ftds.toLocaleString());
            	 $('#without_notes').html(without_notes.toLocaleString());
            	 $('#without_deposits').html(without_deposits.toLocaleString());
            	 $('#total_notes').html(total_notes.toLocaleString());
            	 $('#total_daily').html('$'+total_daily.toLocaleString());
                 $('#total_weekly').html('$'+total_weekly.toLocaleString());
                 $('#total_deposits').html('$'+total_deposits.toLocaleString()); 
                 $('#percent_without_notes').html('%'+percent_without_notes.toLocaleString());
                  $('#percent_without_deposits').html('%'+percent_without_deposits.toLocaleString());
                  $('#percent_daily').html('%'+percent_daily.toLocaleString());
                  $('#percent_weekly').html('%'+percent_weekly.toLocaleString());
	        }
	        
	     });
	  });
}    

function  getUserSpotId(){
  	apiRequest('getUserSpotId',$('#range-form').serialize(),'#transaction_table_holder',function(spotId){
  		globalSpotId = spotId;
  		if (spotId==0) {
  			
  			$('#desk_col').fadeIn(200,function(){
  			 $('#employee_col').fadeIn(200);	
  			});
       }
    });
   }