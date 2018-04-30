
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

function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#gaming_tax_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
      });

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
  
  getGamingTax();
  
}

$(document).ready(function() {
   getDesk(); 
  getAffiliates();
  
  //var d1=new Date();
  //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
  
  $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
  $('#dpStart, #dpEnd').datepicker();

  var date = new Date(), y = date.getFullYear(), m = date.getMonth();
  var firstDay = new Date(y, m, 1);
  var lastDay = new Date(y, m + 1, 0);

  $('#dpEnd').val(lastDay.format("yyyy-MM-dd"));
  $('#dpStart').val(firstDay.format("yyyy-MM-dd"));

    getGamingTax();
    


    $('#dpStart, #dpEnd, #desk, #affiliate').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
        getGamingTax();
    });
  
});

function getGamingTax(){
	

    apiRequest('getGamingTax',$('#range-form').serialize(),'#gaming_tax_holder',function(data){
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
           "aaSorting": [[ 2, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "totalDeposits", "sTitle": "Total Deposits", "sType": "numeric"},
            { "mData": "totalDepositsBonuses", "sTitle": "Total Bonus Deposits", "sType": "numeric"},
            { "mData": "turnover", "sTitle": "Turnover","sType": "numeric"}, 
            { "mData": "cashTurnOver", "sTitle": "Cash Turn Over", "sType": "numeric"},
            { "mData": "bonusTurnOver", "sTitle": "Bonus Turn Over", "sType": "numeric"}
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            
            var total_deposits = 0;
            var total_bonus_deposits = 0;
            var total_turnover = 0;
            var total_cash_turnover = 0;
            var total_bonus_turnover = 0;



            for ( var i=0 ; i<aiDisplay.length ; i++ )
             {

              // aaData[ aiDisplay[i] ]['cashTurnOver']=aaData[ aiDisplay[i] ]['cashTurnOver'].toLocaleString();
              
              total_deposits += parseFloat(aaData[ aiDisplay[i] ]['totalDeposits']);
              total_bonus_deposits += parseFloat(aaData[ aiDisplay[i] ]['totalDepositsBonuses']);
              total_turnover += parseFloat(aaData[ aiDisplay[i] ]['turnover']);
              total_cash_turnover += parseFloat(aaData[ aiDisplay[i] ]['cashTurnOver']);
              total_bonus_turnover += parseFloat(aaData[ aiDisplay[i] ]['bonusTurnOver']);

            }


            $("#total_deposits").html('$'+total_deposits.toLocaleString());
            $("#total_bonus_deposits").html('$'+total_bonus_deposits.toLocaleString());
            $("#total_turnover").html('$'+total_turnover.toLocaleString());
            $("#total_cash_turnover").html('$'+total_cash_turnover.toLocaleString());
            $("#total_bonus_turnover").html('$'+total_bonus_turnover.toLocaleString());

            // $('#total_usd').html('$'+total_USD.toLocaleString() + ' ($' + (total_USD/total_USD_bets).toLocaleString() + '/Bet)');

            // $('#total_gbp_bet').html('&pound;' + (total_GBP/total_GBP_bets).toLocaleString());
            // $('#total_eur_bet').html('&#8364;' + (total_EUR/total_EUR_bets).toLocaleString());
            // $('#total_usd_bet').html('$' + (total_USD/total_USD_bets).toLocaleString());

            // $('#avarage_bets_customer').html(((total_GBP_bets+total_EUR_bets+total_USD_bets)/aiDisplay.length).toLocaleString() + ' Bets');


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
//   $('#total_deposits').html('$'+total_usd_all.toLocaleString());

// }