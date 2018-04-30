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

    getTurnover();

  }

  $(document).ready(function() {


	getDesk();
    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getTurnover();
    getEmployees();
    


    $('#dpStart, #dpEnd, #desk, #employee').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
      getTurnover();
    });
    
    
    $('#desk').change(function() 
    {
      getEmployees();
    });


    $("#openaccounts").on("click",function() {
      getTurnover();
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
  function getTurnover(){

    apiRequest('getTurnover',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      //console.log(data);
      //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime
         
      var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      var href = '';
       /*    for(var i=0,j=data.length; i<j; i++){
          href = url + '/?id='+data[i].customerId;
          data[i].customerId = '<a href="'+href+'" >'+data[i].customerId+'</a>' ;
          data[i].customerName = '<a href="'+href+'" >'+data[i].customerName+'</a>' ;
     }; @Eli: I am canceling this code; it is not good for sorting */

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
      { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric",
        "mRender": function(data,type,row){
        	if(type=='display'){
        		href = url + '/?id='+data;
        		return '<a href="'+href+'" target="_blank">'+data+'</a>';
        	}
        	return data;
        }
      },
      { "mData": "customerName", "sTitle": "Customer Name",
        "mRender": function(data,type,row){
        	if(type=='display'){
        		href = url + '/?id='+row.customerId;
        		return '<a href="'+href+'" target="_blank">'+data+'</a>';
        	}
        	return data;
        }
      },
      { "mData": "employeeName", "sTitle": "Employee Name"},
      { "mData": "currency", "sTitle": "Currency"},
      { "mData": "amount", "sTitle": "Amount","sType": "numeric"},
      { "mData": "bets", "sTitle": "Bets","sType": "numeric"},
      { "mData": "avarage", "sTitle": "Amount/Bet","sType": "numeric"}, 
      { "mData": "saleStatus", "sTitle": "Sale Status"},
      /*{ "mData": "real_account_balance", "sTitle": "Real Account Balance","sType": "numeric", 
        "mRender": function ( data, type, row ) {
              return parseFloat(data).toFixed(2);
          }
        }*/
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

        var base = 'https://openexchangerates.org/api';
        var method = 'historical';
        var today = new Date().format('yyyy-MM-dd');
        var date = $('#dpEnd').val()>today ? today : $('#dpEnd').val();
        var key = 'e658b8bd7566446eb9e141c0082b7ed6';
        var api = base+'/'+method+'/'+date+'.json?app_id='+key;

        $(".rate").text("");

        getExchangeRates(calcTurnover, aaData, aiDisplay, api);

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

var getExchangeRates = function(callbackFunction, aaData, aiDisplay, api) {

  $.getJSON( api, function( data ) {
    callbackFunction(data.rates, aaData, aiDisplay);
  });
  
};

var calcTurnover = function(rates, aaData, aiDisplay) {
  
var total = {
  "amount":{}
  };

var display = "amount";
var display_test = "Total";

var total_USD = 0;
var total_bets = {};
var total_bets_number = 0;

var currencySymbol = {
  GBP:'&pound;',
  USD:'$',
  AUD:'$',
  CAD:'$',
  BRL:'BRL ',
  USD:'$',
  JPY:'¥',
  EUR:'&#8364;'
};


  for ( var i=0 ; i<aiDisplay.length ; i++ )
  {
    $.each(total,function(key,value){ 
     
      if(typeof total[key][aaData[ aiDisplay[i] ]['currency']] === 'undefined') {
        total[key][aaData[ aiDisplay[i] ]['currency']] = 0;
      }

      total[key][aaData[ aiDisplay[i] ]['currency']] += parseFloat(aaData[ aiDisplay[i] ][key]);


    });

    total_USD       += parseFloat(aaData[ aiDisplay[i] ]['amount']) / rates[aaData[ aiDisplay[i] ]['currency']];
    total_bets_number += parseFloat(aaData[ aiDisplay[i] ]['bets']);
  };

  $.each(total,function(key,obj){

    if(key == display) {

      $.each(obj,function(currency,sum) {
        
        currencySelector = 'total_'+currency+'_'+key.toLowerCase();

        if($("#"+currencySelector).length === 0) {
          $(".dynamic-content").append('<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3><h4 class="list-group-item-heading" id="'+currencySelector+'"></h4><p class="list-group-item-text">'+display_test+' '+currency+'</p></a>');
        }
        if(currency != "USD")
            $(".rate").append("<div>USD to " + currency + " : " + rates[currency] + "</div>");

        $("#"+currencySelector).html(currencySymbol[currency] + sum.toLocaleString() );

      });    

    };

  });

$('#total_usd_all').html('$'+total_USD.toLocaleString());
$('#avarage_bets_customer').html((aiDisplay.length!= 0 ? ((total_bets_number)/aiDisplay.length).toLocaleString() : 0) + ' Bets');







// var calcTurnover = function(rates, aaData, aiDisplay) {
//   var rates = rates[0];
  
//   var total = {};
//   var total_bets = {};
  
//   var total_USD = 0;
//   var total_bets_number = 0;

//   var currencySymbol = {
//     GBP:'&pound;',
//     USD:'$',
//     AUD:'$',
//     CAD:'$',
//     BRL:'BRL ',
//     USD:'$',
//     JPY:'¥',
//     EUR:'&#8364;'
//   };


//   for ( var i=0 ; i<aiDisplay.length ; i++ )
//   {
//     if(typeof total[aaData[ aiDisplay[i] ]['currency']] === 'undefined') {
//       total[aaData[ aiDisplay[i] ]['currency']] = 0;
//       total_bets[aaData[ aiDisplay[i] ]['currency']] = 0;
//     }
//     total[aaData[ aiDisplay[i] ]['currency']] += parseFloat(aaData[ aiDisplay[i] ]['amount']);
//     total_bets[aaData[ aiDisplay[i] ]['currency']] += parseFloat(aaData[ aiDisplay[i] ]['bets']);

//   };

//   $.each(total, function(currency,amount) {
//     currencySelector = '#total_'+currency.toLowerCase();
//     currencySelectorBets = '#total_'+currency.toLowerCase()+'_bet';

//     $(currencySelector).html(currencySymbol[currency] + total[currency].toLocaleString() + ' (' + currencySymbol[currency] + (total[currency]/total_bets[currency]).toLocaleString() + '/Bet)');
//     $(currencySelectorBets).html(currencySymbol[currency] + (total[currency]/total_bets[currency]).toLocaleString());

//     total_USD += total[currency] / rates[currency];
//     total_bets_number += total_bets[currency];

//   });

  








  // var total_GBP = 0;
  // var total_EUR = 0;
  // var total_USD = 0;

  // var total_GBP_bets = 0;
  // var total_EUR_bets = 0;
  // var total_USD_bets = 0;

  // for ( var i=0 ; i<aiDisplay.length ; i++ )
  // {

  //   if (aaData[ aiDisplay[i] ]['currency']=='GBP') {
  //     total_GBP += parseFloat(aaData[ aiDisplay[i] ]['amount']);
  //     total_GBP_bets += parseFloat(aaData[ aiDisplay[i] ]['bets']);
  //   }

  //   if (aaData[ aiDisplay[i] ]['currency']=='EUR') {
  //     total_EUR += parseFloat(aaData[ aiDisplay[i] ]['amount']);
  //     total_EUR_bets += parseFloat(aaData[ aiDisplay[i] ]['bets']);
  //   }

  //   if (aaData[ aiDisplay[i] ]['currency']=='USD') {
  //     total_USD += parseFloat(aaData[ aiDisplay[i] ]['amount']);
  //     total_USD_bets += parseFloat(aaData[ aiDisplay[i] ]['bets']);
  //   }

  // }


  // $('#total_gbp').html('&pound;'+total_GBP.toLocaleString() + ' (&pound;' + (total_GBP/total_GBP_bets).toLocaleString() + '/Bet)');
  // $('#total_eur').html('&#8364;'+total_EUR.toLocaleString() + ' (&#8364;' + (total_EUR/total_EUR_bets).toLocaleString() + '/Bet)');
  // $('#total_usd').html('$'+total_USD.toLocaleString() + ' ($' + (total_USD/total_USD_bets).toLocaleString() + '/Bet)');

  // $('#total_gbp_bet').html('&pound;' + (total_GBP/total_GBP_bets).toLocaleString());
  // $('#total_eur_bet').html('&#8364;' + (total_EUR/total_EUR_bets).toLocaleString());
  // $('#total_usd_bet').html('$' + (total_USD/total_USD_bets).toLocaleString());

  // $('#avarage_bets_customer').html(((total_GBP_bets+total_EUR_bets+total_USD_bets)/aiDisplay.length).toLocaleString() + ' Bets');


  // total_usd_all = total_USD;

  // var random = Math.floor((Math.random()*100000)+1);
  // $.getScript("http://www.geoplugin.net/currency_converter.gp?from=EUR&to=USD&amount="+total_EUR+"&_=" + random);
  // $.getScript("http://www.geoplugin.net/currency_converter.gp?from=GBP&to=USD&amount="+total_GBP+"&_=" + random);

};


// function geoPlugin(data){

//   total_usd_all = total_usd_all + parseFloat(data.to.amount.split(",").join(""));
  
//   $('#total_usd_all').html('$'+total_usd_all.toLocaleString());

// };
