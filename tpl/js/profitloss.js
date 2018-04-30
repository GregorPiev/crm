
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

    apiRequest('getAffiliates',$('#range-form').serialize(),'#profitloss_table_holder',function(data){
    
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
  
  getProfitLoss();
  getProfitLossByAffiliate();
  
}

$(document).ready(function() {
    getDesk();
    getAffiliates();
    
    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getProfitLoss();
    getProfitLossByAffiliate();
    


    $('#dpStart, #dpEnd, #desk, #affiliate').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
        getProfitLoss();
        getProfitLossByAffiliate();
    });
  
});

function getProfitLoss(){

    apiRequest('getProfitLoss',$('#range-form').serialize(),'#profitloss_table_holder',function(data){
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
            { "mData": "id", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "aff_id", "sTitle": "Affiliate"},
            { "mData": "self_deposit", "sTitle": "FTD"},
            { "mData": "FTD", "sTitle": "Self Deposit"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "currency", "sTitle": "Currency"}
            
            
            
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            var total_deposits = 0;
            var total_deposits_new = 0;
            var total_withdrawals = 0;
            var total_bonuses = 0;
            var total_bonuses_w = 0;
            var total_deposits_ftd = 0;

            var total_fdts = 0;
            var total_deposits_number = 0;

             for ( var i=0 ; i<aiDisplay.length ; i++ )
             {

              total_deposits_number++;

              if (aaData[ aiDisplay[i] ]['FTD']==1) {
                total_deposits_ftd += parseFloat(aaData[ aiDisplay[i] ]['amount']);
                total_fdts ++;
              }

                           
                
              /*
              if (aaData[ aiDisplay[i] ]['paymentMethod']!='Bonus' && aaData[ aiDisplay[i] ]['ttype']=='Deposit' && aaData[ aiDisplay[i] ]['NewCustomer']=='Yes')
                total_deposits_new += parseFloat(aaData[ aiDisplay[i] ]['amountUSD']);
                */
                
              //console.log(aaData[ aiDisplay[i] ]['amountUSD']);
             }
             
             //var nCells = nRow.getElementsByTagName('th');
             //  nCells[1].innerHTML = 'asd';
        
             
             $('#total_deposits').html('$'+total_deposits.toLocaleString());
             $('#total_withdrawals').html('$'+total_withdrawals.toLocaleString());
             $('#total_bonuses').html('$'+total_bonuses.toLocaleString());
             $('#total_bonuses_w').html('$'+total_bonuses_w.toLocaleString());
             
             $('#total_deposits_ftd').html('$'+total_deposits_ftd.toLocaleString());
             
             
             $('#total_ftds').html(total_fdts.toLocaleString());
             $('#total_deposits_number').html(total_deposits_number.toLocaleString());
             



              var total_GBP = 0;
              var total_EUR = 0;
              var total_USD = 0;
            
             for ( var i=0 ; i<aiDisplay.length ; i++ )
             {
             
              if (aaData[ aiDisplay[i] ]['currency']=='GBP')
                total_GBP += parseFloat(aaData[ aiDisplay[i] ]['amount']);
                
              if (aaData[ aiDisplay[i] ]['currency']=='EUR')
                total_EUR += parseFloat(aaData[ aiDisplay[i] ]['amount']);
              
              if (aaData[ aiDisplay[i] ]['currency']=='USD')
                total_USD += parseFloat(aaData[ aiDisplay[i] ]['amount']);
              
             
             }
             
             
             
             $('#total_gbp').html('&pound;'+total_GBP.toLocaleString());
             $('#total_eur').html('&#8364;'+total_EUR.toLocaleString());
             $('#total_usd').html('$'+total_USD.toLocaleString());
             
             total_usd_all = total_USD;
             
             var random = Math.floor((Math.random()*100000)+1);
             $.getScript("http://www.geoplugin.net/currency_converter.gp?from=EUR&to=USD&amount="+total_EUR+"&_=" + random);
             $.getScript("http://www.geoplugin.net/currency_converter.gp?from=GBP&to=USD&amount="+total_GBP+"&_=" + random);

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

function getProfitLossByAffiliate(){

    apiRequest('getProfitLossByAffiliate',$('#range-form').serialize(),'#profitlossaffiliate_div_holder',function(data){
        //console.log(data);
         //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime
         
        
                $('#profitlossaffiliate_table_holder').dataTable( {
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
            { "mData": "aff_id", "sTitle": "Affiliate"},
            { "mData": "aff_customers", "sTitle": "Customers"},
            { "mData": "deposits", "sTitle": "Deposits"},
            { "mData": "FTD", "sTitle": "FTD"},
            { "mData": "self_deposit", "sTitle": "Self Deposit"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "aff_cost", "sTitle": "CT"},
            { "mData": "aff_payment", "sTitle": "Cost", "sType": "numeric"},
            { "mData": "aff_gross", "sTitle": "Gorss Profit/Loss", "sType": "numeric"}
            
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
             var total_gross = 0;
            // var total_deposits_new = 0;
            // var total_withdrawals = 0;
            // var total_bonuses = 0;
            // var total_bonuses_w = 0;
            // var total_deposits_ftd = 0;
            // var total_fdts = 0;

             for ( var i=0 ; i<aiDisplay.length ; i++ )
             {
             
              if (aaData[ aiDisplay[i] ]['aff_gross']>0) {
                total_gross += parseFloat(aaData[ aiDisplay[i] ]['aff_gross']);
              }

                           
                
             
             }
            
             
            //  $('#total_deposits').html('$'+total_deposits.toLocaleString());
            //  $('#total_withdrawals').html('$'+total_withdrawals.toLocaleString());
            //  $('#total_bonuses').html('$'+total_bonuses.toLocaleString());
            //  $('#total_bonuses_w').html('$'+total_bonuses_w.toLocaleString());
             
            //  $('#total_deposits_ftd').html('$'+total_deposits_ftd.toLocaleString());
             
             if(total_gross <= 0) {
              $(".total_gross i").removeClass("fa-smile-o").addClass("fa-frown-o");
             }
             else {
              $(".total_gross i").removeClass("fa-smile-o, fa-frown-o").addClass("fa-smile-o");
              
             }
              $('#total_gross').html(total_gross.toLocaleString());
             



            //   var total_GBP = 0;
            //   var total_EUR = 0;
            //   var total_USD = 0;
            
            //  for ( var i=0 ; i<aiDisplay.length ; i++ )
            //  {
             
            //   if (aaData[ aiDisplay[i] ]['currency']=='GBP')
            //     total_GBP += parseFloat(aaData[ aiDisplay[i] ]['amount']);
                
            //   if (aaData[ aiDisplay[i] ]['currency']=='EUR')
            //     total_EUR += parseFloat(aaData[ aiDisplay[i] ]['amount']);
              
            //   if (aaData[ aiDisplay[i] ]['currency']=='USD')
            //     total_USD += parseFloat(aaData[ aiDisplay[i] ]['amount']);
              
             
            //  }
             
             
             
            //  $('#total_gbp').html('&pound;'+total_GBP.toLocaleString());
            //  $('#total_eur').html('&#8364;'+total_EUR.toLocaleString());
            //  $('#total_usd').html('$'+total_USD.toLocaleString());
             
            //  total_usd_all = total_USD;
             
            //  var random = Math.floor((Math.random()*100000)+1);
            //  $.getScript("http://www.geoplugin.net/currency_converter.gp?from=EUR&to=USD&amount="+total_EUR+"&_=" + random);
            //  $.getScript("http://www.geoplugin.net/currency_converter.gp?from=GBP&to=USD&amount="+total_GBP+"&_=" + random);

           } 
           
           
    } );
    
    
    
      });
      
      
}

function geoPlugin(data){

  total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
  $('#total_deposits').html('$'+total_usd_all.toLocaleString());

}