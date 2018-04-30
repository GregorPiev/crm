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
  cleanDuplicate();
  reset_dt_view(); 
  getConversionWeeks();
  isShiftManager();
  getCampaigns_N_Agents();
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

function cleanDuplicate(){
  $('#transactionId').val('');
  $('#transactionEmployeeId').val('');
  $('#transactionEmployee').val('');
  $('#type').val('');	
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
var global_chart_data=[]; 
var global_agents=[];

var Manager_data = {'Transactions':{'data':[], 'total_ftds':0, 'today_ftds':0, 'total_deposits':0, 'today_deposits':0},
	                'Regular Shift':{'data':[], 'data_wd':[], 'total_ftds':0,'today_ftds':0,'total_deposits':0,'today_deposits':0},
	                'Manager Shift':{'data':[], 'data_wd':[], 'total_ftds':0,'today_ftds':0,'total_deposits':0,'today_deposits':0},
                   }; // Shift Managers' data 

var transactions_table;
                    
$(document).ready(function() {
	   
	 $('#dpMonth').val(new Date().format("yyyy-MM"));
     $('#dpMonth').datepicker();
     assignDate($('#dpMonth').val());
     reset_dt_view();
     $("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
     });
     getDesk();
     isShiftManager();
     getConversionWeeks();
     getCampaigns_N_Agents();
     displayNewDailyBonus($('#dpMonth').val());
     
     $('#dpMonth').change(function(){
     	assignDate($('#dpMonth').val());
     	$('#set,#button_bonus').addClass('disabled');
     	cleanDuplicate();
     	reset_dt_view();
     	getConversionWeeks();
     	isShiftManager();
     	getCampaigns_N_Agents();
     	displayNewDailyBonus($('#dpMonth').val());
     });
     $('#desk').change(function(){
     	getEmployeesForConversion();
     	getCampaigns_N_Agents();
     });
     $('#desk,#employee').change(function(){
     	cleanDuplicate();
     	reset_dt_view();
     	isShiftManager();
     	getTransactionsForConversion();
     });
     $('#campaign').change(function(){
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
      $(document).on("click","a.getAdd",function(){
	    event.preventDefault();
	    var employeeId=$(this).attr("data-id");
	    var employee=$(this).attr("data-employee");
	    if($('#set_bonus_div').css("display")=='none'){
	        $('#set_bonus_div').slideDown(200,function(){
	  	    $('#week_employeeId_1').val(employeeId);
	  	    $('#week_employee_1').val(employee);
	  	    $('#row_1').slideDown(200);
	    });
	    
	  }else{
	   for(var i=2;i<=5;i++){
	       if($('#row_'+i).css("display")=='none'){
	       	$('#week_employeeId_'+i).val(employeeId);
	       	$('#week_employee_'+i).val(employee);
	       	$('#row_'+i).slideDown(200);
	       	break;
	       }	
	    }	
	  }
      });
      $(document).on("click","a.deleteExtra",function(){
      	event.preventDefault();
      	var post_data="id="+$(this).attr('data-id');
      	apiRequest("deleteExtraForConversion",post_data,"#extra_table_holder",function(){
      		getExtraForConversion();
      	});
      });
      $(document).on("click","a.deleteManager",function(){
      	event.preventDefault();
      	var post_data="id="+$(this).attr('data-id');
      	apiRequest("deleteConversionShiftManager",post_data,"#managers_table",function(){
      		getShiftManagersForTable();
      	});
      });
      $(document).on("click","a.duplicate",function(){
      	event.preventDefault();
      	$('#transactionId').val($(this).attr('data-id'));
      	$('#transactionEmployeeId').val($(this).attr('data-employeeId'));
      	$('#transactionEmployee').val($(this).attr('data-employee'));
      	$('#type').val($(this).attr('data-type'));
      });
      $(document).on("click","a.assign",function(){
      	event.preventDefault();
      	var post_data="transactionId="+$(this).attr('data-id')+"&employeeId="+$(this).attr('data-employeeId')+"&assign="+$(this).attr('data-assign');
      	apiRequest('assignForConversion',post_data,$('#transactions_table_holder'),function(){
      		getTransactionsForConversion();
      	});
      });
      $(document).on("click","a.withdrawal",function(){
      	event.preventDefault();
      	if($(this).attr('data-withdrawal')=='Regular')
      	  return;
        $('#withdrawal_customer').val($(this).attr('data-customer'));
        $('#confirmTime').val($(this).attr('data-confirmTime'));   
      });
      $( document ).on("click","a.change",function() { 
      	event.preventDefault();
      	var id=$(this).attr("data-id");
      	var employee=$(this).attr("data-employee");
      	if($(this).attr('data-isChanged')=='Changed'){
      	   	bootbox.confirm('<h4>Are you sure to delete the changed employee?</h4>',function(result){
	 	       if(result)
	 	         deleteChangedEmployeeForConversion(id);
	        });	
      	}else{
        bootbox.dialog({
        title: "Change Employee",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="employee-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="transaction">Transaction ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="transaction" name="transaction"  value=" ' + id + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="changeEmployee">Transaction Employee</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="changeEmployee" name="changeEmployee" value=" '+ employee +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="chooseEmployee">Choose Employee</label> ' +
                    '<div class="col-md-5"> ' +
                    '<select id="chooseEmployee" name="chooseEmployee" class="form-control">' +
                    '</select>' + 
                       '<script>getEmployeesForChange(); </script>' +
                     '</div> ' +
                    '</div>' +
                    '</div> </div>' +
                    '</form> </div>  </div>',
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
         	changeEmployeeForConversion();
         }
         },
         danger: {
         label: "Cancel",
         className: "btn-danger",
         callback: function() {
         bootbox.alert("<h4>The employee is NOT changed</h4>");
         }
         }
        }});
        }  
      });
});

function deleteChangedEmployeeForConversion(id){
	apiRequest('deleteChangedEmployeeForConversion','id='+id,'',function(data){
		if(data=='success')
		   bootbox.alert('<h4>The changed employee is deleted</h4>');
		getTransactionsForConversion();      
	});
}

function changeEmployeeForConversion(){
	apiRequest('changeEmployeeForConversion',$('#employee-form').serialize(),'',function(data){
		if(data=='success')
		   bootbox.alert('<h4>The employee is changed</h4>');
		getTransactionsForConversion();      
	});
}

function changeDuplicate(){
	apiRequest('changeDuplicate',$('#duplicate-form').serialize(),$('#duplicate-form'),function(data){
		cleanDuplicate();
		getTransactionsForConversion();
	});
}
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

function getEmployeesForChange(){
	$('#chooseEmployee,#managerEmployee,#sales_chooseEmployee,#sales_extraEmployee')
    .find('option')
    .remove()
    .end();
    apiRequest('getEmployeesForConversion',$('#range-form').serialize(),'',function(data){
    	    $.each(data, function() {
                 $('#chooseEmployee,#managerEmployee,#sales_chooseEmployee,#sales_extraEmployee')
                 .append($('<option>', { value : this.userId })
                 .text(this.userId + ' - ' + this.employeeName));
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
                  } 
      }
     });   
}

function getCampaigns_N_Agents(){
  $('#button_all').addClass('disabled');	
  $('#campaign')
    .find('option')
    .remove()
    .end();
  $('#campaign').select2("data", null);
  global_agents=[];  	
  apiRequest('getTransactionsForConversion',$('#range-form').serialize(),'',function(data){
  	 var unique_campaigns=[],unique_agents=[];
  	 $.each(data,function(){
  	 	if(typeof unique_campaigns[this.campaignId]=='undefined')
  	 	  $('#campaign')
  	 	  .append($('<option>', { value : this.campaignId })
          .text(this.campaignName));
        if(typeof unique_agents[this.employeeId]=='undefined')
          global_agents.push({"employeeId" : this.employeeId,
                              "employee": this.employeeId+' - '+this.employee});  
        unique_campaigns[this.campaignId]=1;
        unique_agents[this.employeeId]=1;
  	 });
  	 $('#button_all').removeClass('disabled');
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

function getShiftManagersModal(){
	var real_spotId= 0;
	var modal_body= '<div class="row">'+
	                '<div class="row col-md-12">'+
	                '<form id="manager-form">'+ 
	                '<div class="col-md-6">'+
	                '<h4>Employee</h4>'+
	                '<select class="form-control" id="managerEmployee" name="employee"></select>'+
	                '</div>'+
	                '</form>'+
	                '<div class="col-md-1">'+
	                '<h4>&nbsp;</h4>'+
	                '<a href="" class="btn btn-secondary manager disabled">Add Manager</a>'+
	                '</div>'+
	                '</div>'+
	                '<div class="col-md-12"><h4></h4></div>'+
	                '<div class="col-md-12">'+
	                '<table class="table table-striped table-bordered table-hover table-highlight" id="managers_table">'+
	                '</table>'+
	                '</div>'+
	                '</div>';
	bootbox.dialog({
	  title: 'Shift Managers For '+$('#dpMonth').val(),
	  message: modal_body,
	  buttons: {
      
      success: {
        label: "OK",
        className: "btn-success",
        callback: function() {
           isShiftManager();
      	   getTransactionsForConversion();
        }
      }
      } 	
	});
	getEmployeesForChange();
	getShiftManagersForTable();
	apiRequest('getUserData','','',function(user){
		$('a.manager').removeClass('disabled');
		real_spotId= user.real_spotId;
		
		
	    });
	$('a.manager').click(function(){
		event.preventDefault();
		addShiftManager(real_spotId);
	});               
}

function getShiftManagersForTable(){
	
	apiRequest('getConversionShiftManagers',$('#dpMonth').serialize(),'#managers_table',function(data){
		$('#managers_table').dataTable( {
           "bDestroy": true,
           "bFilter": true,
           "bLengthChange": true,
        
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Id", "bVisible": false},
            { "mData": "employeeId", "sTitle": "Employee ID"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "month", "sTitle": "Month"},
            { "mData": null, "sTitle": "Delete", 
              "fnRender": function(oObj){
              	 return '<a href="" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteManager">Delete</a>';
              }
            }
           ]
        });    
	});
}

function addShiftManager(real_spotId){
	var post_data = $('#dpMonth').serialize()+'&'+$('#managerEmployee').serialize()+'&userId='+real_spotId;
	console.log(post_data);
	apiRequest('addConversionShiftManager',post_data,'#managers_table',function(data){
		if(data=='Already Manager'){
			bootbox.alert('<h4>'+$('#managerEmployee option:selected').text()+' is already manager</h4>');
		}else if(data){
		    getShiftManagersForTable(); 	
		}else{
			bootbox.alert('<h4>Manager could not be added</h4>');
		}
		
	});
}

function isShiftManager(){
	
	apiRequest('getConversionShiftManagers',$('#range-form').serialize(),'',function(data){
		
		if(data.length!=0){  // employee is shift manager
			if($('.manager').css('display')=='none'){
				$('#range-form').append('<div class="col-md-1" id="shift_manager">'+
			                        '<h4>&nbsp;</h4>'+
			                        '<a href="" class="btn btn-green" onclick="event.preventDefault(); getShifts(); return false;">Shift Manager</a>'+ 
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

function getShifts(){
	
	var modal_body= '<div class="row">'+
	                '<div class="row col-md-12">'+
	                '<form id="shift-form">'+ 
	                '<div class="col-md-6">'+
	                '<h4>Date</h4>'+
	                '<input class="form-control" name="shiftDate" id="shiftDate" value="'+$("#dpStart").val()+'" data-date-format="yyyy-mm-dd">'+
	                '</div>'+
	                '<div class="col-md-6">'+
	                '<h4>FTD</h4>'+
	                '<input class="form-control" name="shiftFTD" id="shiftFTD" placeholder="Insert FTD amount">'+
	                '</div>'+
	                '<div class="col-md-12"><h4></h4></div>'+
	                '<div class="col-md-6">'+
	                '<h4>Shift</h4>'+
	                '<select class="form-control" name="shiftType" id="shiftType">'+
	                '<option value="Day">Day</option><option value="Night">Night</option>'+
	                '</select>'+
	                '</div>'+
	                '<input type="hidden" name="employee" value="'+$("#employee").val()+'">'+
	                '</form>'+
	                '<div class="col-md-1">'+
	                '<h4>&nbsp;</h4>'+
	                '<a href="" class="btn btn-secondary shift">Add Shift</a>'+
	                '</div>'+
	                '</div>'+
	                '<div class="col-md-12"><h4>&nbsp;</h4></div>'+
	                '<div class="col-md-12">'+
	                '<table class="table table-striped table-bordered table-hover table-highlight" id="shifts_table">'+
	                '</table>'+
	                '</div>'+
	                '</div>';
	bootbox.dialog({
	  title: 'Manager Shifts for '+$('#employee option:selected').text(),
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
	$('#shiftDate').datepicker();
	getShiftFTDs();
	
	$('a.shift').click(function(){
		event.preventDefault();
		var trim_shift_ftd = ($('#shiftFTD').val()).trim();
		$('#shiftFTD').val(trim_shift_ftd);
		var reg = new RegExp('^[0-9]+$');
		if(!reg.test($('#shiftFTD').val())){
			bootbox.alert('<h4>Please choose a non-negatif number</h4>');
			return;
		}
		addShiftFTDs();
	});
	
	
/*	apiRequest('getConversionShifts',$('#dpMonth').serialize(),'',function(shift_data){
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
              { "mData": "status", "sTitle": "Status"},
              { "mData": "ftds", "sTitle": "Ftds"}
              ]
            });    	
		 });
		 
	});  */             
}

function addShiftFTDs(){
	
	apiRequest('addShiftFTDsForConversion',$('#shift-form').serialize(),'#shifts_table',function(data){
		if(data=='The Shift is already set' || data=='The Shift is updated'){
			bootbox.alert('<h4>'+data+'</h4>');
		}else if(data){
			bootbox.alert('<h4>The Shift is set</h4>');
		}else {
			bootbox.alert('<h4>Please try again. The Shift could not be set</h4>');
		}
		getShiftFTDs();
			
	});
}

function deleteShiftFTDs(id){
   apiRequest('deleteShiftFTDsForConversion','id='+id,'#shifts_table',function(data){
   	  getShiftFTDs();
   }); 	
}

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
              { "mData": "type", "sTitle": "Shift"},
              { "mData": null , "sTitle": "Delete",
                "fnRender": function(o){
                	return '<a href="" data-id="'+o.aData.id+'" class="btn btn-secondary btn-xs" onclick="event.preventDefault(); deleteShiftFTDs('+o.aData.id+'); return false;">Delete</a>'; 
                } 
              }
              ]
        });    	
	});
}

function getConversionWeeks(button){
	cleanDuplicate();
	$('#button_bonus,#button_managers').addClass('disabled');
	apiRequest('getConversionWeeks',$('#range-form').serialize(),$('#range-form'),function(data){
	    if(data.length!=4){
	    	setWeeks(data);
	    }else{
	    	$('#set').removeClass('disabled');
	    	if(button==true){
	    	  setWeeks(data);
	    	  return;	
	    	}
	    	$('#button_bonus,#button_managers').removeClass('disabled');
	    	global_weeks=data;
	    	getTransactionsForConversion();
	    }
	
	  });
}  

function setWeeks(weeks){
	var full_weeks=[];
	var flag=0;
	for(var i=0;i<4;i++){
		flag=0;
		for(var j=0;j<weeks.length;j++){
			if((i+1)==weeks[j].week){
				full_weeks[i]=weeks[j].lastDayofWeek;
				flag++;
			}
		}
		if(flag==0){
			full_weeks[i]='';
		}
	}
	var week_bootbox=bootbox.dialog({
		closeButton: false,
        title: "Set Weeks",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="weeks-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="week_1">Week 1</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="week_1" name="week_1"  value="' + full_weeks[0] + '"   class="form-control input-md" data-date-format="yyyy-mm-dd"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="week_2">Week 2</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="week_2" name="week_2"  value="' + full_weeks[1] + '"   class="form-control input-md" data-date-format="yyyy-mm-dd"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="week_3">Week 3</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="week_3" name="week_3"  value="' + full_weeks[2] + '"   class="form-control input-md" data-date-format="yyyy-mm-dd"> ' +
                     '</div> ' +
                     '</div>'+ 
                     '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="week_4">Week 4</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="week_4" name="week_4"  value="' + full_weeks[3] + '"   class="form-control input-md" data-date-format="yyyy-mm-dd"> ' +
                     '</div> ' +
                     '</div>'+
                     '<input type="hidden" name="wStart"  id="wStart" value="'+$("#dpStart").val()+'"/>'+
                    '</form> </div>  </div>'+
                    '<script>'+
                    '$("#week_1,#week_2,#week_3,#week_4").datepicker();'+
                    '</script>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	for(var i=0;i<4;i++){
      		
      		if(!($('#week_'+(i+1)).val()).trim()){
      		  bootbox.alert('<h4>Fill All The Fields</h4>',function(){
      		  	getConversionWeeks(true);
      		  }); 
      		  return;	
      		}
      		if($('#week_'+(i+1)).val()<$('#dpStart').val() || $('#week_'+(i+1)).val()>$('#dpEnd').val() || (i!=3 && $('#week_'+(i+1)).val()>=$('#week_'+(i+2)).val()) || $('#week_4').val()!=$('#dpEnd').val()){
      		 bootbox.alert('<h4>Wrong Dates</h4>',function(){
      		  	getConversionWeeks(true);
      		  }); 
      		  return; 	
      		}
      	}
      	addWeeks();
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
      	if(weeks.length==4){
      	  bootbox.alert('<h4>Weeks are not changed</h4>',function(){
      	   getConversionWeeks();	
      	  });
      	  
      	  	
      	}else{
        bootbox.alert('<h4>Weeks are not set</h4>',function(){
      		  	getConversionWeeks();
      		  }); 
        
        }
      }
    }  
    }});
    week_bootbox=week_bootbox[0]; 
   // $(week_bootbox.getElementsByClassName('bootbox-body')).addClass('modal-body-left');
   // setBootBoxHeader(week_bootbox.getElementsByClassName('modal-header'));
}
function addWeeks(){
	
	apiRequest('addWeeksForConversion',$('#weeks-form').serialize(),$('#range-form'),function(data){
		$('#set').removeClass('disabled');
		getConversionWeeks();
	});
}

function setWeeklyBonus(){
	cleanDuplicate();
	var bootbox_body='<div class="row">'+
	                 '<div class="col-md-7>"'+
	                 '<form>'+
	                 '<div class="col-md-2">'+
	                 '<h4>Choose Week</h4>'+
	                 '<select class="form-control" id="chosen_week" name="chosen_week">'+
	                 '<option value="1">1</option>'+
	                 '<option value="2">2</option>'+
	                 '<option value="3">3</option>'+
	                 '<option value="4">4</option>'+ 
	                 '</select>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h4>Week Start</h4>'+
	                 '<input id="week_start" name="week_start" class="form-control" placeHolder="Week Start" onfocus="this.blur();"/>'+
	                 '</div>'+
	                  '<div class="col-md-2">'+
	                 '<h4>Week End</h4>'+
	                 '<input id="week_end" name="week_end" class="form-control" placeHolder="Week End" onfocus="this.blur();"/>'+
	                 '</div>'+
	                 '</form>'+
	                 '</div>'+
	                 '<div class="col-md-12"><h4></h4></div>'+
	                 '<div class="col-md-7">'+
	                 '<div class="portlet" id="week_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Week Totals</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="week_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-7 -->'+
	                 '<div class="col-md-5">'+
	                 '<div class="portlet">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Set Bonus</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<div id="set_bonus_div" style="display:none" >'+
	                 '<form id="setBonus-form">'+
	                 '<div class="col-md-4">'+
	                 '<h5>Employee</h5>'+
	                 '</div>'+
	                 '<div class="col-md-2">'+
	                 '<h5>Place</h5>'+
	                 '</div>'+
	                 '<div class="col-md-3">'+
	                 '<h5>Amount</h5>'+
	                 '</div>'+
	                 '<div class="col-md-3"></div>'+
	                 '<div id="bonus_rows"></div>'+
	                 '<div class="col-md-9"></div>'+
	                 '<div class="col-md-3"><a href="" class="btn btn-secondary" onclick="event.preventDefault(); addWeeklyBonus(); return false;">Set Bonus</a></div>'+
	                 '</form>'+
	                 '</div>'+
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+   
	                 '<div class="col-md-5"><h4></h4></div>'+
	                 '<div class="portlet" id="bonus_table_holder">'+
	                 '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Bonuses</h3></div>'+
	                 '<div class="portlet-content">'+
	                 '<a href="" class="btn btn-danger" onclick="event.preventDefault(); deleteWeeklyBonus(); return false;">Delete</a>'+
	                 '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="bonus_table">' +
					 '</table>'+
					 '</div>'+	
	                 '</div><!-- portlet-content -->'+
	                 '</div><!-- portlet -->'+
	                 '</div><!-- col-md-5 -->'+
	                 '</div>'+
	                 '<script>readyWeeklyBonus()</script>';
	var week_bootbox=bootbox.dialog({
		title: 'Set Weekly Bonus',
		message: bootbox_body,
		buttons:{
		success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
         	 getTransactionsForConversion(); 	
		}}}
	});
	week_bootbox=week_bootbox[0];
	$(week_bootbox.getElementsByClassName('modal-dialog')).addClass('modal-xlarge');
//	setBootBoxHeader(week_bootbox.getElementsByClassName('modal-header'));
	for(var i=1;i<=5;i++){
		$('#bonus_rows').append('<div id="row_'+i+'" style="display:none">'+
		                         '<div class="row">'+
		                         '<input type="hidden" class="form-control" id="week_employeeId_'+i+'" name="week_employeeId_'+i+'"/>'+
		                         '<div class="col-md-4"><input class="form-control " id="week_employee_'+i+'" name="week_employee_'+i+'" onfocus="this.blur();"/></div>'+
		                         '<div class="col-md-2"><select class="form-control " id="week_place_'+i+'" name="week_place_'+i+'"><option value="1">1</option><option value="2">2</option></select></div>'+
		                         '<div class="col-md-3"><input class="form-control " id="week_amount_'+i+'" name="week_amount_'+i+'"/></div>'+
		                         '<div class="col-md-3"><a href="" class="btn btn-danger" onclick="event.preventDefault();deleteWeeklyBonusRow('+i+'); return false;">Delete</a></div>'+
		                         '</div><div class="row"><h5></h5></div></div>');
	}
}


function readyWeeklyBonus(){
   init_week_bonus();
   getTransactionsForWeek();
   getWeeklyBonus();
   $('#chosen_week').on('change',function(){
   	 init_week_bonus();
   	 $('#set_bonus_div').slideUp(200,function(){
   	 	for(var i=1;i<=5;i++){
   	 	  $('#row_'+i).attr('style','display:none');
   	 	  $('#week_employeeId_'+i).val('');
   	 	  $('#week_employee_'+i).val('');
   	 	  $('#week_place_'+i).val(1);
   	 	  $('#week_amount_'+i).val(''); 	
   	 	}
   	 }); 
   	 getWeeklyBonus();
   	 getTransactionsForWeek();
   });
	
}
function init_week_bonus(){	
   if($('#chosen_week').val()==1){
   	 $('#week_start').val($('#dpStart').val());
   	 $('#week_end').val(global_weeks[0].lastDayofWeek);
   }else{	
   for(var i=1;i<4;i++){
   	  if($('#chosen_week').val()==i+1){
   	  	$('#week_start').val(global_weeks[i-1].lastDayofWeek);
   	  	$('#week_end').val(global_weeks[i].lastDayofWeek);
   	  }
   }}
     	
}

function getTransactionsForWeek(){
	var real_data=[],agents=[],unique=[],data_wd=[];
	apiRequest('getTransactionsForConversion',$('#range-form').serialize(),$('#week_table_holder'),function(data){
	  	for(var i=0;i<data.length;i++){
	  	   for(var j=0;j<4;j++){
      		if(new Date(data[i].confirmTime).format('yyyy-MM-dd')<=global_weeks[j].lastDayofWeek){
      			data[i].week=global_weeks[j].week;
      			break;
      		}
           }		
	  	   if(unique[data[i].customerId]==1 && data[i].type!="Duplicated")
	  	      continue;
	  	   data_wd.push(data[i]);
	  	   unique[data[i].customerId]=1;   	
	    }
	  	unique=[];
	  	for(var i=0;i<data_wd.length;i++){
	  	  if(data_wd[i].week==$('#chosen_week').val()){
	  	  	real_data.push(data_wd[i]);
	  	  } 	
	  	}
	  	for(var i=0;i<real_data.length;i++){
	  	  if(unique[real_data[i].employeeId]==1)
	  	      continue;
	  	  agents.push({'employeeId':real_data[i].employeeId,'employee':real_data[i].employee,'ftd':0,'add':''});
	  	  unique[real_data[i].employeeId]=1;      	
	  	}
	  	for(var i=0;i<agents.length;i++){
	  		for(var j=0;j<real_data.length;j++){
	  			if(real_data[j].employeeId==agents[i].employeeId && real_data[j].assign!="Deleted"){
	  			   agents[i].ftd++;
	  			} 
	  		}
	  	}
	  	$('#week_table').dataTable( {
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
        
           "aaData": agents,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 2, "desc" ]],                    
           "aoColumns": [
            { "mData": "employeeId", "sTitle": "Employee ID","bVisible":false},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "ftd", "sTitle": "FTD"},
            { "mData": "add", "sTitle":"Add",
              "fnRender": function(oObj){
              
              	return '<a href="#" data-id="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" class="btn btn-week btn-xs getAdd">ADD</a>';
              }
            }
           ]
            
            });	
	  	
    });
}

function deleteWeeklyBonusRow(delete_row){
	for(var i=delete_row;i<=5;i++){
		$('#week_employeeId_'+i).val($('#week_employeeId_'+(i+1)).val());	
		$('#week_employee_'+i).val($('#week_employee_'+(i+1)).val());
		$('#week_amount_'+i).val($('#week_amount_'+(i+1)).val());
		$('#week_place_'+i).val($('#week_place_'+(i+1)).val());
		if($('#row_'+(i+1)).css('display')=='none' || i==5){
	      $('#row_'+i).slideUp(200);
	      break; 		
	    } 
    }
    if($('#row_2').css('display')=='none' && delete_row==1){ 
        $('#set_bonus_div').slideUp(200);
    }	 
}

function addWeeklyBonus(){
	var weekly_bonus='';
	for(var i=1;i<=5;i++){
		if($('#row_'+i).css('display')=='none')
		    break;    
		weekly_bonus+='&'+$('#week_employeeId_'+i).serialize()+'&'+$('#week_place_'+i).serialize()+'&'+$('#week_amount_'+i).serialize();    
	}
	var post_data=$('#dpStart').serialize()+'&'+$('#chosen_week').serialize()+weekly_bonus;
	console.log(post_data);
	apiRequest('changeWeeklyBonusForConversion',post_data,$('#bonus_table_holder'),function(data){
	  console.log(data);	
	  $('#set_bonus_div').slideUp(200,function(){
   	 	for(var i=1;i<=5;i++){
   	 	  $('#row_'+i).attr('style','display:none');
   	 	  $('#week_employeeId_'+i).val('');
   	 	  $('#week_employee_'+i).val('');
   	 	  $('#week_place_'+i).val(1);
   	 	  $('#week_amount_'+i).val(''); 	
   	 	}
   	  });
   	  getWeeklyBonus();  
   	}); 
}

function deleteWeeklyBonus(){
	var post_data=$('#dpStart').serialize()+'&'+$('#chosen_week').serialize();
	apiRequest('changeWeeklyBonusForConversion',post_data,$('#bonus_table_holder'),function(data){
	  getWeeklyBonus();
	});	
}

function getWeeklyBonus(){
   var real_data=[];	
   var post_data=$('#dpStart').serialize();	
   apiRequest('getWeeklyBonusForConversion',post_data,$('#bonus_table_holder'),function(data){
   	  for(var i=0;i<data.length;i++){
   	  	data[i].employee=data[i].employeeId+' - '+data[i].employee;
   	  	if(data[i].week==$('#chosen_week').val())
   	  	  real_data.push(data[i]);
   	  }
   	  
   	  $('#bonus_table').dataTable( {
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
            { "mData": "week", "sTitle": "Week"}
            ]
      });     
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
                    '<a href="" class="btn btn-week" onclick="event.preventDefault(); addExtra(); return false;">Add Extra</a>'+
                    '</div>'+
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
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "extra_delete", "sTitle": "Delete",
              "fnRender": function(oObj){
              	return '<a href="" data-id="'+oObj.aData.id+'" class="btn btn-secondary btn-xs deleteExtra">Delete</a> ';
              }
            }
            ]
      });     
    }); 
}

function addExtra(){
	bootbox.dialog({
        title: "Add Extra",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="extra-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="extraDate" name="extraDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraEmployeeName">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="extraEmployeeName" name="extraEmployeeName" value="'+$('#employee option:selected').text()+'" class="form-control" onfocus="this.blur()"/> ' +
                    '<input type="hidden" id="extraEmployee" name="extraEmployee" value="'+$('#employee').val()+'" class="form-control"/> ' +
                    '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="extraAmount" name="extraAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraReason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="extraReason" name="extraReason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#extraDate").val($("#dpEnd").val());'+
                     '$("#extraDate").datepicker(); '+
                     '</script>',
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addExtraTable();
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }
    }});
}

function addExtraTable(){
	apiRequest('addExtraForConversion',$('#extra-form').serialize(),$('#extra_table_holder'),function(){
		getExtraForConversion();
	});
}
function getTransactionsForConversion(){
	
	$('#button_chart,.portlet-header.shift').addClass('disabled');
	
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
    var bonus_week_arr=new Float64Array(4);
    var bonus_week=0;
    var weekly_bonus=0;
    var extra_bonus=0;
    var total_bonus=0;
    var insert=0;
    
 /*   var shift_types = ['Regular Shift','Manager Shift'];
    
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
     
  /*  $.ajax({
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
  	     			
  	}).done(function(){	   */
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
      	$('#button_chart').removeClass('disabled');  
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
       	 
     /*  	 for(var j=0;j<shifts.length;j++){
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
       
       global_chart_data=real_data_wd;
       	
       for(var i=0;i<real_data_wd.length;i++){
      	today_ftds+=(new Date(real_data_wd[i].confirmTime).format("yyyy-MM-dd")==today && real_data_wd[i].assign!='Deleted') ? 1 : 0;
      	total_ftds+=real_data_wd[i].assign!='Deleted' ? 1 : 0;
      	
      /*	for(var j=0;j<shifts.length;j++){
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
         
      }else{ */
        
      
      
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
      $('#manager_daily_total').html('&#8362; 0'); */
 //     }
      
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
              	 return '<a href="" data-id='+oObj.aData.id+' data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-type="'+oObj.aData.type+'" class="btn btn-'+color+' btn-xs btn-block duplicate">'+oObj.aData.type+'</a>'; 
              }
               },
            { "mData": "withdrawal", "sTitle":"Withdrawals",
              "fnRender": function(oObj){
              	var color= oObj.aData.withdrawal=='Withdrawal' ? 'danger' : 'default';
              	return '<a href="" data-customerId='+oObj.aData.customerId+' data-date="'+oObj.aData.confirmTime+'" class="btn btn-'+color+' btn-xs btn-block withdrawal">'+oObj.aData.withdrawal+'</a>';
              }},   
            { "mData":"assign", "sTitle":"Delete",
              "fnRender": function (oObj) {
              	 var color= oObj.aData.assign=="Delete" ? "secondary" : "danger";
              	 return '<a href="" data-id='+oObj.aData.id+' data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-assign="'+oObj.aData.assign+'" class="btn btn-'+color+' btn-xs btn-block assign">'+oObj.aData.assign+'</a>'; 
              }
            },
            { "mData": "isChanged", "sTitle": "Change",
               "fnRender": function (oObj) {
               	  var color= oObj.aData.isChanged=="Changed" ? "danger" : "success";
               	  return '<a href="" data-id="'+oObj.aData.id+'" data-employee="'+oObj.aData.employee+'" data-isChanged="'+oObj.aData.isChanged+'" class="btn btn-'+color+' btn-xs btn-block change">'+oObj.aData.isChanged+'</a>';
               	}
            },
            { "mData": "campaignName", "sTitle": "Campaign"}                   
            ]
         });
         
     /*    if(shifts.length)
           $('.portlet-header.shift').removeClass('disabled'); */
    });
    });
    });
    });
    });
  //  });
 //   });
}	

function addTarget(week){
	var target_bootbox=bootbox.dialog({
        title: "<h4>Target Assign To "+ $('#employee option:selected').text()+"</h4>",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="target-form"> ' +
                    '<input type="hidden" id="target_employee" name="target_employee"  value="' + $('#employee').val()+ '"   class="form-control input-md" > ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="week"><h5>Week</h5></label> ' +
                    '<div class="col-md-3"> ' +
                    '<input id="week" name="week"  value="' + week+ '"   class="form-control input-md" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div> '+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="month"><h5>Month</h5></label> ' +
                    '<div class="col-md-3"> ' +
                    '<input id="month" name="month"  value="' + $('#dpMonth').val()+ '"   class="form-control input-md" data-date-format="yyyy-mm" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div> '+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="target"><h5>Target</h5></label> ' +
                    '<div class="col-md-3"> ' +
                    '<input id="target" name="target"  value="' + $('#target_'+week).text()+ '"   class="form-control input-md" > ' +
                     '</div> ' +
                    '</div> '+
                    '</form></div></div>' ,
                    
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	if($('#target').val()==$('#target_'+week).text()){
      	  bootbox.alert('<h4>Target is not changed</h4>');
      	  return;	
      	}
      	if($('#target').val()<=0){
      	  if($('#target_'+week).text()==0){	
      	    bootbox.alert('<h4>Target should be positive</h4>');
          }else{
          	 apiRequest('deleteTargetForConversion',$('#target-form').serialize(),$('#transactions_table_holder'),function(data){
      	  	   bootbox.alert('<h4>Target is deleted</h4>',function(){
      	  	     getTransactionsForConversion();	
      	  	   });
      	  	   
      	  }); 	
          }      	
      	}else{
      	  apiRequest('addTargetForConversion',$('#target-form').serialize(),$('#transactions_table_holder'),function(data){
      	  	 
      	  	  bootbox.alert('<h4>Target is added</h4>',function(){
      	  	     getTransactionsForConversion();	
      	  	   });
      	  }); 	
      	}  
      }
    }
    
    }});
  //  setBootBoxHeader(target_bootbox[0].getElementsByClassName("modal-header"));
}

function getCharts(){
	var total_ftds=0, total_campaigns=0, total_countries=0, difference=0, total_differences=0, average_differences=0; 
	var weeks=[], campaigns=[], unique_campaigns=[], countries=[], unique_countries=[], regDifferences=[], difference_label=[];
	for(var i=0; i<4; i++){
		weeks.push({"week": i+1,
		            "total": 0});
	}
	for(var i=0; i<9; i++){
		difference_label = i==0 ? 'same day' : i==7 ? '7+' : i==8 ? '30+' : i;
		regDifferences.push({"difference": difference_label,
		                     "total"     : 0
		                    });
	}
	for(var i in global_chart_data){
		if(global_chart_data[i].assign!='Deleted'){
		 if(typeof unique_campaigns[global_chart_data[i].campaignId]=='undefined')
		   campaigns.push({"campaignName": global_chart_data[i].campaignName,
		                   "total"       :0 
		                  });
		 if(typeof unique_countries[global_chart_data[i].country]=='undefined')
		   countries.push({"country": global_chart_data[i].country,
		                   "total"       :0 
		                  });
		 for(var j in campaigns){
		   if(global_chart_data[i].campaignName==campaigns[j].campaignName)
		     campaigns[j].total++;	
		 }
		 for(var j in countries){
		   if(global_chart_data[i].country==countries[j].country)
		     countries[j].total++;	
		 }
		 for(var j=0; j<4; j++){
      		weeks[j].total+=global_chart_data[i].week==j+1 ? 1 : 0;
      	 }
      	
		 total_ftds++;
		
		 difference = daysBetween(global_chart_data[i].regTime,global_chart_data[i].confirmTime) | 0;
		
		 difference>=30 ? regDifferences[8].total++ : difference>=7 ? regDifferences[7].total++ : difference==6 ? regDifferences[6].total++ : difference==5 ? regDifferences[5].total++ :
		 difference==4 ? regDifferences[4].total++ : difference==3 ? regDifferences[3].total++ : difference==2 ? regDifferences[2].total++ : difference==1 ? regDifferences[1].total++ : regDifferences[0].total++ ;
		          	
		 total_differences += difference;                  
		 unique_campaigns[global_chart_data[i].campaignId]=1;
		 unique_countries[global_chart_data[i].country]=1;
	    } 	                                         
	}
	total_campaigns=campaigns.length;
	total_countries=countries.length;
	average_differences= global_chart_data.length!=0 ? (total_differences/global_chart_data.length).toLocaleString() : 0;
	var chart_bootbox= bootbox.dialog({
	  title: "Charts For Employee "+ $('#employee option:selected').text(),
      message:  
                    
                    '<div class="row">'+
                    '<div class="col-md-2">'+
                    '<h4>Month</h4>'+
                    '<input class="form-control" value="'+$("#dpMonth").val()+'" onfocus="this.blur();"/>'+
                    '</div>'+
                    '<div class="col-md-3">'+
                    '<h4>Employee</h4>'+
                    '<input class="form-control" value="'+$('#employee option:selected').text()+'" onfocus="this.blur();"/>'+
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
				    '<div class="list-group col-md-2">'+  
				    '<a href="javascript:;" class="list-group-item" id="reg_difference_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
					'<h4 class="list-group-item-heading">'+average_differences+'</h4>'+
					'<p class="list-group-item-text">Average Reg. Difference</p>'+
				    '</a>'+
				    '</div>'+
                    '</div>'+
                    '<div class="col-md-10">'+
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
	$('#chart_bootbox .modal-dialog').addClass('modal-xlarge');
	$('#total_ftds_chart').click(function(){ event.preventDefault(); drawChart("Weeks","week",weeks);});
	$('#total_campaigns_chart').click(function(){ event.preventDefault(); drawChart("Campaigns","campaignName",campaigns);});
	$('#total_countries_chart').click(function(){ event.preventDefault(); drawChart("Countries","country",countries);});
	$('#reg_difference_chart').click(function(){ event.preventDefault(); drawChart("Registration Differences","difference",regDifferences);});
}

function drawChart(chart_title,title_field,chart_data){
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
   "labelRadius": 30,
   "innerRadius": "50%",
   "depth3D": 30, 
   "balloonText": "[[title]]<br><span style='font-size:14px'><b> [[value]] </b> ([[percents]]%)</span>",
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
					"valueText":"[[value]]"
			} 
} );
}


var allSales = {
  agents : [],
  chart_data : [],
  month: [],	
  getModal : function(){
  	$('body').addClass('modal-scroll');
  	this.month = $('#dpMonth').val();
  	
    var modal_body = '<div class="row">'+
                   '<div class="row col-md-10">'+
                   '<form id="sales-form">'+
                   '<div class="col-md-2">'+
                   '<h4>Month</h4>'+
                   '<input class="form-control" value="'+$("#dpMonth").val()+'" name="dpMonth" onfocus="this.blur();"/>'+
                   '</div>'+
                   '<input type="hidden" value="'+$("#dpStart").val()+'" name="dpStart" onfocus="this.blur();"/>'+
                   '<input type="hidden" value="'+$("#dpEnd").val()+'" name="dpEnd" onfocus="this.blur();"/>'+
                   '<div class="col-md-2">'+
                   '<h4>Desk</h4>'+
                   '<input class="form-control" value="'+$("#desk option:selected").text()+'" onfocus="this.blur();"/>'+
                   '</div>'+
                   '<input type="hidden" value="'+$("#desk").val()+'" name="desk" onfocus="this.blur();"/>'+
                   '<div class="col-md-2">'+
				   '<h4>Campaigns</h4>'+
				   '<select class="form-control" multiple="multiple" id="sales_campaign" name="campaign[]">'+
				   '</select>'+
				   '</div>'+
				   '</form>'+
				   '<div class="col-md-1">'+
				   '<h4>&nbsp;</h4>'+
				   '<a href="" class="btn btn-secondary chart disabled" id="sales_charts_button">Get Charts</a>'+
				   '</div>'+
                   '</div> <!-- col-md-10 -->'+
                   '<div class="col-md-12"><h3>&nbsp;</h3></div>'+
                   '<div class="col-md-8">'+	
				   '<div class="portlet"> <!-- duplicate_portlet_start -->'+
				   '<div class="portlet-header">'+
			       '<h3><i class="fa fa-table"></i>Duplicate Record</h3>'+
				   '</div>'+
				   '<div class="portlet-content">'+
				   '<form id="sales_duplicate-form">'+
				   '<div class="col-md-3">'+
			       '<h4>Transaction ID</h4>'+	
				   '<input class="form-control" id="sales_transactionId" name="transactionId" placeholder="Transaction Id" onfocus="this.blur();"/>'+
			       '</div>'+
				   '<div class="col-md-3">'+
				   '<h4>Transaction Employee</h4>'+	
				   '<input class="form-control" id="sales_transactionEmployee" name="transactionEmployee" placeholder="Transaction Employee" onfocus="this.blur();"/>'+
				   '<input type="hidden" class="form-control" id="sales_transactionEmployeeId" name="transactionEmployeeId"/>'+
				   '</div>'+
				   '<div class="col-md-3">'+
				   '<h4>Type</h4>'+	
				   '<input class="form-control" id="sales_type" name="type" placeholder="Type" onfocus="this.blur();"/>'+
				   '</div>'+
				   '<div class="col-md-3">'+
				   '<h4>&nbsp;</h4>'+	
				   '<a href="" class="btn btn-secondary" id="sales_duplicate_button">Change</a>'+
				   '</div>'+			
				   '</form>'+
				   '</div> <!-- portlet-content -->'+  
				   '</div> <!-- duplicate_portlet_end -->'+
				   '</div> <!-- col-md-8 -->'+
				   '<div class="list-group col-md-2">'+  	
				   '<a href="javascript:;" class="list-group-item disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(0); return false;"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3><h4 class="list-group-item-heading" id="sales_today_ftds">-</h4><p class="list-group-item-text">Today FTDs</p></a>'+
				   '<a href="javascript:;" class="list-group-item disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(1); return false;"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3><h4 class="list-group-item-heading" id="sales_total_ftds">-</h4><p class="list-group-item-text">Total FTDs</p></a>'+ 
				   '</div>'+	
				   '<div class="list-group col-md-2">'+  
				   '<a href="javascript:;" class="list-group-item disabled"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3><h4 class="list-group-item-heading" id="sales_today_deposits">-</h4><p class="list-group-item-text">Today Deposits</p></a>'+
				   '<a href="javascript:;" class="list-group-item disabled"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3><h4 class="list-group-item-heading" id="sales_total_deposits">-</h4><p class="list-group-item-text">Total Deposits</p></a>'+
				   '</div>'+ 
				   '<div class="col-md-12"><h5></h5></div>'+
				   '<div class="col-md-8">'+
				   '<div class=" portlet" id="sales_table_holder">'+
				   '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Transactions</h3></div> <!-- /.portlet-header -->'+
				   '<div class="portlet-content">'+
				   '<div class="table-responsive">'+
				   '<table class="table table-striped table-bordered table-hover table-highlight" id="sales_table"></table>'+
				   '</div> <!-- table-responsive -->'+
				   '</div> <!-- portlet-content -->'+
			       '</div> <!-- portlet -->'+
                   '</div> <!-- col-md-8 -->'+
                   '<div class="col-md-4">'+
				   '<div class=" portlet" id="sales_commission_table_holder">'+
				   '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Commissions</h3>'+
				   '</div> <!-- portlet-header -->'+
				   '<div class="portlet-content">'+						
				   '<div class="table-responsive">'+
				   '<table class=" table table-striped table-bordered table-hover table-highlight">'+
                   '<thead>'+
                   '<tr><td colspan="4"><h4>Total Deposits</h4></td><td class="col-md-2"><h5  id="sales_total_deposits_commission">$ 0</h5></td></tr>'+
                   '</thead>'+
                   '<tr><td colspan="5"><h6></h6></td></tr>'+    
                   '<thead>'+
                   '<td>Bonus Calculation</td><td>Quantity</td><td>Bonus ILS</td><td>Total Bonus ILS</td><td style="background-color:#f9f9f9"></td>'+
                   '</thead>'+
                   '<tbody>'+
                   '<tr><td>Flat Bonus - $20 per FTD</td><td id="sales_flat">0</td><td>&#8362; 79</td><td id="sales_flat_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(1); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 3 daily FTDs</td><td id="sales_daily_3">0</td><td>&#8362; 100</td><td id="sales_daily_3_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(3); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 4-5 daily FTDs</td><td id="sales_daily_4">0</td><td>&#8362; 200</td><td id="sales_daily_4_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(4); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 6-7 daily FTDs</td><td id="sales_daily_6">0</td><td>&#8362; 500</td><td id="sales_daily_6_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(6); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 8-9 daily FTDs</td><td id="sales_daily_8">0</td><td>&#8362; 1000</td><td id="sales_daily_8_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(8); return false;">View</a></td></tr>';
     modal_body +=  this.month>='2016-05' ?
                   '<tr><td>Extra Bonus for 10-11 daily FTDs</td><td id="sales_daily_10">0</td><td>&#8362; 2000</td><td id="sales_daily_10_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(10); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 12-14 daily FTDs</td><td id="sales_daily_12">0</td><td>&#8362; 3000</td><td id="sales_daily_12_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(12); return false;">View</a></td></tr>'+
                   '<tr><td>Extra Bonus for 15+ daily FTDs</td><td id="sales_daily_15">0</td><td>&#8362; 4000</td><td id="sales_daily_15_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(15); return false;">View</a></td></tr>'
                   :
                   '<tr><td>Extra Bonus for 10+ daily FTDs</td><td id="sales_daily_10">0</td><td>&#8362; 2000</td><td id="sales_daily_10_bonus">&#8362; 0</td><td><a href="" class="btn btn-secondary btn-xs daily disabled" onclick="event.preventDefault(); allSales.viewDailyBonus(10); return false;">View</a></td></tr>';
     modal_body += '</tbody>'+
                   '<thead><td colspan="4">Total Bonus</td><td id="sales_daily_total">&#8362; 0</td></thead>'+
                   '<tr><td colspan="5"><h6></h6></td></tr>'+  
                   '<thead><td colspan="4">Weekly Bonus<a href="" class="btn btn-secondary btn-xs pull-right" id="weekly_bonus_button">View</a></td><td id="sales_weekly_bonus">&#8362; 0</td></thead>'+
                   '<tr><td colspan="5"><h6></h6></td></tr>'+  
                   '<thead><td colspan="4">Goals Bonus</td><td id="sales_goal_bonus">&#8362; 0</td></thead>'+
                   '<tr><td colspan="5"><h6></h6></td></tr>'+  
                   '<thead><td colspan="4">Extra Bonus<a href="" class="btn btn-secondary btn-xs pull-right" id="extra_bonus_button">View</a></td><td id="sales_extra_bonus">&#8362; 0</td></thead>'+
                   '<tr><td colspan="5"><h6></h6></td></tr>'+  
                   '<thead><td colspan="4"><h4>Total Bonus</h4></td><td><h4 id="sales_total_bonus">&#8362; 0</h4></td></thead>'+
				   '</table>'+
				   '</div> <!-- table-responsive -->'+
				   '</div> <!-- portlet-content -->'+
			       '</div> <!-- portlet -->'+
                   '</div> <!-- col-md-4 -->'+		
                   '</div> <!-- row -->' 
                    ;
                   	
    var allSales_bootbox = bootbox.dialog({
  	 title : 'Conversion Sales',
  	 message : modal_body,
  	 buttons : {
  	   success: {
  	 	 label: "OK",
         className: "btn-success",
         callback: function() {
           $('body').removeClass('modal-scroll');	
           getTransactionsForConversion();   		
  	     }
  	 }
    }});
    $(allSales_bootbox[0]).attr("id","allSales_bootbox");
    $("#allSales_bootbox .modal-dialog").addClass("modal-xxlarge");
    $("#sales_campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    this.getCampaigns();
    this.campaignChange();
    this.clickEvents();
    this.getAllTransactions();	
  	
  },
  campaignChange : function(){
     var that = this;
  	 $('#sales_campaign').change(function(){
  	 	that.cleanDuplicate();
  		that.getAllTransactions();
  	 });
  },
  getCampaigns : function(){
  	$('#sales_campaign')
    .find('option')
    .remove()
    .end();
    $('#sales_campaign').select2("data", null);  	
    apiRequest('getTransactionsForConversion',$('#sales-form').serialize(),'',function(data){
  	 var unique=[];
  	 $.each(data,function(){
  	 	if(unique[this.campaignId]==1)
  	 	  return; 
  	 	$('#sales_campaign')
  	 	.append($('<option>', { value : this.campaignId })
        .text(this.campaignName));
        unique[this.campaignId]=1;
  	 });
   });  
  },
  clickEvents : function(){
  	var that = this;
  	$("#sales_charts_button").click(function(){
  		event.preventDefault();
  		that.getChartModal();
  	});
  	$("#allSales_bootbox").on("click","a.sales_duplicate",function(){
  	   event.preventDefault();
  	   $('#sales_transactionId').val($(this).attr('data-id'));
       $('#sales_transactionEmployeeId').val($(this).attr('data-employeeId'));
       $('#sales_transactionEmployee').val($(this).attr('data-employee'));
       $('#sales_type').val($(this).attr('data-type'));
  	   return false;	
  	});
  	$("#allSales_bootbox").on("click","a.sales_assign",function(){
  		event.preventDefault();
  		var post_data="transactionId="+$(this).attr('data-id')+"&employeeId="+$(this).attr('data-employeeId')+"&assign="+$(this).attr('data-assign');
      	apiRequest('assignForConversion',post_data,'#sales_table_holder',function(){
      		that.getAllTransactions();
      	});
  	});
  	$("#allSales_bootbox").on("click","a.sales_change",function(){
  		event.preventDefault();
  		var id=$(this).attr("data-id");
      	if($(this).attr('data-isChanged')=='Changed'){
      	   bootbox.confirm('<h4>Are you sure to delete the changed employee?</h4>',function(result){
	 	       if(result){
	 	         apiRequest('deleteChangedEmployeeForConversion','id='+id,'',function(data){
		          if(data=='success')
		             bootbox.alert('<h4>The changed employee is deleted</h4>');
		          that.getAllTransactions();      
	              });
	            }  
	       });	
      	}else{
        bootbox.dialog({
        title: "Change Employee",
        message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<form class="form-horizontal" id="sales_employee-form"> ' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="transaction">Transaction ID</label> ' +
                 '<div class="col-md-4"> ' +
                 '<input id="sales_changeTransaction" name="transaction"  value=" ' + id + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                 '</div> ' +
                 '</div> ' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="changeEmployee">Transaction Employee</label> ' +
                 '<div class="col-md-5"> ' +
                 '<input id="sales_changeEmployee" name="changeEmployee" value=" '+ $(this).attr("data-employee") +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                 '</div> ' +
                 '</div>' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="chooseEmployee">Choose Employee</label> ' +
                 '<div class="col-md-5"> ' +
                 '<select id="sales_chooseEmployee" name="chooseEmployee" class="form-control">' +
                 '</select>' + 
                 '<script>getEmployeesForChange(); </script>' +
                 '</div> ' +
                 '</div>' +
                 '</div> </div>' +
                 '</form> </div></div>',
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	apiRequest('changeEmployeeForConversion',$('#sales_employee-form').serialize(),'',function(data){
		   if(data=='success')
		    bootbox.alert('<h4>The employee is changed</h4>');
		   that.getAllTransactions();      
	    });
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
        bootbox.alert("<h4>The employee is NOT changed</h4>");
      }
    }
    }});
    }
    
  	});
  	$("#sales_duplicate_button").click(function(){
  		event.preventDefault();	
	    apiRequest('changeDuplicate',$('#sales_duplicate-form').serialize(),'#sales_duplicate-form',function(data){ 
		   that.cleanDuplicate();
		   that.getAllTransactions();
	   }); 
  	});
  	$("#weekly_bonus_button").click(function(){
  		event.preventDefault();
  		bootbox.dialog({
        title: "Weekly Bonus",
        message:    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="sales_weekly_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sales_weekly_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>',    
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
      	    that.getAllTransactions();
         }
         }
        }});
        that.viewWeeklyBonus();	
  	});
  	$("#extra_bonus_button").click(function(){
  		event.preventDefault();
  		bootbox.dialog({
        title: "ExtraBonus",
        message:    '<div class="row">  ' +
                    '<div class="col-md-2">'+
                    '<a href="" class="btn btn-week" onclick="event.preventDefault(); allSales.addExtraModal(); return false;">Add Extra</a>'+
                    '</div>'+
                    '<div class="col-md-2">'+
                    '<a href="" class="btn btn-success" onclick="event.preventDefault(); allSales.viewExtraBonus(); return false;">Refresh</a></div>'+
                    '<div class="col-md-12" id="sales_extra_table_holder">'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sales_extra_table">' +
					'</table>'+
					'</div></div>'+		
                    '</div>',
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
      	    that.getAllTransactions();
         }
         }
    
       }});
       that.viewExtraBonus();
  		
  	});
  },
  viewWeeklyBonus : function(){
  	apiRequest('getWeeklyBonusForConversion',$('#dpStart').serialize(),$('#view_weekly_table_holder'),function(data){
  		for(var i=0;i<data.length;i++){
			data[i].employee=data[i].employeeId+' - '+data[i].employee;
			data[i].month=$('#dpMonth').val();
		}	
  		$('#sales_weekly_table').dataTable( {
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
           "aaSorting": [[ 3, "asc" ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "place", "sTitle": "Place"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "week", "sTitle": "Week"},
            { "mData": "month", "sTitle": "Month"}
            ]
        });     
  	});
  },
  viewExtraBonus : function(){
  	apiRequest('getExtraForConversion',$('#range-form').serialize(),'#sales_extra_table_holder',function(data){
	   	for(var i=0;i<data.length;i++){
          data[i].employee=data[i].employeeId+' - ' +data[i].employee;
	   	}
	   	$('#sales_extra_table').dataTable( {
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
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Id","bVisible":false}, 
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "date", "sTitle": "Date", "sType": "date"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "extra_delete", "sTitle": "Delete",
              "fnRender": function(oObj){
              	return '<a href="" data-id="'+oObj.aData.id+'" onclick="event.preventDefault(); allSales.deleteExtra('+oObj.aData.id+'); return false;" class="btn btn-secondary btn-xs sales_deleteExtra">Delete</a> ';
              }
            }
            ]
      });     
    }); 
  },
  viewDailyBonus : function(amount){
  	var agents= $.extend(true,[],this.agents);
  	var that = this;
  	var today=new Date().format('yyyy-MM')==$('#dpMonth').val() ? new Date().format('yyyy-MM-dd') : $('#dpEnd').val();
  	var daily_data=[],title=[],date_title=[],sort_direction=[];
  	var sort=0;
  	switch(amount){
      case 1:	
        for(var i in agents){
           agents[i].ftds=0;
           for(var j=0;j<31;j++){
           	  agents[i].ftds += agents[i].total_days[j];
           }
           if(agents[i].ftds!=0)
             daily_data.push({'employee'  : agents[i].employee,
                              'date'      : $('#dpMonth').val(),
                              'total_days': agents[i].ftds});	
           
        }
        title="Total FTDs";
        break;
      case 3:
        for(var i in agents){
           for(var j=0;j<31;j++){
           	 if(agents[i].total_days[j]==3){
           	 	daily_data.push({'employee'  : agents[i].employee,
           	 		             'total_days': agents[i].total_days[j],
           	 		             'date'      : this.month+'-'+this.twoDigit(j+1)
           	 	});
           	 }
           }	
        }
        title="Daily "+amount+" FTDs";
        break;
      case 4:
      case 6:
      case 8:
        for(var i in agents){
           for(var j=0;j<31;j++){
           	 	if(agents[i].total_days[j]==amount || agents[i].total_days[j]==amount+1){
           	 		daily_data.push({'employee'  : agents[i].employee,
           	 		  	    	     'total_days': agents[i].total_days[j],
           	 		    	         'date'      : this.month+'-'+this.twoDigit(j+1)
           	 		});
           	 	}
           }	
        }
        title="Daily "+amount+"-"+(amount+1)+" FTDs";
        
        break;
      case 10:
        
        for(var i in agents){
           for(var j=0;j<31;j++){
           	 	if(this.month>='2016-05' ? agents[i].total_days[j]==amount || agents[i].total_days[j]==amount+1 : agents[i].total_days[j]>=amount){
           	 		daily_data.push({'employee'  : agents[i].employee,
           	 		  	    	     'total_days': agents[i].total_days[j],
           	 		    	         'date'      : this.month+'-'+this.twoDigit(j+1)
           	 		});
           	 	}
           }	
        }
        title="Daily "+(this.month>='2016-05' ? amount+"-"+(amount+1) : amount+"+")+" FTDs";
        
        break;
      case 12:
        if(this.month<'2016-05') break;
        for(var i in agents){
           for(var j=0;j<31;j++){
           	 if(agents[i].total_days[j]>=amount && agents[i].total_days[j]<=amount+2){
           	 	daily_data.push({'employee'  : agents[i].employee,
           	 		             'total_days': agents[i].total_days[j],
           	 		             'date'      : this.month+'-'+this.twoDigit(j+1)
           	 	});
           	 }
           }	
        }
        title="Daily "+amount+"-"+(amount+2)+" FTDs";
        break;  
      case 15:
        if(this.month<'2016-05') break;
        for(var i in agents){
           for(var j=0;j<31;j++){
           	 if(agents[i].total_days[j]>=amount){
           	 	daily_data.push({'employee'  : agents[i].employee,
           	 		             'total_days': agents[i].total_days[j],
           	 		             'date'      : this.month+'-'+this.twoDigit(j+1)
           	 	});
           	 }
           }	
        }
        title="Daily "+amount+"+ FTDs";
        break;
      case 0:
         for(var j=0;j<31;j++){
         	if(this.month+'-'+that.twoDigit(j+1)==today){
         		for(var i in agents){
         			if(agents[i].total_days[j]!=0)
         			daily_data.push({'employee'  : agents[i].employee,
           	 		                 'total_days': agents[i].total_days[j],
           	 		                 'date'      : this.month+'-'+this.twoDigit(j+1)
           	 	    });
         		}
         		break;
         	}
         }
         title="FTDs of "+today;
         break;               	
  	};
  	if(amount==0){
  		date_title="Date";
  		sort=1;
  		sort_direction="desc";
  	}else if(amount==1){
  	   	date_title="Month";
  		sort=1;
  		sort_direction="desc";	
  	}else{
  		date_title="Date";
  		sort=2;
  		sort_direction="asc";
  	}
  	bootbox.dialog({
        title: title,
        message:    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="sales_daily_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sales_daily_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>',    
        buttons: {
         success: {
         label: "OK",
         className: "btn-success",
         callback: function() {
      	    that.getAllTransactions();
         }
         }
        }});
        $('#sales_daily_table').dataTable( {
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
           "aaData": daily_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ sort, sort_direction ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "total_days", "sTitle": "Total FTDs"},
            { "mData": "date", "sTitle": date_title, "sType": "date"}
            ]
        });
  },
  addExtraModal : function(){
  	var that = this;
  	bootbox.dialog({
        title: "Add Extra",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="sales_extra-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="sales_extraDate" name="extraDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="sales_extraEmployee" name="extraEmployee" class="form-control"></select>'+
                    '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="sales_extraAmount" name="extraAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraReason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="sales_extraReason" name="extraReason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#sales_extraDate").val($("#dpEnd").val());'+
                    '$("#sales_extraDate").datepicker(); '+
                    'getEmployeesForChange();'+ 
                    '</script>',
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	apiRequest('addExtraForConversion',$('#sales_extra-form').serialize(),$('#sales_extra_table_holder'),function(){
		  that.viewExtraBonus();
	    });
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }
    }});
  },
  deleteExtra: function(id){
  	var that = this; 
  	var post_data="id="+id;
    apiRequest('deleteExtraForConversion',post_data,'#sales_extra_table_holder',function(){
        that.viewExtraBonus();
    });	
  },
  cleanDuplicate : function(){
  	$('#sales_transactionId').val('');
    $('#sales_transactionEmployeeId').val('');
    $('#sales_transactionEmployee').val('');
    $('#sales_type').val('');
  },
  twoDigit : function(n){
    return n > 9 ? "" + n: "0" + n;
  }, 
  getAllTransactions : function(){
  	var that = this;
  	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
  	var data_wd=[],unique_data=[],href=[];
  	var total_deposits=0, today_deposits=0, total_ftds=0, today_ftds=0, daily_3= 0, daily_4= 0, daily_6= 0, daily_8= 0, daily_10= 0, daily_12=0, daily_15=0,
  	    flat_bonus=0, daily_3_bonus=0, daily_4_bonus=0, daily_6_bonus=0, daily_8_bonus=0, daily_10_bonus=0, daily_12_bonus=0, daily_15_bonus=0, daily_total=0, weekly_bonus=0, goal_bonus=0, extra_bonus=0, total_bonus;
  	var today=new Date().format('yyyy-MM')==$('#dpMonth').val() ? new Date().format('yyyy-MM-dd') : $('#dpEnd').val();
  	var sales_agents= JSON.parse(JSON.stringify(global_agents)); //copy of global_agents
  	$('a.daily,#allSales_bootbox .list-group-item,a.chart').addClass('disabled');
  	for(var i in sales_agents){
  		sales_agents[i].target_weeks= new Float64Array(4);
  		sales_agents[i].total_weeks= new Float64Array(4);
  		sales_agents[i].total_days= new Float64Array(31);
  	}
  	$.ajax({
  	    url: "/api.php?cmd=getWeeklyBonusForConversion",
  	    type: "POST",
  	    data: $('#dpStart').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	for(var i=0;i<data.length;i++){
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
  	       		if(data[j].week==i+1){
  	       		  for(var k=0;k<sales_agents.length;k++){
  	       		     if(data[j].employeeId==sales_agents[k].employeeId){
  	       			   sales_agents[k].target_weeks[i]=parseFloat(data[j].target);
  	       		     }
     	       	  }
  	       		}
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
  	    url: "/api.php?cmd=getExtraForConversion",
  	    type: "POST",
  	    data: $('#range-form').serialize(),  
  	    dataType: "json",
        timeout: 60000000,
  	    success:function(data){
  	    	for(var i=0;i<data.length;i++){
  	            extra_bonus+=parseFloat(data[i].amount);
  	        }
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
  	  }).done(function(){   	 	
  	apiRequest('getTransactionsForConversion',$('#sales-form').serialize(),'#sales_table_holder',function(data){
  		console.log('all sales');
  		for(var i=0;i<data.length;i++){
          data[i].employee=data[i].employeeId+' - '+data[i].employee;	
      	  for(var j=0;j<4;j++){
      		if(new Date(data[i].confirmTime).format('yyyy-MM-dd')<=global_weeks[j].lastDayofWeek){
      			data[i].week=global_weeks[j].week;
      			break;
      		}
      	 }
      	 total_deposits+=parseFloat(data[i].amountUSD);
       	 today_deposits+= new Date(data[i].confirmTime).format("yyyy-MM-dd")==today ? parseFloat(data[i].amountUSD) : 0;
      	 if(typeof unique_data[data[i].customerId]=='undefined' || data[i].type=="Duplicated"){
       	 	data_wd.push(data[i]);
       	 }
       	 unique_data[data[i].customerId]=1; 
        }
        that.chart_data = data_wd;
        for(var i=0;i<data_wd.length;i++){
      	  today_ftds+=(new Date(data_wd[i].confirmTime).format("yyyy-MM-dd")==today && data_wd[i].assign!='Deleted') ? 1 : 0;
      	  total_ftds+=data_wd[i].assign!='Deleted' ? 1 : 0;
      	  for(var j=0;j<4;j++){
      	  	if(data_wd[i].week==j+1){
      	  	   for(var k=0;k<sales_agents.length;k++){
      	  	   	 if(sales_agents[k].employeeId==data_wd[i].employeeId){	
      		       sales_agents[k].total_weeks[j]+= data_wd[i].assign!='Deleted' ? 1 : 0;
      		       break;
      		     }  
      		   }
      		 break;  
      		}
      	  }
      	for(var j=0;j<31;j++){
      		if(new Date(data_wd[i].confirmTime).format('d')==j+1){	
      		  for(var k=0;k<sales_agents.length;k++){
      		    if(sales_agents[k].employeeId==data_wd[i].employeeId){
      		        sales_agents[k].total_days[j]+= data_wd[i].assign!='Deleted' ? 1 :0;
      		        break;
      		    }
      		  }
      		  break;       
      		}
      	}
      }
      for(var i=0;i<31;i++){
      	for(var j=0;j<sales_agents.length;j++){
      	  if(that.month>='2016-05'){
      	  	if(sales_agents[j].total_days[i]>=15){
      	  		daily_15++;
      	  	}else if(sales_agents[j].total_days[i]>=12){
      	  		daily_12++;
      	  	}else if(sales_agents[j].total_days[i]>=10){
      			daily_10++;
      	  	}else if(sales_agents[j].total_days[i]>=8){
      			daily_8++;
      	  	}else if(sales_agents[j].total_days[i]>=6){
      			daily_6++;
      	  	}else if(sales_agents[j].total_days[i]>=4){
      			daily_4++;
      	  	}else if(sales_agents[j].total_days[i]==3){
      			daily_3++;
      	  	}
      	  }else{
      		if(sales_agents[j].total_days[i]>=10){
      			daily_10++;
      	  	}else if(sales_agents[j].total_days[i]>=8){
      			daily_8++;
      	  	}else if(sales_agents[j].total_days[i]>=6){
      			daily_6++;
      	  	}else if(sales_agents[j].total_days[i]>=4){
      			daily_4++;
      	  	}else if(sales_agents[j].total_days[i]==3){
      			daily_3++;
      	  	}
      	 }
      	} 
      }
      console.log(sales_agents);
      flat_bonus=total_ftds*79;
      daily_3_bonus=daily_3*100;
      daily_4_bonus=daily_4*200;
      daily_6_bonus=daily_6*500;
      daily_8_bonus=daily_8*1000;
      daily_10_bonus=daily_10*2000;
      daily_12_bonus=daily_12*3000;
      daily_15_bonus=daily_15*4000;
      daily_total=flat_bonus+daily_3_bonus+daily_4_bonus+daily_6_bonus+daily_8_bonus+daily_10_bonus+daily_12_bonus+daily_15_bonus;
      
      
      $('#sales_total_deposits').html('$ '+total_deposits.toLocaleString());
      $('#sales_today_deposits').html('$ '+today_deposits.toLocaleString());
      $('#sales_today_ftds').html(today_ftds.toLocaleString());
      $('#sales_total_ftds').html(total_ftds.toLocaleString());
      $('#sales_total_deposits_commission').html('$ '+total_deposits.toLocaleString());
      $('#sales_flat').html(total_ftds.toLocaleString());
      $('#sales_daily_3').html(daily_3.toLocaleString());
      $('#sales_daily_4').html(daily_4.toLocaleString());
      $('#sales_daily_6').html(daily_6.toLocaleString());
      $('#sales_daily_8').html(daily_8.toLocaleString());
      $('#sales_daily_10').html(daily_10.toLocaleString());
      $('#sales_daily_12').html(daily_12.toLocaleString());
      $('#sales_daily_15').html(daily_15.toLocaleString());
      $('#sales_flat_bonus').html('&#8362; '+flat_bonus.toLocaleString());
      $('#sales_daily_3_bonus').html('&#8362; '+daily_3_bonus.toLocaleString());
      $('#sales_daily_4_bonus').html('&#8362; '+daily_4_bonus.toLocaleString());
      $('#sales_daily_6_bonus').html('&#8362; '+daily_6_bonus.toLocaleString());
      $('#sales_daily_8_bonus').html('&#8362; '+daily_8_bonus.toLocaleString());
      $('#sales_daily_10_bonus').html('&#8362; '+daily_10_bonus.toLocaleString());
      $('#sales_daily_12_bonus').html('&#8362; '+daily_12_bonus.toLocaleString());
      $('#sales_daily_15_bonus').html('&#8362; '+daily_15_bonus.toLocaleString());
      $('#sales_daily_total').html('&#8362; '+daily_total.toLocaleString());
      
      for(var i=0;i<4;i++){
            for(var j=0;j<sales_agents.length;j++){
              if(sales_agents[j].target_weeks[i]!=0 && sales_agents[j].target_weeks[i]<=sales_agents[j].total_weeks[i]){
            		goal_bonus+=300;
              }
            }
      }
      total_bonus=daily_total+weekly_bonus+goal_bonus+extra_bonus;
      
      $('#sales_goal_bonus').html('&#8362; '+ goal_bonus.toLocaleString());
      $('#sales_weekly_bonus').html('&#8362; '+ weekly_bonus.toLocaleString());
      $('#sales_extra_bonus').html('&#8362; '+ extra_bonus.toLocaleString());
      $('#sales_total_bonus').html('&#8362; '+ total_bonus.toLocaleString());
      
      that.agents= $.extend(true, [], sales_agents);
      $('a.daily,#allSales_bootbox .list-group-item,a.chart').removeClass('disabled');
       
  	  $('#sales_table').dataTable( {
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
       "aaData": data,
       "dom": '<"toolbar">frtip',
       "aaSorting": [[ 0, "asc" ]],                    
       "aoColumns": [
       { "mData": "week", "sTitle": "Week", "sType":"number"},            
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
       { "mData": "note", "sTitle": "Note",
         "fnRender": function (oObj) {
            var color='';
            oObj.aData.firstNoteInTwoWeeks=='0000-00-00 00:00:00' ? color="danger" : color="secondary";
            return '<a href="#" data-customer="'+oObj.aData.customerId+'" data-employee="'+oObj.aData.employeeId+'" data-nStart="'+oObj.aData.firstNoteInTwoWeeks+'" data-nEnd="'+oObj.aData.confirmTime+'"   class="btn btn-xs btn-'+color+' getNotes">Note</a>';
          }
       },
       { "mData":"type", "sTitle":"Type",
         "fnRender": function (oObj) {
            var color= oObj.aData.type=="Duplicate" ? "success" : "week";
            return '<a href="" data-id='+oObj.aData.id+' data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-type="'+oObj.aData.type+'" class="btn btn-'+color+' btn-xs btn-block sales_duplicate">'+oObj.aData.type+'</a>'; 
            }
       },
       { "mData": "withdrawal", "sTitle":"Withdrawals",
         "fnRender": function(oObj){
            var color= oObj.aData.withdrawal=='Withdrawal' ? 'danger' : 'default';
            return '<a href="" data-customerId='+oObj.aData.customerId+' data-date="'+oObj.aData.confirmTime+'" class="btn btn-'+color+' btn-xs btn-block withdrawal">'+oObj.aData.withdrawal+'</a>';
          }},   
       { "mData":"assign", "sTitle":"Delete",
         "fnRender": function (oObj) {
            var color= oObj.aData.assign=="Delete" ? "secondary" : "danger";
            return '<a href="" data-id="'+oObj.aData.id+'" data-employeeId="'+oObj.aData.employeeId+'" data-employee="'+oObj.aData.employee+'" data-assign="'+oObj.aData.assign+'" class="btn btn-'+color+' btn-xs btn-block sales_assign">'+oObj.aData.assign+'</a>'; 
            }
       },
       { "mData": "isChanged", "sTitle": "Change",
         "fnRender": function (oObj) {
            var color= oObj.aData.isChanged=="Changed" ? "danger" : "success";
            return '<a href="" data-id="'+oObj.aData.id+'" data-employee="'+oObj.aData.employee+'" data-isChanged="'+oObj.aData.isChanged+'" class="btn btn-'+color+' btn-xs btn-block sales_change">'+oObj.aData.isChanged+'</a>';
            }
       },
       { "mData": "campaignName", "sTitle": "Campaign"}              
       ]
       });
  	});
  	});
  	});
  	});
  },
  getChartModal: function(){
  	var that = this;
  	var chart_modal= bootbox.dialog({
	  title: "Charts For Desk "+ $('#desk option:selected').text(),
      message: '<div class="row">'+
               '<div class="col-md-2">'+
               '<h4>Month</h4>'+
               '<input class="form-control" value="'+$("#dpMonth").val()+'" onfocus="this.blur();"/>'+
               '</div>'+
               '<div class="col-md-3">'+
               '<h4>Employee</h4>'+
               '<input class="form-control" value="'+$('#desk option:selected').text()+'" onfocus="this.blur();"/>'+
               '</div>'+
               '<div class="col-md-1">'+
               '<h4>&nbsp;</h4>'+
               '<a href="" class="btn btn-week" id="total_button">Total Charts</a>'+
               '</div>'+
               '<div class="col-md-1">'+
               '<h4>&nbsp;</h4>'+
               '<a href="" class="btn btn-week" id="today_button">Today Charts</a>'+
               '</div>'+
               '<div class="col-md-12">&nbsp;</div> '+
               '<div class="col-md-12">'+
               '<div class="list-group col-md-2">'+  
			   '<a href="javascript:;" class="list-group-item" id="sales_ftds_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
			   '<h4 class="list-group-item-heading" id="ftds_amount">-</h4>'+
			   '<p class="list-group-item-text"><span class="chart_type"></span> FTDs</p>'+
			   '</a>'+
			   '</div>'+
			   '<div class="list-group col-md-2">'+  
			   '<a href="javascript:;" class="list-group-item" id="sales_campaigns_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
			   '<h4 class="list-group-item-heading" id="campaigns_amount">-</h4>'+
			   '<p class="list-group-item-text"><span class="chart_type"></span> Campaigns</p>'+
			   '</a>'+
			   '</div>'+
			   '<div class="list-group col-md-2">'+  
			   '<a href="javascript:;" class="list-group-item" id="sales_countries_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
			   '<h4 class="list-group-item-heading" id="countries_amount">-</h4>'+
			   '<p class="list-group-item-text"><span class="chart_type"></span> Countries</p>'+
			   '</a>'+
			   '</div>'+
			   '<div class="list-group col-md-3">'+  
		       '<a href="javascript:;" class="list-group-item" id="sales_reg_difference_chart"><h3 class="pull-right"><i class="fa fa-bar-chart"></i></h3>'+
			   '<h4 class="list-group-item-heading" id="reg_difference_amount">-</h4>'+
			   '<p class="list-group-item-text"><span class="chart_type"></span> Average Reg. Difference</p>'+
			   '</a>'+
			   '</div>'+
               '</div>'+
               '<div class="col-md-12">'+
               '<div class="portlet">'+
               '<div class="portlet-header">'+
               '<h3><i class="fa fa-bar-chart-o"></i>Chart</h3>'+
               '</div>'+
               '<div class="portlet-content">'+
               '<div id="sales_chart_div"></div>'+
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
	$(chart_modal[0]).attr("id","chart_modal");
	$('#chart_modal .modal-dialog').addClass('modal-xlarge');
	this.chartCalculations('Total');
	$('#total_button').click(function(){ event.preventDefault(); that.chartCalculations('Total'); return false;});
	$('#today_button').click(function(){ event.preventDefault(); that.chartCalculations('Today'); return false;});
  },
  chartCalculations: function(chart_type){
  	var total_chart_data = $.extend(true,[],this.chart_data);
  	var that = this;
  	var today=new Date().format('yyyy-MM')==$('#dpMonth').val() ? new Date().format('yyyy-MM-dd') : $('#dpEnd').val();
  	var total_ftds=0, total_campaigns=0, total_countries=0, difference_label=0, difference=0, total_differences=0, average_differences=0; 
	var chart_data=[], weeks=[], regDifferences=[], campaigns=[], unique_campaigns=[], countries=[], unique_countries=[];
	
    if(chart_type=='Total'){
    	chart_data = JSON.parse(JSON.stringify(total_chart_data));
    }else if(chart_type=='Today'){
    	for(var i in total_chart_data){
    		if(new Date(total_chart_data[i].confirmTime).format('yyyy-MM-dd')==today)
    		  chart_data.push(total_chart_data[i]);
    	}
    }
	for(var i=0; i<4; i++){
		weeks.push({"week": i+1,
		            "total": 0});
	}
	for(var i=0; i<9; i++){
		difference_label = i==0 ? 'same day' : i==7 ? '7+' : i==8 ? '30+' : i;
		regDifferences.push({"difference": difference_label,
		                     "total"     : 0
		                    });
	}
	
	for(var i in chart_data){
		if(chart_data[i].assign!='Deleted'){
		 if(typeof unique_campaigns[chart_data[i].campaignId]=='undefined')
		   campaigns.push({"campaignName": chart_data[i].campaignName,
		                   "total"       :0 
		                  });
		 if(typeof unique_countries[chart_data[i].country]=='undefined')
		   countries.push({"country": chart_data[i].country,
		                   "total"       :0 
		                  });
		 for(var j in campaigns){
		   if(chart_data[i].campaignName==campaigns[j].campaignName)
		     campaigns[j].total++;	
		 }
		 for(var j in countries){
		   if(chart_data[i].country==countries[j].country)
		     countries[j].total++;	
		 }
		 for(var j=0; j<4; j++){
      		weeks[j].total+=chart_data[i].week==j+1 ? 1 : 0;
      	 }
      	
		 total_ftds++;
		
		 difference = daysBetween(chart_data[i].regTime,chart_data[i].confirmTime) | 0;
		
		 difference>=30 ? regDifferences[8].total++ : difference>=7 ? regDifferences[7].total++ : difference==6 ? regDifferences[6].total++ : difference==5 ? regDifferences[5].total++ :
		 difference==4 ? regDifferences[4].total++ : difference==3 ? regDifferences[3].total++ : difference==2 ? regDifferences[2].total++ : difference==1 ? regDifferences[1].total++ : regDifferences[0].total++ ;
		          	
		 total_differences += difference;                  
		 unique_campaigns[chart_data[i].campaignId]=1;
		 unique_countries[chart_data[i].country]=1;
	    } 	                                    
	}
	total_campaigns= campaigns.length;
	total_countries= countries.length;
	average_differences= chart_data.length!=0 ? (total_differences/chart_data.length).toLocaleString() : 0;
	if($('span.chart_type').html()!=chart_type){
	  $("#sales_chart_div").animate({opacity:0},500,function(){
	    $(this).empty();
	    $(this).animate({opacity:1},500);	
	  });
	  $("#chart_modal .list-group-item-heading,#chart_modal .list-group-item-text").animate({opacity:0},500,function(){
	    $('span.chart_type').html(chart_type);
	    $('#ftds_amount').html(total_ftds);
	    $('#campaigns_amount').html(total_campaigns);
	    $('#countries_amount').html(total_countries);
	    $('#reg_difference_amount').html(average_differences);
	    
	    $(this).animate({opacity:1},500);	
	  });
	}
	$('#sales_ftds_chart').off('click').click(function(){ event.preventDefault(); that.drawChart("Weeks","week",weeks);});
	$('#sales_campaigns_chart').off('click').click(function(){ event.preventDefault(); that.drawChart("Campaigns","campaignName",campaigns);});
	$('#sales_countries_chart').off('click').click(function(){ event.preventDefault(); that.drawChart("Countries","country",countries);});
	$('#sales_reg_difference_chart').off('click').click(function(){ event.preventDefault(); that.drawChart("Registration Differences","difference",regDifferences);});
  },
  drawChart: function(chart_title,title_field,chart_data){
   console.log(chart_title);
   console.log(title_field);
   console.log(chart_data);	
   var chart = AmCharts.makeChart( "sales_chart_div", {
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
   "labelRadius": 30,
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
   });
 }   
 };	

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
