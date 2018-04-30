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

    getDepositors();

  }

  $(document).ready(function() {
  	getDesk();
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getDepositors();

    $('#dpStart, #dpEnd, #desk').change(function() 
    {
      getDepositors();
    });
        

   $("#openaccounts,#deactivatedaccounts,#closedaccounts").on("click",function() {
      getDepositors();
    });
    
  });

function getDepositors(){

  apiRequest('getDepositors',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    for(var i in data){
       		  data[i].realAccountBalanceUSD = parseFloat(data[i].realAccountBalanceUSD).toLocaleString();
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
      "bLengthChange": true,
      "aaData": data,
      "aaSorting": [[ 6, "desc" ]],                    
      "aoColumns": [
      { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
      { "mData": "customerName", "sTitle": "Customer Name"},
      { "mData": "countryName", "sTitle": "Country"},
      { "mData": "lastNoteDate", "sTitle": "Last Note"},
      { "mData": "deskName", "sTitle": "Desk"},
      { "mData": "employee", "sTitle": "Employee"},
      { "mData": "realAccountBalanceUSD", "sTitle": "Real Account Balance USD","sType": "commaseparated-num"},
      { "mData": "currency", "sTitle": "Currency"},
      { "mData": "regStatus", "sTitle": "Reg Status"}
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
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
