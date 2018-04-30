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
  $('#dpMonth').val(endDate.format("yyyy-MM"));
  
    
  }
  
  getMonthsForRetention();
  
} 
 
$(document).ready(function() {
     $('#dpMonth').val(new Date().format("yyyy-MM"));
     $('#dpMonth').datepicker({
     	
        });
    getDesk();      
    getEmployeesForRetention(); 
    getMonthsForRetention();
    $('#desk').change(function(){
    	getEmployeesForRetention();
    	
    	
    });
    $('#dpMonth,#desk,#employee').change(function(){
      	getMonthsForRetention();
    	
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
  
 
function getMonthsForRetention(chosen_title,chosen_value){
	var title='Total Deposits';
	var value="total_depositsUSD";
	var total_deposits=0;
	var total_customers=0;
	if(chosen_title!=undefined && chosen_value!=undefined){
		title=chosen_title;
		value=chosen_value;
	}
	apiRequest('getMonthsForRetention',$('#range-form').serialize(),'#chart_holder',function(data){
	  for(var i=0;i<data.length;i++){
	  	 total_deposits+=parseFloat(data[i].total_depositsUSD);
	  	 total_customers+=parseFloat(data[i].total_customers);
	  	
	  }
	 $('#total_deposits').html('$'+total_deposits.toLocaleString());
	 $('#total_customers').html(total_customers.toLocaleString());
	  var chart = AmCharts.makeChart( "chartdiv", {
   "type": "pie",
   "titles": [ {
  	
    "text": title,
    "size": 16
  } ],
   
   "dataProvider": data,
  "valueField": value,
  "titleField": "FDMonth",
  "startEffect": "elastic",
  "startDuration": 2,
  "labelRadius": 30,
  "innerRadius": "50%",
  "depth3D": 30,
  
  "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]] </b> ([[percents]]%)</span>",
  "angle": 40,
   "pullOutOnlyOne":true,
   
   "legend": {
					"align": "center",
					"markerType": "circle",
					"divId": "legenddiv",
					"equalWidths":true,
					"spacing":50,
					"markerLabelGap":10,
					"valueWidth":100,
					"switchType":"v",
					"valueText":"[[value]] "
				},
  "export": {
			"enabled": true,
			"position": "top-left",
			"legend": {
			"position": "bottom"
			 }
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


