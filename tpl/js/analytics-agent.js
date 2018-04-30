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


function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function monthLess(date){
	var day = $(date).datepicker('getDate').getDate();  
     var month = $(date).datepicker('getDate').getMonth();  
     var year = $(date).datepicker('getDate').getYear()+1900;
	 return year+'-'+month+'-'+day;
}

function clear(){
	
	 $('#this_deposits').html('<h5>-</h5>');
	 $('#this_average').html('<h5>-</h5>');
	 $('#this_3d').html('<h5>-</h5>');
	 $('#last_deposits').html('<h5>-</h5>');
	 $('#last_average').html('<h5>-</h5>');
	 $('#last_3d').html('<h5>-</h5>');
	 $('#this_real_balance').html('<h5>-</h5>');
	 $('#this_ftds').html('<h5>-</h5>');
	 $('#last_real_balance').html('<h5>-</h5>');
	 $('#last_ftds').html('<h5>-</h5>');
	 $('#this_turnover').html('<h5>-</h5>');
     $('#last_turnover').html('<h5>-</h5>');
}



$("#range-form").append('<input type="hidden" name="last_dpStart"  id="last_dpStart"   value="0" />');
$("#range-form").append('<input type="hidden" name="last_dpEnd" id="last_dpEnd"   value="0" />');
$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
     $('#last_dpStart').val(monthLess('#dpStart'));
     $('#last_dpEnd').val(monthLess('#dpEnd'));
     
  //   getServerData();
     getTransactionsForCommission();
     getRealBalance();
     getFtds();
     getTurnOverForRetention();
     getEmployeesForRetention();
   
     $('#desk').change(function(){
     	clear();
     	getEmployeesForRetention();
     });
     
      $('#dpStart, #dpEnd, #desk, #employee').change(function() 
    {
        clear();
        $('#last_dpStart').val(monthLess('#dpStart'));
        $('#last_dpEnd').val(monthLess('#dpEnd'));
        getTransactionsForCommission();
        getRealBalance();
        getFtds();
        getTurnOverForRetention();
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
  
  function getTransactionsForCommission(){
  	     
  	   
  	 
  	    apiRequest('getTransactionsForCommission',$('#range-form').serialize(),'#transactions_table_holder',function(data){
           var total_deposits=0;
           var total_deposits_3d=0;
           var average_deposits=0;
           var c=0;
           console.log("success");
           
           
           for(var i=0,j=data.length; i<j; i++){
           	   
                   total_deposits += parseFloat(data[i].amountUSD);
                 
               if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D'){
                   total_deposits_3d += parseFloat(data[i].amountUSD); 
                }
                 
           };
           if(daysBetween($('#dpStart').val(), $('#dpEnd').val())==0){
           	   c=1;
           }else{
           c= daysBetween($('#dpStart').val(), $('#dpEnd').val());}
           average_deposits=total_deposits/c;
           
           $('#this_deposits').html('<h5> $' +total_deposits.toLocaleString()+ '</h5>');
           $('#this_average').html('<h5> $' +average_deposits.toLocaleString()+ '</h5>');
           $('#this_3d').html('<h5> $' +total_deposits_3d.toLocaleString()+ '</h5>');
        });
        
        apiRequest('getTransactionsForCommission_Last',$('#range-form').serialize(),'#transactions_table_holder',function(data){
            total_deposits=0;
            total_deposits_3d=0;
            average_deposits=0;
            c=0;
    
           
           
           for(var i=0,j=data.length; i<j; i++){
           	   
                   total_deposits += parseFloat(data[i].amountUSD);
                 
               if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D'){
                   total_deposits_3d += parseFloat(data[i].amountUSD); 
                }
                 
           };
           if(daysBetween($('#last_dpStart').val(), $('#last_dpEnd').val())==0){
           	   c=1;
           }else{
           c= daysBetween($('#last_dpStart').val(), $('#last_dpEnd').val());}
           average_deposits=total_deposits/c;
          
           
           $('#last_deposits').html('<h5> $' +total_deposits.toLocaleString()+ '</h5>');
           $('#last_average').html('<h5> $' +average_deposits.toLocaleString()+ '</h5>');
           $('#last_3d').html('<h5> $' +total_deposits_3d.toLocaleString()+ '</h5>');
        });
        
  }
  
  
  function getRealBalance(){
  	
  	    apiRequest('getRealBalance',$('#range-form').serialize(),'#transactions_table_holder',function(data){ 
  	    	
  	     var total_real_balance=0;
  	     
  	     for(var i=0,j=data.length; i<j; i++){
           	   
                   total_real_balance += parseFloat(data[i].real_account_balanceUSD);
  	               
  	  };
  	  
  	  $('#this_real_balance').html('<h5> $' +total_real_balance.toLocaleString()+ '</h5>');
  	  
  	  });
  	  
 /* 	  apiRequest('getRealBalance_Last',$('#range-form').serialize(),'#transactions_table_holder',function(data){ 
  	    	console.log('success 3');
  	      total_real_balance=0;
  	      
  	     for(var i=0,j=data.length; i<j; i++){
           	   
                   total_real_balance += parseFloat(data[i].real_account_balanceUSD);
  	               total_ftds += 1;
  	  };
  	  
  	  $('#last_real_balance').html('<h5> $' +total_real_balance.toLocaleString()+ '</h5>');
  	  
  	 }); */
  }
  
  function getFtds(){
  	   apiRequest('getFtds',$('#range-form').serialize(),'#transactions_table_holder',function(data){ 
  	           var total_ftds=data.length;
  	     
  	  
  	  
  	  $('#this_ftds').html('<h5> ' +total_ftds.toLocaleString()+ '</h5>');
  	  
  	     
  	     });
  	     
  	  apiRequest('getFtds_Last',$('#range-form').serialize(),'#transactions_table_holder',function(data){ 
  	            
  	            total_ftds=data.length;
  	     
  	  
  	  
  	  
  	  $('#last_ftds').html('<h5> ' +total_ftds.toLocaleString()+ '</h5>');
  	     
  	     });   
  	
  }
  
function  getTurnOverForRetention(){
  	
  	   apiRequest('getTurnoverForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
  	   
  	     var total_turnover=0;
  	     for(var i=0,j=data.length; i<j; i++){
           	   
             total_turnover += parseFloat(data[i].turnOverUSD);
  	      };
  	    
           	    
  	   $('#this_turnover').html('<h5> $' +total_turnover.toLocaleString()+ '</h5>');      
  	       
  	
  	
  	});
  	
  	    apiRequest('getTurnoverForRetention_Last',$('#range-form').serialize(),'#transactions_table_holder',function(data){
  	   
  	       total_turnover=0;
  	     for(var i=0,j=data.length; i<j; i++){
           	   
             total_turnover += parseFloat(data[i].turnOverUSD);
  	      };
  	    
           	    
  	   $('#last_turnover').html('<h5> $' +total_turnover.toLocaleString()+ '</h5>');      
  	       
  	
  	
  	});
  	
  }
  
function getServerData(){
	apiRequest('getServerData','','',function(data){
		console.log(data);
	});
}  
  
function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}