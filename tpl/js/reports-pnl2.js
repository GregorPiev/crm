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
  
}

  $(document).ready(function() {
	getDesk();
    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));

    // $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    // $('#dpStart, #dpEnd').datepicker();

    // getPNL();

    // var mydate= new Date()
  
    // apiRequest('getUsersPNLReportDaysAvailable','','#days',function(e){
    //   var elements = '';

    //   if(e['days']>=1) {
    //     elements += '<option value="1">Yesterday</option>';
    //   }
    //   if(e['days']>=7) {
    //     elements += '<option value="7">7 days</option>';
    //   }
    //   if(e['days']>1) {
    //     elements += '<option value="'+e['days']+'">'+e['days']+' Days</option>';
    //   }

    //   $(e['months']).each(function(k,v) {
    //     //console.log(v['month'] + " : " + v["days"]);
    //     elements += '<option value="'+v["days"]+'">Since '+v['month']+'</option>';
    //   });


    //   $('#days').append(elements);
    // });
  
  var d = new Date();
  d.setDate(d.getDate() - 1);
  d = d.format("yyyy-MM-dd");

  // var date = new Date();

  // var day = new String(date.getDate()-1);
  // var month = new String(date.getMonth()+1);
  // var year = date.getFullYear();

  // var day = (day.length == 1) ? "0"+(day) : day;
  // var month = (month.length == 1) ? "0"+month : month;

  // var yesterday = (year + '-' + month + '-' + day);
  
  $('#dpStart, #dpEnd').val(d);
    $('#dpStart, #dpEnd').datepicker({  maxDate: new Date() });

    $('input[name=convertUSD]').change(function() 
    {
      $(".converted-field").fadeToggle();
    });

 });

  function clearData() {
    
    var oTable = $('#transactions_table').dataTable();
    oTable.fnClearTable();

    $(".show").removeClass("show");
    $(".calc").addClass("show");
  }

  function getPNL(){

    

    apiRequest('getUsersPNLReport',$('#range-form').serialize(),'#transactions_table_holder',function(data){
         // console.log(data);
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
          "aaSorting": [[ 4, "desc" ]],                    
          "aoColumns": [
          { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
          { "mData": "customerName", "sTitle": "Customer Name"},
          { "mData": "currency", "sTitle": "Currency"},
          { "mData": "real_ab", "sTitle": "Real ABalance", "sType": "numeric"},
          { "mData": "real_pnl", "sTitle": "Real PNL", "sType": "numeric"},
          { "mData": "target_turnover", "sTitle": "Target Turnover", "sType": "numeric"},
          { "mData": "actual_volume", "sTitle": "Actual Volume", "sType": "numeric"},
          { "mData": "country", "sTitle": "Country" },
          { "mData": "converted_real_pnl", "sTitle": "Converted Real Pnl", "bVisible": false }
          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            $(".show").removeClass("show");
            $(".clear").addClass("show");

            var total_GBP = 0;
            var total_EUR = 0;
            var total_USD = 0;
            var converted_usd = 0;
            
            for ( var i=0 ; i<aiDisplay.length ; i++ )
            {

              converted_usd += parseFloat(aaData[ aiDisplay[i] ]['converted_real_pnl']);

              if (aaData[ aiDisplay[i] ]['currency']=='GBP')
                total_GBP += parseFloat(aaData[ aiDisplay[i] ]['real_pnl']);

              if (aaData[ aiDisplay[i] ]['currency']=='EUR')
                total_EUR += parseFloat(aaData[ aiDisplay[i] ]['real_pnl']);
              
              if (aaData[ aiDisplay[i] ]['currency']=='USD')
                total_USD += parseFloat(aaData[ aiDisplay[i] ]['real_pnl']);
              


            }



            $('#total_gbp').html('&pound;'+total_GBP.toLocaleString());
            $('#total_eur').html('&#8364;'+total_EUR.toLocaleString());
            $('#total_usd').html('$'+total_USD.toLocaleString());

            $('#total_usd_all').html('$'+converted_usd.toLocaleString());



            // total_usd_all = total_USD;

            // var random = Math.floor((Math.random()*100000)+1);
            // $.getScript("http://www.geoplugin.net/currency_converter.gp?from=EUR&to=USD&amount="+total_EUR+"&_=" + random);
            // $.getScript("http://www.geoplugin.net/currency_converter.gp?from=GBP&to=USD&amount="+total_GBP+"&_=" + random);




          } 


        } );



});



}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

// function geoPlugin(data){

//   total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
//   $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

// }
