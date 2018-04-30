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

$(document).ready(function() {
	getRecentDeposits();
	getTotalLeads($('#selectWeek').val());	
	getTotalDeposits($('#selectWeek').val());
	getLeadsAndDeposits($('#option1').val());
	getDepositByCountry($('#option1').val());	
	getHourlyDepositsStatistics($('#option_1').val());

	$('#selectWeek').change(function(){
		getTotalLeads(this.value);
		getTotalDeposits(this.value);
	});
	
	$('#btn1, #btn2').click(function() {		

		getLeadsAndDeposits($(this).children().val());

		getDepositByCountry($(this).children().val());

	});
	
	$('#btn_1, #btn_2, #btn_3').click(function() {		
		getHourlyDepositsStatistics($(this).children().val());
	});
});

function getRecentDeposits(date) {
	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card'; 
	apiRequest('getRecentDeposits',$('#range-form').serialize(),'#recentDeposits_table_holder',function(data){	
		for(var row in data){
               data[row].view = '<a class="btn-sm btn-secondary" target="_blank" href="'+url+'/?id='+data[row].customerId+'">View</a>';           
        }
		$('#recentDeposits_table').dataTable({			
                  
           "bDestroy": true,
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "aaSorting": [[ 2, "desc" ]],                    
           "aoColumns": [
            { "mData": "depositedOn", "sTitle": "Deposited On","sType": "numeric"},
            { "mData": "customerId", "sTitle": "ID"},
            { "mData": "customerName", "sTitle": "Name"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "view", "sTitle": "View"}
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {               
              
           		 var total_deposits = 0;
           		 for (var i=0; i < aiDisplay.length; i++) {
					  total_deposits += parseFloat(aaData[ aiDisplay[i] ]['amount']);
					};
				$('#tertiaryValue').html('$'+total_deposits.toLocaleString());
           }
		});	
	});
} 

function getTotalLeads(date) {
	apiRequest('getTotalLeads',$('#range-form').serialize(),'#div',function(data){
		$('#secondaryValue').html(data[0]["totalLeads"]);
		$('#primaryValue').html(data[0]["todayLeads"]);
	});
}

function getTotalDeposits(date) {
	apiRequest('getTotalDeposits',$('#range-form').serialize(),'#div',function(data){
		var total_deposits = 0;
		 for (var i=0; i < data.length; i++) {
		   total_deposits += parseFloat(data[i]["amount"]);
		 };
		 $('#quarterlyValue').html('$'+total_deposits.toLocaleString());		
	});	
}

function getLeadsAndDeposits(date) {
	var now = new Date();
	var day = now.getDay();
	var month = now.getMonth()+1;
	var year = now.getFullYear();
	var numDayOfLastMonth = new Date(year, month-1, 0).getDate();	
	var l = [];
	if(date == "week") {
		date = $('#option1');
		now.setDate(now.getDate()-8);
			for (var i=0; i < 7; i++) {
			 	now.setDate(now.getDate()+1);			
			  	l.push(now.format("yyyy-MM-dd"));
			};							
		 now.setDate(now.getDate()-6);
		 var firstDay = parseInt(now.format("dd"));
		 var numDay = 7;				
	}else {
		date = $('#option2');
		now.setDate(now.getDate()-(numDayOfLastMonth+1));
		for (var i=0; i <= numDayOfLastMonth; i++) {
			 	now.setDate(now.getDate()+1);			
			  	l.push(now.format("yyyy-MM-dd"));
			};
		now.setDate(now.getDate()-(numDayOfLastMonth));
		var firstDay = parseInt(now.format("dd"));
		var numDay = numDayOfLastMonth;
	}
	
	apiRequest('getLeadsAndDeposits',date,'#canvasContainer1',function(data){	
		 $('#canvas1').remove();
		 $('#canvasContainer1').html('<canvas id="canvas1"></canvas>');
		 
		 var depositData = data.deposits;
		 var leadsData = data.leads;		 
		 var dataL =[] , dataD = [];
	 	 var fDay = firstDay;
		 for (var i=0,j=0; j < numDay; j++) {
		 	if(typeof(depositData[i]) !== 'undefined'){
		 		if(numDay != 7 && fDay > numDay) {
		 			fDay = 1;
		 		}
				 if(parseInt(depositData[i].theDay) == fDay) {
					 dataD[j] = depositData[i++].amount;
					 fDay++;
		 }else {
					 dataD[j] = 0;	
					 fDay++;	
				}	
			}else {
				 dataD[j] = 0;				 
		 }		
			 };
		  var fDay = firstDay;	
		  for (var i=0,j=0; j < numDay; j++) {
		 	if(typeof(leadsData[i]) !== 'undefined'){
		 		if(numDay != 7 && fDay > numDay) {
		 			fDay = 1;
		 }		
				 if(parseInt(leadsData[i].theDay) == fDay) {		 	
					 dataL[j] = leadsData[i++].countCustomers;
					 fDay++;
				}else {
					 dataL[j] = 0;	
					 fDay++;	
				}	
	   		}else { 
				 dataL[j] = 0;				 
			}			
		 }; 	 		 	
		 lineChartData = {			
				labels : l,
				datasets : [
					{
						fillColor : "rgba(229, 65, 45, 0.64)",
						strokeColor : "rgb(229, 65, 45)",
						pointColor : "rgb(229, 65, 45)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(151,187,205,1)",
						data : dataL
					},
					{						
						fillColor : "rgba(240, 173, 78, 0.51)",
						strokeColor : "rgb(240, 173, 78)",
						pointColor : "rgb(240, 173, 78)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(220,220,220,1)",						
						data : dataD
					}
				]
		};
		var ctx = document.getElementById("canvas1").getContext("2d");
	 	//console.log(ctx);
		window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true
				
		});		
	});
}

function getDepositByCountry(date) {
	if(date == "week") {
		date = $('#option1');
	}else {
		date = $('#option2');
	}
	apiRequest('getDepositByCountry',date,'#div',function(data){
		console.log(data);
		if(data != false) {
			$('#canvas2').remove();
			$('#canvasContainer2').html('<canvas id="canvas2"></canvas>');
			var depositors = [];
			for (var i = 0; i < data.length; i++) {
				depositors[i] = data[i]["countDepositors"];
			}
			;
			var maxdepositors = Math.max.apply(Math, depositors);
			//$('#maxCountry').html(maxdepositors.toLocaleString()+'%');
			var countDepositors = [];
			var nameCountry = [];
			var doughnutData = [];
			var colorArray = ["#F7464A", "#46BFBD", "#FDB45C", "#949FB1", "#4D5360"];
			var highlightArray = ["#FF5A5E", "#5AD3D1", "#FFC870", "#A8B3C5", "#616774"];
			for (var i = 0; i < data.length; i++) {
				doughnutData.push({
					value: data[i]["countDepositors"].toLocaleString(),
					color: colorArray[i],
					highlight: highlightArray[i],
					label: data[i]["nameCountry"]
				});
			}
			;
			var ctx = document.getElementById("canvas2").getContext("2d");
			new Chart(ctx).Doughnut(doughnutData, {

				animateScale: true,
			});
		}
	});
}

function getHourlyDepositsStatistics(date) {
	if(date == "day") {
		date = $('#option_1');
	}else if(date == "week") {
		date = $('#option_2');
	}else {
		date = $('#option_3');
	}	
	var newDate = new Date();
	for(j = -1; j<2 ; j++){
	    var tempDate = new Date(), tempHourArr = [];
	    tempDate.setDate(tempDate.getDate() - j);
	    for(i=0; i<24; i++){
	     var hour = tempDate.setHours(i),
	         minutes = tempDate.setMinutes(0),
	         stringHour = (tempDate.getHours()<10?'0':'') + tempDate.getHours() + ":" + (tempDate.getMinutes()<10?'0':'') + tempDate.getMinutes();
	        tempHourArr.push(stringHour);   
	    }
   	}
	
	apiRequest('getHourlyDepositsStatistics',date,'#canvasContainer3',function(data){
		 $('#canvas3').remove();
		 $('#canvasContainer3').html('<canvas id="canvas3"></canvas>');
		 var ctx = document.getElementById("canvas3").getContext("2d");
	 	 var dataD = [];
	 	for (var i=0,j=0; i < data.length; j++) {
	 		if(data[i]["theHour"] == j)
		   		dataD[j] = data[i++]["amount"];		   		
	   		else 
	   			dataD[j] = 0;
		 };
		 lineChartData = {			
				labels : tempHourArr ,
				datasets : [
					{
						fillColor : "rgba(229, 65, 45, 0.64)",
						strokeColor : "rgb(229, 65, 45)",
						pointColor : "rgb(229, 65, 45)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(151,187,205,1)",
						data :dataD
					}
				]
		};
		 window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true
				
		});		
	});
}


	

