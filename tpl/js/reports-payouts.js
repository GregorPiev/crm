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
  
  getPayouts();
  
}

$(document).ready(function() {
	getDesk();
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getPayouts();

    $('#dpStart, #dpEnd, #desk').change(function() 
    {
        getPayouts();
    });
});

function getPayouts(){

    apiRequest('getPayouts',$('#range-form').serialize(),'#payouts_table_holder',function(data){
    	console.log(data);
    	$('#payouts_table').dataTable( {
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
	           { "mData": "payout", "sTitle": "Payout"},
	           { "mData": "currency", "sTitle": "Currency"},
	           { "mData": "payoutUSD", "sTitle": "Payout USD"},
           ],
	       "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
	           var base = 'https://openexchangerates.org/api';
	           var method = 'historical';
	           var date = $('#dpEnd').val();
	           var key = 'e658b8bd7566446eb9e141c0082b7ed6';
	           var api = base+'/'+method+'/'+date+'.json?app_id='+key;
	
	           $(".rate").text("");
	
	           getExchangeRates(calcPayouts, aaData, aiDisplay, api);
           	}
    	});    
	});
};

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



var calcPayouts = function(rates, aaData, aiDisplay) {
	var total = {
    	"payout":{}
    };

  	var display = "payout";
  	var display_test = "Payouts";

  	var total_USD = 0;
  	var total_USD_fixid = 0;
  	var number_positions = 0;

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
  
  	$.each(currencySymbol, function(key,value){
    	total["payout"][key] = 0;
  	});

  	for ( var i=0 ; i<aiDisplay.length ; i++ )
  	{
		$.each(total,function(key,value){
      		if(typeof total[key][aaData[ aiDisplay[i] ]['currency']] === 'undefined') {
    			total[key][aaData[ aiDisplay[i] ]['currency']] = 0;
  			}

  			total[key][aaData[ aiDisplay[i] ]['currency']] += parseFloat(aaData[ aiDisplay[i] ][key]);
		});

		total_USD       += parseFloat(aaData[ aiDisplay[i] ]['payout']) / rates[aaData[ aiDisplay[i] ]['currency']];
		total_USD_fixid += parseFloat(aaData[ aiDisplay[i] ]['payoutUSD']);
    	number_positions += 1;
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
	$('#total_usd_all_fixid').html('$'+total_USD_fixid.toLocaleString());
	$('#number_positions').html(number_positions);
};
