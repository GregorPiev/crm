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

Array.prototype.contains = function(obj) {
	var i = this.length;
	while (i--) {
		if (this[i] === obj) {
			return true;
		}
	}
	return false;
}


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
  
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
    }
	
	getLeadsByCountries();
	
}

function getLeadsByCountries() {
	apiRequest('getLeadsByCountries',$('#range-form').serialize(),'#transactions_table_holder',function(data){
        //console.log(data);
         //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime
         
         
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
         	"bLengthChange": true,
         	"aaData": data,
         	"aaSorting": [[ 6, "desc" ]],                    
         	"aoColumns": [
         	{ "mData": "country", "sTitle": "Country"},
         	{ "mData": "leads", "sTitle": "Leads", "sType": "numeric"},
         	{ "mData": "customers", "sTitle": "Customers", "sType": "numeric"},
         	{ "mData": "dcount", "sTitle": "Deposits","sType": "numeric"},
         	{ "mData": "crate", "sTitle": "Conversion Rate (%)","sType": "numeric"},
         	{ "mData": "FTD", "sTitle": "FTDs", "sType": "numeric"},
         	{ "mData": "self_deposits", "sTitle": "Selfs", "sType": "numeric"},            
         	{ "mData": "damount", "sTitle": "Total Amount","sType": "numeric"}, 
         	{ "mData": "FTDAmount", "sTitle": "FTD Amount","sType": "numeric"},            
            { "mData": "self_amount", "sTitle": "Self Amount","sType": "numeric"},
            { "mData": "withdrawals", "sTitle": "Withdrawals","sType": "numeric"},
         	{ "mData": "chargeBack", "sTitle": "Charge Back","sType": "numeric"},
         	{ "mData": "revenue", "sTitle": "Revenue","sType": "numeric"}

         	
         	],
         	"fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
         		
         		var total_leads = 0;
         		var total_customers = 0;
         		var total_players = 0;
         		
         		var total_deposits = 0;
         		var total_self_deposits = 0;
         		
         		var total_amount = 0;
         		var total_leads_amount = 0;
         		var total_ftd_amount = 0;
         		var total_self_amount = 0;
         		
	            //{ "mData": "leads_amount", "sTitle": "Leads Deposits ($)","sType": "numeric"},
	            
	            for ( var i=0 ; i<aiDisplay.length ; i++ )
	            {
	            	
	            	total_leads += parseFloat(aaData[ aiDisplay[i] ]['leads']);
	            	total_customers += parseFloat(aaData[ aiDisplay[i] ]['customers']);
	            	total_players += parseFloat(aaData[ aiDisplay[i] ]['FTD']);
	            	
	            	total_deposits += parseFloat(aaData[ aiDisplay[i] ]['dcount']);
	            	total_self_deposits += parseFloat(aaData[ aiDisplay[i] ]['self_deposits']);
	            	
	            	total_amount += parseFloat(aaData[ aiDisplay[i] ]['damount']);
	            //total_leads_amount +=  parseFloat(aaData[ aiDisplay[i] ]['leads_amount']);
	            total_ftd_amount += parseFloat(aaData[ aiDisplay[i] ]['FTDAmount']);
	            total_self_amount += parseFloat(aaData[ aiDisplay[i] ]['self_amount']);
	            
	            
	        }
	        
	        
	        
	        $('#total_leads').html(total_leads);
	        $('#total_customers').html(total_customers);
	        $('#total_depositors').html(total_players);
	        
	        $('#total_deposits').html(total_deposits.toLocaleString());
	        $('#total_self_deposits').html(total_self_deposits.toLocaleString());
	        
	        $('#total_amount').html(total_amount.toLocaleString());
	             //$('#total_leads_amount').html(total_leads_amount.toLocaleString());
	             $('#total_ftd_amount').html(total_ftd_amount.toLocaleString());
	             $('#total_self_amount').html(total_self_amount.toLocaleString());
	             
	             
	             
	             
	             
	             
	             
	             
	         } 
	         
	         
	     } );



});
}

function getAffiliates () {

/*
    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    */
    apiRequest('getAffiliates',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    	
    	
    	
    	$('#alltime_leads').dataTable( {
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
    		"bLengthChange": true,
    		"aaData": data,
    		"aaSorting": [[ 2, "desc" ]],                    
    		"aoColumns": [
    		{ "mData": "affID", "sTitle": "Affiliate Id"},
    		{ "mData": "totalDeposits", "sTitle": "Total Deposits", "sType": "numeric"},
    		{ "mData": "leadsNum", "sTitle": "Leads", "sType": "numeric"},
    		{ "mData": "customersNum", "sTitle": "Customers", "sType": "numeric"}                                                     
    		]
    	});
    	

    	jQuery.each(data, function() {
    		$('#affiliate')
    		.append($('<option>', { value : this.affID })
    			.text(this.affID)); 
    	});

    });

}

function geoPlugin(data){

	total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
	$('#total_usd_all').html('$'+total_usd_all.toLocaleString());

}
