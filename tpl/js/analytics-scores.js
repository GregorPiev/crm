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



function monthLess(date,less){
	var day = $(date).datepicker('getDate').getDate();  
     var month = $(date).datepicker('getDate').getMonth() - (less-1);  
     var year = $(date).datepicker('getDate').getYear()+1900;
	 return month+'-'+year;
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
  
  getScore();
  
}

function selectRange2(date1, date2,range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
  
    $(date2).val(endDate.format("yyyy-MM-dd"));
    $(date1).val(startDate.format("yyyy-MM-dd"));
    
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $(date2).val(endDate.format("yyyy-MM-dd"));
  $(date1).val(startDate.format("yyyy-MM-dd"));
    
  }
  
}



$("#range-form").append('<input type="hidden" name="last_dpStart"  id="last_dpStart"   value="0" />');   //dpStart 1 month ago
$("#range-form").append('<input type="hidden" name="last_dpEnd" id="last_dpEnd"   value="0" />');  // dpEnd 1 month ago
$("#range-form").append('<input type="hidden" name="last_2_dpStart"  id="last_2_dpStart"   value="0" />');  // dpStart 2 months ago
$("#range-form").append('<input type="hidden" name="last_2_dpEnd" id="last_2_dpEnd"   value="0" />');  // dpEnd 2 months ago   



$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
     selectRange2('#dpStart','#dpEnd',monthLess('#dpStart',0));
     selectRange2('#last_dpStart','#last_dpEnd',monthLess('#dpStart',1));
     selectRange2('#last_2_dpStart','#last_2_dpEnd',monthLess('#dpStart',2));
     console.log($('#range-form').serialize());
     getEmployeesForRetention();
     getScore();
      
     
     $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        
       });
     
     $('#dpStart, #dpEnd, #desk, #employee').change(function(){
     selectRange2('#dpStart','#dpEnd',monthLess('#dpStart',0));	
     selectRange2('#last_dpStart','#last_dpEnd',monthLess('#dpStart',1));
     selectRange2('#last_2_dpStart','#last_2_dpEnd',monthLess('#dpStart',2));   
     console.log($('#range-form').serialize()); 
     getScore(); 
     });	  
     
});

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
  


function getScore () {
	
     
    apiRequest('getScore',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    	     console.log("success");	
             $('#transactions_table').dataTable( {
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
            "sSwfPath": "tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
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
           "aaSorting": [ [3, 'desc'] ],
          
          
                        
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "last2Deposits", "sTitle": "Deposits 2 Months Ago","sType": "numeric"},
            { "mData": "lastDeposits", "sTitle": "Deposits Last Month","sType": "numeric"},
            { "mData": "currentDeposits", "sTitle": "Deposits Current Month","sType": "numeric"},  
            { "mData": "targetDeposits", "sTitle": "Target Deposits","sType": "numeric"},
            { "mData": "weeklyDeposits", "sTitle": "Weekly Deposits","sType": "numeric"},
            { "mData": "weeklyTarget", "sTitle": "Weekly Target","sType": "numeric"}
            
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

