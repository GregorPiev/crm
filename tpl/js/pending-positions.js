var total_usd_all = 0;

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

     getSelfDeposits();

   }

  $(document).ready(function() {
	getDesk();
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getSelfDeposits();
    getEmployees();
    

    $('#dpStart, #dpEnd, #date, #desk, #employee').change(function() 
    {
    
      getSelfDeposits();
    });
    
    
    $('#desk').change(function() 
    {
      getEmployees();
    });
    
    

    

  });

  function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployees',$('#range-form').serialize(),'#pending_positions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.employeeName)); 
      });

    });
    
  }
  function getSelfDeposits(){

    apiRequest('getPendingPositions',$('#range-form').serialize(),'#pending_positions_table_holder',function(data){
        
         //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime
         

         $('#pending_positions_table').dataTable( {
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
          "aaSorting": [[ 11, "desc" ]],                    
          "aoColumns": [
          { "mData": "positionId" , "sTitle":"position Id","sType": "numeric"},
          { "mData": "customerId" , "sTitle":"customer Id","sType": "numeric"},
          { "mData": "customerName" , "sTitle":"customer Name"},
          { "mData": "realAccountBalance" , "sTitle":"Real ABalance"},
          { "mData": "assetName" , "sTitle":"asset Name"},
          { "mData": "positionDate" , "sTitle":"position Date"},
          { "mData": "positionStart" , "sTitle":"position Start","sType": "numeric"},
          { "mData": "positionEnd" , "sTitle":"position End","sType": "numeric"},
          { "mData": "positionDirection" , "sTitle":"position Direction"},
          { "mData": "positionAmountUSD" , "sTitle":"position Amount","sType": "numeric", 
              "mRender": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2);
                }
          },
          { "mData": "positionRate" , "sTitle":"position Rate","sType": "numeric", 
              "mRender": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2);
                }
          },
          { "mData": "canWin" , "sTitle":"can Win","sType": "numeric", 
              "mRender": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2);
                }
          },
          { "mData": "canLoose" , "sTitle":"can Loose","sType": "numeric", 
              "mRender": function ( data, type, row ) {
                    return parseFloat(data).toFixed(2);
                }
          },
          { "mData": "employee" , "sTitle":"employee"}


          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            var total_positions = 0;
            var total_real_account_balance_arr = {};
            var total_real_account_balance = 0;
            var total_amount = 0;
            var total_can_win = 0;
            var total_can_loose = 0;

           for ( var i=0 ; i<aiDisplay.length ; i++ )
           {
              total_real_account_balance_arr[aaData[aiDisplay[i]]['customerId']] = parseFloat(aaData[aiDisplay[i]]['realAccountBalance']);


              total_amount += parseFloat(aaData[ aiDisplay[i] ]['positionAmountUSD']);
              total_can_win += parseFloat(aaData[ aiDisplay[i] ]['canWin']);
              total_can_loose += parseFloat(aaData[ aiDisplay[i] ]['canLoose']);

              total_positions++;

          };

          $.each(total_real_account_balance_arr,function(index,value){
            total_real_account_balance += parseFloat(value);
          });



          $('#total_amount').html('$'+total_amount.toLocaleString());
          $('#total_positions').html(total_positions.toLocaleString());
          $('#total_can_win').html((total_can_win).toLocaleString());
          $('#total_can_loose').html((total_can_loose).toLocaleString());
          $('#total_real_account_balance').html((total_real_account_balance).toLocaleString());


        } 


      } );



});


}

function geoPlugin(data){

  total_usd_all = total_usd_all + parseFloat(data.to.amount.split(",").join(""));
  
  $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}