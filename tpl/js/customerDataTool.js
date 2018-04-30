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
	$('#registrationDate').val(new Date().format("yyyy-MM-dd"));
	$('#lastLoginDate').val("yyyy-mm-dd");
    $('#registrationDate,#lastLoginDate').datepicker();
    getEmployees();
    getCountries();
    getCampaigns();
    
    $('#submit').click(function(){
    	getCustomerDataTools();
    	 return false;
    });
    $('#desk').change(function() 
    {
      getEmployees();
    });
    
    $('#registrationDate, #lastLoginDate, #registrationStatus, #saleStatus, #demo, #country, #employee, #campaign, #onlineStatus, #accountType').change(function() 
    {
      getCustomerDataTools();
    });
    
    
    
    return false;
	
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

function getCountries () {

    $('#country')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getCountries',$('#range-form').serialize(),'#customerdatatool_table_holder',function(data){

      jQuery.each(data, function() {
      	if (this.iso!='') {
	        $('#country')
	        .append($('<option>', { value : this.iso })
	          .text(this.name + ' - ' + this.iso)); 
      	}
      });

    });
}

function getCampaigns() {
	
	$('#campaigns')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
    apiRequest('getCampaigns',$('#range-form').serialize(),'#customerdatatool_table_holder',function (data){
    	jQuery.each(data,function(){
    		if(this.name!=''){
    			$('#campaigns')
		        .append($('<option>', { value : this.name })
		          .text(this.name)); 		
    		}
    	});
    	
    });
}

function getCustomerDataTools() {
	
	apiRequest('getCustomerDataTools',$('#range-form').serialize(),'#customerdatatool_table_holder',function(data) {
		console.log(data);
	});
	return false;
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
