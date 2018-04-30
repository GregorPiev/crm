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

$("#range-form").append('<input type="hidden" name="desk"  id="desk"/>'+
                        '<input type="hidden" name="employee"  id="employee"/>'
                          );

var employee_desk;

$(document).ready(function() {
	var commission_form =JSON.parse(localStorage.getItem('commission-form'));
	console.log(commission_form);
	$('#dpStart').val(commission_form.dpStart);
	$('#dpEnd').val(commission_form.dpEnd);
	$('#desk').val(commission_form.desk);
	$('#desk_text').val(commission_form.desk_text);
	$('#employee').val(commission_form.employee);
	$('#employee_text').val(commission_form.employee_text);
	employee_desk = parseFloat(commission_form.employee_desk);
    getTransactionsForCommission();
});

function goBack() {
	var url = window.location.protocol + '//' + window.location.host + '/' +globalBrandName+ '/analytics/commission';
    window.location = url;
    return false;
}

function getPDF(){
 	var pdf = new jsPDF($('#content'),'pt','a4');
        pdf.addHTML($('#content'),function() {
        pdf.save('summary_'+$('#desk_text').val()+'_'+$('#employee_text').val()+'.pdf');
         });
}  

function getTransactionsForCommission(){
	var real_data=[], unique=[], exclude=["2378","2357","2343","2421","2290"];
	apiRequest('getTransactionsForCommission',$('#range-form').serialize(),'#summary_table_holder',function(data){
		for(var i=0;i<data.length;i++){
			
			if(unique[data[i].employeeId]==1 || jQuery.inArray(data[i].employeeId,exclude)!=-1){
				continue ; 
			}
			real_data.push({"inventivaId"          :data[i].inventivaId,
				            "employeeId"           :data[i].employeeId,
			                "employeeName"         :data[i].employeeName,
			                "credit_card"          :0,
			                "real_credit_card"     :0,
			                "credit_card_bonus"    :0,
			                "c_3d"                 :0, 
			                "real_c_3d"        	   :0,
			                "c_3d_bonus"           :0,
			                "wire"                 :0,
			                "real_wire"            :0,
			                "wire_bonus"           :0,
			                
			                "extra"                :{
  	    	                                       "credit_card":0,
  	    	                                       "c_3d":0,
  	    	                                       "wire":0
  	                                               },
			                "withdrawals"          :{
  	    	                                       "credit_card":0,
  	    	                                       "c_3d":0,
  	    	                                       "wire":0
  	                                               },
			                "postponed"            :{
  	    	                                       "credit_card":0,
  	    	                                       "c_3d":0,
  	    	                                       "wire":0
  	                                               },
			                "fines"                :0,
			                "other"                :0,
			                "other_bonus"          :0, 
			                "c_3d_2500"            :0,
			                "c_3d_5000"            :0,
			                "c_3d_10000"           :0,
			                "c_3d_25000"           :0,
			                "last_month_difference":0
			                    });
			unique[data[i].employeeId]=1;
		}
	    
	    getSummary(real_data,data); 
	
	
	});
	
	
 }

function getSummary(real_data,commission_data){
	    var full_3d_bonus=[];
        var full_wire_bonus=[];
        var commission_3d_list=[];
        var confirmMonth;
        
  	    if(new Date($('#dpEnd').val()).format("yyyy-MM")=='2015-10'){
  	    	full_3d_bonus=['2450','2518','2474','2479','2481','188','2559'];
            full_wire_bonus=['2450','2518','2474','2479','2481','188','2559'];
  	    } // full_3d and full_wire only for october 2015
  	    
  	    var currency_rate = 3.8;
  	    var total_withdrawals=0;
  	    var total_postponed=0;
  	    var total_extra=0;
  	    var paid_bonus=0;     
  	    
  	    var commission_rates=[];
  	    
  	    var shekel_desks = [0,4];
  	    var desk = parseFloat($('#desk').val());
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
        	
  	    apiRequest('getAllExtras',$('#range-form').serialize(),'#summary_table_holder',function(data){
  	    	 	   
  	    	 	   currency_rate = data['currency_rate'] ? parseFloat(data['currency_rate']['rate']) : currency_rate;
  	    	 	   
  	    	 	   
  	    	 	   for(var index in data["3d_list"]){
  	    	 	   	  commission_3d_list.push(data["3d_list"][index]["processor"]);
  	    	 	   }
  	    	 	  
                   var all_extras = data["extras"];

                   for(var i=0;i<all_extras.length;i++){
                       for(var j=0;j<real_data.length;j++){
                        if(all_extras[i].employeeId==real_data[j].employeeId){
                          switch(all_extras[i].status){
            	       
            	           case 'extra bonus':
            	             if(all_extras[i].type=="Credit Card")
            	                real_data[j].extra.credit_card += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	             if(all_extras[i].type=="Credit Card 3D Secure")
            	                real_data[j].extra.c_3d += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	             if(all_extras[i].type=="Wire")
            	                real_data[j].extra.wire += parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];       
            	             break;
            	       
            	          case 'withdrawals':
            	             if(all_extras[i].type=="Credit Card")
            	                real_data[j].withdrawals.credit_card -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	             if(all_extras[i].type=="Credit Card 3D Secure")
            	                real_data[j].withdrawals.c_3d -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	             if(all_extras[i].type=="Wire")
            	                real_data[j].withdrawals.wire -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	             break;
            	       
            	         case 'fines':
            	             real_data[j].fines-=parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	            break;
            	       
            	         case 'postponed sales':
            	            if(all_extras[i].type=="Credit Card")
            	               real_data[j].postponed.credit_card -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	            if(all_extras[i].type=="Credit Card 3D Secure")
            	               real_data[j].postponed.c_3d -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	            if(all_extras[i].type=="Wire")
            	               real_data[j].postponed.wire -= parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	            break;
            	        case 'other_bonus':
            	           real_data[j].other+=parseFloat(all_extras[i].amount)/rates[all_extras[i].currency];
            	           if(is_shekel_display)
            	           all_extras[i].currency=='ILS' ? real_data[j].other_bonus+=parseFloat(all_extras[i].amount) : real_data[j].other_bonus+=(parseFloat(all_extras[i].amount)/rates[all_extras[i].currency])*currency_rate;
            	           else
            	           real_data[j].other_bonus+=(parseFloat(all_extras[i].amount)/rates[all_extras[i].currency]);
            	           break;
            	       
            	        case 'retention_difference':
            	          if(all_extras[i].date==new Date(new Date($('#dpEnd').val()).getFullYear(),new Date($('#dpEnd').val()).getMonth(),1).format('yyyy-MM-dd')) 
  	    	 		          real_data[j].last_month_difference+=parseFloat(all_extras[i].amount);
            	          break;      
            	       }
                    }
                    }
                  }
  	    	      
                  commission_rates['credit_card'] = is_shekel_display ? 0.035*currency_rate : 0.015;
  	              commission_rates['credit_card_over'] = is_shekel_display ? 0.055*currency_rate : 0.03;
  	              commission_rates['wire'] = is_shekel_display ? 0.07*currency_rate : 0.04;
  	    
  	    	 	  for(var i=0;i<commission_data.length;i++){
  	    	 	  	
  	    	 	  	if($.inArray(commission_data[i].clearedBy,commission_3d_list)!=-1){
                       commission_data[i].type='Credit Card 3D Secure';
                    }else if(commission_data[i].paymentMethod=='Wire'){
                	
                	   commission_data[i].type='Wire';
                    }else{
                	
                	   commission_data[i].type='Credit Card';
                    }
                    
                    confirmMonth = new Date(commission_data[i]['confirmTime']).format('yyyy-MM');
                    
  	    	 	  	for(var j=0;j<real_data.length;j++){
                       
                       if(commission_data[i].employeeId==real_data[j].employeeId){
                       	   if(commission_data[i]['type']=='Credit Card'){
            			
            			      real_data[j].credit_card += parseFloat(commission_data[i]['amountUSD']);	
            		       }
            		       if(commission_data[i]['type']=='Credit Card' && (commission_data[i]['verification']=='Full' 
            		          || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            			
            			      real_data[j].real_credit_card += parseFloat(commission_data[i]['amountUSD']);
            		       }
            		
            		       if(commission_data[i]['type']=='Credit Card 3D Secure'){
            			
            			      real_data[j].c_3d += parseFloat(commission_data[i]['amountUSD']);	
            		       }
            		       if(commission_data[i]['type']=='Credit Card 3D Secure' && (commission_data[i]['verification']=='Full' 
            		          || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            			
            			
            				
            				 if(jQuery.inArray(real_data[j].employeeId,full_3d_bonus)!=-1){
            					  real_data[j].c_3d_bonus += parseFloat(commission_data[i]['amountUSD']);
            				 }else{
            					  real_data[j].c_3d_bonus += parseFloat(commission_data[i]['amountUSD'])*0.85;
            				 }
            			
            			     real_data[j].real_c_3d += parseFloat(commission_data[i]['amountUSD']);
            		         }
            		
            		      if(commission_data[i]['type']=='Wire'){
            		   
            		       	 real_data[j].wire += parseFloat(commission_data[i]['amountUSD']);	
            		        }
            		      if(commission_data[i]['type']=='Wire' && (commission_data[i]['verification']=='Full' 
            		         || (confirmMonth<'2016-08' &&  Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14))){
            				 
            				if(jQuery.inArray(real_data[j].employeeId,full_wire_bonus)!=-1){
            					real_data[j].wire_bonus += parseFloat(commission_data[i]['amountUSD']);
            				}else{
            					real_data[j].wire_bonus += parseFloat(commission_data[i]['amountUSD'])*0.85;
            				}
            			
            			    real_data[j].real_wire += parseFloat(commission_data[i]['amountUSD']);
            		      }
            		      
            		      var amount_field = confirmMonth>='2016-06' ? 'originalAmountUSD' : 'amountUSD';
            		      var percentage = parseFloat((commission_data[i]['percentage']).substring(1));
                       	  
                       	  if(is_shekel_display && commission_data[i]['type']=='Credit Card 3D Secure' && commission_data[i]['amountUSD']>=2500 && commission_data[i]['amountUSD']<5000 && 
                       	     (commission_data[i]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10') && 
                       	      confirmMonth<='2016-04'){
            			
            			     real_data[j].c_3d_2500 += 1;
            		      }
            		      if(is_shekel_display && commission_data[i]['type']=='Credit Card 3D Secure' && commission_data[i][amount_field]>=5000 && commission_data[i][amount_field]<10000 && 
            		         (commission_data[i]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')
            		         && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && commission_data[i]['clearedBy']==commission_3d_list[0]))){  
            			
            		         real_data[j].c_3d_5000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		      }
            		      if(is_shekel_display && commission_data[i]['type']=='Credit Card 3D Secure' && commission_data[i][amount_field]>=10000 && commission_data[i][amount_field]<25000 && 
            		         (commission_data[i]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')
            		        && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && commission_data[i]['clearedBy']==commission_3d_list[0]))){
            			
            			     real_data[j].c_3d_10000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		      }
            		      if(is_shekel_display && commission_data[i]['type']=='Credit Card 3D Secure' && commission_data[i][amount_field]>=25000 && 
            		         (commission_data[i]['verification']=='Full' || (confirmMonth<'2016-08' && Math.ceil(daysBetween(new Date(commission_data[i]['confirmTime']).format('yyyy-MM-dd'), new Date().format('yyyy-MM-dd')))<= 14) || (new Date($('#dpEnd').val()).format("yyyy-MM"))<='2015-10')
            		        && (confirmMonth<='2016-04' || (confirmMonth<='2016-10' && confirmMonth>='2016-06' && commission_data[i]['clearedBy']==commission_3d_list[0]))){
            			
            			    real_data[j].c_3d_25000 += confirmMonth>='2016-06' ? percentage/100 : 1;
            		      }
                       }
                       }
  	    	 	  	
  	    	 	    }
  	    	 	    for(var i=0;i<real_data.length;i++){
  	    	 	    	real_data[i].total_extra = (real_data[i].extra.credit_card + real_data[i].extra.c_3d + real_data[i].extra.wire); 
  	    	 	    	real_data[i].total_withdrawals = (real_data[i].withdrawals.credit_card + real_data[i].withdrawals.c_3d + real_data[i].withdrawals.wire);
  	    	 	    	real_data[i].total_postponed = (real_data[i].postponed.credit_card + real_data[i].postponed.c_3d + real_data[i].postponed.wire);   	    	 
  	    	 	    	real_data[i].totalDeposit = (real_data[i].credit_card + real_data[i].c_3d + real_data[i].wire + real_data[i].total_extra + real_data[i].total_withdrawals + real_data[i].total_postponed);
  	    	 	        real_data[i].realDeposit = (real_data[i].real_credit_card + real_data[i].real_c_3d + real_data[i].real_wire + real_data[i].total_extra + real_data[i].total_withdrawals + real_data[i].total_postponed);
  	    	 	        
  	    	 	        var commission_rate_cc = real_data[i].totalDeposit<70000 ? commission_rates['credit_card'] : commission_rates['credit_card_over'];
  	    	 	        
  	    	 	        real_data[i].credit_card_bonus = real_data[i].real_credit_card*commission_rate_cc*0.85;
  	    	 	        real_data[i].c_3d_bonus = real_data[i].c_3d_bonus*commission_rate_cc; 	
  	    	 	        real_data[i].withdrawals_bonus = ((real_data[i].withdrawals.credit_card + real_data[i].withdrawals.c_3d)*commission_rate_cc+real_data[i].withdrawals.wire*commission_rates['wire'])*0.85;
  	    	 	        real_data[i].extra_bonus = ((real_data[i].extra.credit_card + real_data[i].extra.c_3d)*commission_rate_cc+real_data[i].extra.wire*commission_rates['wire'])*0.85;
  	    	 	        real_data[i].postponed_bonus = ((real_data[i].postponed.credit_card + real_data[i].postponed.c_3d)*commission_rate_cc+real_data[i].postponed.wire*commission_rates['wire'])*0.85;
  	    	 	        
  	    	 	        real_data[i].wire_bonus = real_data[i].wire_bonus*commission_rates['wire'];
  	    	 	        real_data[i].fines_bonus = is_shekel_display ? real_data[i].fines*currency_rate : real_data[i].fines;
  	    	 	        real_data[i].c_3d_2500_bonus = real_data[i].c_3d_2500*150;
            	        real_data[i].c_3d_5000_bonus = real_data[i].c_3d_5000*300;
            	        real_data[i].c_3d_10000_bonus = real_data[i].c_3d_10000*500;
            	        real_data[i].c_3d_25000_bonus = real_data[i].c_3d_25000*1000;
            	        real_data[i].bonus = (real_data[i].credit_card_bonus + real_data[i].c_3d_bonus + real_data[i].wire_bonus + real_data[i].withdrawals_bonus + real_data[i].extra_bonus + real_data[i].postponed_bonus + real_data[i].fines_bonus + real_data[i].other_bonus + real_data[i].c_3d_2500_bonus + real_data[i].c_3d_5000_bonus + real_data[i].c_3d_10000_bonus + real_data[i].c_3d_25000_bonus + real_data[i].last_month_difference);
  	    	 	        real_data[i].percent = real_data[i].realDeposit + real_data[i].fines + real_data[i].other!=0 ? 
  	    	 	                                   is_shekel_display ? (real_data[i].bonus/((real_data[i].realDeposit + real_data[i].fines + real_data[i].other)*currency_rate))*100 :
  	    	 	                                                       (real_data[i].bonus/(real_data[i].realDeposit + real_data[i].fines + real_data[i].other))*100 
  	    	 	                                   : 0;
  	    	 	        real_data[i].total_extra = parseFloat(real_data[i].total_extra).toLocaleString();
  	    	 	        real_data[i].total_withdrawals = parseFloat(real_data[i].total_withdrawals).toLocaleString();
  	    	 	        real_data[i].total_postponed = parseFloat(real_data[i].total_postponed).toLocaleString();
  	    	 	        real_data[i].fines = parseFloat(real_data[i].fines).toLocaleString();
  	    	 	        real_data[i].other = parseFloat(real_data[i].other).toLocaleString();
  	    	 	        real_data[i].totalDeposit = parseFloat(real_data[i].totalDeposit).toLocaleString();
  	    	 	        real_data[i].realDeposit = parseFloat(real_data[i].realDeposit).toLocaleString(); 
  	    	 	        real_data[i].last_month_difference = parseFloat(real_data[i].last_month_difference).toLocaleString();
  	    	 	        real_data[i].bonus = parseFloat(real_data[i].bonus).toLocaleString();
  	    	 	        real_data[i].percent = parseFloat(real_data[i].percent).toLocaleString();
  	    	 	    }        
  	    	$('#summary_table').dataTable( {
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
               "iDisplayLength": 100,
               "aaData": real_data,
               "aaSorting": [[ 1, "asc" ]],                    
               "aoColumns": [
               { "mData": "inventivaId", "sTitle": "Inventiva ID","sType": "numeric"},
               { "mData": "employeeId", "sTitle": "Employee ID","sType": "numeric"},
               { "mData": "employeeName", "sTitle": "Employee Name"},
               { "mData": "totalDeposit", "sTitle": "Total Deposit USD", "sType": "commaseparated-num"},
               { "mData": "realDeposit", "sTitle": "Full KYC USD", "sType": "commaseparated-num"},
               { "mData": "total_extra", "sTitle": "Extra Bonus USD", "sType": "commaseparated-num"},
               { "mData": "total_withdrawals", "sTitle": "Withdrawals USD", "sType": "commaseparated-num"},  
               { "mData": "total_postponed", "sTitle": "Postponed Sales USD", "sType": "commaseparated-num"},
               { "mData": "fines", "sTitle": "Fines USD", "sType": "commaseparated-num"},
               { "mData": "other", "sTitle": "Other Bonus USD", "sType": "commaseparated-num"},
               { "mData": "last_month_difference", "sTitle": "Last Month Difference", "sType": "commaseparated-num"},
               { "mData": "bonus", "sTitle": "Bonus", "sType": "commaseparated-num"},
               { "mData": "percent", "sTitle": "Percent", "sType": "commaseparated-num"}
               ]
             });
  	        });
  	    	});
	
	
}


