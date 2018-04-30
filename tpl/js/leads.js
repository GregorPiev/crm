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
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  
  getLeads();
  
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
            { "mData": "name", "sTitle": "Country"},
            { "mData": "leads", "sTitle": "Leads", "sType": "numeric"},
            { "mData": "customers", "sTitle": "Customers", "sType": "numeric"},
            { "mData": "dcount", "sTitle": "Deposits Count","sType": "numeric"},
            { "mData": "damount", "sTitle": "Deposits Amount","sType": "numeric"},
            { "mData": "FTD", "sTitle": "FTD Count", "sType": "numeric"},
            { "mData": "revenue", "sTitle": "Revenue/Lead", "sType": "numeric"}                                                         
           ]
           
           
    } );
    
    
    
      });
}

function getAffiliates () {

	
//    $('#affiliate')
//    .find('option')
//    .remove()
//    .end()
//    .append('<option value="0">All</option>')
//    .val('0');

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
function getLeads(){

    apiRequest('getLeads',$('#range-form').serialize(),'#transactions_table_holder',function(data){
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
           "aaSorting": [[ 0, "desc" ]],                    
           "aoColumns": [
            { "mData": "regTime", "sTitle": "Reg Time","sType": "date"},
            { "mData": "id", "sTitle": "ID", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "isLead", "sTitle": "Type"},
            { "mData": "verification", "sTitle": "Verified"},
            { "mData": "totalDeposits", "sTitle": "Deposits", "sType": "numeric"},
            { "mData": "offerID", "sTitle": "Offer/LP"},
            { "mData": "affID", "sTitle": "Affiliate"},
            { "mData": "subID", "sTitle": "Sub ID"},
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "callNote", "sTitle": "Notes"}
                                                              
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
         
           var total_leads = 0;
            var total_customers = 0;
            var total_non_customers = 0;
            var verified_customer = 0;
            var total_deposits = 0;
            var total_depositors = 0;
            var total_deposits_amount = 0;
            
          
            
			       for ( var i=0 ; i<aiDisplay.length ; i++ )
			       {
             
				      if (aaData[ aiDisplay[i] ]['isLead']=='0') {
                total_customers += 1;
                total_deposits += parseFloat(aaData[ aiDisplay[i] ]['totalDeposits']);
                total_deposits_amount += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                
                if (parseFloat(aaData[ aiDisplay[i] ]['totalDeposits']) != 0)
                  total_depositors += 1;
                                  
              } else {
                total_non_customers += 1;
              }
              
              if (aaData[ aiDisplay[i] ]['verification']!='None') {
                verified_customer += 1;                
              }  
              
              
             
			       }
             
             
             
             $('#total_leads').html(aiDisplay.length);
             $('#total_customers').html(total_customers);
             $('#total_depositors').html(total_depositors);
             
             //$('#verified_rate').html((verified_customer / total_customers * 100).toLocaleString()+'%');
             
             $('#total_deposits').html(total_deposits.toLocaleString());
             $('#total_dpl').html((total_deposits / aiDisplay.length).toLocaleString());
             $('#total_deposits_amount').html('$'+total_deposits_amount.toLocaleString());
             
             //$('#depositors_rate').html((total_depositors / total_customers * 100).toLocaleString()+'%');
             //$('#customers_rate').html((total_customers / aiDisplay.length * 100).toLocaleString()+'%');
             
             //$('#players_rate').html((total_depositors / aiDisplay.length * 100).toLocaleString()+'%');
             
                          
                 
             
             
             
             
          
             
          
           } 
           
           
    } );
    
    
    
      });
      
      
}

function geoPlugin(data){

  total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
  $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

}