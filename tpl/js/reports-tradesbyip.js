


$(document).ready(function() {

    
    
    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    
   
    


    $('#dpStart, #dpEnd, #desk').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
       
    });
    
      $("#range-form").submit(function(){
          getTrades();
          return false;
      });
  
        
      
      




    

});

function getTrades(){
    // var ip = $("#ip").val();
    // if(ip == 0) {
    //   alert("must input ip");
    //   return false;
    // }

    apiRequest('tradesByIP',$('#range-form').serialize(),'#transactions_table_holder',function(data){
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
 
            // { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "date", "sTitle": "Date", "sType": "date"},
            { "mData": "tradeType", "sTitle": "Trade Type"},
            { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "status", "sTitle": "Status"},
           
            
            
            
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
              
                var customerId = aaData[ 0 ]['customerId'];
                var employeeName = aaData[ 0 ]['employeeName'];

                $(".cid").html(customerId);
                $(".ename").html(employeeName);

           } 
           
           
    } );
    
    
    
      });
      
      
}
