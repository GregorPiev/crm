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

$(document).ready(function() {
	 getDesk();
	 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker(); 
     $month=new Date().getMonth();
     $year=new Date().getFullYear();
     $('#dpStart').val(new Date($year,$month,1).format("yyyy-MM-dd"));
     
     
     getEmployeesForRetention();
      $( document ).on("click","#calculate",function() { 
     	
     	getEfficiency();
     });

     
         
      $('#desk').change(function(){
     	
     	getEmployeesForRetention();
        
       });
     
  
 }); 
 
 function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
 

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
         
  
      });
     
      
      
    });
    
  } 
  
  function getEfficiency(){
  	  
  	apiRequest('getEfficiency',$('#range-form').serialize(),'#efficiency_table_holder',function(data){
  		  
  		console.log("success");
  		var total_rab=0;
  		var total_tb=0;
  		var total_pnl=0;
  		for(var i=0,j=data.length; i<j; i++){
           	        
                	total_rab += parseFloat(data[i].realAB_USD);
                	total_tb += parseFloat(data[i].TO_over_bet);
                	total_pnl += parseFloat(data[i].pnlUSD);
                }
                
                
          console.log(total_pnl.toFixed(2));     
           
  		
  		 $('#efficiency_table').dataTable( {
                "sDom": 'T<"clear">lfrtip',
             "oTableTools": {
             "sSwfPath": "tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
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
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "trade_realAB_USD", "sTitle": "Traded RAB USD","sType": "numeric"},
            { "mData": "no_trade_realAB_USD", "sTitle": "DT_RAB","sType": "numeric"},  
            { "mData": "realAB_USD", "sTitle": "RAB","sType": "numeric"},
            { "mData": "realAB_USD_1000", "sTitle": "RAB 1000+","sType": "numeric"},
            { "mData": "no_trade_realAB_USD_1000", "sTitle": "DT_RAB 1000+","sType": "numeric"},
            { "mData": "turnoverUSD", "sTitle": "Turnover USD","sType": "numeric"},
            { "mData": "pnlUSD", "sTitle": "PNL USD","sType": "numeric"},
            { "mData": "bet", "sTitle": "Bets ","sType": "numeric"},
            { "mData": "TO_over_bet", "sTitle": "TO/Bet","sType": "numeric"},
            { "mData": "TB_over_total_TB", "sTitle": "TB/Total TB",
                "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.TO_over_bet)/total_tb)*100).toFixed(2);
              }     
            },
              { "mData": "pnl_over_total_pnl", "sTitle": "PNL/Total PNL",
                "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.pnlUSD)/total_pnl)*100).toFixed(2);
              }     
            },
            { "mData": "traded_rab_over_rab", "sTitle": "Traded RAB/RAB",
               "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.trade_realAB_USD))/(parseFloat(oObj.aData.realAB_USD))*100).toFixed(2);
              } 
            },
            { "mData": "rab_over_total_rab", "sTitle": "RAB/Total RAB",
              "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.realAB_USD)/total_rab)*100).toFixed(2);
              } 
               },
             { "mData": "no_trade_over_total_rab", "sTitle": "DT RAB/Total RAB",
              "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.no_trade_realAB_USD)/total_rab)*100).toFixed(2);
              }  
               },
              { "mData": "realAB_1000_over_total_rab", "sTitle": " RAB 1000+ /Total RAB",
              "fnRender": function(oObj){
                
              	return '% '+ ((parseFloat(oObj.aData.realAB_USD_1000)/total_rab)*100).toFixed(2);
              }  
               },
               { "mData": "efficiency", "sTitle": "Efficiency", "sType": "numeric",
              "fnRender": function(oObj){
             	if(oObj.aData.realAB_USD==0){
              		var v1=0;
              	}else{
                var v1=(parseFloat(oObj.aData.trade_realAB_USD))/(parseFloat(oObj.aData.realAB_USD));
               } 
                var v2=(parseFloat(oObj.aData.pnlUSD)/total_pnl);
                var v3=(parseFloat(oObj.aData.TO_over_bet)/((total_tb)));
                var v4=(parseFloat(oObj.aData.realAB_USD)/total_rab);
                var v5=(parseFloat(oObj.aData.realAB_USD_1000)/total_rab);
                var v6=(parseFloat(oObj.aData.no_trade_realAB_USD)/total_rab);
              	return  (v1/10+8*v2+2*v3+(0.1-v4)+(0.1-v5)+v6).toFixed(2);
              	              
              	              
              	              
              }  
               } 
               
               
               
            ]
            
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
   
  

  
 