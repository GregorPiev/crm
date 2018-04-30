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

$(document).ready(function(){
	getDesk();
	getAffiliates();
	
	$('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker(); 
    getCountries();
    
    getEmployees();
   	getSaleStatus();
    
    $('#desk').change(function() 
    {
      getEmployees();
    });
    
    $('#employee, #dpStart, #dpEnd, #country, #desk, #affiliate, #type, #saleStatus').change(function() 
    {
      getSaleStatus();
    });
	
});

function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    apiRequest('getEmployees',$('#range-form').serialize(),'#saleStatus_table_holder',function(data){
	   jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
    
}


function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    apiRequest('getAffiliates',$('#range-form').serialize(),'#saleStatus_table_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
      });

    });
    
}

function getCountries() {
	
	$('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
	apiRequest('getCountries',$('#range-form').serialize(),'#saleStatus_table_holder', function(data){
	jQuery.each(data, function() {
        $('#country')
            .append($('<option>', { value : this.name })
            .text(this.name)); 
      });

	});
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
  
  getSaleStatus();
  
}

function getSaleStatus(){
	apiRequest('getSaleStatus',$('#range-form').serialize(),'#saleStatus_table_holder', function(data){
		
		if(data == false) {
			alert("No data found");
		}else {
			
			$('#saleStatus_table').dataTable( {
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
            { "mData": "id", "sTitle": "Customer Id"},            
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "countryName", "sTitle": "Country"},   
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "type", "sTitle": "Type"},            
            { "mData": "lastBalance", "sTitle": "Balance"},
            { "mData": "currency", "sTitle": "Currency"},            
            { "mData": "aff_id", "sTitle": "Affiliate"},
            { "mData": "employee", "sTitle": "Employee"}
           ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            		$('#total_new').html("-");
            		$('#total_noAnswer').html("-");
            		$('#total_checkNumber').html("-");
            		$('#total_callAgain').html("-");
            		$('#total_inTheMoney').html("-");
            		$('#total_noCall').html("-");
            		$('#total_reassign').html("-");
            	    var total_count = 0;	
            	    var total_reassign = 0; 
            	    var total_noCall = 0;
            	    var total_inTheMoney = 0;
            	    var total_callAgain = 0;
            	    var total_checkNumber = 0;
            	    var total_noAnswer = 0;
            	    var total_new = 0;
            	    
            
            	              
	      			for ( var i=0 ; i<aiDisplay.length ; i++ ) {
	      					total_count++;	     
	      					if(aaData[ aiDisplay[i] ]['saleStatus'] == 'reassign') {
	      						 total_reassign += 1;	      						
	      					}else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'new') {
	      						 total_new += 1;	      						
	      					}
	      					else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'noAnswer') {
	      						 total_noAnswer += 1;	      						
	      					}	
	      					else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'checkNumber') {
	      						 total_checkNumber += 1;	      						
	      					}	
	      					else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'callAgain') {
	      						 total_callAgain += 1;	      						
	      					}	
	      					else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'inTheMoney') {
	      						 total_inTheMoney += 1;	      						
	      					}	
	      					else if(aaData[ aiDisplay[i] ]['saleStatus'] == 'noCall') {
	      						 total_noCall += 1;	      						
	      					}				
	              	
	      			}
	      			
	      			console.log("total_reassign:"+total_reassign,"total_new:"+total_new,"total_noAnswer:"+total_noAnswer,"total_checkNumber:"+total_checkNumber,"total_callAgain:"+total_callAgain,
	      			 "total_inTheMoney:"+total_inTheMoney,"total_noCall:"+total_noCall,"total_count:"+total_count);
	             	$('#total_saleStatus').html(total_count);
	             	if(total_reassign != 0) {
            	 	   $('#total_reassign').html(total_reassign+" ("+ (total_reassign*100/total_count).toLocaleString() +"%)"); 
            	 	}
            	 	if(total_noCall != 0) {
            	    	$('#total_noCall').html(total_noCall+" ("+ (total_noCall*100/total_count).toLocaleString() +"%)"); 
            	   	}
            	   	if(total_inTheMoney != 0) {
            	   	 $('#total_inTheMoney').html(total_inTheMoney+" ("+ (total_inTheMoney*100/total_count).toLocaleString() +"%)"); 
            	    }
            	    if(total_callAgain != 0) {
            	    	$('#total_callAgain').html(total_callAgain+" ("+ (total_callAgain*100/total_count).toLocaleString() +"%)"); 
            	    }
            	    if(total_checkNumber != 0) {
            	    	$('#total_checkNumber').html(total_checkNumber+" ("+ (total_checkNumber*100/total_count).toLocaleString() +"%)"); 
            	    }
            	    if(total_noAnswer != 0) {
            	    	$('#total_noAnswer').html(total_noAnswer+" ("+ (total_noAnswer*100/total_count).toLocaleString() +"%)"); 
            	    }
            	    if(total_new != 0) {
            	   	 $('#total_new').html(total_new+" ("+ (total_new*100/total_count).toLocaleString() +"%)"); 
	            	}
	             
	           } 
           
           
           
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