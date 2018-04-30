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

var currencySymbol = {
    GBP:'&pound; ',
    USD:'$ ',
    AUD:'$ ',
    CAD:'$ ',
    BRL:'BRL ',
    JPY:'¥ ',
    CNY:'¥ ',
    EUR:'&#8364; ',
 };
 
 var fa_usd = ['AUD','CAD','BRL'];

$(document).ready(function() {
	getDesk();
    getAffiliates();
    
    getEmployees();
    
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    
    $('#desk').change(function(){
    	getEmployees();
    });


});

function getEmployees(){
	$('#employee')
	  .find('option:not([value="0"])')
	  .remove();
	  
	apiRequest('getEmployees',$('#range-form').serialize(),'#pnl_table_holder',function(data){
		$.each(data,function(key,value){
			$('#employee').append($('<option>',{ value :this.userId , text : this.employeeName}));
			
		});
	});  
}  

function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#pnl_table_holder',function(data){
    
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

function getQuickPNL(){

	var today = new Date().format("yyyy-MM-dd");     
  	var currencyDate = $('#dpEnd').val()>today ? today : $('#dpEnd').val();
  	     
	var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var date = currencyDate;
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+date+'.json?app_id='+key;
    
    
    $.getJSON( api, function( data ) {
                 rates = data.rates;
    }).done(function(){ 
        	          
	apiRequest('getQuickPNL',$('#range-form').serialize(),'#pnl_table_holder',function(data){
		
		$('#pnl_table').dataTable( {
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
                 { "mData": "RAB", "sTitle": "Real ABalance", "sType": "numeric"},
                 { "mData": "account_balance", "sTitle": "Customer Balance", "sType": "numeric"},
                 { "mData": "bonus_balance", "sTitle": "Bonus Balance", "sType": "numeric"},
                 { "mData": "real_pnl", "sTitle": "Real PNL", "sType": "numeric"},
                 { "mData": "turnover", "sTitle": "Turnover", "sType": "numeric"},
                 { "mData": "target_turnover", "sTitle": "Target Turnover", "sType": "numeric"},
                 { "mData": "end_turnover", "sTitle": "Actual Volume", "sType": "numeric"},    
                 { "mData": "employee", "sTitle": "Employee"},
                 { "mData": "saleStatus", "sTitle": "Sale Status"},
                 { "mData": "country", "sTitle": "Country"}
              ],
              "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                   var currency_rate = 0;
                   var real_pnl = 0;
                   var pnl = 0;
                   var bonus_pnl = 0;
                   var real_account_balance = 0;
                   var turnover = 0;
                   var account_balance = 0;
                   var percent_real_pnl = 0;
                   var bonus_balance = 0;
                   
                   var display = "real_pnl";
                   var display_text = "Total Real PNL";
                   var display_currencies = [];
                   
                   var total = {
    				"real_pnl":{}
                   };
                   
                   
                   for(var i=0;i<aiDisplay.length;i++){
                   	
                   	   $.each(total,function(key,value){ 
     
      					 if(typeof total[key][aaData[ aiDisplay[i] ]['currency']] === 'undefined') {
        					total[key][aaData[ aiDisplay[i] ]['currency']] = 0;
      					 }

      					 total[key][aaData[ aiDisplay[i] ]['currency']] += parseFloat(aaData[ aiDisplay[i] ][key]);
    				   });
    				   
                   	   currency_rate = rates[aaData[aiDisplay[i]].currency];
                   	   real_pnl += parseFloat(aaData[aiDisplay[i]].real_pnl)/currency_rate;
                   	   pnl += parseFloat(aaData[aiDisplay[i]].pnl)/currency_rate;
                   	   real_account_balance += parseFloat(aaData[aiDisplay[i]].RAB)/currency_rate;
                   	   turnover += parseFloat(aaData[aiDisplay[i]].turnover)/currency_rate;
                   	   account_balance += parseFloat(aaData[aiDisplay[i]].account_balance)/currency_rate;
                   	   bonus_balance += parseFloat(aaData[aiDisplay[i]].bonus_balance)/currency_rate;
                   }
                   
                   bonus_pnl = pnl - real_pnl;
                   percent = (real_pnl!=0 && turnover!=0) ? ((real_pnl/turnover)*100).toFixed(2) : 0;
                   
                   $.each(total,function(key,obj){
                     
                     if(key == display) {
		                $(".rate").html('');
		                $(".dynamic-content").html('');
		                
                        $.each(obj,function(currency,sum) {
        
                          currencySelector = 'total_'+currency+'_'+key.toLowerCase();

                          if($("#"+currencySelector).length === 0) {
                            $(".dynamic-content").append('<a href="javascript:;" class="list-group-item"><h3 class="pull-right">'+
                                                         '<i class="fa fa-'+($.inArray(currency,fa_usd)==-1 ? currency.toLowerCase() : 'usd')+'"></i></h3><h4 class="list-group-item-heading"'+ 
                                                         'id="'+currencySelector+'"></h4><p class="list-group-item-text">'+display_text+' '+currency+'</p></a>');
                          }
                          if(currency != "USD"){
                            $(".rate").append("<div>USD to " + currency + " : " + rates[currency] + "</div>");
			              }
                          $("#"+currencySelector).html(currencySymbol[currency] + sum.toLocaleString() );

                        });    

                     }

                 });
                  
                   $('#real_pnl').html('$ '+real_pnl.toLocaleString());
                   $('#real_account_balance').html('$ '+real_account_balance.toLocaleString());
                   $('#turnover').html('$ '+turnover.toLocaleString());
                   $('#current_balance').html('$ '+account_balance.toLocaleString());
                   $('#percent').html('% '+percent);
                   $('#bonus_pnl').html('$ '+bonus_pnl.toLocaleString());
                   $('#bonus_balance').html('$ '+bonus_balance.toLocaleString());
              }
           });
           
	    });
	   });
}



  