window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.info('%cScript Error: See Browser Console for Detail','font-size:18px;color:darkred');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log("%c Error JS:" + message,"font-size:12px;color:indigo");
    }

    return true;
};
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
   
   getTransactionsForCommission();
}
var global_userdata =[];

var difference_bonus=0;
  
$(document).ready(function() {
	 
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
	 $('#dpStart, #dpEnd').datepicker();
     
     $("#employee").select2({width: "100%"});
     
     getUserData();
	 getLeverateDesk();
     getLeverateEmployeesForRetention();
     getTransactionsForCommission();
     
     $('#desk').change(function(){
     	getLeverateEmployeesForRetention();
     	getTransactionsForCommission();
     });
     
     $('#dpStart,#dpEnd,#employee').change(function(){
     	getTransactionsForCommission();
     });
});

$(document).off('keyup paste cut change','.validation').on('keyup paste cut change','.validation',function(e){
    	var selectorId= $(this).attr('id');
    	$(this).removeClass('red-border');
    	$('#error_'+selectorId).html('');
    });

$( document ).on("click","a.deleteBonus",function() {
     	var bonusType = $(this).attr("data-bonusType");
     	var post_data={ id : $(this).attr("data-id"), bonusType : bonusType};
     	apiRequestBrand('deleteCommissionBonus',post_data,'#bonus_table_holder',true,capitalBrandName,function(data){
     	    getBonusForCommission(bonusType);
     	});	
});

$( document ).on("click","a.deleteDifference",function() {
     	var post_data = { id : $(this).attr("data-id") };
     	apiRequestBrand('deleteCommissionDifference',post_data,'#difference_table_holder',true,capitalBrandName,function(data){
     	    getLastMonthDifferenceForCommission();
     	});	
});

$( document ).on("click","a.getSplit",function() {
       	event.preventDefault();
        var transaction_id = $(this).attr('data-depositId');
        var transaction_employee = $(this).attr('data-employee');
        var transaction_percent = $(this).attr('data-percent');
        var customer_name = $(this).attr('data-customer');
        var amount = parseFloat($(this).attr('data-amount'));
        var currency = $(this).attr('data-currency');
        transaction_percent == '100' ? addSplitModal(transaction_id,transaction_employee,customer_name,amount,currency) : deleteSplit(transaction_id); 
});

$( document ).on("click","a.getChange",function() {
	    event.preventDefault();
	    var transaction_id = $(this).attr('data-depositId');
	    var transaction_employee = $(this).attr('data-employee');
	    var change = $(this).attr('data-change');
	    change == 'Change' ? addChangeModal(transaction_id,transaction_employee) : deleteChange(transaction_id); 
});

$( document ).on("click","a.deleteRate",function() {
    var employee = $('#employee').val();
    var post_data={ rowId : $(this).attr("data-id"), agentId : employee};
    apiRequestBrand('deleteAgentRates', post_data, '#rates_table_holder', false, capitalBrandName, function(data){
        $('#rates_refresh').trigger('click');
    });
});

$( document ).on("click","a.updateRate",function() {
    setAgentRates( $(this).attr("data-id") );
});

$( document ).on("change", "#employee", function () {
    if( $(this).val()  == '0') {
        $('#agentRates').addClass('disabled');
    }
});

function getLeverateDesk(){
	 apiRequestBrand('getLeverateDesk', '', '#desk',true,capitalBrandName,function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
			});
	}); 
}

function getLeverateEmployeesForRetention () {

    $('#employee')
    .find('option:not([value="0"])')
    .remove();
    var param = "desk=" + $("#desk option:selected").val();

    apiRequestBrand('getLeverateEmployeesForRetention',param,'#transactions_table_holder',false,capitalBrandName,function(data){
      
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
                .text(this.employeeName)
                .attr('data-desk',this.BusinessUnitId)); 
      });
      
      $('#s2id_employee .select2-chosen').text($('#employee option:first-child').text()); // display first chosen employee;
     
    });
    
}

function getEmployeesForModal(){
	
    apiRequestBrand('getLeverateEmployeesForRetention',$('#range-form').serialize(),'',true,capitalBrandName,function(data){
      
      jQuery.each(data, function() {
        $('#bonusEmployee,#changeEmployee,#paidEmployee').append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });
        
    });
}

function getEmployeesForSplit(){
     
     apiRequestBrand('getLeverateEmployeesForRetention',$('#range-form').serialize(),'',true,capitalBrandName,function(data){
    	
    	jQuery.each(data, function() {
    	 	
           $('select.transaction_employees').append($('<option>', { value : this.userId })
                  .text(this.employeeName)); 
      	
        });
     }); 
     
  }

function getTransactionsForCommission(){
	
	$('#difference').addClass('disabled');
  	$('#difference').text('ADD').removeClass('btn-danger btn-success').addClass('btn-secondary');
  	var employee = $('#employee').val();
  	var currency_rate = 3.8; 
        var desk = $('#desk').val();
  	var fines=0;
  	var withdrawals={
  	    	       "credit_card":0,
  	    	       "wire":0
  	               };
  	var postponed={
  	    	       "credit_card":0,
  	    	       "wire":0
  	               };
  	var extra={
  	    	       "credit_card":0,
  	    	       "wire":0
  	               };
  	var total_withdrawals=0;
  	var total_postponed=0;
  	var total_extra=0;
  	var other=0;
  	var other_bonus=0;
  	var paid_bonus=0;
  	var difference_data= 0 ; 
  	var last_month_difference=0;
  	var commission_rates=[];
    var fadeOutFadeIn = true;
    var commission_currency;
  	
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
  	    	 url: "/api"+capitalBrandName+".php?cmd=getAllCommissionBonuses",
  	    	 type: "POST",
  	    	 data: $('#range-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){ 
                 if(desk == "0" && employee != "0"){
                    desk = $('#employee option:selected').attr('data-desk');
                 }
                 commission_currency = getCommissionCurrency(desk,employee,data['commission_currencies']);
                 
                 if(commission_currency == 'ILS') {
                    currency_rate = data['currency_rate'] ? parseFloat(data['currency_rate']) : currency_rate;
                 }
                 else {
                    currency_rate = typeof rates[commission_currency] !== 'undefined' ? rates[commission_currency] : 1;
                 }
                 
                 var currencyClassList = $('.currency').attr('class').split(/\s+/);
                  $.each(currencyClassList, function(index, className) {
                      if (className === commission_currency.toLowerCase()+"-currency") {
                          fadeOutFadeIn = false;
                      }
                  });
                 
  	    	 	   paid_bonus = data['paid'] ? parseFloat(data['paid']['amount']) : 0;

                   commission_rates = data['rates'];
                   for(key in commission_rates) {
                        commission_rates[key]['real_credit_card'] = 0;
                        commission_rates[key]['real_wire'] = 0;
                        commission_rates[key]['real_extra_credit_card'] = 0;
                        commission_rates[key]['real_extra_wire'] = 0;
                        commission_rates[key]['real_withdrawal_credit_card'] = 0;
                        commission_rates[key]['real_withdrawal_wire'] = 0;
                        commission_rates[key]['real_postponed_credit_card'] = 0;
                        commission_rates[key]['real_postponed_wire'] = 0;
                        commission_rates[key]['credit_card'] = (data['rates'][key]['RateCreditCardLower'] / 100) * currency_rate;
                        commission_rates[key]['credit_card_over'] = (data['rates'][key]['RateCreditCardUpper'] / 100) * currency_rate;
                        commission_rates[key]['wire'] = (data['rates'][key]['RateWire'] / 100) * currency_rate;
                   }

                   var all_bonuses = data["bonuses"];
                   
                   for(var i=0;i<all_bonuses.length;i++){
                       switch(all_bonuses[i].status){
            	       
            	       case 'Extra Bonus':
            	          if(all_bonuses[i].paymentMethod=="Credit Card") {
                              extra.credit_card += parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency], all_bonuses[i].date, 'real_extra_credit_card');
                          }

            	          if(all_bonuses[i].paymentMethod=="Wire") {
                              extra.wire += parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency], all_bonuses[i].date, 'real_extra_wire');
                          }
            	          break;
            	       
            	       case 'Withdrawal':
            	          if(all_bonuses[i].paymentMethod=="Credit Card") {
                              withdrawals.credit_card -= parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, -(parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency]), all_bonuses[i].date, 'real_withdrawal_credit_card');
                          }
            	          
            	          if(all_bonuses[i].paymentMethod=="Wire") {
                              withdrawals.wire -= parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, -(parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency]), all_bonuses[i].date, 'real_withdrawal_wire');
                          }
            	          break;
            	       
            	       case 'Commission Deduction':
            	          fines-=parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          break;
            	       
            	       case 'Postponed Sale':
            	          if(all_bonuses[i].paymentMethod=="Credit Card") {
                              postponed.credit_card -= parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, -(parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency]), all_bonuses[i].date, 'real_postponed_credit_card');
                          }
            	       
            	          if(all_bonuses[i].paymentMethod=="Wire") {
                              postponed.wire -= parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency];
                              setDataForBonus(commission_rates, -(parseFloat(all_bonuses[i].amount) / rates[all_bonuses[i].currency]), all_bonuses[i].date, 'real_postponed_wire');
                          }
            	          break;
            	       
            	       case 'Other Bonus':
                        other       += parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          if(commission_currency != all_bonuses[i].currency){
                          other_bonus += (parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency])*currency_rate;
                        }
                        else{
                          other_bonus += parseFloat(all_bonuses[i].amount);
                        }
                          
            	          break;
            	       
            	       case 'Retention Difference':
            	          all_bonuses[i].date==new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth()+1,1).format('yyyy-MM-dd') ?
  	    	 		      difference_data += parseFloat(all_bonuses[i].amount) :
  	    	 		      last_month_difference+=parseFloat(all_bonuses[i].amount);
            	       break;
            	       }
                  }
  	    	      total_extra=extra.credit_card + extra.wire;
  	    	      total_withdrawals=withdrawals.credit_card + withdrawals.wire;
  	    	      total_postponed=postponed.credit_card + postponed.wire; 	
  	    	
  	    	}
  	    	}).done(function(){	
                     
  	         apiRequestBrand('getLeverateTransactionsForCommission',$('#range-form').serialize(),'#transactions_table_holder',true,capitalBrandName,function(data){
  		        
  		        for(var i=0;i<data.length; i++){
  		           data[i].methodOfPayment = data[i].methodOfPayment!='Wire Transfer' ? 'Credit Card' : 'Wire';
  		        }
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
                "bAutoWidth": false,
                "aaData": data,
                "aaSorting": [[ 0, "asc" ]],                    
                "aoColumns": [
                { "mData": "ApprovedOn", "sTitle": "Date", "sType": "date"},
                { "mData": "depositId", "sTitle": "Deposit Id"},
             //   { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric", "bVisible": false},
                { "mData": "customerName", "sTitle": "Customer Name"},
                { "mData": "currency", "sTitle": "Curr"},  
                { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
                { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},     
                { "mData": "methodOfPayment", "sTitle": "Transaction Type"},
              //  { "mData": "employeeId", "bVisible": false},
                { "mData": "transactionEmployee", "sTitle": "Transaction Employee"},
                { "mData": "percentage", "sTitle": "Percent", "bUseRendered": false,
                 "fnRender": function(oObj){
                	return '%'+oObj.aData.percentage; 
                 }
                },
                { "mData": "split",
                "sTitle": "Split",
                "fnRender": function (oObj) {
              	    var color = oObj.aData.split=='Split' ? 'secondary' : 'blue';
                    return '<a href="#" data-depositId="'+oObj.aData.depositId+'" data-customer="'+oObj.aData.customerName+'" data-amount="'+oObj.aData.amount+'" data-employee="'+oObj.aData.transactionEmployee+'"'+
                           ' data-currency="'+oObj.aData.currency+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' btn-block getSplit">'+oObj.aData.split+'</a>';
                  }
                },
                { "mData": "change",
                 "sTitle": "Change Owner",
                 "fnRender": function (oObj) {
              	    var color;
              	    switch(oObj.aData.change){
              	    	case 'Changed':
              	    	   color = 'danger';
              	    	   break;
              	    	case 'Change':
              	    	   color = 'blue';
              	    	   break;
              	    	case '':
              	    	   color = 'secondary';
              	    	   break;      
              	    } 
                    return '<a href="#" data-depositId="'+oObj.aData.depositId+'" data-employee="'+oObj.aData.transactionEmployee+'" data-change="'+oObj.aData.change+'"'+
                           'class="btn btn-xs btn-'+color+' btn-block getChange" '+(oObj.aData.change=='' ? 'disabled' : '')+'>'+oObj.aData.change+'</a>';
                 }},
                 { "mData": "note", "sTitle": "Note", "bUseRendered": false,
                   "fnRender": function (oObj) {
              	    var color= oObj.aData.note=='No' ? 'danger': 'success';
              	    
                    return '<a href="#" class="btn btn-xs btn-'+color+'" onclick="event.preventDefault(); return false;">'+oObj.aData.note+'</a>';
                  }
                 }
                ],
                "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            	
            	  var credit_card=0;
            	  var real_credit_card=0;
            	  var credit_card_bonus=0;
            	  var wire=0;
            	  var real_wire=0;
            	  var wire_bonus=0;
            	  var withdrawals_bonus=0;
            	  var extra_bonus=0;
            	  var postponed_bonus=0;
            	  var fines_bonus=0;
            	  var total_deposits=0;
            	  var real_total_deposits=0;
            	  var total_bonus=0;
                var approved_on_date,today_date,time_diff,diff_days;
                
            	  difference_bonus=0;
            	
            	  console.log("Difference Bonus: "+difference_bonus);
            	  for ( var i=0 ; i<aiDisplay.length ; i++ ){
                  
                  var approved_on_date = new Date(aaData[aiDisplay[i]] ['ApprovedOn']);
                  var today_date = new Date();
                  var time_diff = Math.abs(today_date.getTime() - approved_on_date.getTime());
                  var diff_days = Math.floor(time_diff / (1000 * 3600 * 24)); 
                  
                  aaData[aiDisplay[i]] ['full_kyc'] = false;
                  if(aaData[aiDisplay[i]] ['Lv_SuppliedNecessaryDocuments'] == 1 || diff_days < 14){
                    aaData[aiDisplay[i]] ['full_kyc'] = true;
                  }
            		
            		if(aaData[aiDisplay[i]]['methodOfPayment']=='Credit Card'){

            			credit_card += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                  if(aaData[aiDisplay[i]] ['full_kyc']){
              		    real_credit_card += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);	
                      setDataForBonus(commission_rates, parseFloat(aaData[ aiDisplay[i] ]['amountUSD']), aaData[aiDisplay[i]]['ApprovedOn'], 'real_credit_card');
                  }
            		}
            		
            		if(aaData[aiDisplay[i]]['methodOfPayment']=='Wire'){

            			wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                  if(aaData[aiDisplay[i]] ['full_kyc']){
            			     real_wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                       setDataForBonus(commission_rates, parseFloat(aaData[ aiDisplay[i] ]['amountUSD']), aaData[aiDisplay[i]]['ApprovedOn'], 'real_wire');
                  }
            		}

            		
            	   };

                    total_deposits = credit_card + wire + total_extra + total_withdrawals + total_postponed;
                    real_total_deposits=real_credit_card + real_wire + total_extra + total_withdrawals + total_postponed;

                    commission_rate_cc = total_deposits<70000 ? 'credit_card' : 'credit_card_over';
                    console.log('deposits: '+total_deposits);
                    for(key in commission_rates) {
                        credit_card_bonus += commission_rates[key]['real_credit_card']*commission_rates[key][commission_rate_cc]*0.85;
                        wire_bonus += commission_rates[key]['real_wire']*commission_rates[key]['wire']*0.85;
                        withdrawals_bonus += (commission_rates[key]['real_withdrawal_credit_card']*commission_rates[key][commission_rate_cc]
                            + commission_rates[key]['real_withdrawal_wire']*commission_rates[key]['wire'])*0.85;
                        extra_bonus += (commission_rates[key]['real_extra_credit_card']*commission_rates[key][commission_rate_cc]
                            + commission_rates[key]['real_extra_wire']*commission_rates[key]['wire'])*0.85;
                        postponed_bonus += (commission_rates[key]['real_postponed_credit_card']*commission_rates[key][commission_rate_cc]
                            + commission_rates[key]['real_postponed_wire']*commission_rates[key]['wire'])*0.85;
                    }

                    for(key in commission_rates) {
                        commission_rates[key]['real_credit_card'] = 0;
                        commission_rates[key]['real_wire'] = 0;
                        commission_rates[key]['real_extra_credit_card'] = 0;
                        commission_rates[key]['real_extra_wire'] = 0;
                        commission_rates[key]['real_withdrawal_credit_card'] = 0;
                        commission_rates[key]['real_withdrawal_wire'] = 0;
                        commission_rates[key]['real_postponed_credit_card'] = 0;
                        commission_rates[key]['real_postponed_wire'] = 0;
                    }

            	   fines_bonus= fines*currency_rate;
            	
            	   total_bonus=credit_card_bonus + wire_bonus + extra_bonus + fines_bonus + postponed_bonus + other_bonus + withdrawals_bonus+ last_month_difference;
            	   difference_bonus= total_bonus - paid_bonus;

                    credit_card_bonus.toLocaleString();
                    wire_bonus.toLocaleString();
                    withdrawals_bonus.toLocaleString();
                    extra_bonus.toLocaleString();
                    postponed_bonus.toLocaleString();
                    fines_bonus.toLocaleString();
                    total_bonus.toLocaleString();
                    difference_bonus.toLocaleString();
                    paid_bonus.toLocaleString();
                    other_bonus.toLocaleString();
                    last_month_difference.toLocaleString();
                   
                   if(fadeOutFadeIn){
                      $('#commission_table').fadeOut(function(){
                      	 $('.currency').removeClass().addClass("currency " + commission_currency.toLowerCase()+"-currency");
                      	 $(this).fadeIn(); 
                      });  
                   }
            	   $('#credit_card').html('$'+credit_card.toLocaleString());
            	   $('#real_credit_card').html('$'+real_credit_card.toLocaleString());
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
            	
            	
            	   $('#credit_card_bonus').html(credit_card_bonus.toLocaleString());
            	   $('#wire_bonus').html(wire_bonus.toLocaleString());
            	   $('#withdrawals_bonus').html(withdrawals_bonus.toLocaleString());
            	   $('#extra_bonus').html(extra_bonus.toLocaleString());
            	   $('#fines_bonus').html(fines_bonus.toLocaleString());
            	   $('#other_bonus').html(other_bonus.toLocaleString());
            	   $('#postponed_bonus').html(postponed_bonus.toLocaleString());
            	   $('#last_month_difference').html(last_month_difference.toLocaleString());
                   $('#total_bonus').html(total_bonus.toLocaleString());
                   $('#paid_bonus').html(paid_bonus.toLocaleString());
                   $('#difference_bonus').html(difference_bonus.toLocaleString());
                   if(employee!='0') {
                       $('#difference').removeClass('disabled');
                       $('#agentRates').removeClass('disabled');
                   }

                   if(employee!=0 && difference_data!=0){
                	     console.log("Difference Data: "+difference_data+" Difference Bonus: "+difference_bonus.toFixed(3));
                         difference_data==difference_bonus.toFixed(3) ? 
                         $('#difference').text('ADDED').removeClass('btn-secondary btn-danger').addClass('btn-success') : 
                         $('#difference').text('ADDED').removeClass('btn-secondary btn-success').addClass('btn-danger');
                   }
                   
                   
            }
            
            
                
            });
  	   });
    });
    });
  	
}

 function paidBonus(){
   var paidEmployee_div='';
  	
  	if($('#employee').val()==0){
  		paidEmployee_div = '<div class="form-group"> ' +
                           '<label class="col-md-4 control-label" for="paidEmployee">Employee</label> ' +
                           '<div class="col-md-5"> ' +
                           '<select type="text" id="paidEmployee" name="paidEmployee" class="select2-offscreen validation"> ' +
                           '<option value="0" selected disabled>Choose Employee</option>' +
                           '</select>'+
                           '</div>' +
                           '</div>'
                           ;
                           
  	}else{
  	   paidEmployee_div = '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidEmployee">Employee</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input type="hidden" id="paidEmployee" name="paidEmployee" value="'+$('#employee').val()+'"/>'+
                    '<input type="text" class="form-control" value="'+$("#employee option:selected").text()+'" onfocus="this.blur();">' +
                     '</div>' +
                    '</div>' ; 	
  		
  	}
  	var paid_modal = bootbox.dialog({
        title: "Add Paid Amount",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="paid-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidDate">Month</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input type="text" id="paidDate" name="paidDate" class="form-control" value="'+new Date($("#dpEnd").val()).format("yyyy-MM")+'" data-date-format="yyyy-mm" data-date-autoclose="true" onfocus="this.blur();"> ' +
                     '</div> ' +
                    '</div> ' +
                    paidEmployee_div +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                    '<span id="error_paidEmployee" style="color:red;"></span>'+
                    '</div>'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="paidAmount">Amount</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="paidAmount" name="paidAmount" placeholder="Insert Amount" class="form-control validation">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                    '<span id="error_paidAmount" style="color:red;"></span>'+
                    '</div>'+ 
                    '</form> </div>  </div>'
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	var validation = validatePaid();
      	if(!validation){
      		return false;
      	}
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
    
    $(paid_modal[0]).removeAttr('tabindex');                
    if($("#employee").val()==0){
    	  $("#paidEmployee").select2({width: "100%"}).removeAttr('tabindex');               
          getEmployeesForModal();
    }

  }
  
  function addPaid(){
  	 
  	  $.ajax({
  	    	 url: "/api"+capitalBrandName+".php?cmd=addCommissionPaid",
  	    	 type: "POST",
  	    	 data: $('#paid-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	var color = data == true ? 'success' : 'danger';
  	            var text = data == true ? 'Paid Amount Saved' : 'Paid Amount NOT Saved';
  	       
  	            displayToolTip(color,text);
  	    	 	
            	
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
 
function differenceBonus(){
	
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
  	    	 url: "/api"+capitalBrandName+".php?cmd=addCommissionDifference",
  	    	 type: "POST",
  	    	 data: $('#difference-form').serialize(),
  	    	 dataType: "json",
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	var color = data ? 'success' : 'danger';
  	            var text = data ? data!='Difference is already added' ? 'Difference Saved' : data : 'Difference NOT Saved';
  	       
  	            displayToolTip(color,text);
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
                    '</div></div>',          
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	getTransactionsForCommission();
      }
    }
    
    }});
           
    getLastMonthDifferenceForCommission();
 	   
}

function getLastMonthDifferenceForCommission(){
          
 	apiRequestBrand('getCommissionDifference',$('#range-form').serialize(),'#difference_table_holder',true,capitalBrandName,function(data){
            for(var i=0;i<data.length;i++){
            	data[i].month=new Date(data[i].date).format('yyyy-MM');
            	
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
            { "mData": "employeeName", "sTitle": "Employee"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": null,
              "sTitle": "Delete",
              "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" class="btn btn-xs btn-secondary deleteDifference">Delete</a>';
                  }
            }     
           ]
            
            });
            });          
 }   

function getCommissionBonus(bonusType){
 	$('body').addClass('modal-scroll');
 	bootbox.dialog({
        title: bonusType,
        message:    '<div class="row">' +     
                    '<div class="col-md-12">' +
                    '<div id="bonus_table_holder"></div>'+ 
                    '<a href="" class="btn btn-s btn-secondary" onclick="event.preventDefault(); addBonus(\''+bonusType+'\');return false;">Add '+bonusType+'</a>'+
                    '&nbsp;&nbsp;'+
                    '<a href="" class="btn btn-s btn-success" onclick="event.preventDefault();getBonusForCommission(\''+bonusType+'\');return false;">Refresh</a>'+
                    '</div>'+
                    '<div class="col-md-12">'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="bonus_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div>',
                 
        buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	$('body').removeClass('modal-scroll');
      	getTransactionsForCommission();
      }
    }
    
    }});
    getBonusForCommission(bonusType);       	   
 }
 
 function getBonusForCommission(bonusType){
    var post_data = $('#range-form').serialize()+"&bonusType="+bonusType;
    
 	apiRequestBrand('getCommissionBonus',post_data,'#bonus_table_holder',true,capitalBrandName,function(data){
       
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
                "bAutoWidth": false,
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
                { "mData": "reason", "sTitle": "Reason", "sClass":"columnX"},
                { "mData": null, "sTitle": "Delete",
                  "fnRender": function (oObj) {
                    return '<a href="#" data-id="'+oObj.aData.id+'" data-bonusType="'+bonusType+'" class="btn btn-xs btn-secondary deleteBonus">Delete</a>';
                  }
                }      
                ]
              });
      });
 }

function addBonus(bonusType){
 
 	var bonus_modal = bootbox.dialog({
                  title: 'Add '+bonusType,
                  message: 
                    '<div class="row">' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="bonus-form"> ' +
                    '<input type="hidden" name="bonusType" value="'+bonusType+'" />'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusDate">Date</label> ' +
                    '<div class="col-md-5 col-sm-5 col-xs-5">' +
                    '<input type="text" id="bonusDate" name="bonusDate" placeHolder="Insert Date" class="form-control validation" data-date-format="yyyy-mm-dd" data-date-autoclose="true" onblur="this.value = this.value.trim()"> ' +
                    '</div> ' +
                    '</div> ' +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                    '<span id="error_bonusDate" style="color:red;"></span>'+
                    '</div>'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusEmployee">Employee</label> ' +
                    '<div class="col-md-5 col-sm-5 col-xs-5">' +
                    '<select type="text" id="bonusEmployee" name="bonusEmployee" class="select2-offscreen validation"> ' +
                       '<option value="0" selected disabled>Choose Employee</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                   '<span id="error_bonusEmployee" style="color:red;"></span>'+
                   '</div>'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusCurrency">Currency</label> ' +
                    '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
                    '<select id="bonusCurrency" name="bonusCurrency" class="form-control"> ' +
                    '<option value="1" >USD</option>' +
                    '<option value="2" >EUR</option>' +
                    '<option value="3" >GBP</option>' +
                    '<option value="4" >JPY</option>' +
                    '<option value="5" >AUD</option>' +
                    '<option value="6" >CAD</option>' +
                    (bonusType=='Other Bonus' ? '<option value="9">ILS</option>' : '')+
                    '</select>'+
                    '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusAmount">Amount</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="bonusAmount" name="bonusAmount" placeholder="Insert Amount" class="form-control validation" onblur="this.value = this.value.trim()">' + 
                    '</input>'+ 
                    '</div> </div>' +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                    '<span id="error_bonusAmount" style="color:red;"></span>'+
                    '</div>'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusPaymentMethod">Transaction Type</label> ' +
                    '<div class="col-md-5"> ' +
                    '<select id="bonusPaymentMethod" name="bonusPaymentMethod" class="form-control"> ' +
                    '<option value="1" >Credit Card</option>' +
                    '<option value="2" >Wire</option>' +
                    '</select>'+
                     '</div> ' +
                    '</div>' +
                    (bonusType == 'Postponed Sale' ? '<div class="form-group"> ' +
                                                     '<label class="col-md-4 control-label" for="extra_bonusMonth">PostPone To Month</label> ' +
                                                     '<div class="col-md-5"> ' +
                                                     '<input type="text" id="extra_bonusMonth" name="extra_bonusMonth" placeholder="Insert PostPone To Month" class="form-control validation" data-date-format="yyyy-mm" data-date-autoclose="true"> ' +
                                                     '</div> ' +
                                                     '</div> '+
                                                     '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                                                     '<span id="error_extra_bonusMonth" style="color:red;"></span>'+
                                                     '</div>' : '')+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="bonusReason">Reason</label> ' +
                    '<div class="col-md-5"> ' +
                    '<textarea type="text"  id="bonusReason" name="bonusReason" placeholder="Write Reason (Optional)" class="form-control" onblur="this.value = this.value.trim()">' + 
                    '</textarea>'+ 
                    '</div> </div>' +
                    '</form> </div>  </div>' 
                    ,
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	var validation = validateBonus();
      	if(!validation){
      		return false;
      	}
      	addCommissionBonus(bonusType);
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }
    }});
    $(bonus_modal[0]).removeAttr('tabindex');
    var extra_bonusDay = new Date($('#dpEnd').val());
    $("#bonusDate").val(new Date($('#dpEnd').val()).format("yyyy-MM-dd"))
                   .datepicker();
    console.log($('#dpEnd').val()+' '+extra_bonusDay.getFullYear()+' '+extra_bonusDay.getMonth()+' '+extra_bonusDay.getDate());               
    $("#extra_bonusMonth").val(new Date(extra_bonusDay.getFullYear(),extra_bonusDay.getMonth()+1,1).format("yyyy-MM"))
                          .datepicker();               
    $("#bonusEmployee").select2({width: "100%"}).removeAttr('tabindex');               
    getEmployeesForModal();
    
}
 
function addCommissionBonus(bonusType){
 	
 	apiRequestBrand('addCommissionBonus',$('#bonus-form').serialize(),'#bonus_table_holder',true,capitalBrandName,function(data){
        getBonusForCommission(bonusType);     
    });  
}
 
function validateBonus(){
	 var re = new RegExp(/^((([1-9][0-9]*))+(\.[0-9]{1,2})?|0\.[0-9]{1,2})$/);
	 var valid = 1;
	 
	 if($('#bonusDate').val() == ''){
	 	html='<h5 class="error">Please insert date</h5>';
        $('#error_bonusDate').html(html);
        $('#bonusDate').addClass('red-border');
        valid = 0;
	 }
	 if($('#extra_bonusMonth').val() == ''){
	 	html='<h5 class="error">Please insert postpone to month</h5>';
        $('#error_extra_bonusMonth').html(html);
        $('#extra_bonusMonth').addClass('red-border');
        valid = 0;
	 }
	 if($('#bonusEmployee').val() == null){
	 	html='<h5 class="error">Please select employee</h5>';
        $('#error_bonusEmployee').html(html);
        $('#bonusEmployee').addClass('red-border');
        valid = 0;
	 }
	 if($('#bonusAmount').val()=='' || !re.test($('#bonusAmount').val()) || $('#bonusAmount').val()==0){
	 	html='<h5 class="error">Please insert valid amount</h5>';
        $('#error_bonusAmount').html(html);
        $('#bonusAmount').addClass('red-border');
        valid = 0;
	 }else if(re.test($('#bonusAmount').val())){
	 	$amounts= ($('#bonusAmount').val()).split('.');
	 	if(($amounts[0]).length>8){
	 		html='<h5 class="error">Please insert valid amount (maximum 99999999.99)</h5>';
            $('#error_bonusAmount').html(html);
            $('#bonusAmount').addClass('red-border');
            valid = 0;
	 	}
	 	
	 }
	 
	 return valid;
}

function validatePaid(){
	var re = new RegExp(/^((([1-9][0-9]*))+(\.[0-9]{1,3})?|0\.[0-9]{1,3})$/);
	 var valid = 1;
	 
	 if($('#paidEmployee').val() == null){
	 	html='<h5 class="error">Please select employee</h5>';
        $('#error_paidEmployee').html(html);
        $('#paidEmployee').addClass('red-border');
        valid = 0;
	 }
	 if($('#paidAmount').val()=='' || !re.test($('#paidAmount').val()) || $('#paidAmount').val()==0){
	 	html='<h5 class="error">Please insert valid amount</h5>';
        $('#error_paidAmount').html(html);
        $('#paidAmount').addClass('red-border');
        valid = 0;
	 }else if(re.test($('#paidAmount').val())){
	 	$amounts= ($('#paidAmount').val()).split('.');
	 	if(($amounts[0]).length>12){
	 		html='<h5 class="error">Please insert smaller amount.</h5>';
            $('#error_paidAmount').html(html);
            $('#paidAmount').addClass('red-border');
            valid = 0;
	 	}
	 	
	 }
	 
	 return valid;
}

function addSplitModal(transaction_id,transaction_employee,customer_name,amount,currency){
  	 $('body').addClass('modal-scroll');
  	 var split_modal = bootbox.dialog({
        title: "Split Transaction",
                message: '<div class="row">  ' +
                    '<form id="split-form">'+
                    '<div class="col-md-12"> ' +
                    '<div class="col-md-3">'+
                    '<input type="hidden" class="form-control" id="transactionId" name="transactionId" value="'+transaction_id+'"">'+
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
      						var valid_split = setSplitDetails(amount);
      						if(!valid_split)
      						   return false;
      						$('body').removeClass('modal-scroll');   
      						addSplit(transaction_id);
      					}
    				},
    				danger: {
      					label: "Cancel",
      					className: "btn-danger",
      					callback: function(){
      						$('body').removeClass('modal-scroll');
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
                                '<option value="0">All</option>'+
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

    $('.transaction_percents').off('keyup paste cut').on('keyup paste cut',function(e){
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
  	 var post_data = {"split":JSON.stringify(split),"transactionId":transaction_id};
  	 console.log(post_data);
  	 apiRequestBrand('addCommissionSplit',post_data,'#transactions_table_holder',true,capitalBrandName,function(data){
  	 	   if(data=="Already Splitted"){
  	 	   	  bootbox.alert("<h4>Already Splitted</h4>",function(){
  	 	   	  	 getTransactionsForCommission();
  	 	   	  });
  	 	   }else{
  	 	   var color = data ? 'success' : 'danger';
  	       var text = data ? 'Successful Split' : 'Unsuccessful Split';
  	       
  	       displayToolTip(color,text); 
  	       
  	 	   getTransactionsForCommission();
  	 	   }
  	 });
  }
  
  function deleteSplit(transaction_id){
  	 bootbox.confirm('<h4>Are you sure to delete the split?</h4>',function(result){
  	 	 if(result){
  	 	 	apiRequestBrand('deleteCommissionSplit','transactionId='+transaction_id,'#transactions_table_holder',true,capitalBrandName,function(data){
  	 	 		  
  	 	 		  var color = data ? 'success' : 'danger';
  	              var text = data ? 'Deleted Split' : 'Unsuccessful Delete';
  	       
  	              displayToolTip(color,text);
  	 	 		  getTransactionsForCommission();
  	 	 		  
  	 	 	});
  	 	 }
  	 	   
  	 });
  }
  
  function addChangeModal(transaction_id,transaction_employee){
  	   $('body').addClass('modal-scroll');
  	   var change_modal = bootbox.dialog({
                          title: "Change Employee",
                          message: '<div class="row">  ' +
                                   '<div class="col-md-12"> ' +
                          		   '<form class="form-horizontal" id="employee-form"> ' +
                                   '<input type="hidden" name="transactionId"  value="' +transaction_id+ '"   class="form-control input-md" onfocus="this.blur()"> ' +
                                   '<div class="form-group"> ' +
                                   '<label class="col-md-4 col-sm-4 col-xs-4 control-label" for="changeEmployee">Transaction Employee</label> ' +
                                   '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
                                   '<input value=" '+ transaction_employee +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                                   '</div> ' +
                                   '</div>' +
                                   
                                   '<div class="form-group"> ' +
                                   '<label class="col-md-4 col-sm-4 col-xs-4 control-label" for="changeEmployee">Choose Employee</label> ' +
                                   '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
                                   '<select id="changeEmployee" name="changeEmployee" class="fselect2-offscreen validation">' + 
                                   '<option value="0" selected disabled>Choose Employee</option>' +
                                   '</select>'+
                                   '</div> ' +
                                   '</div>' +
                                   '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                                   '<span id="error_changeEmployee" style="color:red;"></span>'+
                                   '</div>'+
                                   '</form> </div>  </div>',
                          buttons: {
                             success: {
                              label: "OK",
                              className: "btn-success",
                              callback: function() {
      	                        if($('#changeEmployee').val()==null){
      	                        	html='<h5 class="error">Please select employee</h5>';
                                    $('#error_changeEmployee').html(html);
                                    $('#changeEmployee').addClass('red-border');
                                    return false;
      	                        }
      	                        $('body').removeClass('modal-scroll');
      	                        addChangeEmployee($('#employee-form').serialize());
                              }
                             },
                             danger: {
                              label: "Cancel",
                              className: "btn-danger",
                              callback: function(){
                              	$('body').removeClass('modal-scroll'); 
                              }
                             }
                     }});
    
    $(change_modal[0]).attr('id','split_modal').removeAttr('tabindex');
    $("#changeEmployee").select2({width: "100%"}).removeAttr('tabindex');
    getEmployeesForModal(); 
} 

function addChangeEmployee(post_data){
	apiRequestBrand('addCommissionChangeEmployee',post_data,'#transactions_table_holder',true,capitalBrandName,function(data){
		if(data=="Already Changed"){
  	 	   	bootbox.alert("<h4>Already Changed</h4>",function(){
  	 	   	  getTransactionsForCommission();
  	 	   	});
  	 	}else{
		var color = data ? 'success' : 'danger';
  	    var text = data ? 'Successful Change' : 'Unsuccessful Change';
  	       
  	    displayToolTip(color,text);
  	    getTransactionsForCommission();
  	    }
	});
}

function deleteChange(transaction_id){
	bootbox.confirm('<h4>Are you sure to delete the change?</h4>',function(result){
  	 	 if(result){
  	 	 	apiRequestBrand('deleteCommissionChangeEmployee','transactionId='+transaction_id,'#transactions_table_holder',true,capitalBrandName,function(data){
  	 	 		  
  	 	 		  var color = data ? 'success' : 'danger';
  	              var text = data ? 'Deleted Change' : 'Unsuccessful Delete';
  	       
  	                 displayToolTip(color,text);
  	 	 		     getTransactionsForCommission();
  	 	 	});
  	 	 }
  	 	   
  	 });
}

function displayToolTip(type, text, cbFunction) {
    setTimeout(function () {
        $('.tooltip').stop(true, true)
            .attr('class', 'tooltip')
            .addClass('tooltip-' + type)
            .html('<i class="fa fa-' + (type == "success" ? 'check' : 'times') + '" aria-hidden="true"></i>&nbsp; ' + text)
            .css({opacity: 1})
            .animate({opacity: 0}, 5000);
        if (cbFunction) cbFunction();
    }, 300);

}

function setAgentRates(rangeId) {
    var employee = $('#employee').val();
    if(rangeId == undefined) {
        rangeId = '';
    }

    apiRequestBrand('getAgentRates','agentId='+employee+'&id='+rangeId+'&default=','',true,capitalBrandName,function(rateData) {
        var r = rateData[0] ? rateData[0] : rateData['DEFAULT'];
        bootbox.dialog({
            title: "Set Employee Rates",
            message: '<div class="row">  ' +
            '<div class="col-md-12"> ' +
            '<form class="form-horizontal" id="agent-rates-form"> ' +
            '<input type="hidden" name="AgentId" value="'+ employee + '"> ' +
            '<input type="hidden" name="CommissionAgentRateId" value="'+ rangeId + '"> ' +

            '<div class="form-group"> ' +
            '<label class="col-md-4 control-label" for="StartDate">Start Date</label> ' +
            '<div class="col-md-5 col-sm-5 col-xs-5">' +
            '<input type="text" id="StartDate" name="StartDate" placeHolder="Insert Date" class="form-control input-md validation" data-date-format="yyyy-mm-dd" data-date-autoclose="true" required> ' +
            '</div> ' +
            '</div> ' +
            '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +
            '<span id="error_StartDate" style="color:red;"></span>'+
            '</div>'+

            '<div class="form-group"> ' +
            '<label class="col-md-4 control-label" for="EndDate">End Date</label> ' +
            '<div class="col-md-5 col-sm-5 col-xs-5">' +
            '<input type="text" id="EndDate" name="EndDate" placeHolder="Insert Date" class="form-control input-md" data-date-format="yyyy-mm-dd" data-date-autoclose="true"> ' +
            '</div> ' +
            '</div> ' +

            '<div class="form-group"> ' +
            '<label class="col-md-4 col-sm-4 col-xs-4 control-label" for="rateCcLower">Rate Credit Card Lower (%)</label> ' +
            '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
            '<input name="RateCreditCardLower" value="' + r.RateCreditCardLower + '" class="form-control input-md validation" id="RateCreditCardLower" required> ' +
            '</div> ' +
            '</div>' +
            '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +
            '<span id="error_RateCreditCardLower" style="color:red;"></span>'+
            '</div>'+
            
            '<div class="form-group"> ' +
            '<label class="col-md-4 col-sm-4 col-xs-4 control-label" for="rateCcUpper">Rate Credit Card Upper (%)</label> ' +
            '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
            '<input name="RateCreditCardUpper" value="' + r.RateCreditCardUpper + '" class="form-control input-md validation" id="RateCreditCardUpper" required> ' +
            '</div> ' +
            '</div>' +
            '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +
            '<span id="error_RateCreditCardUpper" style="color:red;"></span>'+
            '</div>'+

            '<div class="form-group"> ' +
            '<label class="col-md-4 col-sm-4 col-xs-4 control-label" for="ccUpper">Rate Wire (%)</label> ' +
            '<div class="col-md-5 col-sm-5 col-xs-5"> ' +
            '<input name="RateWire" value="' + r.RateWire + '" class="form-control input-md validation" id="RateWire" required> ' +
            '</div> ' +
            '</div>' +
            '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +
            '<span id="error_RateWire" style="color:red;"></span>'+
            '</div>'+

            '</form></div></div>',

            buttons: {
                success: {
                    label: "OK",
                    className: "btn-success",
                    callback: function() {

                        var fields = $( "#agent-rates-form :input" ).not(':hidden, [name$="Date"]').serializeArray();
                        text = '';
                        error = 0;
                        $.each( fields, function( i, field ) {
                            if( null == field.value.match(/^((([1-9][0-9]*))+(\.[0-9]{1,2})?|0\.[0-9]{1,2})$/) || parseFloat(field.value) > 100 ) {
                                error = 1;
                                text = '<h5>Insert valid number (eg: 5.55)</h5>';
                                $('#error_' + field.name).html( text );
                                $('input[name="' + field.name + '"]').addClass('red-border');
                            }
                        });
                        
                        if($('#StartDate').val()==''){
                        	   error = 1;
                        	   text = '<h5>Insert start date</h5>';
                        	   $('#error_StartDate').html(text);
                        	   $('#StartDate').addClass('red-border');
                        }
                        if( error == 1 ) {
                            return false;
                        }

                        $('body').removeClass('modal-scroll');

                        if(rangeId == '') {
                            addAgentRates($('#agent-rates-form').serialize());
                        } else {
                            updateAgentRates($('#agent-rates-form').serialize());
                        }
                    }
                },
                danger: {
                    label: "Cancel",
                    className: "btn-danger",
                    callback: function(){
                        $('body').removeClass('modal-scroll');
                    }
                }
            }
        });

        if(rangeId == '') {
            restrict = (r.EndDate == '') ? r.StartDate : r.EndDate;
            date = restrict ? new Date(restrict) : new Date();
            if(restrict)
               date.setDate(date.getDate() + 1);
            $('#StartDate').datepicker("setDate", date);
            $('#EndDate').datepicker();
        } else {
            $('#StartDate').datepicker("setDate", new Date(r.StartDate));
            if(r.EndDate != '') {
                $('#EndDate').datepicker("setDate", new Date(r.EndDate));
            } else {
                $('#EndDate').datepicker();
            }
        }

        // $('#agent-rates-form input').change(function () {
       /* $('#agent-rates-form input').off('keyup paste change').on('keyup paste change',function(e){
            $(this).removeClass('red-border');
            $('#error_' + $(this).attr('name') + ' h5').empty();
        });*/

    });
}

function addAgentRates(post_data) {
    apiRequestBrand('addAgentRates', post_data, '', false, capitalBrandName, function(data) {
        var color = data ? 'success' : 'danger';
        var text = data ? 'Data Saved' : 'Data not saved';
        displayToolTip(color,text);

        $('#rates_refresh').trigger('click');
    });
}

function updateAgentRates(post_data) {
    apiRequestBrand('updateAgentRates', post_data, '', false, capitalBrandName, function(data) {
        var color = data ? 'success' : 'danger';
        var text = data ? 'Data Saved' : 'Data not saved';
        displayToolTip(color,text);

        $('#rates_refresh').trigger('click');
    });
}

function showAgentRates() {
    var employee = $('#employee').val();

    $('body').addClass('modal-scroll');

    dialog_message = '<div class="row">' +
        '<div class="col-md-12">' +
        '<div id="bonus_table_holder"></div>';

    if(global_userdata[globalBrandName+"Id"] != 0) {
        dialog_message += '<a href="" class="btn btn-s btn-secondary" onclick="event.preventDefault(); setAgentRates();return false;">Add New Range</a>' +
            '&nbsp;&nbsp;';
    }

    dialog_message += '<a href="" id="rates_refresh" class="btn btn-s btn-success" onclick="event.preventDefault();getAgentRates(\'' + employee + '\');return false;">Refresh</a>'+
        '</div>'+
        '<div class="col-md-12">'+
        '<div class="table-responsive">' +
        '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="rates_table">' +
        '</table>'+
        '</div>'+
        '</div></div>';

    bootbox.dialog({
        title: "Agent Rates",
        message: dialog_message,

        buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function() {
                    $('body').removeClass('modal-scroll');
                    getTransactionsForCommission();
                }
            }

        }
    });

    getAgentRates(employee);

}

function getAgentRates(agentId) {

    apiRequestBrand('getAgentRates','agentId='+agentId,'#rates_table_holder',true,capitalBrandName,function(data){

        $('#rates_table').dataTable( {
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
            "bAutoWidth": false,
            "aaData": data,
            "dom": '<"toolbar">frtip',
            "aaSorting": [[ 1, "desc" ]],
            "aoColumns": [
                { "mData": "CommissionAgentRateId", "sTitle": "ID","bVisible":false},
                { "mData": "StartDate", "sTitle": "Start Date","sType":"date"},
                { "mData": "EndDate", "sTitle": "End Date","sType":"date"},
                { "mData": "RateCreditCardLower", "sTitle": "CC Lower"},
                { "mData": "RateCreditCardUpper", "sTitle": "CC Upper"},
                { "mData": "RateWire", "sTitle": "Wire"},
                { "mData": null, "sTitle": "Update", "bVisible": (global_userdata[globalBrandName+"Id"] != 0) ? true : false,
                    "fnRender": function (oObj) {
                        return '<a href="#" data-id="'+oObj.aData.CommissionAgentRateId+'" class="btn btn-xs btn-secondary updateRate">Update</a>';
                    }
                },
                { "mData": null, "sTitle": "Delete", "bVisible": (global_userdata[globalBrandName+"Id"] != 0) ? true : false,
                    "fnRender": function (oObj) {
                        return '<a href="#" data-id="'+oObj.aData.CommissionAgentRateId+'" class="btn btn-xs btn-secondary deleteRate">Delete</a>';
                    }
                }
            ]
        });
    });
}

function getUserData() {
    apiRequestSync('getUserData', '', '', function (userdata) {
        global_userdata = userdata;
    });
}

function setDataForBonus(commission_rates, amount, date, bonus_key) {
    add_range = null;
    for (var key in commission_rates) {

        if(key == 'DEFAULT')
            continue;

        commission_rates[key]['EndDate'] = commission_rates[key]['EndDate'] == '' ? new Date().format('yyyy-MM-dd') : commission_rates[key]['EndDate'];
        console.log(new Date(date).format("yyyy-MM-dd")+' '+commission_rates[key]['EndDate']);
        if(new Date(date).format("yyyy-MM-dd") >= commission_rates[key]['StartDate'] && new Date(date).format("yyyy-MM-dd") <= commission_rates[key]['EndDate']) {
            add_range = key;
            commission_rates[key][bonus_key] += amount;
            break;
        }
    }
    if(add_range == null && commission_rates.hasOwnProperty('DEFAULT'))
        commission_rates['DEFAULT'][bonus_key] += amount;
}

function getCommissionCurrency(desk,employee,commission_currencies){

  var commission_currency;

  // If the desk is different from all, will get bonus currency by desk business unit id
  if(desk != "0"){
      commission_currencies.forEach(function(currency_obj){
        if(currency_obj.id == desk){
          commission_currency = currency_obj.CurrencyCode;
        }
    });
  }

  // If the employee different from all, will get bonus currency by employee business unit id
  else if(employee != "0") {
      commission_currencies.forEach(function(currency_obj){
        if(currency_obj.id == employee){
          commission_currency = currency_obj.CurrencyCode;
        }
    });
  }

  // If no comission currency, return default: USD
  return (commission_currency ? commission_currency : 'usd');
}