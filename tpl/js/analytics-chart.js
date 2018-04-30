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
function addDay(date,i){
	var date1 = date.split('-'); 
	var y = parseInt(date1[0], 10); 
	var m = parseInt(date1[1], 10); 
	var d = parseInt(date1[2], 10); 
	return new Date(y, m-1, d+i).format("yyyy-MM-dd");
	
}

var datas={
	       "Total Deposits":"totalDeposit",
	       "Total Credit Cards":"totalCreditCard",
	       "Total 3D Deposits":"totalDeposit3D",
	       "Total Non 3D Deposits":"totalDepositNon3D",
	       "Total Wires":"totalDepositWire",
	       "Total Withdrawals":"totalWithdrawal",
	       "Total Bonus":"totalBonus",
	       "Total Bonus Withdrawals":"totalBonusWithdrawal"
	
           };
var data1,data2,chosen_data;

 function getData(){
 	jQuery.each(datas, function(key,value) {
    	if(key==$('#data1 option:selected').text()){
    		$('#title_data1').html(key);
    		data1=value;
    		
    	}
    	if(key==$('#data2 option:selected').text()){
    		$('#title_data2').html(key);
    		data2=value;
    	
    	}
    	
    });
    $('#portlet_header').html(' <h3><i class="fa fa-table"></i>'+$('#data1 option:selected').text()+' vs '+$('#data2 option:selected').text()+'</h3>');
 }
 
 function getDataDesk(){
 	jQuery.each(datas, function(key,value) {
    	if(key==$('#chosen_data option:selected').text()){
    		$('#title_data1').html($('#desk1 option:selected').text()+' '+key);
    		$('#title_data2').html($('#desk2 option:selected').text()+' '+key);
    		chosen_data=value;
    		
    	}	
    });
    $('#portlet_header').html(' <h3><i class="fa fa-table"></i>'+$('#desk1 option:selected').text()+' vs '+$('#desk2 option:selected').text()+'</h3>');
 }                    
	
$('#chart').append('<div class="ex-tooltip" id="tt"></div>');


$(document).ready(function() {
	getDesk();
    getData();
    $('#dpStart').daterangepicker({
    	singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
     $('#dpEnd').daterangepicker({
    	singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    
     
     
    function dateSet(start, end,label) {
        $('#dpStart').val(start.format('YYYY-MM-DD'));
        $('#dpEnd').val(end.format('YYYY-MM-DD'));
        $('#button1').html(label +' <span class="caret"></span>');
        getChart();
    }
    dateSet(moment(), moment());
    

    $('#reportrange').daterangepicker({
        ranges: {
           'Today': [moment(), moment()],
           'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
           'Last 7 Days': [moment().subtract(6, 'days'), moment()],
           'Last 30 Days': [moment().subtract(29, 'days'), moment()],
           'Last 90 Days' : [moment().subtract(89, 'days'), moment()],
            'This Month ' : [moment().startOf('month'), moment()],
           'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
        }
        
        	
        
    }, dateSet);
    $('#button1').html('Today <span class="caret"></span>');
    getEmployeesForRetention();
    getChart();
    
    
    $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        getChart();
       });
    
    $('#dpStart, #dpEnd').change(function(){
        $('#button1').html('Custom Range <span class="caret"></span>');
        getChart();
      });
       $('#employee').change(function(){
        getChart();
       });
    $('#data1,#data2').change(function(){
     	getData();
     	getChart();
     });     
    $('#desk1,#desk2,#chosen_data').change(function(){
    	 getDataDesk();
    	 getChart();
     });
     
     $('#chooseChart').change(function(){
    switch($("#chooseChart option:selected").text()){
    	case "Total Comparisons":
    	    $('#button1').html('Today <span class="caret"></span>');
    	    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    	    $('#desk [value="0"]').attr("selected",true);
    	    $('#employee [value="0"]').attr("selected",true);
    	    $('#data1 [value="0"]').attr("selected",true);
    	    $('#data2 [value="2"]').attr("selected",true);
    	    $('#chart2_1,#chart2_2').slideUp(100,function(){
    	    	$('#chart1_1,#chart1_2').slideDown(300);
    	    });
    	     getData();
    	     getEmployeesForRetention();
             getChart();
    	    break;
    	
    	case "Desk Comparisons": 
    	    $('#button1').html('Today <span class="caret"></span>');
    	    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    	    $('#desk1 [value="4"]').attr("selected",true);
    	    $('#desk2 [value="5"]').attr("selected",true);
    	    $('#chosen_data [value="0"]').attr("selected",true);
    	    $('#chart1_1,#chart1_2').slideUp(100,function(){
    	    	$('#chart2_1,#chart2_2').slideDown(300);
    	    });
    	    getDataDesk();
    	    getChart();
    	   
    	    break;
    	
    }
   });
   $('#withoutWeekEnd').change(function(){
      	if(Math.ceil(daysBetween($('#dpStart').val(),$('#dpEnd').val()))!=0)
      		getChart();
      	
    });    
});

function getChart(){
  var x1=[];
  var addDate=0;
  var k= Math.ceil(daysBetween($('#dpStart').val(),$('#dpEnd').val()));
  var z=[];
  var a=[];
  var total_data1=0;
  var total_data2=0;
  
  var y1=new Float64Array(200);
  var a1=new Float64Array(200);

  if(k!=0){
   for(var i=0;i<=k;i++){
  	addDate=addDay($('#dpStart').val(),i);
  	if($('#withoutWeekEnd').prop('checked')==true){ 
  	   if(new Date(addDate).getDay()!=0 && new Date(addDate).getDay()!=6) 
  	        x1.push(addDate);
  	}else {
  	  x1.push(addDate);  
  	}
  }
  } else{
  	for(var i=0;i<24;i++){ 
  		if(i<10)
  		x1[i]=$('#dpStart').val()+' 0'+i+':00';
  		
  		else
  		x1[i]=$('#dpStart').val()+' '+i+':00';
  	}
  }
  
    topOffset = -500;
    leftOffset=-262;
    
  var chart_data = {
    "xScale": "time",
    "yScale": "linear",
    "type": "line-dotted",
    "main": [{
        "className": ".firstData",
      
        "data":[]
       },{
       	 "className":".secondData",
       	 "data":[]
       }
        ]
};
 
   var opts = {
	
    "dataFormatX": function (x) {
        if(k!=0){
        return d3.time.format('%Y-%m-%d').parse(x);
       }else {
       	return d3.time.format('%Y-%m-%d %H:%M').parse(x);
       }
    },
    "tickFormatX": function (x) {
        if(k!=0){
        return d3.time.format('%e %B')(x);
        }else {
        return d3.time.format('%H:%M')(x);	
        }
    },
    "mouseover": function (d, i) {
        var pos = $(this).offset();
        if(k!=0){
        $('#tt').html('Date: ' +d3.time.format('%e %B %a')(d.x) + '<br/> Amount: $' + (d.y).toLocaleString());
        }
        else{
        $('#tt').html('Hour: ' +d3.time.format('%H:%M')(d.x) + '<br/> Amount: $' + (d.y).toLocaleString());	
        }
        $('#tt').css({
             top: topOffset + pos.top,
             left: pos.left + leftOffset,
                
            });
      
        $('#tt').show();
     
       
    },
    "mouseout": function (x) {
        $('#tt').hide();
   } 
};
 
  

  switch($("#chooseChart option:selected").text()){
   
    case "Total Comparisons":
   
     apiRequest('getRealScoreForChart',$('#range-form').serialize(),'#transactions_table_holder',function(data){ 
          var myChart = new xChart('line-dotted', chart_data, '#chart', opts);
  
          for(var j=0;j<data.length;j++){
            total_data1+=parseFloat(data[j][data1]);
	 		total_data2+=parseFloat(data[j][data2]);  
              
	 	     if(k!=0){
              for(var i=0;i<x1.length;i++){
	 	      if(x1[i]==data[j].confirmDate){
	 	      	
	 		y1[i]=parseFloat(data[j][data1]);
	 		a1[i]=parseFloat(data[j][data2]);
	 		}}
	 		}else{
	 		for(var i=0;i<24;i++){
	 			
	 	      if(x1[i]==data[j].confirmHour){
	 	      	
	 		y1[i]=parseFloat(data[j][data1]);
	 		a1[i]=parseFloat(data[j][data2]);
	 		}
	 		}}	
	 		
	 	}
	 	
	 	
	 

	 $('#total_data1').html('$'+total_data1.toLocaleString());
	 $('#total_data2').html('$'+total_data2.toLocaleString());
	 if(k!=0){
	    var j=x1.length;
	    }
	 else{
	 	var j=24;
	 }	
	 for(var i=0;i<j;i++){ 	
	 	z.push({
	 		x:x1[i],y:y1[i]
	 	});
	 	a.push({
	 		x:x1[i],y:a1[i]
	 	});
	 }
	 console.log(y1);
	 console.log(a1);
	 myChart.setData({
        "xScale": "time",
        "yScale": "linear",
        "type": "line-dotted",
        "main": [{
            className: ".firstData",
           
            data: z
        },
        {
        	className: ".secondData",
            data: a
        }
        ] });     

});
     break;
  
  case "Desk Comparisons":
    z=[];
    a=[];
    total_data1=0;
    total_data2=0;
    apiRequest('getChartForDesks',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    	var myChart = new xChart('line-dotted', chart_data, '#chart', opts);
    	for(var j=0;j<data.length;j++){
    		if($('#desk1').val()!=$('#desk2').val()){
    		    if($('#desk1').val()==data[j]['desk']){
    		
    			   total_data1+=parseFloat(data[j][chosen_data]);
    		    }else{
    			   total_data2+=parseFloat(data[j][chosen_data]);
    		}
    		}else{
    			total_data1+=parseFloat(data[j][chosen_data]);
    			total_data2+=parseFloat(data[j][chosen_data]);
    		}
    		if(k!=0){
    		for(var i=0;i<x1.length;i++){
    			 if(x1[i]==data[j].confirmDate){
    			 	if($('#desk1').val()!=$('#desk2').val()){ 
    			 	   if($('#desk1').val()==data[j]['desk']){
    			           y1[i]+=parseFloat(data[j][chosen_data]);
    		           }else{
    			           a1[i]+=parseFloat(data[j][chosen_data]);
    		           }
    		         }else{
    		         	 y1[i]+=parseFloat(data[j][chosen_data]);
    		         	 a1[i]+=parseFloat(data[j][chosen_data]);
    		         }
    		}
    	}}
    	 else{
    	   	for(var i=0;i<24;i++){
    			 if(x1[i]==data[j].confirmHour){
    			 if($('#desk1').val()!=$('#desk2').val()){ 
    			 	   if($('#desk1').val()==data[j]['desk']){
    			           y1[i]+=parseFloat(data[j][chosen_data]);
    		           }else{
    			           a1[i]+=parseFloat(data[j][chosen_data]);
    		           }
    		         }else{
    		         	 y1[i]+=parseFloat(data[j][chosen_data]);
    		         	 a1[i]+=parseFloat(data[j][chosen_data]);
    		         }
    		}
    	}  	
    	  	
    	  }};
    	$('#total_data1').html('$'+total_data1.toLocaleString());
	    $('#total_data2').html('$'+total_data2.toLocaleString());
	    
	  if(k!=0){
	    var j=x1.length;
	    }
	  else{
	 	var j=24;
	    }	
     for(var i=0;i<j;i++){	
	 	z.push({
	 		x:x1[i],y:y1[i]
	 	});
	 	a.push({
	 		x:x1[i],y:a1[i]
	 	});
	 }
	 console.log(y1);
	 console.log(a1);
	 myChart.setData({
        "xScale": "time",
        "yScale": "linear",
        "type": "line-dotted",
        "main": [{
            className: ".firstData",
           
            data: z
        },
        {
        	className: ".secondData",
            data: a
        }
        ] });     
    });
    break;
  

};




}

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
  
  function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk,#desk1,#desk2').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk1 option[value="4"]').attr('selected',true);
			$('#desk2 option[value="5"]').attr('selected',true);
	});
}
  
 