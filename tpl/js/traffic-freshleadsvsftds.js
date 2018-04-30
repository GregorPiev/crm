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


var cumulative_fresh_leads=[], fresh_leads=[];
var cumulative_online_leads=[], online_leads=[];
var cumulative_ftds=[], ftds=[];
var c_fresh_leads=[], c_online_leads=[], c_ftds=[];

var ftd_data=[], fresh_lead_data=[], online_lead_data=[];

var chart_dates=[]; 
var startDate, endDate,desk;

$(document).ready(function() {
    getDesk();
    $('#dpStart,#dpEnd').daterangepicker({
    	singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    
    $("#employee").select2({width: "100%"});
    
    $("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
     });
    $("#country").select2( {
   	  placeholder: "Select Country or leave blank for all",
      allowClear: true,
      width: "100%"
    }); 
     
    getEmployeesForConversion();
     
    $("#desk").change(function(){
    	getEmployeesForConversion(); 
    });
    
    $("#employee, #campaign, #country").change(function(){
       console.log($(this).val());
       getDatas();	
    }); 
     
    function dateSet(start, end,label) {
        $('#dpStart').val(start.format('YYYY-MM-DD'));
        $('#dpEnd').val(end.format('YYYY-MM-DD'));
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
    $('#dpStart,#dpEnd').change(function(){
    	$('#range_label').html('Custom Range');
    });
    $('#filter_portlet').click(function(){
    	event.preventDefault();
    	var $filter_content = $(this).parent('.portlet').find('.portlet-content');
    	$filter_content.toggle('blind',300);
    	
    });
});

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

function getEmployeesForConversion(){
	$('#employee')
    .find('option[value!="0"]')
    .remove();
    
    apiRequest('getEmployeesForConversion',$('#range-form').serialize(),'',function(data){
                  jQuery.each(data, function() {
                    $('#employee')
                    .append($('<option>', { value : this.userId })
                    .text(this.userId + ' - ' + this.employeeName));
                  });
                  $('#s2id_employee .select2-chosen').text($('#employee option:first').text()); // display first chosen employee; 
      
     });   
}

$('#leads_button').click(function(){
	event.preventDefault();
	$('.chart_type_button').addClass('disabled');
	$('#filter_portlet').addClass('disabled')
	                    .parent('.portlet')
	                    .find('.portlet-content')
	                    .hide('blind');
	$('#campaign,#country').select2("data", null)
	                       .find('option')
	                       .remove();
	startDate = $('#dpStart').val();
	endDate = $('#dpEnd').val();
	desk = $('#desk option:selected').text();                                                                           
	getNewRegisterLeads();
	
});

function getNewRegisterLeads(){
	apiRequest('getNewRegisterLeads',$('#range-form').serialize(),'#filter_portlet',function(data){
		online_lead_data = JSON.parse(JSON.stringify(data));
		getFTDs();
	});
}

function getFTDs(){
	apiRequest('getFTDsForChart',$('#range-form').serialize(),'#filter_portlet',function(data){
		ftd_data = JSON.parse(JSON.stringify(data));
		getFreshLeads();
	});
}

function getFreshLeads(){
	
	var campaigns = [], countries = [], unique_campaigns = [], unique_countries = []; // '#campaigns' and '#countries' will be filled by the chart data
	var post_data = $('#range-form').serialize()+'&employee=0';
	
	apiRequest('getFreshLeads',post_data,'#filter_portlet',function(data){
	   
	   fresh_lead_data = JSON.parse(JSON.stringify(data));
	   
	   for(var i in online_lead_data){
		      
		      if(typeof unique_campaigns[online_lead_data[i].campaign]=='undefined'){
				    campaigns.push(online_lead_data[i].campaign);
				    unique_campaigns[online_lead_data[i].campaign]=1;
			  }
			  if(typeof unique_countries[online_lead_data[i].country]=='undefined'){
				    countries.push(online_lead_data[i].country);
				    unique_countries[online_lead_data[i].country]=1;
			  } 
			  
	   }		 
	   for(var i in ftd_data){
		      
		      if(typeof unique_campaigns[ftd_data[i].campaign]=='undefined'){
				    campaigns.push(ftd_data[i].campaign);
				    unique_campaigns[ftd_data[i].campaign]=1;
			  }
			  if(typeof unique_countries[ftd_data[i].country]=='undefined'){
				    countries.push(ftd_data[i].country);
				    unique_countries[ftd_data[i].country]=1;
			  } 
			  
	   }	
	   for(var i in fresh_lead_data){
		      
			  if(typeof unique_campaigns[fresh_lead_data[i].campaign]=='undefined'){
				     campaigns.push(fresh_lead_data[i].campaign);
				     unique_campaigns[fresh_lead_data[i].campaign]=1;
			  }
			  if(typeof unique_countries[fresh_lead_data[i].country]=='undefined'){
				    countries.push(fresh_lead_data[i].country);
				    unique_countries[fresh_lead_data[i].country]=1;
			  }  
		
	   }
	   
	   campaigns = campaigns.sort();
	   countries = countries.sort();
	   
	   $.each(campaigns,function(){
	   	 $('#campaign').append('<option>'+this+'</option>');
	   });
	   $.each(countries,function(){
	   	 $('#country').append('<option>'+this+'</option>');
	   });
	   	
	   $('#filter_portlet').removeClass('disabled');
  	   
  	   $('.chart_type_button').removeClass('disabled');
  	   
  	   getDatas();	
	});
}

function getDatas(){
	 
	var employee_filter = $('#employee').val();
	var campaign_filter = $('#campaign').val();
	var country_filter = $('#country').val() ;
	
	var filtered_ftd_data = [];
	var filtered_fresh_lead_data=[];
	var filtered_online_lead_data=[];
	
	var previous_number_days=Object.keys(chart_dates).length; // using to specify number of appending charts                      
	var currentDate = $('#dpEnd').val();
	
	chart_dates=[];
	cumulative_fresh_leads=[], fresh_leads=[], cumulative_online_leads=[], online_leads=[], cumulative_ftds=[], ftds=[];
	c_fresh_leads=[], c_online_leads, c_ftds=[];
	
	while(currentDate>=$('#dpStart').val()){  // initialize datas
			chart_dates[currentDate]=[];
			cumulative_fresh_leads[currentDate]=[];
			fresh_leads[currentDate]=[];
			cumulative_online_leads[currentDate]=[];
			online_leads[currentDate]=[];
			cumulative_ftds[currentDate]=[];
			ftds[currentDate]=[];
			c_fresh_leads[currentDate]=0;
			c_online_leads[currentDate]=0;
			c_ftds[currentDate]=0;
			
			for(var i=0;i<24;i++){
  		       var hour= i<10 ? currentDate+' 0'+i+':00' : currentDate+' '+i+':00';
  		       chart_dates[currentDate].push({"date": hour,
  		                                      "fresh_leads": 0,
  		                                      "online_leads": 0,
  		                                      "ftds": 0
  		                                      });
  	        }
  		    var new_date = new Date(currentDate);
  		    new_date.setDate(new_date.getDate()-1);                
  		    currentDate = new_date.format('yyyy-MM-dd');
	}  
	 
	var chart_dates_length= Object.keys(chart_dates).length;
	console.log(previous_number_days);
	console.log(chart_dates_length); 
	console.log(chart_dates);
	
	if(previous_number_days<chart_dates_length){
		for(var i=previous_number_days; i<chart_dates_length; i++){
				
		  $('#chart_holder .portlet-content').append('<div id="chart_div_'+i+'" class="chart_div" style="opacity:0">'+                                
		  	                                         '<div class="col-md-12"><h3>&nbsp;</h3></div>'+ 	
                                                     '<div class="col-md-8">'+
               	                                     '<h3 id="chart_title_'+i+'" style="text-align: center;"></h3>'+
              	                                     '<figure id="chart_'+i+'"></figure>'+
              	                                     '<div class="ex-tooltip" id="tt_'+i+'"></div>'+
                                                     '</div>'+
                                                     '<div class="list-group col-md-2">'+	
					                                 '<a href="javascript:;" class="list-group-item">'+
					                                 '<h3 class="pull-right"><i class="fa fa-bar-chart-o"></i></h3>'+
					                                 '<h4 class="list-group-item-heading fresh" id="total_fresh_leads_'+i+'" style="color: #3880aa;">-</h4>'+
					                                 '<h4 class="list-group-item-text fresh" >Assigned Leads</h4>'+
					                                 '</a>'+
					                                 '<a href="javascript:;" class="list-group-item">'+
					                                 '<h3 class="pull-right"><i class="fa fa-bar-chart-o"></i></h3>'+
					                                 '<h4 class="list-group-item-heading online" id="total_online_leads_'+i+'" style="color: #4da944;">-</h4>'+
					                                 '<h4 class="list-group-item-text online" >Online Leads</h4>'+
					                                 '</a>'+
					                                 '<a href="javascript:;" class="list-group-item">'+
					                                 '<h3 class="pull-right"><i class="fa fa-bar-chart-o"></i></h3>'+
					                                 '<h4 class="list-group-item-heading ftd" id="total_ftds_'+i+'" style="color: #f26522;">-</h4>'+
					                                 '<h4 class="list-group-item-text ftd" >FTDs</h4>'+
					                                 '</a>'+
			                                         '</div>'+
			                                         '</div>');
		}
	}else if(previous_number_days>chart_dates_length){
		for(var i=previous_number_days-1;i>=chart_dates_length;i--){
			
			$('#chart_div_'+i).animate({opacity:0},1000,function(){
				$(this).empty()
				       .remove();
			});
	    };
	}
	
	$('.list-group-item').off('hover').hover(function(){
	  var fields = ['fresh','online','ftd'];
	  var $this_header = $(this).find('.list-group-item-heading');
      var chart_id = $(this).parents('.chart_div').attr('id');
 	  for(var i in fields){
		if($this_header.hasClass(fields[i])){
			$('#'+chart_id+' .line').css('stroke-opacity','0.25');
			$('#'+chart_id+' .fill').css('fill-opacity','0.25');
			$('#'+chart_id+' circle').css('opacity','0.25');
            $('#'+chart_id+' .color'+i+' .line,#'+chart_id+' .color'+i+'.line').css('stroke-opacity','1');
            $('#'+chart_id+' .color'+i+' .fill').css('fill-opacity','1');
            $('#'+chart_id+' .color'+i+' circle').css('opacity','1');
			
		}
	  } 
    },
    function(){
	   $('.xchart .line').css('stroke-opacity','1');
	   $('.xchart .fill').css('fill-opacity','1');
	   $('.xchart circle').css('opacity','1');
    });
	
	for(var i in online_lead_data){
		if((employee_filter==0 ? true : employee_filter==online_lead_data[i].employeeId) && ($('#campaign').val()== null ? true : $.inArray(online_lead_data[i].campaign,campaign_filter)!=-1) && ($('#country').val()== null ? true : $.inArray(online_lead_data[i].country,country_filter)!=-1) )
	        filtered_online_lead_data.push(online_lead_data[i]);			
	}
	for(var i in ftd_data){
		if((employee_filter==0 ? true : employee_filter==ftd_data[i].employeeId) && ($('#campaign').val()== null ? true : $.inArray(ftd_data[i].campaign,campaign_filter)!=-1) && ($('#country').val()== null ? true : $.inArray(ftd_data[i].country,country_filter)!=-1) )
	        filtered_ftd_data.push(ftd_data[i]);			
	}
	for(var i in fresh_lead_data){
		if((employee_filter==0 ? true : employee_filter==fresh_lead_data[i].newEmployeeId) && ($('#campaign').val()== null ? true : $.inArray(fresh_lead_data[i].campaign,campaign_filter)!=-1) && ($('#country').val()== null ? true : $.inArray(fresh_lead_data[i].country,country_filter)!=-1) )
	        filtered_fresh_lead_data.push(fresh_lead_data[i]);			
	}
	
	
	for(var date in chart_dates){	
	   for(var i=0;i<24;i++){
	   	  for(var j in filtered_online_lead_data){
	   	   if(chart_dates[date][i]['date']==filtered_online_lead_data[j].regHour)
					chart_dates[date][i]['online_leads']++;
	      }	
	      for(var j in filtered_ftd_data){
	   	   if(chart_dates[date][i]['date']==filtered_ftd_data[j].confirmHour)
					chart_dates[date][i]['ftds']++;
	      }
	      for(var j in filtered_fresh_lead_data){
	   	   if(chart_dates[date][i]['date']==filtered_fresh_lead_data[j].hour)
					chart_dates[date][i]['fresh_leads']++;
	      }
	      c_online_leads[date] += chart_dates[date][i]['online_leads'];
	      c_ftds[date] += chart_dates[date][i]['ftds'];
	      c_fresh_leads[date] += chart_dates[date][i]['fresh_leads'];
	      online_leads[date].push({x: chart_dates[date][i]['date'] , y: chart_dates[date][i]['online_leads']});
	      ftds[date].push({x: chart_dates[date][i]['date'] , y: chart_dates[date][i]['ftds']});
	      fresh_leads[date].push({x: chart_dates[date][i]['date'] , y: chart_dates[date][i]['fresh_leads']});
	      cumulative_online_leads[date].push({x: chart_dates[date][i]['date'] , y: c_online_leads[date]});
	      cumulative_ftds[date].push({x: chart_dates[date][i]['date'] , y: c_ftds[date]});
	      cumulative_fresh_leads[date].push({x: chart_dates[date][i]['date'] , y: c_fresh_leads[date]});
	   }
	} 
	
    drawChart('Hourly');
}

function drawChart(type){
	var myChart = [];
	var data_1=[], data_2=[], data_3=[];
	
	var key=0;
	
	var chart_defs = {
      "xScale": "time",
      "yScale": "linear",
      "type": "line-dotted",
      "main": [{
        "className": ".firstData",
      
        "data":[]
       },{
       	 "className":".secondData",
       	 "data":[]
       },{
       	 "className":".thirdData",
       	 "data":[]
       }
       ]
    };
    var chart_opts=[];

    for(var date in chart_dates){
    	chart_opts[key] = {
	        "dataFormatX": function (x) {	
    	        return d3.time.format('%Y-%m-%d %H:%M').parse(x);
            },
            "tickFormatX": function (x) {
                return d3.time.format('%H:%M')(x);
            },
            "mouseover": function (d, i) {
              var pos = $(this).offset();
              var data_class = ($(this).parent().attr('class')).split(" ")[2];
              var amount_label = data_class=='firstData' ? 'Assigned Leads' : data_class=='secondData' ? 'Online Leads' : 'FTDs';  // hasClass does not work since the Class is a SVGAnimatedString
              var $figure = $(this).parents('figure');
              var figure_id = $figure.attr('id');
              var index= figure_id.split('_')[1];
              var topOffset = -($figure.offset()).top; // figure topOffset
              var leftOffset=-(~~$('html').css('padding-left').replace('px', '') + ~~$('body').css('margin-left').replace('px', '') + ~~$('#content').css('margin-left').replace('px', '')); //figure leftOffset
              
              $('#tt_'+index).html('Hour: ' +d3.time.format('%H:%M')(d.x) + '<br/> '+amount_label+': ' + (d.y).toLocaleString());
        
               $('#tt_'+index).css({
                top: topOffset + pos.top,
                left: pos.left + leftOffset,
              
               
               }); 
           
               
         	   $('#tt_'+index).show(); 
     
       
            },
            "mouseout": function (x) {
            	var figure_id = $(this).parents('figure').attr('id');
                var index= figure_id.split('_')[1];
                $('#tt_'+index).hide();
             } 
        };
    	myChart[key] = new xChart('line-dotted', chart_defs, '#chart_'+key, chart_opts[key]);
    	$('#chart_title_'+key).text(d3.time.format('%Y-%m-%d %a')(new Date(date)));
    	if(type=='Cumulative'){
		  data_1[key]= JSON.parse(JSON.stringify(cumulative_fresh_leads[date]));
		  data_2[key]= JSON.parse(JSON.stringify(cumulative_online_leads[date]));
		  data_3[key]= JSON.parse(JSON.stringify(cumulative_ftds[date]));
	    }else{
		  data_1[key]= JSON.parse(JSON.stringify(fresh_leads[date]));
		  data_2[key]= JSON.parse(JSON.stringify(online_leads[date]));
		  data_3[key]= JSON.parse(JSON.stringify(ftds[date]));
	    }
	    myChart[key].setData({
        "xScale": "time",
        "yScale": "linear",
        "type": "line-dotted",
        "main": [{
            className: ".firstData",
           
            data: data_1[key]
        },
        {
        	className: ".secondData",
            data: data_2[key]
        },
        {
        	className: ".thirdData",
            data: data_3[key]
        }
        ] });
        $('#total_fresh_leads_'+key).html(c_fresh_leads[date]);
        $('#total_online_leads_'+key).html(c_online_leads[date]);
        $('#total_ftds_'+key).html(c_ftds[date]);
        $('#chart_div_'+key).animate({opacity:1},1000);
	    key++;
    }
	
	    
} 

function getTableModal(){
	var employee = $('#employee option:selected').text();
	var campaigns = $('#campaign').map(function(){ return $(this).val();}).get();
	campaigns = campaigns.join("\n"); 
	campaigns = $('#campaign').val()==null ? 'All' : campaigns;
	var countries = $('#country').map(function(){ return $(this).val();}).get();
	countries = countries.join("\n");
	countries =  $('#country').val()==null ? 'All' : countries;
	
	var modal_body = '<div class="row">'+
	                 '<div class="col-md-12">'+
	                 '<div class="row">'+
	                 '<div class="col-md-3">'+
	                 '<h4>Start Date</h4>'+
	                 '<input class="form-control" value="'+startDate+'" onfocus="this.blur();" />'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h4>End Date</h4>'+
	                 '<input class="form-control" value="'+endDate+'" onfocus="this.blur();" />'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h4>Desk</h4>'+
	                 '<input class="form-control" value="'+desk+'" onfocus="this.blur();" />'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h4>Employee</h4>'+
	                 '<input class="form-control" value="'+employee+'" onfocus="this.blur();" />'+
	                 '</div>'+
	                 '</div></div>'+
	                 '<div class="col-md-12"><h5>&nbsp;</h5></div>'+
	                 '<div class="col-md-12">'+
	                 '<div class="row">'+
	                 '<div class="col-md-3">'+
	                 '<h4>Campaigns</h4>'+
	                 '<textarea type="text" autocorrect="off" class="form-control" onfocus="this.blur();">'+campaigns+
	                 '</textarea>'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h4>Countries</h4>'+
	                 '<textarea type="text" autocorrect="off" class="form-control" onfocus="this.blur();">'+countries+
	                 '</textarea>'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h4>Hour Period</h4>'+
	                 '<select id="hour_period" class="form-control">'+
	                 '<option value="1">1</option>'+
	                 '<option value="2">2</option>'+
	                 '<option value="3">3</option>'+
	                 '<option value="4">4</option>'+
	                 '<option value="6">6</option>'+
	                 '<option value="8">8</option>'+
	                 '<option value="12">12</option>'+
	                 '</select>'+
	                 '</div>'+
	                 '</div>'+
	                 '</div>'+
	                 '<div class="col-md-12"><h5>&nbsp;</h5></div>'+
	                 '<div class="col-md-12">'+
	                 
	                 '<div class="portlet">'+
	                 '<div class="portlet-header"><h3><i class="fa fa-table"></i><span>Table</span></h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<table class="table table-striped table-bordered table-hover table-highlight" id="ftd_table"></table>'+
	                 '</div>'+
	                 '</div> <!-- portlet -->'+
	                 '</div>'+
	                 '</div>';
	 var table_modal = bootbox.dialog({
	 	title : 'Fresh Leads vs FTDs Table',
	 	message : modal_body,
	 	buttons : {
	 		success: {
              label: "OK",
              className: "btn-success"

	 	   }
	 	}  
	 }); 
	 $(table_modal[0]).find('.modal-dialog').addClass('modal-large');
	 getTable();
	 
	 $('#hour_period').change(function(){
	 	getTable();
	 });
	                
	                  
} 

function getTable(){
	var hour_period = $('#hour_period').val();
	
	var table_data = [];
	
	for(var i=0;i<24/hour_period;i++){
		var hour = (i*hour_period)<10 ? '0'+(i*hour_period)+':00' : (i*hour_period)+':00'; 
		table_data.push({ "hour" : hour,
		                  "online_leads" : 0,
		                  "ftds" : 0,
		                  "fresh_leads" : 0
		                });
		                
	}
	for(var date in chart_dates){
		for(var i in online_leads[date]){
			for(var j=table_data.length-1;j>=0;j--){
				if(d3.time.format('%H:%M')(new Date(online_leads[date][i].x))>=table_data[j].hour){
					table_data[j].online_leads+=online_leads[date][i].y;
					break;
				}
		    } 
		}
		for(var i in ftds[date]){
			for(var j=table_data.length-1;j>=0;j--){
				if(d3.time.format('%H:%M')(new Date(ftds[date][i].x))>=table_data[j].hour){
					table_data[j].ftds+=ftds[date][i].y;
					break;
				}
		    } 
		}
		for(var i in fresh_leads[date]){
			for(var j=table_data.length-1;j>=0;j--){
				if(d3.time.format('%H:%M')(new Date(fresh_leads[date][i].x))>=table_data[j].hour){
					table_data[j].fresh_leads+=fresh_leads[date][i].y;
					break;
				}
		    } 
		}
	}
    $('#ftd_table').dataTable( {
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
            "bLengthChange": false,
            "bAutoWidth": false,	
            "aaData": table_data,
            "dom": '<"toolbar">frtip',
            "aaSorting": [[ 0, "asc" ]],                    
            "aoColumns": [
            { "mData": "hour", "sTitle": "Hour"},
            { "mData": "fresh_leads", "sTitle": "Assigned Leads"},
            { "mData": "online_leads", "sTitle": "Online Leads"},
            { "mData": "ftds", "sTitle": "FTDs"}
            ]
       });     
            
}


