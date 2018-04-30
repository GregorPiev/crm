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
  };
  


  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#chEnd').val(endDate.format("yyyy-MM-dd"));
    $('#chStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#chEnd').val(endDate.format("yyyy-MM-dd"));
  $('#chStart').val(startDate.format("yyyy-MM-dd"));
    
  }

  
}

$(document).ready(function() {
	 
	 $('#chStart, #chEnd').val(new Date().format("yyyy-MM-dd")).datepicker();
	 
	 getDesk();
});

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#change_table_holder', function(data) {			
			$.each(data, function(key, value) { 
				 $('#deskFrom,#deskTo').append($('<option>', { value : this.id , text : this.name })); 
			});
			
			$('#deskFrom option[value="4"]').attr('selected',true);
			$('#deskTo option[value="5"]').attr('selected',true);
	});
}

function getDeskChanges(){
	
	apiRequest('getDeskChangesForRetention',$('#range-form').serialize(),'#change_table_holder',function(data){
		$('#change_table').dataTable( {
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
           "aaSorting": [[ 6, "asc" ]],                    
           "aoColumns": [
      //      { "mData": "id", "sTitle": "Log ID"},
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"}, 
            { "mData": "oldDesk", "sTitle": "Old Desk"},
            { "mData": "oldEmployee", "sTitle": "Old Employee"},
            { "mData": "newDesk", "sTitle": "New Desk"},
            { "mData": "newEmployee", "sTitle": "New Employee"},
            { "mData": "date", "sTitle": "Change Date"}
            ]
         });
	});
}


