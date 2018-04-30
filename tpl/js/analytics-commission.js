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
  
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  
  clean();
  displayBonusFor3D($('#dpStart').val(),$('#dpEnd').val());
  getTransactionsForCommission();
  
}

function clean(){
	localStorage.setItem('commission-form',  JSON.stringify({"dpStart":$('#dpStart').val(),
                                                                 "dpEnd":$('#dpEnd').val(),
                                                                 "desk":$('#desk').val(),
                                                                 "desk_text":$('#desk option:selected').text(),
                                                                 "employee":$('#employee').val(),
                                                                 "employee_desk":$('#employee option:selected').attr('data-desk'),
                                                                 "employee_text":$('#employee option:selected').text()})); // set values for summary                                                       
 /*       $('#transactionId').val('');
        $('#transactionEmployee').val('');
        $('#percentage').val('0');
        $('#splitPercentage').val('');
        $('#splitEmployee').select2('val','0',true); */
}

// $("#change-form").append('<input type="hidden" name="percentage"  id="percentage"   value="0" />');
$("#range-form").append('<input type="hidden" name="customerId"  id="customerId"/>');

//var global=0;
var difference_bonus=0;

$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
     
     $("#employee").select2({width: "100%"});
         
     clean();
     displayBonusFor3D($('#dpStart').val(),$('#dpEnd').val());
     getEmployeesForRetention();
     getTransactionsForCommission();
     
     $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        
     });
     $('#dpStart, #dpEnd').change(function(){                  	
        
        var date1= $(this).val();
        var date2= $('.dates').not(this).val();
        displayBonusFor3D(date1,date2);
        clean();
        getTransactionsForCommission();        	 
     });
      
     $('#desk, #employee').change(function(){
      	displayBonusFor3D($('#dpStart').val(),$('#dpEnd').val());
        clean();
        getTransactionsForCommission();
     });
      
      
      $( document ).on("click","a.getSplit",function() {
       	event.preventDefault();
        var transaction_id = $(this).attr('data-id');
        var transaction_employee = $(this).attr('data-employee');
        var transaction_percent = $(this).attr('data-percent');
        var customer_name = $(this).attr('data-customer');
        var amount = parseFloat($(this).attr('data-amount'));
        var currency = $(this).attr('data-currency');
        transaction_percent == '%100' ? addSplitModal(transaction_id,transaction_employee,customer_name,amount,currency) : deleteSplit(transaction_id); 
     }); 
     
     $( document ).on("click","#refresh",function() { 
      clean();     
      getTransactionsForCommission();
     });
     
      $( document ).on("click","a.getChange",function() { 
        bootbox.dialog({
        title: "Change Employee",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="employee-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="transaction">Transaction ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="transaction" name="transaction"  value=" ' + $(this).attr("data-id") + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="changeEmployee">Transaction Employee</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="changeEmployee" name="changeEmployee" value=" '+ $(this).attr("data-employee") +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="chooseEmployee">Choose Employee</label> ' +
                    '<div class="col-md-5"> ' +
                    '<select id="chooseEmployee" name="chooseEmployee" class="form-control">' + 
                       '<option value="0" >All</option>' +
                       '<script>getEmployeeForChange(); </script>' +
                     '</div> ' +
                    '</div>' +
                    '</div> </div>' +
                    '</form> </div>  </div>',
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getChangeTransaction();
      	getTransactionsForCommission();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
        bootbox.alert("The employee is NOT changed");
      }
    }
    }});
});   
 
  $( document ).on("click","a.getWithdrawals",function() {
     	$('#customerId').val($(this).attr('data-customerId'));
     	console.log($('#customerId').val());
     	bootbox.dialog({
        title: "Withdrawals",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="withdrawal_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="withdrawal_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getWithdrawalsForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
     	
     }); 
     
     $( document ).on("click","a.deletePenalty",function() {
     	var id=$(this).attr("data-id");
     	var retentionWithdrawalId=$(this).attr("data-retentionWithdrawalId");
     	post_data="id="+id+"&retentionWithdrawalId="+retentionWithdrawalId;
     	apiRequest('deletePenalty',post_data,'#penalty_table_holder',function(data){
     	    getPenaltyForCommission();
     	});	
     });
     $( document ).on("click","a.deleteExtra",function() {
     	post_data="id="+$(this).attr("data-id");
     	apiRequest('deleteExtra',post_data,'#extra_table_holder',function(data){
     	    getExtraForCommission();
     	});	
     }); 
     $( document ).on("click","a.deletePostponed",function() {
     	post_data="id="+$(this).attr("data-id");
     	apiRequest('deletePostponed',post_data,'#postponed_table_holder',function(data){
     	    getPostponedForCommission();
     	});	
     });   
     $( document ).on("click","a.deleteFines",function() {
     	post_data="id="+$(this).attr("data-id");
     	apiRequest('deleteFines',post_data,'#fines_table_holder',function(data){
     	    getFinesForCommission();
     	});	
     });
     $( document ).on("click","a.deleteOther",function() {
     	post_data="id="+$(this).attr("data-id");
     	apiRequest('deleteOtherBonus',post_data,'#other_table_holder',function(data){
     	    getOtherBonusForCommission();
     	});	
     });
     $( document ).on("click","a.deleteDifference",function() {
     	post_data="id="+$(this).attr("data-id");
     	apiRequest('deleteDifference',post_data,'#difference_table_holder',function(data){
     	    getLastMonthDifferenceForCommission();
     	});	
     });       
  
 }); 
 
function displayBonusFor3D(date1,date2){
 	var compareMonth1= '2016-05';
 	var compareMonth2= '2016-11';
 	var month1 = new Date(date1).format('yyyy-MM');
 	var month2 = new Date(date2).format('yyyy-MM');
    
    var shekel_desks = [0,4];
  	var desk = parseFloat($('#desk').val());
  	var employee_desk = parseFloat($('#employee option:selected').attr('data-desk'));
  	var is_shekel_display = $.inArray(desk,shekel_desks)!=-1 && $.inArray(employee_desk,shekel_desks)!=-1;
    
    if(!is_shekel_display){
    	animateDisplayBonusFor3D('none','none','usd-currency');
    }else {
      if((month1==compareMonth1 && month2==compareMonth1) || (month1>=compareMonth2 && month2>=compareMonth2)){
    	
    	animateDisplayBonusFor3D('none','none','ils-currency');
      }	
      else if(month1<compareMonth1 || month2<compareMonth1){
    	animateDisplayBonusFor3D('table-row','table-row','ils-currency');
      }else 
        animateDisplayBonusFor3D('table-row','none','ils-currency'); 	
    }	 
}

function animateDisplayBonusFor3D(type,type_3d_2500,type_currency){
 	if($('.3d-extrabonus').css('display')!=type || $('.3d-2500').css('display')!=type_3d_2500 || !$('.currency').hasClass(type_currency)){
    		$('#commission_table').animate({opacity:0},function(){
    			$('.3d-extrabonus').css('display',type);
    			$('.3d-2500').css('display',type_3d_2500);
    			$('.currency').removeClass('ils-currency usd-currency').addClass(type_currency);
    			$(this).animate({opacity:1});
    		});
    }		
}
 
 function getEmployeesForRetention () {

    $('#employee')
    .find('option:not([value="0"])')
    .remove();
    

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
                .text(this.userId + ' - ' + this.employeeName)
                .attr('data-desk',this.desk)); 
      });
      
      $('#s2id_employee .select2-chosen').text($('#employee option:first-child').text()); // display first chosen employee;
      
    });
    
  }
  
   function getEmployeeForChange(){
  	
  	 $('#chooseEmployee,#penaltyEmployee,#extraEmployee,#postponedEmployee,#finesEmployee,#otherEmployee,#paidEmployee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
    
    
    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'',function(data){
    	
    	jQuery.each(data, function() {
        $('#chooseEmployee,#penaltyEmployee,#extraEmployee,#postponedEmployee,#finesEmployee,#otherEmployee,#paidEmployee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
                 
  
      });
      	
    });
    
  	
  }
  
  function getEmployeesForSplit(){
     $('select.transaction_employees')
              .find('option')
              .remove()
     		  .end()
     		  .append('<option value="0">All</option>')
              .val('0');	
    
     
     apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'',function(data){
    	
    	jQuery.each(data, function() {
    	 	
           $('select.transaction_employees').append($('<option>', { value : this.userId })
                  .text(this.userId + ' - ' + this.employeeName)); 
      	
        });
        $('select.transaction_employees').select2('val','0',true);
     }); 
     
  }
  
  function addSplitModal(transaction_id,transaction_employee,customer_name,amount,currency){
  	 var split_modal = bootbox.dialog({
        title: "Split Transaction",
                message: '<div class="row">  ' +
                    '<form id="split-form">'+
                    '<div class="col-md-12"> ' +
                  
                    '<div class="col-md-3">'+
                    '<h4>Transaction ID</h4>'+
                    '<input class="form-control" id="transactionId" name="transactionId" value="'+transaction_id+'" onfocus="this.blur();">'+
                    '</div>'+
                    '<div class="col-md-3">'+
                    '<h4>Customer Name</h4>'+
                    '<input class="form-control" value="'+customer_name+'" onfocus="this.blur();">'+
                    '</div>'+
                    '<div class="col-md-2">'+
                    '<h4>Currency</h4>'+
                    '<input class="form-control" value="'+currency+'" onfocus="this.blur();">'+
                    '</div>'+
                    '<div class="col-md-3">'+
                    '<h4>Amount</h4>'+
                    '<input class="form-control" value="'+amount+'" onfocus="this.blur();">'+
                    '</div>'+
                    
                    '</div>'+
                    '<div class="col-md-12"><h5></h5></div>' +
                    '<div class="col-md-12"> ' +
                    
                    '<div class="col-md-2">'+
                    '<h4>Split To</h4>'+
                    '<select class="form-control" id="number_split">'+
                    '<option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option>'+
                    '</select>'+
                    
                    '</div>'+
                    '</div>'+
                    '<div class="col-md-12"><h4>&nbsp;</h4></div>' +
                    '<div class="col-md-12"> ' +
                    '<div class="col-md-3">'+
                    '<h4>Transaction Employee</h4>'+
                    '<input class="form-control" value="'+transaction_employee+'" onfocus="this.blur();">'+
                    '</div>'+
                    '<div class="col-md-2">'+
                    '<h4>Percent</h4>'+
                    '<input class="form-control" id="transaction_percent" value="100" onfocus="this.blur();">'+
                    '</div>'+
                    '<div class="col-md-3">'+
                    '<h4>Amount</h4>'+
                    '<input class="form-control" id="transaction_amount" value="'+amount+'" onfocus="this.blur();">'+
                    '</div>'+
                    '</div>'+
                    '<div id="split_rows" style="display:none"></div>'+
                    '</form></div>',
                buttons: {
           			success: {
      					label: "OK",
      					className: "btn-success",
      					callback: function(){
      						addSplit(transaction_id);
      					}
    				},
    				danger: {
      					label: "Cancel",
      					className: "btn-danger",
      					callback: function() {
        					
      					}
    				}
     }});
    $(split_modal[0]).attr('id','split_modal').removeAttr('tabindex'); 
	$('#split_modal .modal-dialog').addClass('modal-large');
	
	
	for(var i=0;i<4;i++){
		$('#split_rows').append('<div class="split_row" id="row_'+i+'" style="display:none">'+
		                        '<div class="col-md-12"><h5>&nbsp;</h5></div>' +
                                '<div class="col-md-12"> ' +
                                '<div class="col-md-3">'+
                                '<select class="form-control transaction_employees" id="transaction_employee_'+i+'" name="transaction_employee_'+i+'">'+
                                '</select>'+
                                '</div>'+
                                '<div class="col-md-2">'+
                    			'<input class="form-control transaction_percents" id="transaction_percent_'+i+'" name="transaction_percent_'+i+'" placeholder="Insert Percent" value="0">'+
                    			'</div>'+
                    			'<div class="col-md-3">'+
                    			'<input class="form-control transaction_amounts" id="transaction_amount_'+i+'" name="transaction_amount_'+i+'" value="0" onfocus="this.blur();">'+
                    			'</div>'+
                    			'</div>'+
                    			'</div>');
	}
	$("select.transaction_employees").select2({width: "100%"});
	getEmployeesForSplit();
	setSplitRows($('#number_split').val(),amount);
	
	$('#number_split').change(function(){
		setSplitRows($(this).val(),amount);
	});

    $('.transaction_percents').off('keyup paste').on('keyup paste',function(e){
    	var keycode = (e.keyCode ? e.keyCode : e.which);
    	if(keycode==13){
    	   setSplitDetails(amount,'percent');
    	}else {
    	   $('.transaction_amounts').val('0');
           $('#transaction_amount').val(amount);
           $('#transaction_percent').val('100');
           $(this).removeClass('red-border');	
    	}
    	   
    });
    
    var modal_dom = $('#split_modal')[0];
    clickHandler = $._data(modal_dom,'events').click[0].handler;
    $(modal_dom).off('click','.modal-footer button').on('click','.modal-footer button',function(e){
    	
    	if($(this).hasClass('btn-success'))  
    	   var valid_split = setSplitDetails(amount);	     
    	
    	if(typeof valid_split=='undefined' ||  valid_split)
    	   $.proxy(clickHandler, this)(e);
    });
  }
  
  function setSplitRows(split_number,amount) {
  	 $('#split_rows').slideUp(500,function(){
  	 	$('.split_row').css('display','none');
  	 	initializeSplitDetails(amount,true);
  	 	
  	 	for(var i=0;i<split_number-1;i++){
  	 	   $('#row_'+i).css('display','block');	
  	 	}
  	 	$(this).slideDown(500);
  	 });
  }
  
  function setSplitDetails(amount,type) {
  	var total_percent = 0 ;
  	var unfilled_employees = false;
  	var unfilled_percent = false;
  	var invalid_percent = false;
  	var re = new RegExp(/^((([1-9][0-9]*))+(\.[0-9]{1})?|0\.[0-9]{1})$/); 
  	var dom = '.transaction_percents';
  	
  	dom += type!='percent' ? ',select.transaction_employees' : '';
  	
  	$(dom).each(function(){
  		var split_row = $(this).parents('.split_row');
  		var is_percent = $(this).hasClass('transaction_percents');
  		
  		if(split_row.css('display')!='none' && ($(this).val()==0 || (is_percent && !re.test($(this).val())))){
  		  	
  			if(is_percent && $(this).val()==0) 
  			     unfilled_percent=true;
  			if(is_percent && !re.test($(this).val())){ 
  				 $(this).addClass('red-border');
  				 invalid_percent = true;
  		  	}
  		  	if(!is_percent && $(this).val()==0) 
  		  	     unfilled_employees = true;
  			return ;
  		}
  		
  		if(is_percent) total_percent+=parseFloat($(this).val());
  		
  	});
  	
  	if(unfilled_percent || invalid_percent){ 
  		var message = unfilled_percent ? 'Fill all the percentage' : 'Invalid Percentage';
  		bootbox.alert('<h4>'+message+'</h4>');
  		return false;
  	}
  	
  	if(total_percent>=100){ 
  	   bootbox.alert('<h4>Total Percentage is equal to or bigger than 100</h4>',function(){
  		  initializeSplitDetails(amount);
  	   });
  	   return false;
  	}
  	
  	$('#transaction_percent').val((100-total_percent).toLocaleString());
  	$('#transaction_amount').val((((100-total_percent)/100)*amount).toLocaleString());
  	$('.split_row').each(function(){
  		var percent = parseFloat($(this).find('.transaction_percents').val());
  		$(this).find('.transaction_amounts').val(((percent/100)*amount).toLocaleString());
  	});
  	
  	if(unfilled_employees){
  		bootbox.alert('<h4>Fill all the employees</h4>');
  		return false;
  	}
  	
  	return true;
  	
  }
  
  function initializeSplitDetails(amount,reset_employees){
  	 
  	 if(reset_employees) $('select.transaction_employees').select2('val','0',true);
  	 $('#transaction_percent').val('100');
  	 $('#transaction_amount').val(amount);
  	 $('.transaction_percents,.transaction_amounts').val('0');
  	 $('.transaction_percents').removeClass('red-border');
  };
  
  function addSplit(transaction_id){
  	 var split=[];
  	 $('.split_row').each(function(){
  	 	if($(this).css('display')=='none') return;
  	 	var split_employee = $(this).find('select.transaction_employees').val();
  	 	var split_percent = $(this).find('.transaction_percents').val();
  	 	split.push({employee: split_employee,
  	 		        percent: split_percent
  	 		        });	         
  	 });
  	 post_data = {"split":JSON.stringify(split),"transactionId":transaction_id};
  	 console.log(post_data);
  	 apiRequest('addSplit',post_data,'#transactions_table_holder',function(data){
  	 	   var color = data ? 'success' : 'danger';
  	       var text = data ? data!='Already Splitted' ? 'Successful Split' : data : 'Unsuccessful Split';
  	       var image = data ? 'check' : 'times'; 
  	       
  	       $('.tooltip').attr('class','tooltip')
                 		.addClass('tooltip-'+color)
                 		.html('<i class="fa fa-'+image+'" aria-hidden="true"></i>&nbsp; '+text)
                 		.animate({opacity:1},function(){
                    	    $(this).animate({opacity:0},5000);
                    	});
  	 	   getTransactionsForCommission();
  	 });
  }
  
  function deleteSplit(transaction_id){
  	 bootbox.confirm('<h4>Are you sure to delete the split?</h4>',function(result){
  	 	 if(result){
  	 	 	apiRequest('deleteSplit','transactionId='+transaction_id,'#transactions_table_holder',function(data){
  	 	 		  var color = data ? 'success' : 'danger';
  	              var text = data ? data!='Already Deleted' ? 'Deleted Split' : data : 'Unsuccessful Delete';
  	              var image = data ? 'check' : 'times'; 
  	       
  	              $('.tooltip').attr('class','tooltip')
                 		      .addClass('tooltip-'+color)
                 		      .html('<i class="fa fa-'+image+'" aria-hidden="true"></i>&nbsp; '+text)
                 		      .animate({opacity:1},function(){
                    	         $(this).animate({opacity:0},5000);
                    	      });
  	 	 		  getTransactionsForCommission();
  	 	 	});
  	 	 }
  	 	   
  	 });
  }
  
  function getChangeTransaction(){
  	
  	  apiRequest('getChangeTransaction',$('#employee-form').serialize(),'',function(data){	    	
  	    	bootbox.alert("The employee is changed");
  	   });
  
  }
  
  function getTransactionsForCommission(){
  	
  	    $('#difference').addClass('disabled');
  	    $('#difference').text('ADD').removeClass('btn-danger btn-success').addClass('btn-secondary');
  	    
  	    var full_3d_bonus=[];
        var full_wire_bonus=[];
        var commission_3d_list=[];
        
  	    if(new Date($('#dpEnd').val()).format("yyyy-MM")=='2015-10'){
  	    	full_3d_bonus=['2450','2518','2474','2479','2481','188','2559'];
            full_wire_bonus=['2450','2518','2474','2479','2481','188','2559'];
  	    } // full_3d and full_wire only for october 2015
  	    
  	    var currency_rate = 3.8;
  	    var fines=0;
  	    var withdrawals={
  	    	       "credit_card":0,
  	    	       "c_3d":0,
  	    	       "wire":0
  	               };
  	    var postponed={
  	    	       "credit_card":0,
  	    	       "c_3d":0,
  	    	       "wire":0
  	               };
  	    var extra={
  	    	       "credit_card":0,
  	    	       "c_3d":0,
  	    	       "wire":0
  	               };
  	    var total_withdrawals=0;
  	    var total_postponed=0;
  	    var total_extra=0;
  	    var other=0;
  	    var other_bonus=0;
  	    var paid_bonus=0; 
  	    var last_month_difference=0; 
  	    var difference_data=[];    
  	    var array=[];
  	    var commission_rates=[];
  	    
  	    var shekel_desks = [0,4];
  	    var desk = parseFloat($('#desk').val());
  	    var employee_desk = parseFloat($('#employee option:selected').attr('data-desk'));
  	    var is_shekel_display = $.inArray(desk,shekel_desks)!=-1 && $.inArray(employee_desk,shekel_desks)!=-1;
  	    
  	    console.log('Shekel Display: '+is_shekel_display);
  	      
  	    var currencyDate=new Date().format("yyyy-MM-dd");
  	     
  	     if(new Date().format("yyyy-MM")>new Date($('#dpEnd').val()).format("yyyy-MM")){
  	     	
  	     	currencyDate=new Date((new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth() + 1, 1)) - 1).format("yyyy-MM-dd");
  	     	
  	     }
  	     
  	     var base = 'https://openexchangerates.org/api';
         var method = 'historical';
         var date = currencyDate;
         var key = 'e658b8bd7566446eb9e141c0082b7ed6';
         var api = base+'/'+method+'/'+date+'.json?app_id='+key;
         var rates = 0;
         
        $.getJSON( api, function( data ) {
                 rates = data.rates;
        }).done(function(){ 
        	
  	    $.ajax({
  	    	 url: "/api.php?cmd=getAllExtras",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	   
  	    	 	   currency_rate = data['currency_rate'] ? parseFloat(data['currency_rate']['rate']) : currency_rate;
  	    	 	   
  	    	 	   paid_bonus = data['paid'] ? parseFloat(data['paid']['amount']) : 0;
  	    	 	   
  	    	 	   for(var index in data["3d_list"]){
  	    	 	   	  commission_3d_list.push(data["3d_list"][index]["processor"]);
  	    	 	   }
  	    	 	  
                   var all_extras = data["extras"];
                   
                   for(var i=0;i<all_extras.length;i++){
                       switch(all_extras[i].status){
            	       
            	       case 'extra bonus':
            	       if(all_extras[i].type=="Credit Card")
            	           extra.credit_card += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Credit Card 3D Secure")
            	           extra.c_3d += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Wire")
            	           extra.wire += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];       
            	       break;
            	       
            	       case 'withdrawals':
            	       if(all_extras[i].type=="Credit Card")
            	           withdrawals.credit_card -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Credit Card 3D Secure")
            	           withdrawals.c_3d -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Wire")
            	           withdrawals.wire -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       break;
            	       
            	       case 'fines':
            	       fines-=parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       break;
            	       
            	       case 'postponed sales':
            	       if(all_extras[i].type=="Credit Card")
            	           postponed.credit_card -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Credit Card 3D Secure")
            	           postponed.c_3d -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(all_extras[i].type=="Wire")
            	           postponed.wire -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       break;
            	       
            	       case 'other_bonus':
            	       other+=parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	       if(is_shekel_display)
            	         all_extras[i].currency=='ILS' ? other_bonus+=parseFloat(all_extras[i].amount) : other_bonus+=(parseFloat(all_extras[i].amount)/rates[all_extras[i].currency])*currency_rate;
            	       else 
            	         other_bonus+=parseFloat(all_extras[i].amount)/rates[all_extras[i].currency]; 
            	       break;
            	       
            	       case 'retention_difference':
            	       all_extras[i].date==new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth()+1,1).format('yyyy-MM-dd') ?
  	    	 		      difference_data.push(parseFloat(all_extras[i].amount).toFixed(3)) :
  	    	 		      last_month_difference+=parseFloat(all_extras[i].amount);
            	       break;
            	       }
                  }
  	    	      total_extra=extra.credit_card + extra.c_3d + extra.wire;
  	    	      total_withdrawals=withdrawals.credit_card + withdrawals.c_3d + withdrawals.wire;
  	    	      total_postponed=postponed.credit_card + postponed.c_3d + postponed.wire;
                 
  	    	 	
  	    	
  	    	}
  	    	}).done(function(){
  	      $.ajax({
  	    	 url: "/api.php?cmd=getEmployeesForRetention",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	 

                   for(var i=0;i<data.length;i++){
                     array.push({
        	         "employeeId": data[i].userId ,
        	          "real_c_3d":0,
        	          "real_wire":0,
        	          "total_deposits":0
        	          
                 }); 
            	      
            	
                  }
  	    	      
               
  	    	 	
  	    	
  	    	}
  	    	
  	    }).done(function(){	 	 
  	 
  	    apiRequest('getTransactionsForCommission',$('#range-form').serialize(),'#transactions_table_holder',function(data){
        
        commission_rates['credit_card'] = is_shekel_display ? 0.035*currency_rate : 0.015;
  	    commission_rates['credit_card_over'] = is_shekel_display ? 0.055*currency_rate : 0.03;
  	    commission_rates['wire'] = is_shekel_display ? 0.07*currency_rate : 0.04;
  	         
        for(var i=0,j=data.length; i<j; i++){
           	   if($.inArray(data[i].clearedBy,commission_3d_list)!=-1){
                   data[i].type='Credit Card 3D Secure';
                }else if(data[i].paymentMethod=='Wire'){
                	
                	data[i].type='Wire';
                }else{
                	
                	data[i].type='Credit Card';
                	
                	
                }
               
            }; 
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "confirmTime", "sTitle": "Date", "sType": "date"},
            { "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "currency", "sTitle": "Curr"},  
            { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
            { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},
        //    { "mData": "originalAmountUSD", "sTitle": "Original Deposit USD", "sType": "numeric"},      
            { "mData": "type", "sTitle": "Transaction Type"},
            { "mData": "clearedBy", "sTitle": "Cleared By"},
            { "mData": "verification", "sTitle": "Verification"},
            { "mData": "employee", "sTitle": "Transaction Employee"},
            { "mData": "percentage", "sTitle": "Percent", "bUseRendered": false,
              "fnRender": function(oObj){
              	var percentage = (oObj.aData.percentage).substring(1);
              	percentage = (parseFloat(percentage)).toLocaleString();
              	return '%'+percentage; 
              }
            },
            { "mData": "split",
              "sTitle": "Split",
              "fnRender": function (oObj) {
              	    var color = oObj.aData.split=='Split' ? 'secondary' : 'blue';
                    return '<a href="#" data-id="'+oObj.aData.id+'" data-customer="'+oObj.aData.customerName+'" data-amount="'+oObj.aData.amount+'" data-employee="'+oObj.aData.employee+'" data-currency="'+oObj.aData.currency+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' btn-block getSplit">'+oObj.aData.split+'</a>';
                  }
            },
            { "mData": "note", "sTitle": "Note",
              "fnRender": function (oObj) {
              	    var text='';
              	    var color='';
              	    if(oObj.aData.note=='YES'){
              	    	text='Yes';
              	    	color='success';
              	    	}
              	    if(oObj.aData.note=='NO'){
              	    	text='No';
              	    	color='danger';
              	    	}
              	    
                    return '<a href="#" data-id="'+oObj.aData.id+'" data-employee="'+oObj.aData.employee+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' getChange">'+text+'</a>';
                  }
              },
              { "mData": "withdrawal", "sTitle": "Withdrawal",
               "fnRender": function (oObj) {
              	    
              	    var color='';
              	    if(oObj.aData.withdrawal=='Withdrawal'){
              	    	
              	    	color='danger';
              	    	}
              	    if(oObj.aData.withdrawal=='Pending'){
              	    
              	    	color='blue';
              	    	}
              	    if(oObj.aData.withdrawal=='Regular'){
              	    
              	    	color='default';
              	    	}
                    return '<a href="#" data-customerId="'+oObj.aData.customerId+'" class="btn btn-xs btn-'+color+' btn-block getWithdrawals">'+oObj.aData.withdrawal+'</a>';
                  }
              }  
            
            ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            	
            	var credit_card=0;
            	var real_credit_card=0;
            	var credit_card_bonus=0;
            	var c_3d=0;
            	var real_c_3d=0;
            	var c_3d_bonus=0;
            	var wire=0;
            	var real_wire=0;
            	var wire_bonus=0;
            	var withdrawals_bonus=0;
            	var extra_bonus=0;
            	var postponed_bonus=0;
            	var fines_bonus=0;
            	var total_deposits=0;
            	var real_total_deposits=0;
        /*    	var wire_2500=0;
            	var wire_2500_bonus=0;
            	var wire_5000=0;
            	var wire_5000_bonus=0;
            	var wire_10000=0;
            	var wire_10000_bonus=0;
            	var wire_25000=0;
            	var wire_25000_bonus=0;   Wire bonuses are canceled*/
            	var c_3d_2500=0;
            	var c_3d_2500_bonus=0;
            	var c_3d_5000=0;
            	var c_3d_5000_bonus=0;
            	var c_3d_10000=0;
            	var c_3d_10000_bonus=0;
            	var c_3d_25000=0;
            	var c_3d_25000_bonus=0;
            	var total_bonus=0;
            	var confirmMonth;
            	difference_bonus=0;
            	
            	
            	for ( var i=0 ; i<array.length ; i++ ){
                	array[i].real_c_3d=0;
                	array[i].real_wire=0;
                }
            	
            	for ( var i=0 ; i<aiDisplay.length ; i++ ){
            		
            		confirmMonth = new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM');
            		
            		if(aaData[aiDisplay[i]]['type']=='Credit Card'){
            			
            			credit_card += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);	
            		}
            		if(aaData[aiDisplay[i]]['type']=='Credit Card' && (aaData[aiDisplay[i]]['verification']=='Full' 
            		   || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            			
            			real_credit_card += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
            		}
            		
            		if(aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure'){
            			
            			c_3d += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);	
            		}
            		if(aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure' && (aaData[aiDisplay[i]]['verification']=='Full' 
            		   || (confirmMonth<'2016-08' &&  Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            			
            			for(var j=0;j<array.length;j++){
            				if(aaData[aiDisplay[i]].employeeId==array[j].employeeId){
            				
            				if(jQuery.inArray(array[j].employeeId,full_3d_bonus)!=-1){
            					array[j].real_c_3d += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
            				}else{
            					array[j].real_c_3d += parseFloat(aaData[ aiDisplay[i] ]['amountUSD'])*0.85;
            				}
            			}
            			}
            			
            			real_c_3d += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
            		}
            		
            		if(aaData[aiDisplay[i]]['type']=='Wire'){
            		   
            			wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);	
            		}
            		if(aaData[aiDisplay[i]]['type']=='Wire' && (aaData[aiDisplay[i]]['verification']=='Full' 
            		   || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            			
            			 	
            		    for(var j=0;j<array.length;j++){
            		      if(aaData[aiDisplay[i]].employeeId==array[j].employeeId){
            				 
            				if(jQuery.inArray(array[j].employeeId,full_wire_bonus)!=-1){
            					array[j].real_wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
            				}else{
            					array[j].real_wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD'])*0.85;
            				}
            			}
            			}
            			real_wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
            		}
         /*   		if(aaData[aiDisplay[i]]['clearedBy']=='Wire' && aaData[aiDisplay[i]]['amountUSD']>=2500 && aaData[aiDisplay[i]]['amountUSD']<5000){
            			
            			wire_2500 += 1;
            		}
            		if(aaData[aiDisplay[i]]['clearedBy']=='Wire' && aaData[aiDisplay[i]]['amountUSD']>=5000 && aaData[aiDisplay[i]]['amountUSD']<10000){
            			
            			wire_5000 += 1;
            		}
            		if(aaData[aiDisplay[i]]['clearedBy']=='Wire' && aaData[aiDisplay[i]]['amountUSD']>=10000 && aaData[aiDisplay[i]]['amountUSD']<25000){
            			
            			wire_10000 += 1;
            		}
            		if(aaData[aiDisplay[i]]['clearedBy']=='Wire' && aaData[aiDisplay[i]]['amountUSD']>=25000){
            			
            			wire_25000 += 1;
            		}  */
            		var amount_field = confirmMonth>='2016-06' ? 'originalAmountUSD' : 'amountUSD';
            		var percentage = parseFloat((aaData[aiDisplay[i]]['percentage']).substring(1));
        
            		if(is_shekel_display && aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure' && aaData[aiDisplay[i]]['amountUSD']>=2500 && aaData[aiDisplay[i]]['amountUSD']<5000 && 
            		   (aaData[aiDisplay[i]]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10') && 
            		   confirmMonth<='2016-04'){
            			
            			c_3d_2500 += 1;
            		}
            		if(is_shekel_display && aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure' && aaData[aiDisplay[i]][amount_field]>=5000 && aaData[aiDisplay[i]][amount_field]<10000 && 
            		   (aaData[aiDisplay[i]]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')  
            		   && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && aaData[aiDisplay[i]]['clearedBy']==commission_3d_list[0]))){      
            			
            		     c_3d_5000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		}
            		if(is_shekel_display && aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure' && aaData[aiDisplay[i]][amount_field]>=10000 && aaData[aiDisplay[i]][amount_field]<25000 && 
            		   (aaData[aiDisplay[i]]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')    
            		   && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && aaData[aiDisplay[i]]['clearedBy']==commission_3d_list[0]))){
            			
            			c_3d_10000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		}
            		if(is_shekel_display && aaData[aiDisplay[i]]['type']=='Credit Card 3D Secure' && aaData[aiDisplay[i]][amount_field]>=25000 && 
            		   (aaData[aiDisplay[i]]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(aaData[aiDisplay[i]]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')     
            		   && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && aaData[aiDisplay[i]]['clearedBy']==commission_3d_list[0]))){
            			
            			c_3d_25000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		}
            		
            	};
            	total_deposits = credit_card + c_3d + wire + total_extra + total_withdrawals + total_postponed;
            	real_total_deposits=real_credit_card + real_c_3d + real_wire + total_extra + total_withdrawals + total_postponed;
            	
            	var commission_rate_cc = total_deposits<70000 ? commission_rates['credit_card'] : commission_rates['credit_card_over'];
            	
            	credit_card_bonus = real_credit_card*commission_rate_cc*0.85;
            	for(var i=0; i<array.length;i++){
            		c_3d_bonus+=array[i].real_c_3d*commission_rate_cc;
            	}
            	withdrawals_bonus=(withdrawals.credit_card + withdrawals.c_3d)*commission_rate_cc*0.85;
            		
            	extra_bonus=(extra.credit_card + extra.c_3d)*commission_rate_cc*0.85;
            		
            	postponed_bonus=(postponed.credit_card + postponed.c_3d)*commission_rate_cc*0.85;
            	
            	for(var i=0; i<array.length;i++){
            		wire_bonus+=array[i].real_wire*commission_rates['wire'];
            	}
            	withdrawals_bonus += withdrawals.wire*commission_rates['wire']*0.85;
            	extra_bonus += extra.wire*commission_rates['wire']*0.85;
            	postponed_bonus += postponed.wire*commission_rates['wire']*0.85;
            	fines_bonus= is_shekel_display ? fines*currency_rate : fines;
         /*   	wire_2500_bonus=wire_2500*500;
            	wire_5000_bonus=wire_5000*750;
            	wire_10000_bonus=wire_10000*1500;
            	wire_25000_bonus=wire_25000*3000;   */
            	c_3d_2500_bonus=c_3d_2500*150;
            	c_3d_5000_bonus=c_3d_5000*300;
            	c_3d_10000_bonus=c_3d_10000*500;
            	c_3d_25000_bonus=c_3d_25000*1000;
            	total_bonus=credit_card_bonus + c_3d_bonus + wire_bonus + extra_bonus + fines_bonus + postponed_bonus + other_bonus + withdrawals_bonus + c_3d_2500_bonus + c_3d_5000_bonus + c_3d_10000_bonus + c_3d_25000_bonus + last_month_difference;
            	difference_bonus= total_bonus - paid_bonus;
            	
            	$('#credit_card').html('$'+credit_card.toLocaleString());
            	$('#real_credit_card').html('$'+real_credit_card.toLocaleString());
            	$('#c_3d').html('$'+c_3d.toLocaleString());
            	$('#real_c_3d').html('$'+real_c_3d.toLocaleString());
            	$('#wire').html('$'+wire.toLocaleString());
            	$('#real_wire').html('$'+real_wire.toLocaleString());
            	$('#withdrawals').html('$'+total_withdrawals.toLocaleString());
            	$('#real_withdrawals').html('$'+total_withdrawals.toLocaleString());
            	$('#extra').html('$'+total_extra.toLocaleString());
            	$('#real_extra').html('$'+total_extra.toLocaleString());
            	$('#fines').html('$'+fines.toLocaleString());
            	$('#real_fines').html('$'+fines.toLocaleString());
            	$('#postponed').html('$'+total_postponed.toLocaleString());
            	$('#real_postponed').html('$'+total_postponed.toLocaleString());
            	$('#other').html('$'+other.toLocaleString());
            	$('#real_other').html('$'+other.toLocaleString());
            	$('#total_deposits').html('$'+total_deposits.toLocaleString());
            	$('#real_total_deposits').html('$'+real_total_deposits.toLocaleString());
            	
        /*    	$('#wire_2500').html(wire_2500.toLocaleString());
            	$('#wire_5000').html(wire_5000.toLocaleString());
            	$('#wire_10000').html(wire_10000.toLocaleString());
            	$('#wire_25000').html(wire_25000.toLocaleString());    */
            	$('#c_3d_2500').html(c_3d_2500.toLocaleString());
            	$('#c_3d_5000').html(c_3d_5000.toLocaleString());
            	$('#c_3d_10000').html(c_3d_10000.toLocaleString());
            	$('#c_3d_25000').html(c_3d_25000.toLocaleString());
            	$('#credit_card_bonus').html(credit_card_bonus.toLocaleString());
            	$('#c_3d_bonus').html(c_3d_bonus.toLocaleString());
            	$('#wire_bonus').html(wire_bonus.toLocaleString());
            	$('#withdrawals_bonus').html(withdrawals_bonus.toLocaleString());
            	$('#extra_bonus').html(extra_bonus.toLocaleString());
            	$('#fines_bonus').html(fines_bonus.toLocaleString());
            	$('#other_bonus').html(other_bonus.toLocaleString());
            	$('#postponed_bonus').html(postponed_bonus.toLocaleString());
        /*   	$('#wire_2500_bonus').html('&#8362;'+wire_2500_bonus.toLocaleString());
            	$('#wire_5000_bonus').html('&#8362;'+wire_5000_bonus.toLocaleString());
            	$('#wire_10000_bonus').html('&#8362;'+wire_10000_bonus.toLocaleString());
            	$('#wire_25000_bonus').html('&#8362;'+wire_25000_bonus.toLocaleString());   */
            	$('#c_3d_2500_bonus').html(c_3d_2500_bonus.toLocaleString());
            	$('#c_3d_5000_bonus').html(c_3d_5000_bonus.toLocaleString());
            	$('#c_3d_10000_bonus').html(c_3d_10000_bonus.toLocaleString());
            	$('#c_3d_25000_bonus').html(c_3d_25000_bonus.toLocaleString());
            	$('#last_month_difference').html(last_month_difference.toLocaleString());
                $('#total_bonus').html(total_bonus.toLocaleString());
                $('#paid_bonus').html(paid_bonus.toLocaleString());
                $('#difference_bonus').html(difference_bonus.toLocaleString());
                $('#difference').removeClass('disabled');
                if($('#employee').val()!=0 && difference_data[0]!=null){
                	     console.log(difference_data[0]);
                         difference_data[0]==difference_bonus.toFixed(3) ? 
                         $('#difference').text('ADDED').removeClass('btn-secondary').addClass('btn-success') : 
                         $('#difference').text('ADDED').removeClass('btn-secondary').addClass('btn-danger');
                }   
            }
            
            });
            
 
       });
       });
       });
       });
      
  }
  
  function getWithdrawalsForCommission(){
  	  apiRequest('getWithdrawalsForCommission',$('#range-form').serialize(),'#withdrawal_table_holder',function(data){
  	  	  $('#withdrawal_table').dataTable( {
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Customer Id"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "amountUSD", "sTitle": "Amount USD","sType": "numeric"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "date", "sTitle": "Date","sType": "date"},
            { "mData": "employee", "sTitle": "Employee"}  
           ]
            
            });
  	  	
  	  	
  	  });
  	
  	
  }
  
 function getPenalty(){
 	
 	bootbox.dialog({
        title: "Withdrawals",
     //   className:"largeWidth",
        message:  
                   '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="penalty_table_holder"></div>'+
                    '<div class="row"> '+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-secondary" onclick="addPenalty();return false;">Add Withdrawal</a>'+
                    '</div>'+
                    '<div class=col-md-2></div>'+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-success" onclick="getPenaltyForCommission();return false;">Refresh</a>'+
                    '</div></div>'+
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="penalty_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getPenaltyForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           

 	   
 }
 
 function getPenaltyForCommission(){
 
 	apiRequest('getPenalty',$('#range-form').serialize(),'#penalty_table_holder',function(data){
            console.log("succes"); 
       
             $('#penalty_table').dataTable( {
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type","sType": "numeric"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "retentionWithdrawalId", "bVisible": false},
            { "mData": "penalty_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" data-retentionWithdrawalId="'+oObj.aData.retentionWithdrawalId+'" class="btn btn-xs btn-secondary deletePenalty">Delete</a>';
                  }
            }    
           ]
            });
            });
 }
 
function addPenalty(){
 	bootbox.dialog({
        title: "Add Withdrawal",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="penalty-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="penaltyDate" name="penaltyDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="penaltyEmployee" name="penaltyEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyCurrency">Currency</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="penaltyCurrency" name="penaltyCurrency" class="form-control"> ' +
                    '<option value="USD" >USD</option>' +
                    '<option value="EUR" >EUR</option>' +
                    '<option value="GBP" >GBP</option>' +
                    '<option value="JPY" >JPY</option>' +
                    '<option value="AUD" >AUD</option>' +
                    '<option value="CAD" >CAD</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="penaltyAmount" name="penaltyAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="penaltyType">Transaction Type</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="penaltyType" name="penaltyType" class="form-control"> ' +
                    '<option value="Credit Card" >Credit Card</option>' +
                    '<option value="Credit Card 3D Secure" >Credit Card 3D Secure</option>' +
                    '<option value="Wire" >Wire</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="reason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="reason" name="reason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#penaltyDate").val(new Date().format("yyyy-MM-dd"));'+
                     '$("#penaltyDate").datepicker(); '+
                      'getEmployeeForChange()'+
                      
                     '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addPenaltyTable();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
 }
 
 function addPenaltyTable(){
 	console.log($('#penalty-form').serialize());
 	 apiRequest('addPenaltyTable',$('#penalty-form').serialize(),'#transaction_table_holder',function(data){
      }); 
 }
 
function getExtra(){
 	
 	bootbox.dialog({
        title: "Extra Bonus",
      //  className:"largeWidth",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="extra_table_holder"></div>'+
                    '<div class="row"> '+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-secondary" onclick="addExtra();return false;">Add Extra</a>'+
                    '</div>'+
                    '<div class=col-md-2></div>'+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-success" onclick="getExtraForCommission();return false;">Refresh</a>'+
                    '</div></div>'+
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="extra_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getExtraForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
 
 	   
 }
 function getExtraForCommission(){
 
 	apiRequest('getExtra',$('#range-form').serialize(),'#extra_table_holder',function(data){
            console.log("succes"); 
       
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
        
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "extra_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteExtra">Delete</a>';
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
                    '<label class="col-md-4 control-label" for="extraEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="extraEmployee" name="extraEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraCurrency">Currency</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="extraCurrency" name="extraCurrency" class="form-control"> ' +
                    '<option value="USD" >USD</option>' +
                    '<option value="EUR" >EUR</option>' +
                    '<option value="GBP" >GBP</option>' +
                    '<option value="JPY" >JPY</option>' +
                    '<option value="AUD" >AUD</option>' +
                    '<option value="CAD" >CAD</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="extraAmount" name="extraAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extraType">Transaction Type</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="extraType" name="extraType" class="form-control"> ' +
                    '<option value="Credit Card" >Credit Card</option>' +
                    '<option value="Credit Card 3D Secure" >Credit Card 3D Secure</option>' +
                    '<option value="Wire" >Wire</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extra_reason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="extra_reason" name="extra_reason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#extraDate").val(new Date().format("yyyy-MM-dd"));'+
                     '$("#extraDate").datepicker(); '+
                      'getEmployeeForChange()'+
                      
                     '</script>'
                    ,
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
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
 }
 
function addExtraTable(){
 	
 	 apiRequest('addExtraTable',$('#extra-form').serialize(),'#transaction_table_holder',function(data){
      });  
 }
 
 function getPostponed(){
 	
 	bootbox.dialog({
        title: "Postponed Sales",
        className:"largeWidth",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="postponed_table_holder"></div>'+
                    '<div class="row"> '+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-secondary" onclick="addPostponed();return false;">Add Postponed</a>'+
                    '</div>'+
                    '<div class=col-md-2></div>'+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-success" onclick="getPostponedForCommission();return false;">Refresh</a>'+
                    '</div></div>'+
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="postponed_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getPostponedForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
 
 	   
 }
 
 function getPostponedForCommission(){
          
 	apiRequest('getPostponed',$('#range-form').serialize(),'#postponed_table_holder',function(data){
            console.log(data); 
            
         
            
             $('#postponed_table').dataTable( {
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "postponed_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deletePostponed">Delete</a>';
                  }
            }       
           ]
            
            });
            });
        
            
 }
 
 function addPostponed(){
 	bootbox.dialog({
        title: "Add Postponed Sale",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="postponed-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponedDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="postponedDate" name="postponedDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponedEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="postponedEmployee" name="postponedEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponedCurrency">Currency</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="postponedCurrency" name="postponedCurrency" class="form-control"> ' +
                    '<option value="USD" >USD</option>' +
                    '<option value="EUR" >EUR</option>' +
                    '<option value="GBP" >GBP</option>' +
                    '<option value="JPY" >JPY</option>' +
                    '<option value="AUD" >AUD</option>' +
                    '<option value="CAD" >CAD</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponedAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="postponedAmount" name="postponedAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponedType">Transaction Type</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="postponedType" name="postponedType" class="form-control"> ' +
                    '<option value="Credit Card" >Credit Card</option>' +
                    '<option value="Credit Card 3D Secure" >Credit Card 3D Secure</option>' +
                    '<option value="Wire" >Wire</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="extra_bonusMonth">PostPone To Month</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="extra_bonusMonth" name="extra_bonusMonth" class="form-control" data-date-format="yyyy-mm" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="postponed_reason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="postponed_reason" name="postponed_reason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                      
                    '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addPostponedTable();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
    var extra_bonusDay = new Date();
    
    $("#postponedDate").val(new Date().format("yyyy-MM-dd"));
    
    $("#extra_bonusMonth").val(new Date(extra_bonusDay.getFullYear(),extra_bonusDay.getMonth()+1,extra_bonusDay.getDate()).format("yyyy-MM"));
    $("#postponedDate,#extra_bonusMonth").datepicker();
    getEmployeeForChange();
    
 }
 
 function addPostponedTable(){
 	
 	 apiRequest('addPostponedTable',$('#postponed-form').serialize(),'#transaction_table_holder',function(data){
 	 	if(data){
 	 		getPostponedForCommission();
 	 	}
      });  
 }
 
 function getFines(){
 	
 	bootbox.dialog({
        title: "Commission Deduction",
        className:"largeWidth",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="fines_table_holder"></div>'+
                    '<div class="row"> '+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-secondary" onclick="addFines();return false;">Add Deduction</a>'+
                    '</div>'+
                    '<div class=col-md-2></div>'+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-success" onclick="getFinesForCommission();return false;">Refresh</a>'+
                    '</div></div>'+
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="fines_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getFinesForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
 
 	   
 }
 
 function getFinesForCommission(){
          
 	apiRequest('getFines',$('#range-form').serialize(),'#fines_table_holder',function(data){
            
             $('#fines_table').dataTable( {
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
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
         
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "fines_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteFines">Delete</a>';
                  }
            }     
           ]
            
            });
            });
        
            
 }
 
 function addFines(){
 	bootbox.dialog({
        title: "Add Commission Deduction",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="fines-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="finesDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="finesDate" name="finesDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="finesEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="finesEmployee" name="finesEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="finesCurrency">Currency</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="finesCurrency" name="finesCurrency" class="form-control"> ' +
                    '<option value="USD" >USD</option>' +
                    '<option value="EUR" >EUR</option>' +
                    '<option value="GBP" >GBP</option>' +
                    '<option value="JPY" >JPY</option>' +
                    '<option value="AUD" >AUD</option>' +
                    '<option value="CAD" >CAD</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="finesAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="finesAmount" name="finesAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="fines_reason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="fines_reason" name="fines_reason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#finesDate").val(new Date().format("yyyy-MM-dd"));'+
                     '$("#finesDate").datepicker(); '+
                      'getEmployeeForChange()'+
                      
                     '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addFinesTable();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
 }
 
 function addFinesTable(){
 	
 	 apiRequest('addFinesTable',$('#fines-form').serialize(),'#transaction_table_holder',function(data){
      });  
 }
 
function getOtherBonus(){
 	
 	bootbox.dialog({
        title: "Other Bonus",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="other_table_holder"></div>'+
                    '<div class="row"> '+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-secondary" onclick="addOtherBonus();return false;">Add Other Bonus</a>'+
                    '</div>'+
                    '<div class=col-md-2></div>'+
                    '<div class=col-md-1>'+
                    '<a href="" class="btn btn-s btn-success" onclick="getOtherBonusForCommission();return false;">Refresh</a>'+
                    '</div></div>'+
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="other_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getOtherBonusForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
 
 	   
 }
 
 function getOtherBonusForCommission(){
          
 	apiRequest('getOtherBonus',$('#range-form').serialize(),'#other_table_holder',function(data){          
             $('#other_table').dataTable( {
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
           "aaSorting": [[ 1, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "reason", "sTitle": "Reason"},
            { "mData": "other_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteOther">Delete</a>';
                  }
            }    
           ]
            
            });
            });
        
            
 }
 
 function addOtherBonus(){
 	bootbox.dialog({
        title: "Add Other Bonus",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="other-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="otherDate">Date</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="otherDate" name="otherDate" class="form-control" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="otherEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="otherEmployee" name="otherEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="otherCurrency">Currency</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select id="otherCurrency" name="otherCurrency" class="form-control"> ' +
                    '<option value="USD" >USD</option>' +
                    '<option value="EUR" >EUR</option>' +
                    '<option value="GBP" >GBP</option>' +
                    '<option value="ILS" >ILS</option>' +
                    '<option value="JPY" >JPY</option>' +
                    '<option value="AUD" >AUD</option>' +
                    '<option value="CAD" >CAD</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="otherAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="otherAmount" name="otherAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="other_reason">Reason</label> ' +
                    '<div class="col-md-4"> ' +
                    '<textarea type="text"  id="other_reason" name="other_reason" placeholder="Write Reason (Optional)" class="form-control">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    '$("#otherDate").val(new Date().format("yyyy-MM-dd"));'+
                    '$("#otherDate").datepicker(); '+
                    'getEmployeeForChange()'+  
                     '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addOtherBonusTable();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
 }
 
 function addOtherBonusTable(){
 	
 	 apiRequest('addOtherBonusTable',$('#other-form').serialize(),'#transaction_table_holder',function(data){
      });  
 } 
 
 function paidBonus(){
  	
  	var paidEmployee_div='';
  	
  	if($('#employee').val()==0){
  		paidEmployee_div = '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<select type="text" id="paidEmployee" name="paidEmployee" class="form-control"> ' +
                       '<option value="0" >All</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ';
  	}else{
  	   paidEmployee_div = '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="paidEmployee" name="paidEmployee" class="form-control" value="'+$("#employee option:selected").text()+'" onfocus="this.blur();">' +
                     '</div> ' +
                    '</div> ' ; 	
  		
  	}
  	bootbox.dialog({
        title: "Add Paid Amount",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="paid-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidDate">Month</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="paidDate" name="paidDate" class="form-control" value="'+new Date($("#dpEnd").val()).format("yyyy-MM")+'" data-date-format="yyyy-mm" data-date-autoclose="true" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div> ' +
                    paidEmployee_div +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="paidAmount" name="paidAmount" placeholder="Insert Amount" class="form-control">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    
                    
                    '</form> </div>  </div>'+
                
                    '<script>'+
                    
                      'if($("#employee").val()==0)'+
                           'getEmployeeForChange();'+
                      
                     '</script>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	addPaid();
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       
      }
    }
    }});
  	
  }
  
  function addPaid(){
  	 
  	  $.ajax({
  	    	 url: "/api.php?cmd=addPaid",
  	    	 type: "POST",
  	    	 data: $('#paid-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	data=='Same Amount' ? bootbox.alert("<h4>Amount is already added</h4>") : bootbox.alert("<h4>Amount is saved</h4>");
            	
             },
             error: function(x, t, m) {
             console.log(x);
             console.log(t);
             console.log(m);
  	    	 }	
  	    	 }
  	    	
  	    	
  	    	
  	    ).done(function(){
	     getTransactionsForCommission();
	     
	});
  	
  	
  	
  }
  
function getLastMonthDifference(){
 	
 	bootbox.dialog({
        title: "Last Month Differences",
        message:  
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="difference_table_holder"></div>'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="difference_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>'+
                    '<script>getLastMonthDifferenceForCommission();</script>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
 
 	   
}
 
function getLastMonthDifferenceForCommission(){
          
 	apiRequest('getDifference',$('#range-form').serialize(),'#difference_table_holder',function(data){
            for(var i=0;i<data.length;i++){
            	data[i].month=new Date(data[i].date).format('yyyy-MM');
            	data[i].employee=data[i].employeeId+' - '+data[i].employeeName;
            }
            $('#difference_table').dataTable( {
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
           "aaSorting": [[ 1, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "ID","bVisible":false},
            { "mData": "month", "sTitle": "Month","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "difference_delete",
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteDifference">Delete</a>';
                  }
            }     
           ]
            
            });
            });          
 }  
  
function differenceBonus(){
  	if($('#employee').val()==0){
  		bootbox.alert("<h4>Please choose an employee</h4>");
  		return;
  	}
  	var next_month=new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth()+1).format('yyyy-MM');
  	
  	bootbox.dialog({
  		 title: "Add Difference Bonus",
         message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="difference-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="differenceMonth">Next Month</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="differenceMonth" name="differenceMonth" class="form-control" value="'+next_month+'" data-date-format="yyyy-mm" data-date-autoclose="true" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="differenceEmployee">Employee</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input type="text" id="differenceEmployee" name="differenceEmployee" class="form-control" value="'+$('#employee option:selected').text()+'" data-date-format="yyyy-mm" data-date-autoclose="true" onfocus="this.blur();"> ' +
                    '<input type="hidden" id="differenceEmployeeId" id="differenceEmployeeId" name="differenceEmployeeId" value="'+$('#employee').val()+'"/>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="differenceAmount">Amount</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="differenceAmount" name="differenceAmount" value="'+difference_bonus.toFixed(3)+'" class="form-control" onfocus="this.blur();"/>' + 
                    '</div> </div>' +
                    
                    
                    '</form> </div>  </div>',
       buttons:{
       confirm:{
       	 label:"Confirm",
       	 className:"btn-success",
       	 callback: function(){
       	 	addDifference();
       	 }
       }}             
  }); 
}
  
function addDifference(){
  	  $.ajax({
  	    	 url: "/api.php?cmd=addDifference",
  	    	 type: "POST",
  	    	 data: $('#difference-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	
  	    	 	data=='Same Amount' ? bootbox.alert("<h4>Difference is already added</h4>") : bootbox.alert("<h4>Difference is saved</h4>");	
           },
           error: function(x, t, m) {
             console.log(x);
             console.log(t);
             console.log(m);
  	    	 }	
  	    }).done(function(){
	     getTransactionsForCommission(); 
	});
}   
 
function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
