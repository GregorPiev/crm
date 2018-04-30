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
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  }
  
  function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}
  
  

$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
      $("#days").change(function(){
       selectRange(this.value);
       });
     
     
     getEmployeesForRetention();
      $( document ).on("click","#run",function() { 
     	
     	getNoTurnover();
     });

     
         
      $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        
       });
      $('#dpStart').change(function(){
     	
     	$('#days').val(daysBetween(this.value,$('#dpEnd').val()));
       }); 
      $('#dpEnd').change(function(){
     	
     	$('#days').val(daysBetween($('#dpStart').val(),this.value));
       });  
       
      $("#regStatus").select2( {
   	    placeholder: "Select Registration Status or leave blank for all",
        allowClear: true,
        width: "100%"
     
      }).append('<option value="activated" >Activated</option>',
                           '<option value="noTrade" >No Trade</option>',
                            '<option value="pending" >Pending</option>',
                             '<option value="deactivated" >Deactivated</option>');
  
 }); 
 
 function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
 

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
  
      });
     
      
      
    });
    
  } 
  
  function getNoTurnover(){
  	  
  	apiRequest('getNoTurnover',$('#range-form').serialize(),'#customers_table_holder',function(data){
  		  
  		console.log("success");
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
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "currency", "sTitle": "Currency"},  
            { "mData": "real_AB_USD", "sTitle": "Real Balance USD","sType": "numeric"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "regTime", "sTitle": "Registration","sType": "date"},
            { "mData": "firstDepositDate", "sTitle": "First Deposit","sType": "date"},
            { "mData": "lastDepositDate", "sTitle": "Last Deposit","sType": "date"},
            { "mData": "regStatus", "sTitle": "Registration"}
               ]
            
  	    });
  		
  });
  	
  }
  
  function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
   
  

  
