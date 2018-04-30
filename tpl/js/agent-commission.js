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
        $('#transactionId').val('');
        $('#transactionEmployee').val('');
        $('#percentage').val('0');
        $('#splitPercentage').val('');
        $('#splitEmployee').select2('val','0',true);
}

$("#change-form").append('<input type="hidden" name="percentage"  id="percentage"   value="0" />');

//var global=0;
var firstDisplay=1;

$(document).ready(function() {
	 
	 
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker();
     
     $("#employee, #splitEmployee").select2({width: "100%"});
      
     getDesk(); 
     getEmployeesForRetention();
     clean();
     displayBonusFor3D($('#dpStart').val(),$('#dpEnd').val());
     getTransactionsForCommission(); 
     
     $( document ).on("click","a.getSplit",function() {
      	
      $('#transactionId').val($(this).attr('data-id'));
      $('#transactionEmployee').val($(this).attr('data-employee'));
      $('#percentage').val($(this).attr('data-percent'));
  }); 
     
     $( document ).on("click","#refresh",function() { 
        
        clean();
     	getTransactionsForCommission();
     });
         
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

    $('#employee,#splitEmployee')
    .find('option:not([value="0"])')
    .remove();
    
    
    var requestFunction = firstDisplay ? apiRequestSync : apiRequest; 
    
    
    requestFunction('getEmployeesForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      
      jQuery.each(data, function() {
        $('#employee,#splitEmployee')
        .append($('<option>', { value : this.userId })
                .text(this.userId + ' - ' + this.employeeName)
                .attr('data-desk',this.desk)); 
      });
      
      $('#s2id_employee .select2-chosen').text($('#employee option:first-child').text()); // display first chosen employee;
      $('#s2id_splitEmployee .select2-chosen').text($('#splitEmployee option:first-child').text()); // display first chosen employee;
      
      if(firstDisplay)
         getUserSpotId();
      
      firstDisplay=0;   
    });
    
}
  
function getSplit(){
  	    
  	    if($('#transactionId').val()=='' || $('#transactionEmployee').val()==''){
  	    	bootbox.alert('<h4>Select A Transaction</h4>');
  	        clean();
  	        return;
  	    	
  	    }
  	    
  	    if($('#percentage').val()=='%100' && $('#splitEmployee').val()==0){
  	    	bootbox.alert('<h4>Select An Employee</h4>'); 	 
  	    	return;
  	    }
  	    
  	   
  	    apiRequest('getSplit',$('#change-form').serialize(),'#transactions_table_holder',function(data){
  	       clean();
  	       var color = data ? 'success' : 'danger';
  	       var text = data ? data : 'Unsuccesful Split';
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
  
  
function getTransactionsForCommission(){
  	    
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
  	    var last_month_difference=0;     
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
                 
                 console.log('Rates DownLoad Success');
                 
                 rates = data.rates;
                
        }).done(function(){ 
  	     
  	     $.ajax({
  	    	 url: "/api.php?cmd=getAllExtras",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	   
  	    	 	   console.log('All Extras Success');
  	    	 	   
  	    	 	   currency_rate = data['currency_rate'] ? parseFloat(data['currency_rate']['rate']) : currency_rate;
  	    	 	   
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
            	       if(all_extras[i].date==new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth(),1).format('yyyy-MM-dd')) 
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
                    return '<a href="#" data-id="'+oObj.aData.id+'" data-employee="'+oObj.aData.employee+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' btn-block getSplit">'+oObj.aData.split+'</a>';
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
            	var wire_25000_bonus=0;  Wire bonuses are canceled */
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
            }
            
            });
            
 
       });
       });
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
                    '<div id="penalty_table_holder">'+
                    
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="penalty_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>'+
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
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type","sType": "numeric"},
            { "mData": "reason", "sTitle": "Reason"}  
           ]
            });
            });
 }
 
 function getExtra(){
 	
 	bootbox.dialog({
        title: "Extra Bonus",
     //   className:"largeWidth",
        message:  
                   '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="extra_table_holder">'+
                    
                    '<div class="table-responsive">' +

				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="extra_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>'+
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
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type"},
            { "mData": "reason", "sTitle": "Reason"}  
           ]
            });
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
            console.log("succes"); 
            
         
            
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
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "type", "sTitle": "Transaction Type"},
            { "mData": "reason", "sTitle": "Reason"}  
           ]
            
            });
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
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
         
            { "mData": "reason", "sTitle": "Reason"}  
           ]
            
            });
            });
        
            
 }
 
function getOtherBonus(){
 	
 	bootbox.dialog({
        title: "Other Bonus",
        message:  
                    
                    '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="other_table_holder"></div>'+
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
            { "mData": "reason", "sTitle": "Reason"}
           ]
            
            });
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
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"}    
           ]
            });
            });          
 }    
 
function  getUserSpotId(){
  	apiRequestSync('getUserSpotId',$('#range-form').serialize(),'#transaction_table_holder',function(spotId){

  		if (spotId==0) {
  			$('#desk_col').show();
  			$('#employee_col').show();
       }else {
       	   $('#employee option[value="'+spotId+'"]').attr('selected',true);
       }
       console.log('First Chosen Employee:'+$('#employee').val());
    });
   }
   
function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
   
