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

$(document).ready(function() {
	getDesk();
	$('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getEmployees();
    
    $('#sum').focus(function(){
    	$('#sum').css('border-color','#ccc');
    	return false;	
    });
    
    $('#submit').click(function(){
    	if($('#sum').val() == "") {
    		$('#sum').css('border-color','#FA0808');
    	} else {
    		
    		getBigDepositors();
    	}
    	return false;
    });
    
     $('#desk').change(function() 
    {
      getEmployees();
    });
    
    $('#employee, #desk, #dpStart, #dpEnd').change(function(){
    //	getBigDepositors();
    });
    
    
});

function getEmployees() {
	 $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployeesShort',$('#range-form').serialize(),'#portfolio_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
}


function getBigDepositors() {
	apiRequest('getBigDepositors',$('#range-form').serialize(),'#bigdepositors_table_holder',function(data) {
		
		if(data == false) {
			alert("No data found");
		}else {
		
			var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
	        var href = '';
	        for(var i=0,j=data.length; i<j; i++){
	          href = url + '/?id='+data[i].customerId;
	          data[i].customerId = '<a href="'+href+'" target="_blank">'+data[i].customerId+'</a>' ;
	          data[i].customerName = '<a href="'+href+'" target="_blank">'+data[i].customerName+'</a>' ;
	        };
	        
			$('#bigdepositors_table').dataTable({
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
	            { "mData": "id", "sTitle": "#"},
	            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
	            { "mData": "customerName", "sTitle": "Customer Name"},
	            { "mData": "countryName", "sTitle": "Country"},            
	            { "mData": "sumAmountUSD", "sTitle": "Sum Amount USD", "sType": "numeric"},
	            { "mData": "lastDepositDate", "sTitle": "Last Deposit Date", "sType": "numeric"},
	            { "mData": "saleStatus", "sTitle": "Sale Status"},
	           	{ "mData": "aff_id", "sTitle": "Affiliate"},
	            { "mData": "employee", "sTitle": "Employee"}
	           ],
				
			});
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
