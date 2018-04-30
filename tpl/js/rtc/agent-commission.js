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
  clean();
  getTransactionsForCommission();
}

function clean(){                                                 
        $('#transactionId').val('');
        $('#transactionEmployee').val('');
        $('#percentage').val('0');
        $('#splitPercentage').val('');
        $('#splitEmployee').select2('val','0',true);
}

var difference_bonus=0;
var global_userdata =[];

$(document).ready(function() {     
     $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker();     
     $("#employee, #splitEmployee").select2({width: "100%"});
     
     getLeverateDesk();
     getUserData(); 
     
     $('#desk').change(function(){
     	clean();
     	getLeverateEmployeesForRetention(true);
     	getTransactionsForCommission();
     });
     $('#dpStart,#dpEnd,#employee').change(function(){
     	clean();
     	getTransactionsForCommission();
     });
});

$( document ).on("click","a.getSplit",function() { 
          event.preventDefault();
          $('#transactionId').val($(this).attr('data-id'));
          $('#transactionEmployee').val($(this).attr('data-employee'));
          $('#percentage').val($(this).attr('data-percent'));
});
 
$(document).on('click','a.getSplitDelete',function(){       
       deleteSplit($(this).attr('data-id'));
});

 $( document ).on("click","#refresh",function() {    
    event.preventDefault();
    clean();
    getTransactionsForCommission();
 });
 
function getLeverateDesk(){
	 apiRequestBrand('getLeverateDesk', '', '#desk',true,capitalBrandName,function(data) {
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
			});
	}); 
}

function  getUserData(){
    
  	apiRequestSync('getUserData','','#employee',function(userdata){
                
  		global_userdata = userdata;
  		if (userdata.spotId==0) {
  			getLeverateEmployeesForRetention(true);
  			$('#refresh,#change').removeClass('disabled');
			$("#employee_col").show();
  			$("#desk_col").show();
  		}else{
  			$("#employee_col").remove();
  			if(userdata[globalBrandName+"Id"] != 0){
  			   $("#range-form").append('<input type="hidden" name="employee" value="'+userdata[globalBrandName+"Id"]+'"/>');
  			   getLeverateEmployeesForRetention(false);
  			   $('#refresh,#change').removeClass('disabled');
  			}
  		}
  		getTransactionsForCommission();
  	});	
}
 
function getLeverateEmployeesForRetention(commission_employee) {
    var dom = commission_employee==true ? '#employee,#splitEmployee' : '#splitEmployee';
    $(dom).find('option:not([value="0"])').remove();
    
    var param = "desk=" + $("#desk").val();
    apiRequestBrand('getLeverateEmployeesForRetention',param,'#transactions_table_holder',true,capitalBrandName,function(data){
      
      jQuery.each(data, function() {
        $(dom).append($('<option>', { value : this.userId }).text(this.employeeName)
        .attr('data-desk',this.BusinessUnitId)); 
      });
      
      if(commission_employee) $('#s2id_employee .select2-chosen').text($('#employee option:first-child').text()); // display first chosen employee;
      $('#s2id_splitEmployee .select2-chosen').text($('#splitEmployee option:first-child').text()); // display first chosen employee;
   
    });
    
}
  
function getSplit(){    
  	    if($('#transactionId').val()=='' || $('#transactionEmployee').val()==''){
  	    	bootbox.alert('<h4>Select A Transaction</h4>');
  	        
  	        return;  	    	
  	    }  	    
        if($('#splitEmployee').val()==0){    
  	    	bootbox.alert('<h4>Select An Employee</h4>'); 	 
  	    	return;
  	    } 
        var split=[];                             
        var split_employee = $("#splitEmployee").val();
        var split_percent = $("#splitPercentage").val();
        split.push({employee: split_employee,percent: split_percent});
        var post_data = {"split":JSON.stringify(split),"transactionId":$('#transactionId').val()};
            
  	    apiRequestBrand('addCommissionSplit',post_data,'#transactions_table_holder',true,capitalBrandName,function(data){
  	       clean();  	       
  	 	   var color = data ? 'success' : 'danger';
  	       var text = data=='Already Splitted' ? data : data ? 'Successful Split' : 'Unsuccessful Split';
  	       displayToolTip(color,text); 
  	 	   getTransactionsForCommission();
  	   });
}
           
function getTransactionsForCommission(){
  	   if(global_userdata[globalBrandName+"Id"] == undefined || (global_userdata['spotId'] != 0 && global_userdata[globalBrandName+"Id"] == 0)){
  	       bootbox.alert("<h4>The user is not defined at FM System. Please contact with HelpDesk</h4>");
  	       return false;
       }  
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
  	    	 	    
                   var all_bonuses = data["bonuses"];
                   
                   for(var i=0;i<all_bonuses.length;i++){
                       switch(all_bonuses[i].status){
            	       
            	       case 'Extra Bonus':
            	          if(all_bonuses[i].paymentMethod=="Credit Card")
            	             extra.credit_card += parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          if(all_bonuses[i].paymentMethod=="Wire")
            	             extra.wire += parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];       
            	          break;
            	       
            	       case 'Withdrawal':
            	          if(all_bonuses[i].paymentMethod=="Credit Card")
            	             withdrawals.credit_card -= parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          
            	          if(all_bonuses[i].paymentMethod=="Wire")
            	             withdrawals.wire -= parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          break;
            	       
            	       case 'Commission Deduction':
            	          fines-=parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	          break;
            	       
            	       case 'Postponed Sale':
            	          if(all_bonuses[i].paymentMethod=="Credit Card")
            	             postponed.credit_card -= parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
            	       
            	          if(all_bonuses[i].paymentMethod=="Wire")
            	             postponed.wire -= parseFloat(all_bonuses[i].amount)/rates[all_bonuses[i].currency];
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
            	       }
                  }
  	    	      total_extra=extra.credit_card + extra.wire;
  	    	      total_withdrawals=withdrawals.credit_card + withdrawals.wire;
  	    	      total_postponed=postponed.credit_card + postponed.wire;
  	    	
  	    	}
  	    }).done(function(){
 	        
  	    apiRequestBrand('getLeverateTransactionsForCommission',$('#range-form').serialize(),'#transactions_table_holder',true,capitalBrandName,function(data){

  		    commission_rates['credit_card'] = 0.035*currency_rate;
  	            commission_rates['credit_card_over'] = 0.055*currency_rate;
  	            commission_rates['wire'] = 0.055*currency_rate;
  		        
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
                            { "mData": "customerName", "sTitle": "Customer Name"},
                            { "mData": "currency", "sTitle": "Curr"},  
                            { "mData": "amount", "sTitle": "Deposit", "sType": "numeric"},
                            { "mData": "amountUSD", "sTitle": "Deposit USD", "sType": "numeric"},      
                            { "mData": "methodOfPayment", "sTitle": "Transaction Type"},
                            { "mData": "transactionEmployee", "sTitle": "Transaction Employee"},
                            { "mData": "percentage", "sTitle": "Percent", "bUseRendered": false,
                              "fnRender": function(oObj){
                	           return '%'+oObj.aData.percentage; 
                              }
                            },
                            { "mData": "split","sTitle": "Split",
                              "fnRender": function (oObj) {
                                    var color = oObj.aData.split=='Split' ? 'secondary' : 'blue';
                                    //console.log("%cSplit Data:" + JSON.stringify(oObj.aData),"color:brown");
                                    if(oObj.aData.split=='Split')  
                                       return '<a href="#" data-id="'+oObj.aData.depositId+'" data-employee="'+oObj.aData.transactionEmployee+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' btn-block getSplit">'+oObj.aData.split+'</a>';
                                   else
                                       return '<a href="#" data-id="'+oObj.aData.depositId+'" data-employee="'+oObj.aData.transactionEmployee+'" data-percent="'+oObj.aData.percentage+'" class="btn btn-xs btn-'+color+' btn-block getSplitDelete">'+oObj.aData.split+'</a>';
                                  }
                            },
                            { "mData": "note", "sTitle": "Note",
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
                                                        }
                                                }

                                                if(aaData[aiDisplay[i]]['methodOfPayment']=='Wire'){

                                                        wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                                        if(aaData[aiDisplay[i]] ['full_kyc']){
                                                  			     real_wire += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                                                        }
                                                }


                                           };
                                           total_deposits = credit_card + wire + total_extra + total_withdrawals + total_postponed;
                                           real_total_deposits=real_credit_card + real_wire + total_extra + total_withdrawals + total_postponed;

                                           var commission_rate_cc = total_deposits<70000 ? commission_rates['credit_card'] : commission_rates['credit_card_over'];

                                           credit_card_bonus = real_credit_card*commission_rate_cc*0.85;
                                           wire_bonus=real_wire*commission_rates['wire']*0.85;
                                           withdrawals_bonus=(withdrawals.credit_card*commission_rate_cc+ withdrawals.wire*commission_rates['wire'])*0.85;
                                           extra_bonus=(extra.credit_card*commission_rate_cc+extra.wire*commission_rates['wire'])*0.85;
                                           postponed_bonus=(postponed.credit_card*commission_rate_cc+postponed.wire*commission_rates['wire'])*0.85;
                                           fines_bonus= fines*currency_rate;

                                           total_bonus=credit_card_bonus + wire_bonus + extra_bonus + fines_bonus + postponed_bonus + other_bonus + withdrawals_bonus+ last_month_difference;
                                           
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
                                           
                                          
                            }

                            });
                    });
                });
            });
       //});
}


function getLastMonthDifference(){ 	
 	if(global_userdata[globalBrandName+"Id"] == undefined || (global_userdata['spotId'] != 0 && global_userdata[globalBrandName+"Id"] == 0)){
 		bootbox.alert("<h4>The user is not defined at FM System. Please contact with HelpDesk</h4>");
  	    return false;
 	}
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
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"}     
           ]
            
            });
            });          
 }
 
function getCommissionBonus(bonusType){
 	if(global_userdata[globalBrandName+"Id"] == undefined || (global_userdata['spotId'] != 0 && global_userdata[globalBrandName+"Id"] == 0)){
 		bootbox.alert("<h4>The user is not defined at FM System. Please contact with HelpDesk</h4>");
  	    return false;
 	}
 	$('body').addClass('modal-scroll');
 	bootbox.dialog({
        title: bonusType,
        message:    '<div class="row">' +     
                    '<div class="col-md-12">' +
                    '<div id="bonus_table_holder"></div>'+ 
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
                { "mData": "reason", "sTitle": "Reason", "sClass":"columnX"}      
                ]
              });
      });
}
  
function deleteSplit(transaction_id){
     
  	 bootbox.confirm('<h4>Are you sure to delete the split?</h4>',function(result){
  	 	 if(result){
  	 	 	apiRequestBrand('deleteCommissionSplit','transactionId='+transaction_id,'#transactions_table_holder',true,capitalBrandName,function(data){
  	 	 		  clean();        
                  var color = data ? 'success' : 'danger';
                  var text = data=='Already Deleted' ? data : data ? 'Deleted Split' : 'Unsuccessful Delete';                          
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
