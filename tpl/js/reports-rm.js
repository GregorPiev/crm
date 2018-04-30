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

  //getRmCommissions();
  
}

$(document).ready(function() {

    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    //getRmCommissions();
    


    $('#dpStart, #dpEnd, #desk').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
        //getRmCommissions();
    });

  });

function clearData() {
    
  var oTable = $('#transactions_table').dataTable();
  oTable.fnClearTable();

  $(".show").removeClass("show");
  $(".calc").addClass("show");
}

function getRmCommissions(){

  apiRequest('getRmCommissions',$('#range-form').serialize(),'#commissions_table_holder',function(data){
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
          "aaSorting": [[ 3, "desc" ]],                    
          "aoColumns": [
          { "mData": "customerId", "sTitle": "Customer Id", "sType": "numeric"},
          { "mData": "customerFName", "sTitle": "Customer Name"},
          { "mData": "customerLName", "sTitle": "Customer Surname"},
          { "mData": "employeeId", "sTitle": "Employee Id", "sType": "numeric"},
          { "mData": "employeeName", "sTitle": "Employee Name"},
          { "mData": "employeeSruname", "sTitle": "Employee Surname"},            
          { "mData": "currency", "sTitle": "Currency"},
          { "mData": "totalDepositsinPeriod", "sTitle": "Total Deposits in Period", "sType": "numeric"},
          { "mData": "totalDepositsAllTime", "sTitle": "Total Deposits All Time", "sType": "numeric"},
          { "mData": "totalBonusinPeriod", "sTitle": "Total Bonusin Period", "sType": "numeric"},
          { "mData": "totalBonusAllTime", "sTitle": "Total Bonus All Time", "sType": "numeric"},
          { "mData": "totalBetsinPeriod", "sTitle": "Total Betsin Period", "sType": "numeric"},
          { "mData": "totalBetsAllTime", "sTitle": "Total Bets All Time", "sType": "numeric"},
          { "mData": "totalWithdrawalsinPeriod", "sTitle": "Total Withdrawals in Period", "sType": "numeric"},
          { "mData": "totalWithdrawalsAllTime", "sTitle": "Total Withdrawals All Time", "sType": "numeric"}

          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            $(".show").removeClass("show");
            $(".clear").addClass("show");
            
          }


        } );

});


}
