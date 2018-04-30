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
    
    getFTDsByCurrencies();
    
  }

  $(document).ready(function() {

    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getFTDsByCurrencies();
    
    $('#dpStart, #dpEnd').change(function() 
    {
      getFTDsByCurrencies();
    });

  });

  function getFTDsByCurrencies(){

    apiRequest('getFTDsByCurrencies',$('#range-form').serialize(),'#transactions_table_holder',function(data){
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
          
          { "mData": "employee", "sTitle": "Employee"},
          { "mData": "usd_ftds", "sTitle": "USD FTDs"},
          { "mData": "gbp_ftds", "sTitle": "GBP FTDs"},
          { "mData": "eur_ftds", "sTitle": "EUR FTDs"},
          { "mData": "jpy_ftds", "sTitle": "JPY FTDs"},
          { "mData": "aud_ftds", "sTitle": "AUD FTDs"},
          { "mData": "cad_ftds", "sTitle": "CAD FTDs"},
          { "mData": "brl_ftds", "sTitle": "BRL FTDs"}
          
          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            var total_usd = 0;
            var total_gbp = 0;
            var total_eur = 0;
            var total_jpy = 0;
            var total_aud = 0;
            var total_cad = 0;
            var total_brl = 0;
            for ( var i=0 ; i<aiDisplay.length ; i++ ) {
              total_usd += parseInt(aaData[ aiDisplay[i] ]['usd_ftds']);
              total_gbp += parseInt(aaData[ aiDisplay[i] ]['gbp_ftds']);
              total_eur += parseInt(aaData[ aiDisplay[i] ]['eur_ftds']);
              total_jpy += parseInt(aaData[ aiDisplay[i] ]['jpy_ftds']);
              total_aud += parseInt(aaData[ aiDisplay[i] ]['aud_ftds']);
              total_cad += parseInt(aaData[ aiDisplay[i] ]['cad_ftds']);
              total_brl += parseInt(aaData[ aiDisplay[i] ]['brl_ftds']);
            }
            $('#total_usd').html(total_usd.toLocaleString());
            $('#total_gbp').html(total_gbp.toLocaleString());
            $('#total_eur').html(total_eur.toLocaleString());
            $('#total_jpy').html(total_jpy.toLocaleString());
            $('#total_aud').html(total_aud.toLocaleString());
            $('#total_cad').html(total_cad.toLocaleString());
            $('#total_brl').html(total_brl.toLocaleString());

          } 
          
          
        } );



});


}
