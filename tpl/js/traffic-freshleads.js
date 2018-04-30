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

var global_data=[];
var global_agents=[];
$(document).ready(function(){
	$('#dpStart,#dpEnd').val(new Date().format('yyyy-MM-dd')).datepicker();
	$("#employee").select2({width: "100%"});
	$("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
     });
    getCampaigns(); 
	getDesk();
	getEmployeesForConversion();
	$('#desk').change(function(){
		getEmployeesForConversion();
	});
});

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

function getEmployeesForConversion(){
	$('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
    apiRequest('getEmployeesForConversion',$('#range-form').serialize(),'',function(data){
    	    $.each(data, function() {
                 $('#employee').append($('<option>', {value : this.userId , text : this.userId+' - '+ this.employeeName}));
            });
    });
    $('#s2id_employee .select2-chosen').text($('#employee option:first').text()); // display first chosen employee;
}

function getCampaigns(){
  $('#campaign')
    .find('option')
    .remove()
    .end();	
  apiRequest('getCampaigns','','',function(data){
  	
  	 $.each(data,function(){
  	 	  $('#campaign')
  	 	  .append($('<option>', { value : this.id })
          .text(this.name));
  	 });
  });  
}
$('#employee_button').click(function(){
	event.preventDefault();
	leadsByEmployee.getModal();
});
$('#leads_button').click(function(){
	event.preventDefault();
	getFreshLeads();
});
$('#conversion_rate_button').click(function(){
	event.preventDefault();
	conversionRate.getModal();
});

function getFreshLeads(){
	var campaigns=[], unique_campaigns=[], countries=[], unique_countries=[], unique_agents=[];
	var customers=0;
	global_data=[], global_agents=[];
	$('#employee_button, .list-group-item').addClass('disabled');
    apiRequest('getFreshLeads',$('#range-form').serialize(),'#leads_table_holder',function(data){
    	global_data = data;
    	for(var i in data){
		    customers++;
		    
		    if(typeof unique_agents[data[i].newEmployeeId]=='undefined')
		       global_agents.push({"employeeId": data[i].newEmployeeId, 
		                           "employee": data[i].newEmployee,
		                           "leads": 0, // first employee's customers 
		                           "clean":0,  // first employee sales among leads
		                           "dirty":0,  // first employee sales
		                           "new_customer":0 // clean customers who have registration date same as sale date 
		                           });
		                      
    		if(typeof unique_campaigns[data[i].campaign]=='undefined')
		       campaigns.push({"campaignName": data[i].campaign});
		                      
		    if(typeof unique_countries[data[i].country]=='undefined')
		       countries.push({"country": data[i].country});
		    
		    for(var j in global_agents){
		    	if(data[i].newEmployeeId==global_agents[j].employeeId){
		    	  global_agents[j].leads++;
		    	  break;
		    	}  
		    }   
		    unique_agents[data[i].newEmployeeId]=1;
		    unique_campaigns[data[i].campaign]=1;
		    unique_countries[data[i].country]=1;                 
    	}
    	$('#total_employees').html(global_agents.length);
    	$('#total_customers').html(customers.toLocaleString());
    	$('#total_campaigns').html(campaigns.length);
    	$('#total_countries').html(countries.length);
    	$('#employee_button, .list-group-item').removeClass('disabled');
    	$('#leads_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 5, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "customerId"},
            { "mData": "customerName", "sTitle": "customerName"}, 
            { "mData": "country", "sTitle": "Country"},
            { "mData": "oldEmployee", "sTitle": "Assigned From"},
            { "mData": "newEmployee", "sTitle": "Employee"},
            { "mData": "date", "sTitle": "Assign Date", "sType": "date"},
            { "mData": "campaign", "sTitle": "Campaign"}
           ] 
       });
    });	
}

var leadsByEmployee={
	getModal: function(){
		var that=this;
		var modal_body = '<div class="row">'+
		                 '<div class="col-md-3">'+
		                 '<h4>Employee</h4>'+
		                 '<select id="chosenEmployee" class="form-control"></select>'+
		                 '</div>'+
		                 '<div class="col-md-12"><h3>&nbsp;</h3></div>'+
		                 '<div class="col-md-12">'+
		                 '<div class="portlet">'+ 
                         '<div class="portlet-header">'+
             	         '<h3><i class="fa fa-bar-chart-o"></i>Fresh Leads</h3>'+
                         '</div> <!-- portlet-header -->'+
                         '<div class="portlet-content">'+	
                         '<table class="table table-striped table-bordered table-hover table-highlight" id="employee_table"></table>'+
                         '</div> <!-- portlet-content -->'+	 
                         '</div> <!-- portlet -->'+
		                 '</div>'+
		                 '</div> <!-- row -->';
	   var employee_modal = bootbox.dialog({
	   	  title : 'Fresh Leads By Employee',
	   	  message : modal_body,
	   	  buttons : {
	   	  	success: {
	   	  	  label: 'OK',
	   	  	  className: 'btn-success'	
	   	  	}
	   	  }
	   	   
	   });
	   $(employee_modal[0]).attr('id','employee_modal');
	   $('#employee_modal').removeAttr('tabindex'); // necessary for focus to the search field of $("#chosenEmployee") select2;
	   $('#employee_modal .modal-dialog').addClass('modal-xlarge');
	   $("#chosenEmployee").select2({width: "100%"});
	   this.getEmployees();
	   $('#chosenEmployee').change(function(){
	   	 that.getFreshLeads();
	   });	             
	},
	getEmployees: function(){
		for(var i in global_agents){
			$('#chosenEmployee').append('<option>'+global_agents[i].employee+'</option>');
		}
		$('#s2id_chosenEmployee .select2-chosen').text($('#chosenEmployee option:first').text()); // display first chosen employee;
		this.getFreshLeads();
	},
	getFreshLeads: function(){
		var lead_data = $.extend(true,[],global_data);
		var real_data = [];
		for(var i in lead_data){
			if(lead_data[i].newEmployee==$('#chosenEmployee option:selected').text())
				real_data.push(lead_data[i]);
		}
		$('#employee_table').dataTable( {
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
           "bAutoWidth":false,
           "aaData": real_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 5, "asc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "customerId"},
            { "mData": "customerName", "sTitle": "customerName"}, 
            { "mData": "country", "sTitle": "Country"},
            { "mData": "oldEmployee", "sTitle": "Assigned From"},
            { "mData": "newEmployee", "sTitle": "Employee"},
            { "mData": "date", "sTitle": "Assign Date", "sType": "date"},
            { "mData": "campaign", "sTitle": "Campaign"}
           ] 
       });
	}
};

var conversionRate={
	rate_data : [],
	getModal: function(){
		
		var modal_body = '<div class="row">'+
		                 '<div class="col-md-12 display_element">'+
		                 '<div class="portlet id="rate_table_holder">'+ 
                         '<div class="portlet-header">'+
             	         '<h3><i class="fa fa-table"></i>Rate Table</h3>'+
                         '</div> <!-- portlet-header -->'+
                         '<div class="portlet-content">'+	
                         '<table class="table table-striped table-bordered table-hover table-highlight" id="rate_table"></table>'+
                         '</div> <!-- portlet-content -->'+	 
                         '</div> <!-- portlet -->'+
		                 '</div>'+
		                 '<div class="col-md-12 display_element" style="display:none">'+
		                 '<div class="portlet">'+ 
                         '<div class="portlet-header">'+
             	         '<h3><i class="fa fa-bar-chart-o"></i>Rate Chart</h3>'+
                         '</div> <!-- portlet-header -->'+
                         '<div class="portlet-content">'+	
                         '<a href="" class="btn btn-blue disabled">Clean</a>&nbsp;'+
                         '<a href="" class="btn btn-blue disabled">Dirty</a>&nbsp;'+
                         '<a href="" class="btn btn-blue disabled">New Customer</a>'+
                         '<div class="col-md-12" id="chart_div"></div>'+
                         '</div> <!-- portlet-content -->'+	 
                         '</div> <!-- portlet -->'+
		                 '</div>'+
		                 '</div> <!-- row -->';
	   var rate_modal = bootbox.dialog({
	   	  title : 'Conversion Rates',
	   	  message : modal_body,
	   	  buttons : {
	   	  	success: {
	   	  	  label: 'OK',
	   	  	  className: 'btn-success'	
	   	  	}
	   	  }
	   	   
	   });
	   $(rate_modal[0]).attr('id','rate_modal');
	   $('#rate_modal .modal-dialog').addClass('modal-xlarge');
	   this.rate_data= $.extend(true,[],global_agents);
	   this.clickEvents();
	   this.getTransactions();
	   console.log(this.rate_data);
	},
	getTransactions: function(){
		var that = this;
		var lead_data = $.extend(true,[],global_data);
		var data_wd = [], unique = [];
		var start_date = new Date(new Date($('#dpStart').val()).getFullYear(),new Date($('#dpStart').val()).getMonth(),1).format('yyyy-MM-dd');
		var end_date = new Date(new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth()+1,1) - 1).format('yyyy-MM-dd');
		var post_data = 'dpStart='+start_date+'&dpEnd='+end_date+'&'+$("#desk").serialize()+'&'+$("#employee").serialize();
		$("#campaign").serialize()!='' ? post_data+= '&'+$("#campaign").serialize() : '';
		
	   	apiRequest('getTransactionsForConversion',post_data,'#rate_table_holder',function(data){
	   		for(var i in data){
	   			if(unique[data[i].customerId]==1 || data[i].assign=='Deleted')
	   			   continue;
	   			data_wd.push(data[i]);
	   			unique[data[i].customerId]=1;   
	   		}
	   		for(var i in data_wd){
	   			var confirmDate = new Date(data_wd[i].confirmTime).format('yyyy-MM-dd');
	   			var range = confirmDate >= $('#dpStart').val() && confirmDate <= $('#dpEnd').val();
	   			if(!range) continue;
	   			for(var j in that.rate_data){
	   				if(data_wd[i].employeeId == that.rate_data[j].employeeId){
	   					that.rate_data[j].dirty++;
	   				    for(var k in lead_data){
	   				    	if(data_wd[i].customerId == lead_data[k].customerId){
	   				    	  that.rate_data[j].clean++;
	   				    	  if(confirmDate == new Date(data_wd[i].regTime).format('yyyy-MM-dd')){
	   				    	  	 that.rate_data[j].new_customer++;
	   				    	  }
	   				    	  break;
	   				    	}  
	   				    }
	   				}
	   			}
	   			
	   		}
	   		for(var i in that.rate_data){
	   			that.rate_data[i].clean_percentage = parseFloat((that.rate_data[i].clean / that.rate_data[i].leads)*100).toFixed(2);
	   			that.rate_data[i].dirty_percentage = parseFloat((that.rate_data[i].dirty / that.rate_data[i].leads)*100).toFixed(2);
	   			that.rate_data[i].new_customer_percentage = parseFloat((that.rate_data[i].new_customer / that.rate_data[i].leads)*100).toFixed(2);
	   		}
	   		$('#rate_modal .btn-blue').removeClass('disabled');
	   		
	   		that.drawTable();
	   	});
	},
	drawTable: function(){
		$('#rate_table').dataTable( {
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
           "bAutoWidth":false,
           "aaData": this.rate_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "employee"},
            { "mData": "leads", "sTitle": "Fresh Leads"}, 
            { "mData": "clean", "sTitle": "Clean Sales"},
            { "mData": "clean_percentage", "sTitle": "Clean CR", "bUseRendered": false,
              "fnRender": function(oObj){
              	 return '%'+oObj.aData.clean_percentage;
              }
            },
            { "mData": "dirty", "sTitle": "Dirty Sales"},
            { "mData": "dirty_percentage", "sTitle": "Dirty CR", "bUseRendered": false,
              "fnRender": function(oObj){
              	 return '%'+oObj.aData.dirty_percentage;
              }
            },
            { "mData": "new_customer", "sTitle": "New Customer Sales"},
            { "mData": "new_customer_percentage", "sTitle": "New Customer CR", "bUseRendered": false,
              "fnRender": function(oObj){
              	 return '%'+oObj.aData.new_customer_percentage;
              }
            }
            ]
        });    
	},
	clickEvents: function(){
		var that = this;
		$('#rate_modal .btn-blue').click(function(){
			event.preventDefault();
			that.drawChart($(this).text());
		});
		
		$('#rate_modal .portlet-header').click(function(){
			event.preventDefault();
			var current_element = this;
			$(this).parents('.display_element').hide('drop',500,function(){
				$('#rate_modal .portlet-header').not(current_element).parents('.display_element').show('drop',500);
		    }); 
		});
	},
	drawChart: function(type){
		var title = type+' Percentage';
		var value = [];
		switch(type){
		  case 'Clean'        : value = "clean_percentage"; break;
		  case 'Dirty'        : value = "dirty_percentage"; break;
		  case 'New Customer' : value = "new_customer_percentage"; break;  	
		}
		var chart = AmCharts.makeChart( "chart_div", {
          "type": "pie",
          "titles": [ {
             "text": title,
             "size": 16
          } ],
          "dataProvider": this.rate_data,
          "valueField": value,
          "titleField": "employee",
          "startEffect": "elastic",
          "startDuration": 2,
          "labelRadius": 30,
          "innerRadius": "50%",
          "depth3D": 30, 
          "balloonText": "[[title]]<br><span style='font-size:14px'><b> % [[value]] </b> ([[percents]]%)</span>",
          "angle": 40,
          "pullOutOnlyOne":true,
          "legend": {
					"align": "center",
					"markerType": "circle",
					"divId": "legenddiv",
					"position":"left",
					"equalWidths":true,
					"markerLabelGap":10,
					"marginRight": 20,
                    "autoMargins": false,
					"valueWidth":20,
					"switchType":"v",
					"valueText":"[[value]]"
			} 
   });
	}
};
