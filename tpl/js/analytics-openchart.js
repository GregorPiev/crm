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
  
    $('#exStart').val(endDate.format("yyyy-MM-dd"));
    $('#exEnd').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#exEnd').val(endDate.format("yyyy-MM-dd"));
  $('#exStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  
  getAssets();
  
}

var total=0; 
$(document).ready(function() {
    $('#exStart,#exEnd').val(new Date().format("yyyy-MM-dd"));
    $('#exStart,#exEnd').datepicker();  
    
    getDesk();
    
    $('#exStart,#exEnd,#desk').change(function(){
      	$('#asset_total,#current_price,#title_price,#title_asset_total,#total,#expected_real_pnl').text('-');
      	getAssets();
    	
    });
    $('#asset').change(function(){
        
        $('#title_price').text($('#asset option:selected').text()+' Current Price');
        $('#title_asset_total').text($('#asset option:selected').text()+' Positions USD');
	    $('#portlet-header').html('<h3><i class="fa fa-bar-chart"></i>'+$('#asset option:selected').text()+' Open Positions</h3>');
	    $('#asset_total,#current_price,#expected_real_pnl').text('-');
	    getCurrentPrice($('#asset').val());	
    });

});

  
function getAssets(){
	
	total=0; 
	
	$('#asset')
    .find('option')
    .remove()
    .end();
   
	apiRequest('getAssets',$('#range-form').serialize(),'',function(data){
		
	   if(data[0]==undefined){
	   	  bootbox.alert("No Open Positions For Specified Days");
	   	  return;
	   }	
	   jQuery.each(data, function() {
	   	 $('#asset').append($('<option>',{value : this.assetId , totalUSD: this.totalUSD})
	   	            .text(this.assetName));
	   	 total += parseFloat(this.totalUSD);
	   });
	   $('#title_price').text($('#asset option:selected').text()+' Current Price');
	   $('#title_asset_total').text($('#asset option:selected').text()+' Positions USD');
	   $('#portlet-header').html('<h3><i class="fa fa-bar-chart"></i>'+$('#asset option:selected').text()+' Open Positions</h3>');
	   getCurrentPrice($('#asset').val());
	
	});
} 
function getCurrentPrice($asset){
    
    post_data='asset='+$asset;
    $.ajax({
  	    url: "/api.php?cmd=getCurrentPrice",
  	    type: "POST",
  	    data: post_data,  
  	    dataType: "xml",
        timeout: 60000000,
  	    success:function(data){
  	       var rate=data.getElementsByTagName('rate');
  	       var price=[];
  	       var current_price=0;
  	       for(var i=0;i<rate.length;i++){
  	       	 price.push(parseFloat(rate[i].innerHTML));
  	       }
  	       current_price = price[price.length-1];
  	       getOpenPositionsForChart(current_price);	
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	    }); 	
	
}

function getOpenPositionsForChart(current_price){
	
	var title=$('#asset option:selected').text();
	apiRequest('getOpenPositionsForChart',$('#range-form').serialize(),'#chart_holder',function(data){
	  
	  var expected_real_pnl=0;	
	  var real_data=[], customers=[],unique=[];
	  
	  for(var i=0;i<data.length;i++){
	  	if(unique[data[i].customerId]==1){
	  		continue;
	  	}
	  	data[i].real_pnl=Math.min(data[i].totalDepositUSD,data[i].pnl);
	  	customers.push({"customerId":data[i].customerId,
	  	                "totalDepositUSD":parseFloat(data[i].totalDepositUSD),
	  	                 "pnl":parseFloat(data[i].pnl),
	  	                 "real_pnl":parseFloat(data[i].real_pnl),
	  	                 "payout":0,
	  	                 "amountUSD":0});
	  	unique[data[i].customerId]=1;                 
	  }
	  unique=[];
	  real_data.push({"rate": 0,
		              "customers": JSON.parse(JSON.stringify(customers)),
		              "real_pnl" : 0
	                   });
	  for(var i=0;i<data.length;i++){
	  	if(unique[data[i].rate]==1){
				continue ; 
			}
		real_data.push({"rate": data[i].rate,
		                "customers": JSON.parse(JSON.stringify(customers)),
		                "real_pnl" : 0
		                });	
	  	unique[data[i].rate]=1;
	  }
	  
	  
	  for(var i=0; i<real_data.length;i++){
	  	
	  	for(var j=0; j<data.length;j++){
	  	  for(var k=0; k<real_data[i].customers.length;k++){
	  	  	
	  		if(real_data[i].customers[k].customerId==data[j].customerId){
	  
	  	  	   if(data[j].rate<=real_data[i].rate){
	  			  if(data[j].position=='up'){
	  				 real_data[i].customers[k].payout += parseFloat(data[j].potentialWinPayout);
	  			  }else{
	  				 real_data[i].customers[k].payout += 0;  
	  			  }
	  		   }else{
	  			  if(data[j].position=='up'){
	  				 real_data[i].customers[k].payout += 0;
	  			   }else{
	  				real_data[i].customers[k].payout += parseFloat(data[j].potentialWinPayout);  
	  			   }
	  		   } 
	  		   real_data[i].customers[k].amountUSD += parseFloat(data[j].amountUSD);  
	  		}
	  	   }	
	  	}
	  	
	  	for(var j=0;j<real_data[i].customers.length;j++){
	  		real_data[i].customers[j].expected_pnl= real_data[i].customers[j].amountUSD - real_data[i].customers[j].payout;
	  		real_data[i].customers[j].expected_real_pnl=Math.min(real_data[i].customers[j].totalDepositUSD,real_data[i].customers[j].pnl + real_data[i].customers[j].expected_pnl);
	  		real_data[i].real_pnl += (real_data[i].customers[j].expected_real_pnl-real_data[i].customers[j].real_pnl);
	     } 
	     if(real_data[i].rate<=current_price){
	       expected_real_pnl = real_data[i].real_pnl;
	     }
	     real_data[i].real_pnl = (real_data[i].real_pnl).toFixed(2);
	  }
	  
	 console.log(real_data);
	 
	  
	  $('#current_price').text(current_price);
  	  $('#asset_total').text('$ '+(parseFloat($('#asset option:selected').attr('totalUSD'))).toLocaleString());
  	  $('#total').text('$ '+total.toLocaleString());
  	  $('#expected_real_pnl').text('$ '+expected_real_pnl.toLocaleString());
	 
	  var chart = AmCharts.makeChart( "chartdiv", {
    "type": "serial",
   
    "titles": [ {
  	
     "text": title,
     "size": 16
    } ],
    "dataProvider": real_data,
    "categoryField": "rate",
    "graphs": [{
        "balloonText": "[[category]]: <b>$ [[value]]</b>",
        "fillAlphas": 0.8,
        "lineAlpha": 0.2,
        "type": "column",
        "valueField": "real_pnl"
    }],
    "valueAxes": [ {
    "gridColor": "#FFFFFF",
    "gridAlpha": 0.2,
    "dashLength": 0
  } ],
  "gridAboveGraphs": true,
  "startDuration": 1,
  
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
			$('#desk option[value="4"]').attr('selected',true);
			getAssets();
	});
}




