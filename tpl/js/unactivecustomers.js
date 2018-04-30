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

  function formatDate(date, fmt) {
    function pad(value) {
      return (value.toString().length < 2) ? '0' + value : value;
    }
    return fmt.replace(/%([a-zA-Z])/g, function (_, fmtCode) {
      switch (fmtCode) {
        case 'Y':
        return date.getUTCFullYear();
        case 'M':
        return pad(date.getUTCMonth() + 1);
        case 'd':
        return pad(date.getUTCDate());
        case 'H':
        return pad(date.getUTCHours());
        case 'm':
        return pad(date.getUTCMinutes());
        case 's':
        return pad(date.getUTCSeconds());
        default:
        throw new Error('Unsupported format code: ' + fmtCode);
      }
    });
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
    var start = new Date() - 30*24*60*60*1000;
    start = formatDate(new Date(start), '%Y-%M-%d');

    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    $('#dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart').val(start);
    $('#dpStart, #dpEnd').datepicker();
    getSelfDeposits();
    getEmployees();
    


    $('#dpStart, #dpEnd, #desk, #employee').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
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

    apiRequest('getEmployees',$('#range-form').serialize(),'#transactions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.employeeName)); 
      });

    });
    
  }
  function getSelfDeposits(){

    apiRequest('getUnactiveCustomers',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      console.log(data);
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
          "aaSorting": [[ 1, "asc" ]],                    
          "aoColumns": [
          { "mData": "cid", "sTitle": "Customer Id","sType": "numeric"},
          { "mData": "customerName", "sTitle": "Customer Name"},
          { "mData": "employeeName", "sTitle": "Employee Name"},
          { "mData": "balance", "sTitle": "Balance"},
          { "mData": "lastActive", "sTitle": "Last Interaction"}
          
          
          
          
          
          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            
           

          } 
          
          
        } );



});


}

function geoPlugin(data){

  total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
  $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}