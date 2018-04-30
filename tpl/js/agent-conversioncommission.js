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

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

function daysBetween(startDate, endDate) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
}

function selectRange(range) {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
  $('#dpMonth').val(endDate.format("yyyy-MM"));
  reset_dt_view(); 
  getConversionWeeks();
  isShiftManager();
  displayNewDailyBonus($('#dpMonth').val());  
}

function assignDate(month){
  var date=	new Date(month);
  var endDate = new Date(date.getFullYear(),date.getMonth(),1);
  var startDate = new Date(date.getFullYear(),date.getMonth(),1);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));	
}

function save_dt_view (oSettings, oData) {
  localStorage.setItem( 'DataTables_'+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings) {
  return JSON.parse( localStorage.getItem('DataTables_'+window.location.pathname) );
}
function reset_dt_view() {
  localStorage.removeItem('DataTables_'+window.location.pathname);
}

$("#range-form").append('<input type="hidden" name="dpStart"  id="dpStart"/>'+
                        '<input type="hidden" name="dpEnd"  id="dpEnd"/>'  
                          );
                
$("#content-container").append('<div style="display:none">'+
			                     '<form id="note-form">'+
			                     '<input class="form-control" type="text" name="nStart" id="nStart">'+
			                     '<input class="form-control" type="text" name="nEnd" id="nEnd">'+
				                 '<input class="form-control" type="text" name="note_customer" id="note_customer">'+
				                 '<input class="form-control" type="text" name="note_employee" id="note_employee">'+
			                     '</form>'+
			                     '<form id="withdrawal-form">'+
			                     '<input type="text" name="withdrawal_customer" id="withdrawal_customer">'+
			                     '<input type="text" name="confirmTime" id="confirmTime">'+
			                     '</form>'+ 
		                         '</div>');
/*function setBootBoxHeader(header){
	$(header).addClass('header-dark');
}		*/                            
var global_weeks=[];

var Manager_data = {'Transactions':{'data':[], 'total_ftds':0, 'today_ftds':0, 'total_deposits':0, 'today_deposits':0},
	                'Regular Shift':{'data':[], 'data_wd':[], 'total_ftds':0,'today_ftds':0,'total_deposits':0,'today_deposits':0},
	                'Manager Shift':{'data':[], 'data_wd':[], 'total_ftds':0,'today_ftds':0,'total_deposits':0,'today_deposits':0},
                   }; // Shift Managers' data 

var transactions_table;

var global_spotId;
                    
$(document).ready(function() {
	   
	 $('#dpMonth').val(new Date().format("yyyy-MM"));
     $('#dpMonth').datepicker();
     assignDate($('#dpMonth').val());
     reset_dt_view();
     getDesk();
     getConversionWeeks();
     displayNewDailyBonus($('#dpMonth').val());
     
     $('#dpMonth').change(function(){
     	assignDate($('#dpMonth').val());
     	reset_dt_view();
     	getConversionWeeks();
     	isShiftManager();
     	displayNewDailyBonus($('#dpMonth').val());
     });
     $('#desk').change(function(){
     	getEmployeesForConversion();
     });
     $('#desk,#employee').change(function(){
     	reset_dt_view();
     	isShiftManager();
     	getTransactionsForConversion();
     });
     
     $('.portlet-header.shift').css({"cursor":"pointer"}).click(function(){
     	event.preventDefault();
     	$(this).addClass('disabled');
     	
     	var that = this;
     	var $text = $(this).find('span');
     	var $table = $('#transactions_table_wrapper');
     	var $list_group_text = $('.list-group-item.shift .list-group-item-text');
     	var $list_group_heading = $('.list-group-item.shift .list-group-item-heading');
     	var change_text = ['Transactions','Regular Shift','Manager Shift'];
     
     	$text.animate({opacity:0},500,function(){
     	    	
     	  for(var i=0;i<change_text.length;i++){
     	  	 if(change_text[i]==$(this).text()){
     	  	 	i==change_text.length-1 ? $(this).text(change_text[0]) : $(this).text(change_text[i+1]);
     	  	 	break;
     	  	 }
     	  }
     	  $(this).animate({opacity:1},1000);
       });
       $table.hide('drop',500,function(){
       	  var show_data=[];
       	  
       	  for(var i=0;i<change_text.length;i++){
       	  	if(change_text[i]==$text.text()){
       	  		show_data = Manager_data[$text.text()]['data'];
       	  	}
       	  }
       	  transactions_table.fnClearTable();
       	  transactions_table.fnAddData(show_data);
          $(this).show('drop',1000,function(){
          	$(that).removeClass('disabled');
          }); 	
       }); 
       for(var i=0;i<change_text.length;i++){
     	  	 if(change_text[i]==$text.text()){
     	  	 	 $list_group_text.animate({opacity:0},500,function(){
			       var insert_text = $text.text()=='Transactions' ? '' : (($text.text()).split(" "))[0]; 
			       $(this).find('span').text(insert_text);
			       $(this).animate({opacity:1},500);
		         });
		         $list_group_heading.animate({opacity:0},500,function(){
		           $('#today_ftds').html(Manager_data[$text.text()]['today_ftds']);
		           $('#total_ftds').html(Manager_data[$text.text()]['total_ftds']);
		           $('#today_deposits').html('$ '+(Manager_data[$text.text()]['today_deposits']).toLocaleString());
			       $('#total_deposits').html('$ '+(Manager_data[$text.text()]['total_deposits']).toLocaleString());
		           $(this).animate({opacity:1},500);	
		         });
     	  	 }
       }	  	  
     });
     
     $( document ).on("click","a.getNotes",function() {
	   event.preventDefault();
	   $('#nStart').val($(this).attr("data-nStart"));
	   $('#nEnd').val($(this).attr("data-nEnd"));
	   $('#note_customer').val($(this).attr("data-customer"));
	   $('#note_employee').val($(this).attr("data-employee"));
	   bootbox.dialog({
        title: "Notes",
        message:    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="notes_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="notes_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getNotesForConversion();</script>',
                 
        buttons: {
         success: {
         label: "OK",
         className: "btn-success"
         }
         }});
   //   setBootBoxHeader(note_bootbox[0].getElementsByClassName('modal-header'));   
	
      });
 /*     $(document).on("click","a.closeShift",function() {
       	  event.preventDefault();
       	  var id= $(this).attr('data-id');
       	  var status= $(this).attr('data-status');
       	  var shift_employee = $(this).attr('data-employee');
       	  if(status=='closed')
       	     return false;
       	  if(shift_employee!=global_spotId){
       	  	 bootbox.alert('<h4>You have no right to close this shift</h4>');
       	  	 return false;
       	  }    
       	  apiRequest('closeConversionShift','id='+id,'#shifts_table',function(data){
       	  	 if(data) 
       	  	   bootbox.alert('<h4>The shift is closed</h4>');
       	  	 else
       	  	   bootbox.alert('<h4>The shift could not be closed,/h4>');
             getShifts();
       	  });
    });  */
      
});

function getNotesForConversion(){
	apiRequest('getNotesForConversion',$('#note-form').serialize(),$('#notes_table_holder'),function(data){
		  $('#notes_table').dataTable( {
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
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "body", "sTitle": "Body"},
            { "mData": "createDate", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"}
           ],
           "fnRowCallback": function( nRow, aData ) {
           	  if(aData.createDate<$('#nStart').val() || aData.createDate>$('#nEnd').val())
           	     $(nRow).css({"background-color":"#cfcfcf"});
           	  
           } 
            });	
	});
	
} 

function getEmployeesForConversion(){
	$('#employee')
    .find('option')
    .remove()
    .end();
    
    $.ajax({
  	    	 url: "/api.php?cmd=getEmployeesForConversion",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
  	    	 async:false,
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	 
  	    	 	  if(data==''){
  	    	 	  	$('#employee').append($('<option>', { value : "0" , text : "No Employee"}));
  	    	 	  }else{
  	    	 	     
                   jQuery.each(data, function() {
                     $('#employee')
                     .append($('<option>', { value : this.userId })
                     .text(this.userId + ' - ' + this.employeeName));
                    });
                    getUserSpotId();
                  } 
      }
     });   
}

function displayNewDailyBonus(month){
	var compareMonth= '2016-05';
   
    if(month<compareMonth)
    	animateNewDailyBonus('none');
    else
    	animateNewDailyBonus('table-row');
}

function animateNewDailyBonus(type){
 	if($('.new_daily_extra').css('display')!=type){
    		$('#commission_table').animate({opacity:0},function(){
    			$('.new_daily_extra').css('display',type);
    			$('#span_daily_10').html(type=='none' ? '10+' : '10-11');
    			$(this).animate({opacity:1});
    		});
    }		
}

function isShiftManager(){
	
	apiRequest('getConversionShiftManagers',$('#range-form').serialize(),'',function(data){
		
		if(data.length!=0){  // employee is shift manager
			if($('.manager').css('display')=='none'){
				$('#range-form').append('<div class="col-md-1" id="shift_manager">'+
			                        '<h4>&nbsp;</h4>'+
			                        '<a href="" class="btn btn-green" onclick="event.preventDefault(); getShiftsModal(); return false;">Shift Manager</a>'+ 
			                        '</div>'  
			                        );
				$('#commission_table').animate({opacity:0},function(){
		           $('.manager').show();
		           $('#regular_shift_text').text('- Regular Shift');
		           $(this).animate({opacity:1});
	            });
			}
		}else{
			   if($('.manager').css('display')!='none'){
			   	$('#shift_manager').remove();
				$('#commission_table').animate({opacity:0},function(){
		           $('.manager').hide();
		           $('#regular_shift_text').text('');
		           $(this).animate({opacity:1});
	            });
			   }
		}
	});
}

function getShiftsModal(){
	var modal_body= '<div class="row">'+
	                '<div class="col-md-6">'+
	                '<input class="form-control" value="'+$("#employee option:selected").text()+'" onfocus="this.blur();">'+ 
	                '</div>'+
	              /*  '<div class="col-md-1">'+
	                '<a href="" class="btn btn-green" id="shift_button">Open Shift</a>'+
	                '</div>'+ */
	                '<div class="col-md-12"><h4></h4></div>'+
	                '<div class="col-md-12">'+
	                '<table class="table table-striped table-bordered table-hover table-highlight" id="shifts_table">'+
	                '</table>'+
	                '</div>'+
	                '</div>';
	bootbox.dialog({
	  title: 'Manager Shifts',
	  message: modal_body,
	  buttons:{
	  	success:{
	  	  label: "OK",
          className: "btn-success",
          callback: function(){
          	 getTransactionsForConversion();
          }  	
	  	}
	  }	
	});
	
//	getShifts();
	
	getShiftFTDs();
	
/*	$('#shift_button').click(function(){
		event.preventDefault();
		bootbox.confirm('<h4>Do you confirm to open a new manager shift?</h4>',function(result){
			if(result){
			  if(new Date().format('yyyy-MM')>$('#dpMonth').val()){
			  	 bootbox.alert('<h4>You can not open a shift for the selected month</h4>');
			  	 return;
			  }
			  if(global_spotId!=$('#employee').val()){
			  	 bootbox.alert('<h4>You have no access to open shift for selected employee</h4>');
			  	 return; 
			  } 
			  openShift();
			}
		});
	});   */            
}

/* function getShifts(){
	apiRequest('getConversionShifts',$('#dpMonth').serialize(),'',function(shift_data){
		 apiRequest('getFTDsForShiftManagers',$('#dpMonth').serialize(),'',function(ftd_data){
		    var table_data=[];
		    
		    for(var i in shift_data){
		 	   if(shift_data[i].employeeId==$('#employee').val()){
		 		shift_data[i].ftds=0;
		 		table_data.push(shift_data[i]);
		 	   }
		    }
		    for(var i=0;i<ftd_data.length;i++){
  	           for(var j=0;j<table_data.length;j++){
       	 	       if(ftd_data[i].confirmTime>=table_data[j].startTime && (table_data[j].endTime=='0000-00-00 00:00:00' || ftd_data[i].confirmTime<=table_data[j].endTime)){
                          	
      		                   table_data[j].ftds++;
      	                  
      	           }        	                	    
  	           }
  	        }
		    $('#shifts_table').dataTable( {
              "bDestroy": true,
              "bFilter": true,
              "bLengthChange": true,
              "aaData": table_data,
              "dom": '<"toolbar">frtip',
              "aaSorting": [[ 3, "desc" ]],                    
              "aoColumns": [
              { "mData": "id", "sTitle": "Id", "bVisible": false},
              { "mData": "employeeId", "sTitle": "Employee ID"},
              { "mData": "employee", "sTitle": "Employee"},
              { "mData": "startTime", "sTitle": "Start Time"},
              { "mData": "endTime", "sTitle": "End Time"},
              { "mData": "status", "sTitle": "Status", "bUseRendered": false,
                "fnRender": function(oObj){
                	var color = oObj.aData.status == 'closed' ? 'danger' : 'success';
                	return '<a href="" data-id="'+oObj.aData.id+'" data-employee="'+oObj.aData.employeeId+'" data-status="'+oObj.aData.status+'" class="btn btn-'+color+' btn-xs closeShift">'+oObj.aData.status+'</a>';
                }},
              { "mData": "ftds", "sTitle": "Ftds"}
              ]
            });    	
		 });
		 
	});
} */

function getShiftFTDs(){
	apiRequest('getShiftFTDsForConversion',$('#dpMonth').serialize(),'#shifts_table',function(data){
		var table_data = [];
		for(var i in data){
			if(data[i].employeeId==$('#employee').val())
			   table_data.push(data[i]);
		}
		$('#shifts_table').dataTable( {
              "bDestroy": true,
              "bFilter": true,
              "bLengthChange": true,
              "aaData": table_data,
              "dom": '<"toolbar">frtip',
              "aaSorting": [[ 3, "asc" ]],                    
              "aoColumns": [
              { "mData": "id", "sTitle": "Id", "bVisible": false},
              { "mData": "employeeId", "sTitle": "Employee ID"},
              { "mData": "employeeName", "sTitle": "Employee"},
              { "mData": "date", "sTitle": "Date"},
              { "mData": "ftds", "sTitle": "Ftds"},
              { "mData": "type", "sTitle": "Shift"}
              
              ]
        });    	
	});
}

/* function openShift(){
	apiRequest('openConversionShift',$('#range-form').serialize(),'#shifts_table',function(data){
		if(data=='open shift'){
			bootbox.alert('<h4>There is an open shift. Please close the open shift.</h4>');
			return;
		}
		getShifts();
		
	});
} */

function getConversionWeeks(){
	
	apiRequest('getConversionWeeks',$('#range-form').serialize(),$('#range-form'),function(data){
	    if(data.length!=4){
	    	bootbox.alert('<h4>Wait until the admin set the weeks for the specified month</h4>');
	    }else{
	    	global_weeks=data;
	    	getTransactionsForConversion();
	    }
	
	  });
}  


function viewWeeklyBonus(){
	bootbox.dialog({
        title: "Weekly Bonus",
        message:    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="view_weekly_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="view_weekly_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>viewWeeklyBonusForConversion();</script>',
                 
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
      	    getTransactionsForConversion();
         }
         }
    
     }});
  //    setBootBoxHeader(view_weekly_bootbox[0].getElementsByClassName('modal-header'));   
}
function viewWeeklyBonusForConversion(){
	var real_data=[];
	apiRequest('getWeeklyBonusForConversion',$('#dpStart').serialize(),$('#view_weekly_table_holder'),function(data){
		for(var i=0;i<data.length;i++){
			data[i].employee=data[i].employeeId+' - '+data[i].employee;
			data[i].month=$('#dpMonth').val();
			if(data[i].employeeId==$('#employee').val()){
				real_data.push(data[i]);
			}
		}
		$('#view_weekly_table').dataTable( {
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
           "aaData": real_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 2, "desc" ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "place", "sTitle": "Place"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "week", "sTitle": "Week"},
            { "mData": "month", "sTitle": "Month"}
            ]
      });     
		
	});
}

function viewExtraBonus(){
      bootbox.dialog({
        title: "ExtraBonus",
        message:    '<div class="row">  ' +
                    '<div class="col-md-2">'+
                    '<a href="" class="btn btn-success" onclick="event.preventDefault(); getExtraForConversion(); return false;">Refresh</a></div>'+
                    '<div class="col-md-12" id="extra_table_holder">'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="extra_table">' +
					'</table>'+
					'</div></div>'+		
                    '</div>'+
                    '<script>getExtraForConversion();</script>',
                 
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
      	    getTransactionsForConversion();
         }
         }
    
       }});
   //   setBootBoxHeader(extra_bootbox[0].getElementsByClassName('modal-header'));   	
}

function getExtraForConversion(){
	var real_data=[];
	apiRequest('getExtraForConversion',$('#range-form').serialize(),$('#extra_table_holder'),function(data){
	   	for(var i=0;i<data.length;i++){
          data[i].employee=data[i].employeeId+' - ' +data[i].employee;
          if(data[i].employeeId==$('#employee').val()){
				real_data.push(data[i]);
			}
	   	}
	   	$('#extra_table').dataTable( {
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
           "aaData": real_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 2, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Id","bVisible":false}, 
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "date", "sTitle": "Date"},
            { "mData": "reason", "sTitle": "Reason"}
            ]
      });     
    }); 
}

function getTransactionsForConversion(){
	
	$('.portlet-header.shift').addClass('disabled');
	
	if(typeof transactions_table!='undefined' && $('.portlet-header.shift span').text()!='Transactions'){
		$('.portlet-header.shift span').animate({opacity:0},500,function(){
			$(this).text('Transactions');
			$(this).animate({opacity:1},500);
		});
		$('.list-group-item.shift .list-group-item-text').animate({opacity:0},500,function(){
			$(this).find('span').text('');
			$(this).animate({opacity:1},500);
		});
		$('.list-group-item.shift .list-group-item-heading').animate({opacity:0},500,function(){
			$('#today_ftds').html(Manager_data['Transactions']['today_ftds']);
			$('#total_ftds').html(Manager_data['Transactions']['total_ftds']);
			$('#today_deposits').html('$ '+(Manager_data['Transactions']['today_deposits']).toLocaleString());
			$('#total_deposits').html('$ '+(Manager_data['Transactions']['total_deposits']).toLocaleString());
			$(this).animate({opacity:1},500);
		});
		$('#transactions_table_wrapper').hide('drop',500,function(){
			transactions_table.fnClearTable();
       	    transactions_table.fnAddData(Manager_data['Transactions']['data']);
            $(this).show('drop',500);
		});
	}  // Showing All The Transactions
	
	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
    var href = '';
    var month = $('#dpMonth').val();
    var real_data=[],data_wd=[],real_data_wd=[],unique=[], shifts=[];
    var today=new Date().format('yyyy-MM')==$('#dpMonth').val() ? new Date().format('yyyy-MM-dd') : $('#dpEnd').val();
    var target_weeks=new Float64Array(4);
    var total_weeks=new Float64Array(4);
    var total_days=new Float64Array(31);
    var all_total_days=new Float64Array(31);
    var total_deposits=0;
    var today_ftds=0;
    var today_deposits=0;
    var total_ftds=0;
    var average_ftds=0;
    var daily_3=0;
    var daily_4=0;
    var daily_6=0;
    var daily_8=0;
    var daily_10=0;
    var daily_12=0;
    var daily_15=0;
    var daily_total=0;
    var manager_daily_total=0;
    var flat_bonus=0;
    var daily_3_bonus=0;
    var daily_4_bonus=0;
    var daily_6_bonus=0;
    var daily_8_bonus=0;
    var daily_10_bonus=0;
    var daily_12_bonus=0;
    var daily_15_bonus=0;
    var manager_all_daily_0=0;
    var manager_all_daily_16=0;
    var manager_all_daily_36=0;
    var manager_all_daily_41=0;
    var manager_all_daily_46=0;
    var manager_all_daily_61=0;
    var manager_all_daily_0_bonus=0;
    var manager_all_daily_16_bonus=0;
    var manager_all_daily_36_bonus=0;
    var manager_all_daily_41_bonus=0;
    var manager_all_daily_46_bonus=0;
    var manager_all_daily_61_bonus=0;
    var manager_all_daily_total=0;
    var bonus_week_arr=new Float64Array(4);;
    var bonus_week=0;
    var weekly_bonus=0;
    var extra_bonus=0;
    var total_bonus=0;
    var insert=0;
    
  /*  var shift_types = ['Regular Shift','Manager Shift'];
    
    for(var i in shift_types){
    	var type = shift_types[i];
    	Manager_data[type]['data']=[];
    	Manager_data[type]['data_wd']=[];
    	Manager_data[type]['total_days']=new Float64Array(31);
    	Manager_data[type]['total_deposits']=0;
    	Manager_data[type]['today_deposits']=0;
    	Manager_data[type]['total_ftds']=0;
    	Manager_data[type]['today_ftds']=0;
    	Manager_data[type]['daily_3']=0;
    	Manager_data[type]['daily_4']=0;
    	Manager_data[type]['daily_6']=0;
    	Manager_data[type]['daily_8']=0;
    	Manager_data[type]['daily_10']=0;
    } */
    
    $.ajax({
  	    url: "/api.php?cmd=getUserSpotId",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(spotId){
  	    	
  	    	if(spotId!=0){	
  	    	  	$('#employee option[value="'+spotId+'"]').attr('selected',true);
  	    	}	
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	}).done(function(){
 /* 	$.ajax({
  	    url: "/api.php?cmd=getConversionShifts",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	
  	    	for(var i=0;i<data.length;i++){
  	    		if(data[i].employeeId==$('#employee').val()){
  	    			shifts.push(data[i]);
  	    		}
  	    	}
  	    	
  	    			 
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	}).done(function(){
  	$.ajax({
  	    url: "/api.php?cmd=getFTDsForShiftManagers",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(ftd_data){
  	      if(shifts.length!=0){	
  	        for(var i=0;i<ftd_data.length;i++){
  	           for(var j=0;j<shifts.length;j++){
       	 	       if(ftd_data[i].confirmTime>=shifts[j].startTime && (shifts[j].endTime=='0000-00-00 00:00:00' || ftd_data[i].confirmTime<=shifts[j].endTime)){
                          for(var k=0;k<31;k++){	
      		                   all_total_days[k]+=new Date(shifts[j].startTime).format('d')==k+1 ? 1 :0;
      	                  }
      	           }        	                	    
  	           }
  	        }
  	        console.log(all_total_days);
  	        for(var i=0;i<31;i++){
      	        if(all_total_days[i]>=70){
      		      manager_all_daily_70++;
      	        }else if(all_total_days[i]>=60){
      		      manager_all_daily_60++;
      	        }else if(all_total_days[i]>=51){
      		      manager_all_daily_51++;
      	        }else if(all_total_days[i]>=46){
      		      manager_all_daily_46++;
      	        }else if(all_total_days[i]>=41){
      		      manager_all_daily_41++;
      	        }else if(all_total_days[i]>=36){
      		      manager_all_daily_36++;
      	        }
            }
            manager_all_daily_36_bonus = manager_all_daily_36 * 300;
            manager_all_daily_41_bonus = manager_all_daily_41 * 500;
            manager_all_daily_46_bonus = manager_all_daily_46 * 750;
            manager_all_daily_51_bonus = manager_all_daily_51 * 1000;
            manager_all_daily_60_bonus = manager_all_daily_60 * 1500;
            manager_all_daily_70_bonus = manager_all_daily_70 * 2000;
            manager_all_daily_total = manager_all_daily_36_bonus + manager_all_daily_41_bonus + manager_all_daily_46_bonus + manager_all_daily_51_bonus + manager_all_daily_60_bonus + manager_all_daily_70_bonus;
  	      }
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	     			
  	}).done(function(){		*/ 
  	$.ajax({
  	    url: "/api.php?cmd=getShiftFTDsForConversion",
  	    type: "POST",
  	    data: $('#dpMonth').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	for(var i=0;i<data.length;i++){
  	    		if(data[i].employeeId==$('#employee').val())
  	    		   shifts.push(data[i]);
  	    	}
  	    	
  	    	for(var i in shifts){
  	    		
      	        if(shifts[i].ftds>=61){
      		      manager_all_daily_61++;
      	        }else if(shifts[i].ftds>=46){
      		      manager_all_daily_46++;
      	        }else if(shifts[i].ftds>=41){
      		      manager_all_daily_41++;
      	        }else if(shifts[i].ftds>=36){
      		      manager_all_daily_36++;
      	        }else if(shifts[i].ftds>=16){
      		      manager_all_daily_16++;
      	        }else if(shifts[i].ftds>=0){
      		      manager_all_daily_0++;
      	        }
            }
            manager_all_daily_0_bonus = manager_all_daily_0 * 0;
            manager_all_daily_16_bonus = manager_all_daily_16 * 300;
            manager_all_daily_36_bonus = manager_all_daily_36 * 600;
            manager_all_daily_41_bonus = manager_all_daily_41 * 900;
            manager_all_daily_46_bonus = manager_all_daily_46 * 1500;
            manager_all_daily_61_bonus = manager_all_daily_61 * 3000;
            manager_all_daily_total = manager_all_daily_0_bonus + manager_all_daily_16_bonus + manager_all_daily_36_bonus + manager_all_daily_41_bonus + manager_all_daily_46_bonus + manager_all_daily_61_bonus;
  	    	
  	    		
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	}).done(function(){ 	 		
    $.ajax({
  	    url: "/api.php?cmd=getWeeklyBonusForConversion",
  	    type: "POST",
  	    data: $('#dpStart').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	for(var i=0;i<data.length;i++){
  	    		if(data[i].employeeId==$('#employee').val())
  	    		   weekly_bonus+=parseFloat(data[i].amount);
  	    	}
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	}).done(function(){ 
    $.ajax({
  	    url: "/api.php?cmd=getTargetsForConversion",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	       
  	       for(var i=0;i<4;i++){
  	       	for(var j=0;j<data.length;j++){
  	       		if(data[j].week==i+1 && data[j].employeeId==$('#employee').val()){
  	       			target_weeks[i]=parseFloat(data[j].target);
  	       		}
  	       	}
  	       }
  	       console.log(target_weeks);
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	    }).done(function(){
  	  $.ajax({
  	    url: "/api.php?cmd=getExtraForConversion",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	console.log('extraforconversion');
  	    	for(var i=0;i<data.length;i++){
  	    	  if(data[i].employeeId==$('#employee').val())	
  	            extra_bonus+=parseFloat(data[i].amount);
  	        }
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	  }).done(function(){   	 	
      apiRequest('getTransactionsForConversion',$('#range-form').serialize(),$('#transactions_table_holder'),function(data){  
        for(var i=0;i<data.length;i++){
          data[i].employee=data[i].employeeId+' - '+data[i].employee;	
      	  for(var j=0;j<4;j++){
      		if(new Date(data[i].confirmTime).format('yyyy-MM-dd')<=global_weeks[j].lastDayofWeek){
      			data[i].week=global_weeks[j].week;
      			break;
      		}
      	 }	 
        }
       for(var i=0;i<data.length;i++){
      	 if(data[i].employeeId==$('#employee').val()){
      		real_data.push(data[i]); // chosen agent's transactions
      		}
      	 if(unique[data[i].customerId]==1){
      		continue;
      	 }
      	 data_wd.push(data[i]); // transactions without duplicated customer
      	 unique[data[i].customerId]=1;
       }
       unique=[];
       for(var i=0;i<real_data.length;i++){
       	 total_deposits+=parseFloat(real_data[i].amountUSD);
       	 today_deposits+= new Date(real_data[i].confirmTime).format("yyyy-MM-dd")==today ? parseFloat(real_data[i].amountUSD) : 0;
       	 
    /*   	 for(var j=0;j<shifts.length;j++){
       	 	if(real_data[i].confirmTime>=shifts[j].startTime && (shifts[j].endTime=='0000-00-00 00:00:00' || real_data[i].confirmTime<=shifts[j].endTime)){   
       	 	   Manager_data['Manager Shift']['data'].push(real_data[i]); // Manager Shift table data
       	 	   Manager_data['Manager Shift']['total_deposits'] += parseFloat(real_data[i].amountUSD);
       	 	   Manager_data['Manager Shift']['today_deposits'] += new Date(real_data[i].confirmTime).format("yyyy-MM-dd")==today ? parseFloat(real_data[i].amountUSD) : 0; 
       	 	   insert++;
       	 	}   
       	 }
       	 if(insert==0){
       	 	Manager_data['Regular Shift']['data'].push(real_data[i]); // Regular Shift table data
       	 	Manager_data['Regular Shift']['total_deposits'] += parseFloat(real_data[i].amountUSD);
       	 	Manager_data['Regular Shift']['today_deposits'] += new Date(real_data[i].confirmTime).format("yyyy-MM-dd")==today ? parseFloat(real_data[i].amountUSD) : 0;
       	 }
       	 insert=0; */
       	 
       	 if(unique[real_data[i].customerId]==1 && real_data[i].type!="Duplicated"){
       	 	continue;
       	 }
       	 real_data_wd.push(real_data[i]);
       	 unique[real_data[i].customerId]=1;
       }	
      for(var i=0;i<real_data_wd.length;i++){
      	today_ftds+=(new Date(real_data_wd[i].confirmTime).format("yyyy-MM-dd")==today && real_data_wd[i].assign!='Deleted') ? 1 : 0;
      	total_ftds+=real_data_wd[i].assign!='Deleted' ? 1 : 0;
      	
    /*  	for(var j=0;j<shifts.length;j++){
       	 	if(real_data_wd[i].confirmTime>=shifts[j].startTime && (shifts[j].endTime=='0000-00-00 00:00:00' || real_data_wd[i].confirmTime<=shifts[j].endTime)){   
       	 	   Manager_data['Manager Shift']['data_wd'].push(real_data_wd[i]); // Manager Shift data without duplication for calculations
       	 	   Manager_data['Manager Shift']['today_ftds'] += (new Date(real_data_wd[i].confirmTime).format("yyyy-MM-dd")==today && real_data_wd[i].assign!='Deleted') ? 1 : 0;
       	 	   Manager_data['Manager Shift']['total_ftds'] += real_data_wd[i].assign!='Deleted' ? 1 : 0;
       	 	   insert++;
       	 	}   
       	}
       	if(insert==0){
       	 	Manager_data['Regular Shift']['data_wd'].push(real_data_wd[i]); // Regular Shift data without duplication for calculations
       	 	Manager_data['Regular Shift']['today_ftds'] += (new Date(real_data_wd[i].confirmTime).format("yyyy-MM-dd")==today && real_data_wd[i].assign!='Deleted') ? 1 : 0;
       	 	Manager_data['Regular Shift']['total_ftds'] += real_data_wd[i].assign!='Deleted' ? 1 : 0;
       	}
       	insert=0; */
       	
      	for(var j=0;j<4;j++){
      		total_weeks[j]+=real_data_wd[i].week==j+1 && real_data_wd[i].assign!='Deleted' ? 1 : 0;
      	}
      	for(var j=0;j<31;j++){	
      		total_days[j]+=new Date(real_data_wd[i].confirmTime).format('d')==j+1 && real_data_wd[i].assign!='Deleted' ? 1 :0;
      	}
      }
      for(var i=0;i<31;i++){
      	if(month>='2016-05'){ 
      		if(total_days[i]>=15){
      			daily_15++;
      		}else if(total_days[i]>=12){
      			daily_12++;
      		}else if(total_days[i]>=10){
      			daily_10++;
      		}else if(total_days[i]>=8){
      			daily_8++;
      		}else if(total_days[i]>=6){
      			daily_6++;
      		}else if(total_days[i]>=4){
      			daily_4++;
      		}else if(total_days[i]==3){
      			daily_3++;
      		}
      	}else{
      		if(total_days[i]>=10){
      			daily_10++;
      		}else if(total_days[i]>=8){
      			daily_8++;
      		}else if(total_days[i]>=6){
      			daily_6++;
      		}else if(total_days[i]>=4){
      			daily_4++;
      		}else if(total_days[i]==3){
      			daily_3++;
      		}
      	}   
      	
      }
      
      average_ftds=(total_ftds==0) ? 0:total_deposits/total_ftds;
      flat_bonus=total_ftds*79;
      daily_3_bonus=daily_3*100;
      daily_4_bonus=daily_4*200;
      daily_6_bonus=daily_6*500;
      daily_8_bonus=daily_8*1000;
      daily_10_bonus=daily_10*2000;
      daily_12_bonus=daily_12*3000;
      daily_15_bonus=daily_15*4000; 
      daily_total=flat_bonus+daily_3_bonus+daily_4_bonus+daily_6_bonus+daily_8_bonus+daily_10_bonus+daily_12_bonus+daily_15_bonus;
  /*    
      Manager_data['Transactions']['data']=real_data;
      Manager_data['Transactions']['total_ftds']=total_ftds;
      Manager_data['Transactions']['today_ftds']=today_ftds;
      Manager_data['Transactions']['total_deposits']=total_deposits;
      Manager_data['Transactions']['today_deposits']=today_deposits; // Inserting all manager datas
      
      if(shifts.length!=0){
      	 var daily_amount={ 3:100,
      	 	                4:200,
      	 	                6:500,
      	 	                8:1000,
      	 	                10:2000};
      	 for(var i in shift_types){
    	    var type = shift_types[i];
    	    for(var j=0; j<Manager_data[type]['data_wd'].length; j++){
    	    	for(var k=0;k<31;k++){	
      		        Manager_data[type]['total_days'][k] += new Date(Manager_data[type]['data_wd'][j].confirmTime).format('d')==k+1 && Manager_data[type]['data_wd'][j].assign!='Deleted' ? 1 :0;
      	        }
    	    }
    	    for(var j=0;j<31;j++){
      	       if(Manager_data[type]['total_days'][j]>=10){
      		       Manager_data[type]['daily_10']++;
      	       }else if(Manager_data[type]['total_days'][j]>=8){
      		       Manager_data[type]['daily_8']++;
      	       }else if(Manager_data[type]['total_days'][j]>=6){
      		       Manager_data[type]['daily_6']++;
      	       }else if(Manager_data[type]['total_days'][j]>=4){
      		       Manager_data[type]['daily_4']++;
      	       }else if(Manager_data[type]['total_days'][j]==3){
      		       Manager_data[type]['daily_3']++;
      	       }
            }
            for(var key in daily_amount){
            	Manager_data[type]['daily_'+key+'_bonus'] = type=='Regular' ? Manager_data[type]['daily_'+key]*daily_amount[key] : Manager_data[type]['daily_'+key]*(daily_amount[key]/2);
            }
            
    	 }
    	 Manager_data['Regular Shift']['flat_bonus'] = Manager_data['Regular Shift']['total_ftds']*79;
    	 Manager_data['Manager Shift']['flat_bonus'] = Manager_data['Manager Shift']['total_ftds']*40;
    	 
    	 console.log(Manager_data['Regular Shift']);
    	 
    	 for(var i in shift_types){
    	   var type = shift_types[i];
    	   var data_type = type=='Manager Shift' ? 'manager_' : '';
    	   
    	   Manager_data[type]['daily_total'] = Manager_data[type]['flat_bonus'] + Manager_data[type]['daily_3_bonus'] + Manager_data[type]['daily_4_bonus'] + Manager_data[type]['daily_6_bonus'] + Manager_data[type]['daily_8_bonus'] + Manager_data[type]['daily_10_bonus'];
    	   
    	   $('#'+data_type+'flat').html(Manager_data[type]['total_ftds'].toLocaleString());
           $('#'+data_type+'daily_3').html(Manager_data[type]['daily_3'].toLocaleString());
           $('#'+data_type+'daily_4').html(Manager_data[type]['daily_4'].toLocaleString());
           $('#'+data_type+'daily_6').html(Manager_data[type]['daily_6'].toLocaleString());
           $('#'+data_type+'daily_8').html(Manager_data[type]['daily_8'].toLocaleString());
           $('#'+data_type+'daily_10').html(Manager_data[type]['daily_10'].toLocaleString());
           $('#'+data_type+'flat_bonus').html('&#8362; '+Manager_data[type]['flat_bonus'].toLocaleString());
           $('#'+data_type+'daily_3_bonus').html('&#8362; '+Manager_data[type]['daily_3_bonus'].toLocaleString());
           $('#'+data_type+'daily_4_bonus').html('&#8362; '+Manager_data[type]['daily_4_bonus'].toLocaleString());
           $('#'+data_type+'daily_6_bonus').html('&#8362; '+Manager_data[type]['daily_6_bonus'].toLocaleString());
           $('#'+data_type+'daily_8_bonus').html('&#8362; '+Manager_data[type]['daily_8_bonus'].toLocaleString());
           $('#'+data_type+'daily_10_bonus').html('&#8362; '+Manager_data[type]['daily_10_bonus'].toLocaleString());   
           $('#'+data_type+'daily_total').html('&#8362; '+Manager_data[type]['daily_total'].toLocaleString()); 	
    	 }
    	 
    	 daily_total = Manager_data['Regular Shift']['daily_total'];
    	 manager_daily_total = Manager_data['Manager Shift']['daily_total'];	
         
      }else{  */
        
      
      
      $('#flat').html(total_ftds.toLocaleString());
      $('#daily_3').html(daily_3.toLocaleString());
      $('#daily_4').html(daily_4.toLocaleString());
      $('#daily_6').html(daily_6.toLocaleString());
      $('#daily_8').html(daily_8.toLocaleString());
      $('#daily_10').html(daily_10.toLocaleString());
      $('#daily_12').html(daily_12.toLocaleString());
      $('#daily_15').html(daily_15.toLocaleString());
      $('#flat_bonus').html('&#8362; '+flat_bonus.toLocaleString());
      $('#daily_3_bonus').html('&#8362; '+daily_3_bonus.toLocaleString());
      $('#daily_4_bonus').html('&#8362; '+daily_4_bonus.toLocaleString());
      $('#daily_6_bonus').html('&#8362; '+daily_6_bonus.toLocaleString());
      $('#daily_8_bonus').html('&#8362; '+daily_8_bonus.toLocaleString());
      $('#daily_10_bonus').html('&#8362; '+daily_10_bonus.toLocaleString());
      $('#daily_12_bonus').html('&#8362; '+daily_12_bonus.toLocaleString());
      $('#daily_15_bonus').html('&#8362; '+daily_15_bonus.toLocaleString());
      
      $('#daily_total').html('&#8362; '+daily_total.toLocaleString());
  /*    $('#manager_flat').html(0);
      $('#manager_daily_3').html(0);
      $('#manager_daily_4').html(0);
      $('#manager_daily_6').html(0);
      $('#manager_daily_8').html(0);
      $('#manager_daily_10').html(0);
      $('#manager_flat_bonus').html('&#8362; 0');
      $('#manager_daily_3_bonus').html('&#8362; 0');
      $('#manager_daily_4_bonus').html('&#8362; 0');
      $('#manager_daily_6_bonus').html('&#8362; 0');
      $('#manager_daily_8_bonus').html('&#8362; 0');
      $('#manager_daily_10_bonus').html('&#8362; 0');
      $('#manager_daily_total').html('&#8362; 0');
      } */
      
      $('#total_deposits_commission').html('$ '+total_deposits.toLocaleString());
      $('#total_deposits').html('$ '+total_deposits.toLocaleString());
      $('#today_deposits').html('$ '+today_deposits.toLocaleString());
      $('#today_ftds').html(today_ftds.toLocaleString());
      $('#total_ftds').html(total_ftds.toLocaleString());
   // $('#average_ftds').html('$ '+average_ftds.toLocaleString());
      
      $('#manager_all_daily_0').html(manager_all_daily_0.toLocaleString());
      $('#manager_all_daily_16').html(manager_all_daily_16.toLocaleString());
      $('#manager_all_daily_36').html(manager_all_daily_36.toLocaleString());
      $('#manager_all_daily_41').html(manager_all_daily_41.toLocaleString());
      $('#manager_all_daily_46').html(manager_all_daily_46.toLocaleString());
      $('#manager_all_daily_61').html(manager_all_daily_61.toLocaleString());
      $('#manager_all_daily_0_bonus').html('&#8362; '+manager_all_daily_0_bonus.toLocaleString());
      $('#manager_all_daily_16_bonus').html('&#8362; '+manager_all_daily_16_bonus.toLocaleString());
      $('#manager_all_daily_36_bonus').html('&#8362; '+manager_all_daily_36_bonus.toLocaleString());
      $('#manager_all_daily_41_bonus').html('&#8362; '+manager_all_daily_41_bonus.toLocaleString());
      $('#manager_all_daily_46_bonus').html('&#8362; '+manager_all_daily_46_bonus.toLocaleString());
      $('#manager_all_daily_61_bonus').html('&#8362; '+manager_all_daily_61_bonus.toLocaleString());
      $('#manager_all_daily_total').html('&#8362; '+manager_all_daily_total);
      
      for(var i=0;i<4;i++){
            $('#target_'+(i+1)).html(target_weeks[i].toLocaleString());
            $('#total_week_'+(i+1)).html(total_weeks[i].toLocaleString());
            if(target_weeks[i]!=0 && target_weeks[i]<=total_weeks[i]){
            	    bonus_week_arr[i]=300;
            		bonus_week+=300;
            }
            $('#bonus_week_'+(i+1)).html('&#8362; '+bonus_week_arr[i]);
            if(target_weeks[i]!=0){
            		$('#add_target_'+(i+1)).html('EDIT');
            }else{
            		$('#add_target_'+(i+1)).html('ADD');
            }
      }
      total_bonus= daily_total + manager_daily_total + manager_all_daily_total + weekly_bonus + bonus_week + extra_bonus;
      
      $('#bonus_week').html('&#8362; '+ bonus_week.toLocaleString());
      $('#weekly_bonus').html('&#8362; '+ weekly_bonus.toLocaleString());
      $('#extra_bonus').html('&#8362; '+ extra_bonus.toLocaleString());
      $('#total_bonus').html('&#8362; '+ total_bonus.toLocaleString());
      
      transactions_table = $('#transactions_table').dataTable( {
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
           'iDisplayLength': 10,
           "bStateSave": true,
           "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData); },
           "fnStateLoad": function(oSettings) { return load_dt_view(oSettings); },
           "scrollCollapse": false,
           "aaData": real_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "asc" ]],                    
           "aoColumns": [
            { "mData": "week", "sTitle": "Week"},            
            { "mData": "confirmTime", "sTitle": "Date", "sType": "date"},
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric", "bUseRendered":false,
              "fnRender": function(oObj){
               	href = url + '/?id='+oObj.aData.customerId;
               	return '<a href="'+href+'" target="_blank">'+oObj.aData.customerId+'</a>';
               }},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Curr"},  
            { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},
            { "mData": "employeeId", "sTitle": "Employee ID","bVisible": false},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "firstNoteInTwoWeeks", "sTitle": "First Note", "sType": "date"},
            { "mData": "note",
              "sTitle": "Note",
              "fnRender": function (oObj) {
              	    var color=oObj.aData.firstNoteInTwoWeeks=='0000-00-00 00:00:00' ? "danger" : "secondary";
                    return '<a href="#" data-customer="'+oObj.aData.customerId+'" data-employee="'+oObj.aData.employeeId+'" data-nStart="'+oObj.aData.firstNoteInTwoWeeks+'" data-nEnd="'+oObj.aData.confirmTime+'"   class="btn btn-xs btn-'+color+' getNotes">Note</a>';
                  }
            },
            { "mData":"type", "sTitle":"Type",
              "fnRender": function (oObj) {
              	 var color= oObj.aData.type=="Duplicate" ? "success" : "week";
              	 return '<a href="" data-id='+oObj.aData.id+' data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-type="'+oObj.aData.type+'" class="btn btn-'+color+' btn-xs btn-block" onclick="event.preventDefault();">'+oObj.aData.type+'</a>'; 
              }
               },
            { "mData": "withdrawal", "sTitle":"Withdrawals",
              "fnRender": function(oObj){
              	var color= oObj.aData.withdrawal=='Withdrawal' ? 'danger' : 'default';
              	return '<a href="" data-customerId='+oObj.aData.customerId+' data-date="'+oObj.aData.confirmTime+'" class="btn btn-'+color+' btn-xs btn-block" onclick="event.preventDefault();">'+oObj.aData.withdrawal+'</a>';
              }},   
            { "mData":"assign", "sTitle":"Delete",
              "fnRender": function (oObj) {
              	 var color= oObj.aData.assign=="Delete" ? "secondary" : "danger";
              	 return '<a href="" data-id='+oObj.aData.id+' data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-assign="'+oObj.aData.assign+'" class="btn btn-'+color+' btn-xs btn-block" onclick="event.preventDefault();">'+oObj.aData.assign+'</a>'; 
              }
               }            
            ]
         });
         
    /*     if(shifts.length)
           $('.portlet-header.shift').removeClass('disabled'); */
    });
    });
    });
    });
    });
    });
 //   });
 //   });
}	

function  getUserSpotId(){
  	apiRequest('getUserData',$('#range-form').serialize(),'#transaction_table_holder',function(userData){
  		if (userData.spotId==0) {
  			$('#desk_div').fadeIn(200,function(){
  			 $('#employee_div').fadeIn(200);	
  			});
  			
        }
        global_spotId = userData.spotId!=0 ? userData.spotId : userData.real_spotId;
        $('#employee option[value="'+global_spotId+'"]').attr('selected',true);
        isShiftManager(); 
       
    });
   }
   
function getDesk(){
	$.ajax({
  	    	 url: "/api.php?cmd=getDesk",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
  	    	 async:false,
             timeout: 60000000,
  	    	 success:function(data){	
			    $.each(data, function(key, value) { 
				  $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			    });
			    $('#desk option[value="4"]').attr('selected',true);
			    getEmployeesForConversion();
			}
	});
}   
                             
