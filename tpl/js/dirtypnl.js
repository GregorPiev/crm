
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

    apiRequest('getAffiliates',$('#range-form').serialize(),'#asd',function(data){
    
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
  
  getDirtyPnl();
  
}

$(document).ready(function() {
  getDesk();  
  getAffiliates();
  
  //var d1=new Date();
  //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
  
 $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();

    getDirtyPnl();
    


    $('#dpStart, #dpEnd, #desk, #affiliate').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];
        getDirtyPnl();
    });
  
});

function getDirtyPnl(){

    apiRequest('getDirtyPnl',$('#range-form').serialize(),'#dirty_pnl_holder',function(data){
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
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "desk", "sTitle":"Desk","sType":"numeric"},
            { "mData": "turnover", "sTitle":"Turnover","sType":"numeric"},
            { "mData": "dirtypnl", "sTitle":"Dirty Pnl","sType":"numeric"},
            { "mData": "totalDepositsBonuses", "sTitle":"Bonus Deposits","sType":"numeric"},
            { "mData": "totalWithdrawalsBonuses", "sTitle":"Bonus Withdrawals","sType":"numeric"},
            { "mData": "totalWins", "sTitle":"Total Wins","sType":"numeric"},
            { "mData": "totalLosts", "sTitle":"Total Losts","sType":"numeric"}
           ],
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            
    
            var turnover = 0;
            var dirtypnl = 0;
            var totalDepositsBonuses = 0;
            var totalWithdrawalsBonuses = 0;
            var totalWins = 0;
            var totalLosts = 0;



            for ( var i=0 ; i<aiDisplay.length ; i++ )
             {

              // aaData[ aiDisplay[i] ]['cashTurnOver']=aaData[ aiDisplay[i] ]['cashTurnOver'].toLocaleString();
              
              turnover += parseFloat(aaData[aiDisplay[i]]['turnover']);
              dirtypnl += parseFloat(aaData[aiDisplay[i]]['dirtypnl']);
              totalDepositsBonuses += parseFloat(aaData[aiDisplay[i]]['totalDepositsBonuses']);
              totalWithdrawalsBonuses += parseFloat(aaData[aiDisplay[i]]['totalWithdrawalsBonuses']);
              totalWins += parseFloat(aaData[aiDisplay[i]]['totalWins']);
              totalLosts += parseFloat(aaData[aiDisplay[i]]['totalLosts']);

            }


            // $("#total_deposits").html('$'+total_deposits.toLocaleString());
            // $("#total_bonus_deposits").html('$'+total_bonus_deposits.toLocaleString());
            // $("#total_turnover").html('$'+total_turnover.toLocaleString());
            // $("#total_cash_turnover").html('$'+total_cash_turnover.toLocaleString());
            // $("#total_bonus_turnover").html('$'+total_bonus_turnover.toLocaleString());


            $("#total_dirty_pnl").html('$'+dirtypnl.toLocaleString());
            $("#total_wins").html('$'+totalWins.toLocaleString());
            $("#total_turnover").html('$'+turnover.toLocaleString());
            $("#total_losts").html('$'+totalLosts.toLocaleString());

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