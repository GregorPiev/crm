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

  getRealScore();
  
}

 

  

$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
 /*    if($('#retention').is(':checked')){
     	$('input[name="retention"]').val()='on';
    } */
     console.log($('#range-form').serialize());
     getEmployeesForRetention();
   
     getRealScore();
      $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        
       });
     $('#dpStart, #dpEnd, #desk, #employee,#retention').change(function(){
        console.log($("#range-form").serialize());
        getRealScore();
      });  
     
 });  
 
   
 
function getEmployeesForRetention () {
	
    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
    
    
   

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
  
      });
      
      
      
    });
    
  } 
  
function onlyFTDs(total_deposits,total_3d,total_wire,total_non_3d,total_bonus,total_withdrawals,total_bonuses_w,total_chargebacks,total_fees){
	apiRequest('onlyFTDs',$('#range-form').serialize(),'#transactions_table_holder',function(data){
	var total_ftds=data.length;
	var ftd_deposits=0;
	var ftd_3d=0;
	var ftd_wire=0;
	var ftd_non_3d=0;
	var percent_3d=0;
	var percent_non_3d=0;
	var percent_wire=0;
	var percent_withdrawals=0;
	var percent_net_bonus=0;
	var closed_ftds=0;
	var total_n_ftd_deposits=0;
	var net_bonus=total_bonus-total_bonuses_w;
	for(i=0;i<data.length;i++){
		ftd_deposits+=parseFloat(data[i].amountUSD);
		if(data[i].clearedBy=='SolidPayments3D' || data[i].clearedBy=='ApiTerminal' || data[i].clearedBy=='Processing3D' || data[i].clearedBy=='Inatec3D' || data[i].clearedBy=='Fibonatix' || data[i].clearedBy=='Fibonatix3D' || data[i].clearedBy=='Insight3D'  || data[i].clearedBy=='AmericanVolume'){
			ftd_3d+=parseFloat(data[i].amountUSD);
		}
		if(data[i].paymentMethod!='Wire' && data[i].clearedBy!='SolidPayments3D' && data[i].clearedBy!='ApiTerminal' && data[i].clearedBy!='Processing3D' && data[i].clearedBy!='Inatec3D' && data[i].clearedBy!='Fibonatix' && data[i].clearedBy!='Fibonatix3D' && data[i].clearedBy!='Insight3D'  && data[i].clearedBy!='AmericanVolume'){
			ftd_non_3d+=parseFloat(data[i].amountUSD);
		}
		if(data[i].paymentMethod!='Wire'){
			ftd_wire+=parseFloat(data[i].amountUSD);
		}
		 if(data[i].closed=='YES'){
			   closed_ftds++;
		}	
	}
	    total_n_ftd_deposits=total_deposits+ftd_deposits;
	if(!$('#retention').is(':checked')){
		total_deposits+=ftd_deposits;
		total_3d+=ftd_3d;
		total_wire+=ftd_wire;
		total_non_3d+=ftd_non_3d;
		
		
		
	}
	percent_wire= total_deposits!=0 ? ((total_wire/(total_deposits))*100).toFixed(2) : 0;   
	if(total_3d+total_non_3d!=0){
       percent_3d= ((total_3d/(total_3d+total_non_3d))*100).toFixed(2);
       percent_non_3d=((total_non_3d/(total_3d+total_non_3d))*100).toFixed(2);
    }
    if(total_n_ftd_deposits!=0){
       percent_withdrawals=((total_withdrawals/total_n_ftd_deposits)*100).toFixed(2);
       percent_net_bonus=((net_bonus/total_n_ftd_deposits)*100).toFixed(2);
    }
	$('#total_ftds').html(total_ftds.toLocaleString());
	$('#closed_ftds').html(closed_ftds.toLocaleString());
	$('#total_deposits').html('$'+total_deposits.toLocaleString());
    $('#total_3d').html('$'+total_3d.toLocaleString()); 
    $('#total_non_3d').html('$'+total_non_3d.toLocaleString());
    $('#total_wire').html('$'+total_wire.toLocaleString());   
    $('#percent_3d').html('%'+percent_3d.toLocaleString());
    $('#percent_non_3d').html('%'+percent_non_3d.toLocaleString());
    $('#percent_wire').html('%'+percent_wire.toLocaleString());
    $('#percent_withdrawals').html('%'+percent_withdrawals.toLocaleString());
    $('#percent_net_bonus').html('%'+percent_net_bonus.toLocaleString());
    $('#total_bonuses').html('$'+total_bonus.toLocaleString());
    $('#net_bonus').html('$'+net_bonus.toLocaleString());
    $('#total_withdrawals').html('$'+total_withdrawals.toLocaleString());
    $('#total_bonuses_w').html('$'+total_bonuses_w.toLocaleString());
    $('#total_chargebacks').html('$'+total_chargebacks.toLocaleString());
    $('#total_fees').html('$'+total_fees.toLocaleString());
	});
}  
 
 function getRealScore() {
 	 
 	apiRequest('getRealScore',$('#range-form').serialize(),'#transactions_table_holder',function(data){
 	 console.log('success');
 	 var total_bonuses_w=0;
 	 var total_chargebacks=0;
 	 var total_fees=0;
 	 
 	    
 	 
 	 for(var i=0; i<data.length;i++){
 	 	total_bonuses_w+=parseFloat(data[i].totalBonusWithdrawal);
 	 	total_chargebacks+=parseFloat(data[i].totalChargeBack);
 	 	total_fees+=parseFloat(data[i].totalFees);
 	 	data[i].netBonus=(data[i].totalBonus-data[i].totalBonusWithdrawal).toFixed(2);
 	 	data[i].percent_wire=data[i].totalDeposit!=0 ? (((parseFloat(data[i].totalDepositWire))/(parseFloat(data[i].totalDeposit)))*100).toFixed(2) : 0;
 	 	data[i].percent_3d=parseFloat(data[i].totalDeposit)-parseFloat(data[i].totalDepositWire)!=0 ? (((parseFloat(data[i].totalDeposit3D))/(parseFloat(data[i].totalDeposit)-parseFloat(data[i].totalDepositWire)))*100).toFixed(2) : 0;
 	 	data[i].percent_non_3d=parseFloat(data[i].totalDeposit)-parseFloat(data[i].totalDepositWire)!=0 ? (((parseFloat(data[i].totalDepositNon3D))/(parseFloat(data[i].totalDeposit)-parseFloat(data[i].totalDepositWire)))*100).toFixed(2) : 0;
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
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": [
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "totalDeposit", "sTitle": "Total Deposit","sType": "numeric"},
            { "mData": "totalDepositWire", "sTitle": "Total Wire","sType": "numeric"},
            { "mData": "percent_wire", "sTitle": "Wire Percentage", "bUseRendered": false,
              "fnRender": function(oObj){
              	return '% '+ oObj.aData.percent_wire;	
              }
            },     
            { "mData": "totalDeposit3D", "sTitle": "Total 3D","sType": "numeric"},
            { "mData": "percent_3d", "sTitle": "3D Percentage",
              "fnRender": function(oObj){
              	return '% '+ oObj.aData.percent_3d;	
              }
            }, 
            { "mData": "totalDepositNon3D", "sTitle": "Total Non 3D","sType": "numeric"},
            { "mData": "percent_non_3d", "sTitle": "Non 3D Percentage",
              "fnRender": function(oObj){
              	return '% '+ oObj.aData.percent_non_3d;	
              }
            },  
            { "mData": "totalBonus", "sTitle": "Total Bonus","sType": "numeric"},  
            { "mData": "netBonus", "sTitle": "Net Bonus","sType": "numeric"},
            { "mData": "percent_bonus", "sTitle": "Bonus Percentage",
                "fnRender": function(oObj){
                if(oObj.aData.totalDeposit==0){
                	return '%0';
                }else{
              	return '% '+ (((parseFloat(oObj.aData.netBonus))/(parseFloat(oObj.aData.totalDeposit)))*100).toFixed(2);
              	}
              }
              },  
            { "mData": "totalWithdrawal", "sTitle": "Total Withdrawal", "sType": "numeric"},
            { "mData": "percent_withdrawals", "sTitle": "Withdrawals Percentage",
                "fnRender": function(oObj){
                if(oObj.aData.totalDeposit==0){
                	return '%0';
                }else{
              	return '% '+ (((parseFloat(oObj.aData.totalWithdrawal))/(parseFloat(oObj.aData.totalDeposit)))*100).toFixed(2);
              	}
              }
              }  ],
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
             
             var total_deposits=0;
             var total_3d=0;
             var total_wire=0;
             
             var total_bonus=0;
             var total_withdrawals=0;
             var total_non_3d=0;
             for(i=0;i<aiDisplay.length;i++){
             	total_deposits+= parseFloat(aaData[aiDisplay[i]]['totalDeposit']);
             	total_3d+= parseFloat(aaData[aiDisplay[i]]['totalDeposit3D']);
             	total_non_3d+= parseFloat(aaData[aiDisplay[i]]['totalDepositNon3D']);
             	total_wire+= parseFloat(aaData[aiDisplay[i]]['totalDepositWire']);
                total_bonus+= parseFloat(aaData[aiDisplay[i]]['totalBonus']);
                total_withdrawals+= parseFloat(aaData[aiDisplay[i]]['totalWithdrawal']);
             }
             if(total_deposits!=0){
             	percent_3d=((total_3d/total_deposits)*100).toFixed(2);
             }else{
             	percent_3d=0;
             }
            onlyFTDs(total_deposits,total_3d,total_wire,total_non_3d,total_bonus,total_withdrawals,total_bonuses_w,total_chargebacks,total_fees); 
            
            
            
            }
 	
 	});
 	});
 	
 }
 
 function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}
