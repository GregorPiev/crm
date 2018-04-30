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
  
    $('#exStart').val(endDate.format("yyyy-MM-dd"));
    $('#exEnd').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#exEnd').val(endDate.format("yyyy-MM-dd"));
  $('#exStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  
  
}

$(document).ready(function(){
	$('#exStart,#exEnd').val(new Date().format("yyyy-MM-dd"));
    $('#exStart,#exEnd').datepicker();  
    getDesk(); 
	
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
  
function getCurrentPrices(){
	$.ajax({
	    url: "/api.php?cmd=getCurrentPricesForAssets",
  	    type: "POST",
        data: $('#range-form').serialize(), 
  	    dataType: "xml",
        timeout: 60000000,
        beforeSend: function(){
          $('.loader').show();
        },
        complete: function(){
         $('.loader').hide();
        },
  	    success:function(data){
  	    	
  	    	var batchs=(data.getElementsByTagName('AssetsHistory'));
  	    	var assets=[];
  	    	console.log(batchs[0].lastChild.childNodes[3]);
  	    	for(var i=0;i<batchs.length;i++){
  	    		var assetId=batchs[i].lastChild.childNodes[1].innerHTML;
  	    		var rate=batchs[i].lastChild.childNodes[3].innerHTML;
  	    		assets.push({"assetId":assetId,
  	    		             "rate":parseFloat(rate)
  	    		            });
  	    	}
  	    	console.log(assets);
  	    	getOpenPositions(assets);
  	    	
  	    },
  	    error: function(x, t, m) {
        console.log(x);
        console.log(t);
        console.log(m);
  	    }
        
          
        
  	 });   
}

function getOpenPositions(assets){
    var real_data=[],customers=[],unique=[];
    
    apiRequest('getOpenPositionsForRealPNL',$('#range-form').serialize(),'#open_table_holder',function(data){
    	
    	for(var i=0;i<data.length;i++){
    		for(var j=0;j<assets.length;j++){
    		   if(data[i].assetId==assets[j].assetId){
    		      data[i].currentPrice=assets[j].rate;
    		      break;
    		   }
    		}
    		if(typeof data[i].currentPrice == 'undefined'){
    			data[i].currentPrice = 'Unknown';
    			data[i].payoutUSD = 'Unknown'; 
    		}else if(data[i].currentPrice==data[i].rate){
    			data[i].payoutUSD=data[i].amountUSD;
    		}else if(data[i].currentPrice>data[i].rate){
    			if(data[i].position=='up'){
    				data[i].payoutUSD=data[i].potentialWinPayout;
    			}else {
    				data[i].payoutUSD=0;
    			}
    		}else {
    			if(data[i].position=='down'){
    				data[i].payoutUSD=data[i].potentialWinPayout;
    			}else {
    				data[i].payoutUSD=0;
    			}
    		}
    		if(unique[data[i].customerId]==1){
    			continue;
    		}
    		customers.push({'customerId':data[i].customerId,
    		                'totalDepositUSD':parseFloat(data[i].totalDepositUSD),  
    		                'pre_pnl':parseFloat(data[i].pnl),
    		                'pnl':0 
    		                 });
    		unique[data[i].customerId]=1;                 
    	}
    	
    	for(var i=0;i<data.length;i++){
    		if(new Date(data[i].opendDate).format('yyyy-MM-dd')>=$('#exStart').val()){
    		 real_data.push(data[i]);
    		}else{
    	     for(var j=0;j<customers.length;j++){
    	     	if(customers[j].customerId==data[i].customerId){
    	     	  customers[j].pre_pnl += data[i].payoutUSD !== 'Unknown' ? parseFloat(data[i].amountUSD)-parseFloat(data[i].payoutUSD) : 0; 	
    	     	}
    	     }		
    		}
    		 
    	}
    	
    	$('#open_table').dataTable( {
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
           "aaSorting": [[ 5, "asc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Position ID"},
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "assetName", "sTitle": "Asset Name"},
            { "mData": "date", "sTitle": "Execution Date", "sType": "date"},
            { "mData": "opendDate", "sTitle": "Expiry Date", "sType": "date"},
            { "mData": "position", "sTitle": "Direction"},
            { "mData": "rate", "sTitle": "EntryRate"},
            { "mData": "currentPrice", "sTitle": "Current Price"},
            { "mData": "amountUSD", "sTitle": "Investment USD"},
            { "mData": "payoutUSD", "sTitle": "Payout USD"},
            { "mData": "employee", "sTitle": "Employee"} 
            ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
           	  var total_pnl=0;
           	  var real_pnl=0;
           	  for(var row in customers){
           	  	customers[row].pnl=0;
           	  }
           	  for(var i=0;i<aiDisplay.length;i++){
           	  	 for(var j=0;j<customers.length;j++){
           	  	 	if(customers[j].customerId==aaData[aiDisplay[i]].customerId){
           	  	 		customers[j].pnl += aaData[aiDisplay[i]].payoutUSD !== 'Unknown' ? parseFloat(aaData[aiDisplay[i]].amountUSD)-parseFloat(aaData[aiDisplay[i]].payoutUSD) : 0;
           	  	 		break;
           	  	 	}
           	  	 }
           	  //	total_pnl += parseFloat(aaData[aiDisplay[i]].amountUSD)-parseFloat(aaData[aiDisplay[i]].payoutUSD);
           	  }
           	  for(var i=0;i<customers.length;i++){
           	  	real_pnl += Math.min(customers[i].totalDepositUSD,(customers[i].pre_pnl+customers[i].pnl)) - Math.min(customers[i].totalDepositUSD,customers[i].pre_pnl);
           	  	total_pnl += customers[i].pnl;
           	  }
           	  
           	  $('#total_pnl').html('$'+total_pnl.toLocaleString());
           	  $('#real_pnl').html('$'+real_pnl.toLocaleString());
           } 
    });
    });  	
	
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk option[value="4"]').attr('selected',true);
			getEmployeesForRetention();
	});
}

