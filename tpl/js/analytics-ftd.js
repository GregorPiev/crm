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
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }

  
}

// $("#range-form").append('<input class="form-control" type="hidden" name="desk" id="desk" value="1">');

var ftd_data=[];
var startDate, endDate;
var global_total_ftds = 0, global_total_campaigns = 0, global_total_countries = 0;

$(document).ready(function() {
	 
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker();
     $("#campaign").select2( {
   	  placeholder: "Select Campaigns or leave blank for all",
      allowClear: true,
      width: "100%"
     });
     getCampaigns();	 
     getEmployeesForRetention();
     $('#desk').change(function(){
     	getEmployeesForRetention();
     });
});

$( document ).on("click","a.getNotes",function() {
	$('#note_customer').val($(this).attr('data-customerId'));            
	$('#note_employee').val($(this).attr('data-employee'));
	console.log($('#note-form').serialize());
	bootbox.dialog({
        title: "Notes",
        message:  
                   '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="note_table_holder">'+
                    
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="note_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>'+
                    '<script>getNotesForFTD();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      
      }
    }
    
    }});
	
	
});

$(document).on("click","a.getRealTransactions",function(){
	event.preventDefault();
	var customerId=$(this).attr('data-customerId');
	var sales_bootbox= bootbox.dialog({
        title: "Sales",
        message:  
                   '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="sales_table_holder">'+
                    
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sales_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>'+
                    '<script>getRealTransactions('+customerId+');</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success"
    }
    
    }});
    $(sales_bootbox[0]).attr('id','sales_bootbox');
	$('#sales_bootbox .modal-dialog').addClass('modal-large');
});

function getNotesForFTD(){
	apiRequest('getNotesForFTD',$('#note-form').serialize(),'#note_table_holder',function(data){
		console.log("success note");
	     $('#note_table').dataTable( {
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
           "aaSorting": [[ 4, "asc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "body", "sTitle": "Body"},
            { "mData": "createDate", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"}
           ]
            
            });
	});
	
}

function getRealTransactions(customerId){
	apiRequest('getRealTransactionsForWithdrawals','customerId='+customerId,'#sales_table_holder',function(data){
		 for(var i in data){
     	 if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D' || data[i].clearedBy=='Inatec3D' || data[i].clearedBy=='Fibonatix' || data[i].clearedBy=='Insight3D'){
                   data[i].clearedBy='Credit Card 3D Secure';
         }else if(data[i].paymentMethod=='Wire'){
                	data[i].clearedBy='Wire';
         }else{                	
                	data[i].clearedBy='Credit Card';
         }
         }
	     $('#sales_table').dataTable( {
                "sDom": 'T<"clear">lfrtip',
             "oTableTools": {
             "sSwfPath": "./js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "confirmTime", "sTitle": "Date", "sType": "date"},
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Curr"},  
            { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},      
            { "mData": "clearedBy", "sTitle": "Transaction Type"},
            { "mData": "verification", "sTitle": "Verify"},
            { "mData": "employee", "sTitle": "Transaction Employee"},
            { "mData": "percentage", "sTitle": "Percent"}
           ]
            
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
    
    
    
   

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
  
      });
      
      
      
    });
    
  } 
  
function getCampaigns(){
	$('#campaign').find('option').remove();
	apiRequest('getCampaigns',$('#range-form').serialize(),'#transactions_table_holder',function(data){
	  $.each(data, function() {
        $('#campaign')
        .append($('<option>', { value : this.id })
           .text(this.name)); 
      });
	});
}  
 
function getFTDs(){
	
	$('#chart_button').addClass('disabled');
	startDate= $('#dpStart').val();
	endDate= $('#dpEnd').val();	
	
	apiRequest('getFTDsForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
	   
	   for(var i=0; i<data.length; i++){
	   	 data[i].notes2 = data[i].notes;
	   }
	   ftd_data = data; 
	   $('#transactions_table').dataTable( {
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
           "aaSorting": [[ 8, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer Id"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "date", "sTitle": "Assign Date","sType":"date"},     
            { "mData": "notes", "sTitle": "Total Notes","sType": "numeric", "bUseRendered": false,
             "fnRender": function (oObj) {
                    return '<a href="#" data-customerId="'+oObj.aData.customerId+'" data-employee="'+oObj.aData.employeeId+'" class="getNotes">'+oObj.aData.notes+'</a>';
                  }
            },  
            
            
            { "mData": "dailyDepositUSD", "sTitle": "Daily Deposits USD","sType": "numeric"}, 
            { "mData": "weeklyDepositUSD", "sTitle": "Weekly Deposits USD","sType": "numeric"},
            { "mData": "totalDepositUSD", "sTitle": "Total Deposits USD","sType": "numeric"},
            { "mData": "retentionDepositUSD", "sTitle": "Retention Deposits USD","sType": "numeric"},
            { "mData": "numberDeposits", "sTitle": "Number Deposits","sType": "numeric"},
            { "mData": null, "sTitle": "Sales", 
              "fnRender": function(oObj){
              	 var color= oObj.aData.numberDeposits==0 ? 'danger' : 'blue';
              	 var text= oObj.aData.numberDeposits==0 ? 'No Sales' : 'Sales';
              	 
                 return '<a href="" data-customerId="'+oObj.aData.customerId+'" class="btn btn-'+color+' btn-xs btn-block getRealTransactions">'+text+'</a>';	
              }
            },
            { "mData": "notes2", "sTitle": "Notes","bVisible": false},
            { "mData": "campaign", "sTitle": "Campaign"},
            { "mData": "subCampaignId", "sTitle": "SubCampaign"}
             ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            	var total_ftds=aiDisplay.length;
            	var closed_ftds=0;
            	var total_notes=0;
            	var without_notes=0;
            	var without_deposits=0;
            	var without_ret_deposits=0;
            	var percent_without_notes=0;
            	var percent_without_deposits=0;
            	var percent_without_ret_deposits=0;
            	var total_daily=0;
            	var total_weekly=0;
            	var total_deposits=0;
            	var total_ret_deposits=0;
            	var percent_daily=0;
            	var percent_weekly=0;
            	 for(var i=0;i<aiDisplay.length;i++){
            	 	if(aaData[aiDisplay[i]]['closed']=='YES'){
            	 		closed_ftds++;
            	 	}
            	 	if(aaData[aiDisplay[i]]['notes2']==0){
            	 		without_notes++;
            	 	}
            	 	if(aaData[aiDisplay[i]]['totalDepositUSD']==0){
            	 		without_deposits++;
            	 	}
            	 	if(aaData[aiDisplay[i]]['numberDeposits']==0){
            	 		without_ret_deposits++;
            	 	}
            	 	total_notes+=parseFloat(aaData[aiDisplay[i]]['notes2']);
            	 	total_daily+=parseFloat(aaData[aiDisplay[i]]['dailyDepositUSD']);
            	 	total_weekly+=parseFloat(aaData[aiDisplay[i]]['weeklyDepositUSD']);
            	 	total_deposits+=parseFloat(aaData[aiDisplay[i]]['totalDepositUSD']);
            	 	total_ret_deposits+=parseFloat(aaData[aiDisplay[i]]['retentionDepositUSD']);
            	 }
            	 if(total_ftds==0){
            	 	percent_without_notes=0;
            	 	percent_without_deposits=0;
            	 	percent_without_ret_deposits=0;
            	 }else{
            	 percent_without_notes=((without_notes/total_ftds)*100).toFixed(2);
            	 percent_without_deposits=((without_deposits/total_ftds)*100).toFixed(2);
            	 percent_without_ret_deposits=((without_ret_deposits/total_ftds)*100).toFixed(2);
            	 }
            	 if(total_deposits==0){
            	 	percent_daily=0;
            	 	percent_weekly=0;
            	 }else{
            	 	percent_daily=((total_daily/total_deposits)*100).toFixed(2);
            	 	percent_weekly=((total_weekly/total_deposits)*100).toFixed(2);
            	 	
            	 	
            	 }
            	 $('#total_ftds').html(total_ftds.toLocaleString());
            	 $('#closed_ftds').html(closed_ftds.toLocaleString());
            	 $('#without_notes').html(without_notes.toLocaleString());
            	 $('#without_deposits').html(without_deposits.toLocaleString());
            	 $('#without_ret_deposits').html(without_ret_deposits.toLocaleString());
            	 $('#total_notes').html(total_notes.toLocaleString());
            	 $('#total_daily').html('$'+total_daily.toLocaleString());
                 $('#total_weekly').html('$'+total_weekly.toLocaleString());
                 $('#total_deposits').html('$'+total_deposits.toLocaleString());
                 $('#total_ret_deposits').html('$'+total_ret_deposits.toLocaleString()); 
                 $('#percent_without_notes').html('%'+percent_without_notes.toLocaleString());
                 $('#percent_without_deposits').html('%'+percent_without_deposits.toLocaleString());
                 $('#percent_without_ret_deposits').html('%'+percent_without_ret_deposits.toLocaleString());
                 $('#percent_daily').html('%'+percent_daily.toLocaleString());
                 $('#percent_weekly').html('%'+percent_weekly.toLocaleString());
	        }
	        
	     });
	     $('#chart_button').removeClass('disabled');
	  });
}    


var charts = {
	ftd_data : [],  
	getModal: function(){
     this.ftd_data = JSON.parse(JSON.stringify(ftd_data));
     
     var self = this;
     var unique_ftds = [], unique_campaigns = [], unique_countries = [];
     var ftds = [], campaigns = [], countries = [];
     var total_ftds = 0, total_campaigns = 0, total_countries = 0; 
     
     for(var i in this.ftd_data){
     	 if(typeof unique_ftds[this.ftd_data[i].employeeId]=='undefined')
		   ftds.push({"employee": this.ftd_data[i].employee,
		              "total"       :0 
		             });
     	 if(typeof unique_campaigns[this.ftd_data[i].campaign]=='undefined')
		   campaigns.push({"campaignName": this.ftd_data[i].campaign,
		                   "total"       :0 
		                  });
		 if(typeof unique_countries[this.ftd_data[i].country]=='undefined')
		   countries.push({"country": this.ftd_data[i].country,
		                   "total"       :0 
		                  });
		 for(var j in ftds){
		   if(this.ftd_data[i].employee==ftds[j].employee)
		     ftds[j].total++;	
		 }                 
		 for(var j in campaigns){
		   if(this.ftd_data[i].campaign==campaigns[j].campaignName)
		     campaigns[j].total++;	
		 }
		 for(var j in countries){
		   if(this.ftd_data[i].country==countries[j].country)
		     countries[j].total++;	
		 }
		 
		 unique_ftds[this.ftd_data[i].employeeId]=1;
		 unique_campaigns[this.ftd_data[i].campaign]=1;
		 unique_countries[this.ftd_data[i].country]=1;
		 
		 total_ftds++;
		 
     }
     
     total_campaigns = campaigns.length;
     total_countries = countries.length;
     
	 var chart_bootbox= bootbox.dialog({
	  title: 'FTD Charts',
      message:  
                    
                    '<div class="row">'+
                    '<div class="col-md-2">'+
                    '<h4>Start Date</h4>'+
                    '<input class="form-control" value="'+startDate+'" onfocus="this.blur();"/>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                    '<h4>End Date</h4>'+
                    '<input class="form-control" value="'+endDate+'" onfocus="this.blur();"/>'+
                    '</div>'+
                    '<div class="col-md-12">&nbsp;</div> '+
                    '<div class="col-md-12">'+
                    '<div class="list-group col-md-2">'+  
				    '<a href="javascript:;" class="list-group-item" id="total_ftds_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
					'<h4 class="list-group-item-heading">'+total_ftds+'</h4>'+
					'<p class="list-group-item-text">Total FTDs</p>'+
				    '</a>'+
				    '</div>'+
				    '<div class="list-group col-md-2">'+  
				    '<a href="javascript:;" class="list-group-item" id="total_campaigns_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
					'<h4 class="list-group-item-heading">'+total_campaigns+'</h4>'+
					'<p class="list-group-item-text">Total Campaigns</p>'+
				    '</a>'+
				    '</div>'+
				    '<div class="list-group col-md-2">'+  
				    '<a href="javascript:;" class="list-group-item" id="total_countries_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
					'<h4 class="list-group-item-heading">'+total_countries+'</h4>'+
					'<p class="list-group-item-text">Total Countries</p>'+
				    '</a>'+
				    '</div>'+
                    '</div>'+
                    '<div class="col-md-12">'+
                    '<div class="portlet">'+
                    '<div class="portlet-header">'+
                    '<h3><i class="fa fa-bar-chart-o"></i>Chart</h3>'+
                    '</div>'+
                    '<div class="portlet-content">'+
                    '<div id="chart_div"></div>'+
                    '</div>'+
                    '</div> <!-- portlet -->'+
                    '</div><!-- col-md-12 -->'+
                    '</div><!-- row -->',
      buttons: {
      success: {
      label: "OK",
      className: "btn-success"
      }}                	
	});
	$(chart_bootbox[0]).attr("id","chart_bootbox");
	$('#chart_bootbox .modal-dialog').addClass('modal-large');
	
	$('#total_ftds_chart').click(function(){ event.preventDefault(); self.drawChart("Employees","employee",ftds);});
	$('#total_campaigns_chart').click(function(){ event.preventDefault(); self.drawChart("Campaigns","campaignName",campaigns);});
	$('#total_countries_chart').click(function(){ event.preventDefault(); self.drawChart("Countries","country",countries);});
		
	},
	drawChart : function(chart_title, title_field, chart_data){
		var chart = AmCharts.makeChart( "chart_div", {
            "type": "pie",
            "titles": [ {
            "text": chart_title,
            "size": 16
            } ],
            "dataProvider": chart_data,
            "valueField": "total",
            "titleField": title_field,
            "startEffect": "elastic",
            "startDuration": 2,
            "labelRadius": 50,
            "innerRadius": "50%",
            "depth3D": 30, 
            "balloonText": "[[title]]<br><span style='font-size:14px'><b> [[value]] </b> ([[percents]]%)</span>",
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
      } );
	}
};
 