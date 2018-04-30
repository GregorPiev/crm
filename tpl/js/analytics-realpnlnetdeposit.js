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

$('#chart').append('<div class="ex-tooltip" id="tt"></div>');

var topOffset = -450; 
var leftOffset=-300; //tooltip offset
    
var chart_defs = [], chart_opts = []; //chart initialation; 

var real_pnl=[], net_deposit=[], cumulative_real_pnl=[], cumulative_net_deposit=[]; //chart datas

$(document).ready(function() {
    getDesk();
    getEmployeesForRetention();
    $('#pStart,#pEnd').daterangepicker({
    	singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $("#employee").select2({width: "100%"});
     
     
    function dateSet(start, end,label) {
        $('#pStart').val(start.format('YYYY-MM-DD'));
        $('#pEnd').val(end.format('YYYY-MM-DD'));
        $('#range_label').html(label);
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
    $('#range_label').html('Today');
    $('#pStart,#pEnd').change(function(){
    	buttonActive('Custom Range');
    });
    $('#desk').change(function(){
    	getEmployeesForRetention();
    });
    
   
});

function buttonActive(range){
	$range = $('.ranges ul li').filter(function(){ return $(this).text()==range;});
	$range.addClass('active');
	$('.ranges ul li').not($range).removeClass('active');
	$('#range_label').html(range);
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#chart_holder',function(data){
      
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
      });
      $('#s2id_employee .select2-chosen').text($('#employee option:first').text()); // display first chosen employee;
    });
    
  }
  
function getChart(){
	$('.chart_button').addClass('disabled');
  	apiRequest('getRealPNLForChart',$('#range-form').serialize(),'#chart_holder',function(customers){
  		console.log(customers);
  		getPNLForPeriod(customers);
  	});
}

function getPNLForPeriod(customers){
	apiRequest('getPNLForPeriod',$('#range-form').serialize(),'#chart_holder',function(pnl){
  		
  		console.log(pnl);
  		
  		getNetDepositForPeriod(customers,pnl);
  	});
}
function getNetDepositForPeriod(customers,pnl){
	var chart_dates=[], rates=[];
	var c_r_pnl=0, c_n_deposit=0;
	var same_day = $('#pStart').val()==$('#pEnd').val() ? true : false;
	var today = new Date().format("yyyy-MM-dd");     
  	var currencyDate = $('#pEnd').val()>today ? today : $('#pEnd').val();
	var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+currencyDate+'.json?app_id='+key;
    
    real_pnl=[], net_deposit=[], cumulative_real_pnl=[], cumulative_net_deposit=[];
    if(same_day){
    	for(var i=0;i<24;i++){
  		   hour= i<10 ? $('#pStart').val()+' 0'+i+':00' : $('#pStart').val()+' '+i+':00';
  		   chart_dates.push({"date": hour,
  		                     "real_pnl": 0,
  		                     "net_deposit": 0
  		                    });
  	    }
    }
    chart_defs = {
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
    chart_opts = {
	
    "dataFormatX": function (x) {
    	
    	return same_day ? d3.time.format('%Y-%m-%d %H:%M').parse(x) : d3.time.format('%Y-%m-%d').parse(x);
       
     },
    "tickFormatX": function (x) {
       
        return same_day ? d3.time.format('%H:%M')(x) : d3.time.format('%e %B')(x);
       
        
     },
     "mouseover": function (d, i) {
    	
        var pos = $(this).offset();
        var amount_label = ($(this).parent().attr('class')).split(" ")[2]=='firstData' ? 'Real PNL' : 'Net Deposit';  // hasClass does not work since the Class is a SVGAnimatedString
        same_day ? $('#tt').html('Hour: ' +d3.time.format('%H:%M')(d.x) + '<br/> '+amount_label+': $' + (d.y).toLocaleString()) : $('#tt').html('Date: ' +d3.time.format('%e %B %a')(d.x) + '<br/> '+amount_label+': $' + (d.y).toLocaleString());
        
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
     
    $.getJSON( api, function( currencyData ) {
        rates = currencyData.rates;
    }).done(function(){
	apiRequest('getNetDepositForPeriod',$('#range-form').serialize(),'#chart_holder',function(deposit){
  		
  	   
  	   for(var i in customers){
  	   	    if(!same_day){ 
  	   	      if(i==0){
  	   	      	
  	   	       for(var date in customers[i].dates){
  	   	        chart_dates.push({"date": date,
  	   	        	              "real_pnl": 0,
  	   	        	              "net_deposit": 0});
  	   	       }
  	   	      }
  	   	    }else{
  	   	       customers[i].dates=[];
  	   	       for(var j in chart_dates){
  	   	       	 customers[i].dates[chart_dates[j].date] = {"pnl": 0,
  	   	       	                                            "deposit":0
  	   	       	                                           };
  	   	       	                         
  	   	       }  	
  	   	    }	  	
  	   	    
  			for(var j in pnl){
  				if(customers[i].id==pnl[j].customerId){
  					for(var date in customers[i].dates){
  						if(same_day ? date==pnl[j].endHour : date==pnl[j].endDate){
  							customers[i].dates[date].pnl=pnl[j].pnl;
  							break;
  						}
  					}
  				}
  			}
  			for(var j in deposit){
  				if(customers[i].id==deposit[j].customerId){
  					for(var date in customers[i].dates){
  						if(same_day ? date==deposit[j].hour : date==deposit[j].date){
  							customers[i].dates[date].deposit=deposit[j].netDeposit;
  							break;
  						}
  					}
  				}
  			}
  	   }
  	   for(var i in customers){
  	   	 var date=0, pre_deposit=0, pre_pnl=0, daily_deposit=0, daily_pnl=0;
  	   	 for(var j in chart_dates){
  	   	 	date = chart_dates[j].date;
  	   	 	pre_deposit = j==0 ? parseFloat(customers[i].pre_deposit) : daily_deposit;
  	   	 	pre_pnl = j==0 ? parseFloat(customers[i].pre_pnl) : daily_pnl;
  	   	 	daily_deposit = parseFloat(customers[i].dates[date].deposit) + pre_deposit;
  	   	 	daily_pnl = parseFloat(customers[i].dates[date].pnl) + pre_pnl;
                        
            currency_val = rates[customers[i].currency];
            if(typeof currency_val==='undefined'){
                currency_val =1;
            }
  	   	 	chart_dates[j].real_pnl += (Math.min(daily_deposit,daily_pnl)-Math.min(pre_deposit,pre_pnl))/currency_val;                        
  	   	 	chart_dates[j].net_deposit += parseFloat(customers[i].dates[date].deposit)/currency_val;
                        
  	   	} 
  	   }
           
  	   for(var i in chart_dates){                 
  	   	 c_r_pnl += parseFloat(chart_dates[i].real_pnl);                 
  	   	 c_n_deposit += parseFloat(chart_dates[i].net_deposit);
  	   	 real_pnl.push({ x: chart_dates[i].date, y: parseFloat(chart_dates[i].real_pnl)});
  	   	 cumulative_real_pnl.push({x: chart_dates[i].date, y: c_r_pnl});
  	   	 net_deposit.push({ x: chart_dates[i].date, y: parseFloat(chart_dates[i].net_deposit)});
  	   	 cumulative_net_deposit.push({x: chart_dates[i].date, y: c_n_deposit});
  	   }
  	   
  	   $('#total_real_pnl').html('$ '+c_r_pnl.toLocaleString());
  	   $('#total_net_deposit').html('$ '+c_n_deposit.toLocaleString());
  	   
  	   $('#daily_button').animate({opacity:0},200,function(){
  	   	    same_day ? $(this).text('Hourly') : $(this).text('Daily');
  	   	    $(this).animate({opacity:1},200);  
  	   });
  	   
  	   $('.chart_button').removeClass('disabled');
  	   drawChart('Cumulative'); 

    });
  	});   
}

function drawChart(type){
	var title= type=='Daily' && $('#pStart').val()==$('#pEnd').val() ? 'Hourly' : type;
	var myChart = new xChart('line-dotted', chart_defs, '#chart', chart_opts);
	var data_1=[], data_2=[];
	$('#chart_title').animate({opacity:0},200,function(){
		$(this).text(title+' Chart');
		$(this).animate({opacity:1},500);
	    
	});
	if(type=='Cumulative'){
		data_1= JSON.parse(JSON.stringify(cumulative_real_pnl));
		data_2= JSON.parse(JSON.stringify(cumulative_net_deposit));
	}else{
		data_1= JSON.parse(JSON.stringify(real_pnl));
		data_2= JSON.parse(JSON.stringify(net_deposit));
	}
	console.log(data_1);
	console.log(data_2);
	myChart.setData({
        "xScale": "time",
        "yScale": "linear",
        "type": "line-dotted",
        "main": [{
            className: ".firstData",
           
            data: data_1
        },
        {
        	className: ".secondData",
            data: data_2
        }
        ] });    
}

