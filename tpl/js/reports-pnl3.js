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
  };

  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

$(document).ready(function() {
	getDesk();
    getAffiliates();
    getEmployees();

    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    
   // getPNL();

    $('#dpStart, #dpEnd, #desk').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
       // getPNL();
    });
    $('#desk').change(function(){
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

    apiRequest('getEmployeesShort',$('#range-form').serialize(),'#transactions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.employeeName)); 
      });

    });
    
}

function getPNLByUser() {

  apiRequest('getUserPNL',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    //console.log(data);
  });

}

function getTotalPayouts() {
	
	apiRequest('getTotalPayouts',$('#range-form').serialize(),'#div',function(data){
		
    var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var today = new Date().format('yyyy-MM-dd');
    var date = $('#dpEnd').val()>today ? today : $('#dpEnd').val();
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+date+'.json?app_id='+key;

    $.getJSON( api, function( currecnyData ) {
      var rates = currecnyData.rates;

      
      total_payout = 0;

      for ( var i=0 ; i<data.length ; i++ ){
        
        payout = parseFloat(data[i]['payout']);   

        currency = data[i]['currency'];
        payout = payout/rates[currency];


        total_payout += payout;            
      }
      

      window.payouts = total_payout.toFixed(2);
      console.log("payouts",window.payouts);
      getPNL();
     

    });
     
	  
  });
  
   	
}

function getTotalTurnover() {
	
	apiRequest('getTurnover',$('#range-form').serialize(),'#div',function(data){
		
		total_turnovers = 0;


    var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var today = new Date().format('yyyy-MM-dd');
    var date = $('#dpEnd').val()>today ? today : $('#dpEnd').val();
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+date+'.json?app_id='+key;

    $.getJSON( api, function( currecnyData ) {
      var rates = currecnyData.rates;

      for ( var i=0 ; i<data.length ; i++ ){
        amount = parseFloat(data[i]['amount']);   
        currency = data[i]['currency'];
        amount = amount/rates[currency];

        total_turnovers += amount;            
      } 

      
      window.turnover = total_turnovers.toFixed(2);
      console.log("turnover",window.turnover);

      getTotalPayouts();
     

    });

    	
	  
  });
  
   	
}

function getPNL(){
 	
 		
    $(".list-group-item-heading").removeData("amount");
    apiRequest('testPNL',$('#range-form').serialize(),'#transactions_table_holder',function(data){
        for (var i=0; i < data.length; i++) {
        	 bb = data[i].current_balance - data[i].real_ab;
        	 data[i].BonusBalance = bb.toFixed(2);
        };
        
       
        
       
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
            { "mData": "current_balance", "sTitle": "Customer Balance", "sType": "numeric"},
            { "mData": "BonusBalance", "sTitle": "Bonus Balance", "sType": "numeric"},
            { "mData": "real_pnl", "sTitle": "Real PNL", "sType": "numeric"},
            { "mData": "turnover", "sTitle": "Turnover", "sType": "numeric"},
            { "mData": "target_turnover", "sTitle": "Target Turnover", "sType": "numeric"},
            { "mData": "actual_volume", "sTitle": "Actual Volume", "sType": "numeric"},    
            { "mData": "customer_liability", "sTitle": "Customer Liability", "sType": "numeric"},    
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "country", "sTitle": "Country"}
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
              var base = 'https://openexchangerates.org/api';
              var method = 'historical';
              var today = new Date().format('yyyy-MM-dd');
              var date = $('#dpEnd').val()>today ? today : $('#dpEnd').val();
              var key = 'e658b8bd7566446eb9e141c0082b7ed6';
              var api = base+'/'+method+'/'+date+'.json?app_id='+key;
			  
              getExchangeRates(calcPNL, aaData, aiDisplay, api);

           } 
           
           
        } );
      });
}

var getExchangeRates = function(callbackFunction, aaData, aiDisplay, api) {

console.log('aadata', aaData);
console.log('aiDisplay', aiDisplay);

  $.getJSON( api, function( data ) {
    callbackFunction(data.rates, aaData, aiDisplay);
  });
  
};


var calcPNL = function(rates, aaData, aiDisplay) {
	
  var total = {
    "real_pnl":{},
    "real_ab":{},
    "customer_liability":{}
    };

  var display = "real_pnl";
  var display_test = "Total PNL";

  var total_USD = 0;
  var real_account_balance = 0;
  var customer_liability = 0;
  var total_turnover = 0;
  var turnover = 0;
  var current_balance = 0;
  var bonus = 0; 
  var bonus_balance = 0; 
  

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
    current_balance += parseFloat(aaData[ aiDisplay[i] ]['current_balance']) / rates[aaData[ aiDisplay[i] ]['currency']];
    total_USD       += parseFloat(aaData[ aiDisplay[i] ]['real_pnl']) / rates[aaData[ aiDisplay[i] ]['currency']];
    real_account_balance       += parseFloat(aaData[ aiDisplay[i] ]['real_ab']) / rates[aaData[ aiDisplay[i] ]['currency']];
    customer_liability       += parseFloat(aaData[ aiDisplay[i] ]['customer_liability']) / rates[aaData[ aiDisplay[i] ]['currency']];
    turnover       += parseFloat(aaData[ aiDisplay[i] ]['turn_overUSD'])  ;
    bonus_balance       += parseFloat(aaData[ aiDisplay[i] ]['BonusBalance']) / rates[aaData[ aiDisplay[i] ]['currency']];
  	
  };
  
  $.each(total,function(key,obj){

    if(key == display) {
		$(".rate").html('');
      $.each(obj,function(currency,sum) {
        
        currencySelector = 'total_'+currency+'_'+key.toLowerCase();

        if($("#"+currencySelector).length === 0) {
          $(".dynamic-content").append('<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3><h4 class="list-group-item-heading" id="'+currencySelector+'"></h4><p class="list-group-item-text">'+display_test+' '+currency+'</p></a>');
        }
        if(currency != "USD"){
            $(".rate").append("<div>USD to " + currency + " : " + rates[currency] + "</div>");
			
		}
        $("#"+currencySelector).html(currencySymbol[currency] + sum.toLocaleString() );

      });    

    };

  });
  console.log("turnover in function"+ window.turnover);
  console.log("payouts  in function"+ window.payouts);

  bonus = (window.turnover - window.payouts - total_USD);

  //console.log(bonus);
  $('#total_usd_all').html('$'+total_USD.toLocaleString());
  $('#current_balance').html('$'+current_balance.toLocaleString());
  $('#real_account_balance').html('$'+real_account_balance.toLocaleString());
  $('#customer_liability').html('$'+customer_liability.toLocaleString());
  $('#turnover').html('$'+parseFloat(window.turnover).toLocaleString());
  $('#precent').html(((total_USD/window.turnover)*100).toFixed(1)+"%");
  $('#bonus_balance').html('$'+bonus_balance.toLocaleString());
  $('#bonus').html('$'+bonus.toLocaleString());


};


function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
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

