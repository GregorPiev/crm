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
  
  getSpeedVerification();
  
}

function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployees',$('#range-form').serialize(),'#transactions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
    
}

$(document).ready(function() {
	
    getDesk();
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getSpeedVerification();
    getEmployees();

    $('#dpStart, #dpEnd, #desk, #affiliate, #employee').change(function() 
    {
        getSpeedVerification();
    });
    
    $('#desk').change(function() 
    {
      getEmployees();
    });
    
});
  

function getSpeedVerification(){

	var total_deltatime = 0;
	
    apiRequest('getSpeedVerification',$('#range-form').serialize(),'#speed_table_holder',function(data){
        
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
           "aaSorting": [[ 10, "desc" ]],
           "aoColumns": [
            { "mData": "id", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "countryName", "sTitle": "Country"},
            { "mData": "firstDepositDate", "sTitle": "FDD Date", "sType": "date"},
            { "mData": "PartialVerificationStatus", "sTitle": "Partial Verification Status Date", "sType": "date"},
            { "mData": "FullVerificationStatus", "sTitle": "Full Verification Status Date", "sType": "date"},
            //{ "mData": "DeltaNonetoPartialOrFull", "sTitle": "None To Partial Or Full (Hours)", "sType": "numeric"},
            //{ "mData": "DeltaPartialtoFull", "sTitle": "Partial To Full (Hours)", "sType": "numeric"},
            { "mData": "DeltaNonetoPartialOrFull", "sTitle": "None To Partial Or Full (Time)",
                "fnRender": function(oObj){
                total_deltatime += parseFloat(oObj.aData.DeltaNonetoPartialOrFull);
                var days = Math.floor(oObj.aData.DeltaNonetoPartialOrFull/24);
				var hours = oObj.aData.DeltaNonetoPartialOrFull-(days*24);
				
              	return 'Time in Days: '+ days + ' and Hours: ' + hours;
              }     
            },
            { "mData": "DeltaPartialtoFull", "sTitle": "Partial To Full (Time)",
                "fnRender": function(oObj){
                total_deltatime += parseFloat(oObj.aData.DeltaPartialtoFull);
                var days = Math.floor(oObj.aData.DeltaPartialtoFull/24);
				var hours = oObj.aData.DeltaPartialtoFull-(days*24);
				
              	return 'Time in Days: '+ days + ' and Hours: ' + hours;
              }     
            }
           ], 
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            var total_customers = 0;
			var average_delta_time = 0;
			
            for ( var i=0 ; i<aiDisplay.length ; i++ ) {
                total_customers++;
                //total_deltatime = parseFloat(aaData[ aiDisplay[i] ]['DeltaNonetoPartialOrFull']) + parseFloat(aaData[ aiDisplay[i] ]['DeltaPartialtoFull'])
            }
            
            average_delta_time = total_customers!=0 ? parseFloat(total_deltatime / total_customers) : 0;
             
             $('#total_customers').html(total_customers.toLocaleString());
             $('#averagedelta').html(average_delta_time.toLocaleString()+' Hrs');
           } 
           
           
    } );
    
    
    
      });
      
      
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}