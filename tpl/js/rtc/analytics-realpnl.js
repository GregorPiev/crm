window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.info('%cScript Error: See Browser Console for Detail','font-size:18px;color:darkred');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log("%c Error JS:" + message,"font-size:12px;color:indigo");
    }

    return true;
};
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

function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#pEnd').val(endDate.format("yyyy-MM-dd"));
    $('#pStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#pEnd').val(endDate.format("yyyy-MM-dd"));
  $('#pStart').val(startDate.format("yyyy-MM-dd"));
    
  }
}

var rates=[];

$(document).ready(function(){
	$('#pStart,#pEnd').val(new Date().format('yyyy-MM-dd')).datepicker();
        $("#employee").select2( {
          placeholder: "Select Employee or leave blank for all",
          allowClear: true,
          width: "100%"
         });
     
	getLeverateDesk();
	$('#desk').change(function(){
		getLeverateEmployees();
	});
	
});

function getLeverateEmployees () {

    $('#employee').find('option').remove().end();
    
    var param ="desk=" + $("#desk").val();
    
    apiRequestBrand('getLeverateEmployees',param,'#pnl_table_holder',true,capitalBrandName,function(data){   

      $.each(data, function() {
        $('#employee').append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });
      
    });
    
}

function getRealPNL(){
	$('#pnlButton').addClass('disabled');
	
    var today = new Date().format("yyyy-MM-dd");     
    var currencyDate = $('#pEnd').val()>today ? today : $('#pEnd').val();
    var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+currencyDate+'.json?app_id='+key;
    var showNotClosed = !$('#closePnl').prop('checked');
    var param =$('#range-form').serialize();
    $('#closePnl').prop("disabled", true);
    rates = [];
    $.getJSON(api) 
    .fail(function(jqXHR, textStatus, error){
       bootbox.alert('<h4>Currency Rate Error. Please contact with Tech Department</h4>');
    })
    .done(function(currencyData) {
        rates = currencyData.rates;             
             
       	apiRequestBrand('getRealPnl',param,'#pnl_table_holder',true,capitalBrandName,function(data){        
            $('#pnlButton').removeClass('disabled');
            $('#closePnl').prop("disabled", false);
            
            var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';      
      	    var href = '';
      	    
       		for(var i in data){
       		  data[i].real_pnlUSD = parseFloat((parseFloat(data[i].real_pnl)/rates[data[i].currency]).toFixed(2)).toLocaleString();
       		  data[i].preNetDeposits = parseFloat(data[i].preNetDeposits).toLocaleString();
       		  data[i].pre_Closed_Pnl = parseFloat(data[i].pre_Closed_Pnl).toLocaleString();
       		  data[i].pre_Open_Pnl = parseFloat(data[i].pre_Open_Pnl).toLocaleString();
       		  data[i].pre_Pnl = parseFloat(data[i].pre_Pnl).toLocaleString();
       		  data[i].pre_RAB = parseFloat(data[i].pre_RAB).toLocaleString();
       		  data[i].endNetDeposits = parseFloat(data[i].endNetDeposits).toLocaleString();
       		  data[i].end_Closed_Pnl = parseFloat(data[i].end_Closed_Pnl).toLocaleString();
       		  data[i].end_Open_Pnl = parseFloat(data[i].end_Open_Pnl).toLocaleString();
       		  data[i].end_Pnl = parseFloat(data[i].end_Pnl).toLocaleString();
       		  data[i].end_RAB = parseFloat(data[i].end_RAB).toLocaleString();
       		  data[i].pnl = parseFloat(data[i].pnl).toLocaleString();
       		  data[i].real_pnl = parseFloat(data[i].real_pnl).toLocaleString();
       		  data[i].balance = parseFloat(data[i].balance).toLocaleString();
       		  data[i].equity = parseFloat(data[i].equity).toLocaleString();                                     
                                   
       		}
       		           
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
             "bFilter": true,
             "bLengthChange": true,
             "aaData": data,
             "aaSorting": [[15, "asc" ]],                    
             "aoColumns": [
             { "mData": "tpAccount", "sTitle": "TPAccount", "sType": "numeric", "bUseRendered": false,
               "fnRender": function(oObj){
             	href = url + '/?id='+oObj.aData.accountId;
		        return '<a href="'+href+'" target="_blank">'+oObj.aData.tpAccount+'</a>';
               }                 
             },             
             { "mData": "accountName", "sTitle": "Customer Name"},
             
             { "mData": "currency", "sTitle": "Curr"}, 
             { "mData": "preNetDeposits", "sTitle": "Start Net Deposit", "sType": "commaseparated-num"},             
             
             { "mData": "pre_Closed_Pnl", "sTitle": "Start Close PNL", "sType": "commaseparated-num"},
             { "mData": "pre_Open_Pnl", "sTitle": "Start Open PNL", "sType": "commaseparated-num","bVisible":showNotClosed},
             { "mData": "pre_Pnl", "sTitle": "Start PNL","sType": "commaseparated-num","bVisible":showNotClosed},
             { "mData": "pre_RAB", "sTitle": "Start RAB", "sType": "commaseparated-num"},                         
            
             { "mData": "endNetDeposits", "sTitle": "End Net Deposit", "sType": "commaseparated-num"},
             
             { "mData": "end_Closed_Pnl", "sTitle": "End Close PNL", "sType": "commaseparated-num"},
             { "mData": "end_Open_Pnl", "sTitle": "End Open PNL", "sType": "commaseparated-num","bVisible":showNotClosed},             
             { "mData": "end_Pnl", "sTitle": "End PNL", "sType": "commaseparated-num","bVisible":showNotClosed},
             
             
             { "mData": "end_RAB", "sTitle": "End RAB", "sType": "commaseparated-num"},             
             { "mData": "pnl", "sTitle": "PNL", "sType": "commaseparated-num"},
            
            { "mData": "real_pnl", "sTitle": "Real Pnl", "sType": "commaseparated-num"},
             { "mData": "real_pnlUSD", "sTitle": "Real Pnl USD", "sType": "commaseparated-num"},
             { "mData": "balance","sTitle": "Balance", "sType": "commaseparated-num"},
             { "mData": "equity", "sTitle": "Equity", "sType": "commaseparated-num"}, 
             { "mData": "employee", "sTitle": "Employee"},
             { "mData": "country", "sTitle": "Country"}
             ],
             "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
             	  
                var total_pnl = 0;
                var total_real_pnl = 0;
                var total_net_deposits = 0;
                var total_real_losers = 0;
                var total_real_winners = 0;
                var total_balance = 0;
                var total_equity = 0;
                var total_rab = 0;
                var pnl = 0, real_pnlUSD = 0, net_deposit = 0, balance = 0, equity = 0, rab = 0;
                
                for(var i=0;i<aiDisplay.length;i++){
                   pnl = parseFloat((aaData[aiDisplay[i]].pnl).replace(/,/g,""));
                   real_pnlUSD = parseFloat((aaData[aiDisplay[i]].real_pnlUSD).replace(/,/g,""));
                   balance = parseFloat((aaData[aiDisplay[i]].balance).replace(/,/g,""));
                   equity = parseFloat((aaData[aiDisplay[i]].equity).replace(/,/g,""));
                   rab = parseFloat((aaData[aiDisplay[i]].end_RAB).replace(/,/g,""));
                   net_deposit = parseFloat((aaData[aiDisplay[i]].endNetDeposits).replace(/,/g,""))-parseFloat((aaData[aiDisplay[i]].preNetDeposits).replace(/,/g,""));
                   	
                   total_pnl += pnl/rates[aaData[aiDisplay[i]].currency];
                   total_real_pnl += real_pnlUSD;
                   total_balance += balance/rates[aaData[aiDisplay[i]].currency];
                   total_equity += equity/rates[aaData[aiDisplay[i]].currency];
                   total_rab += rab/rates[aaData[aiDisplay[i]].currency];
                   total_net_deposits += net_deposit/rates[aaData[aiDisplay[i]].currency];
                   real_pnlUSD<0 ? total_real_losers += real_pnlUSD : total_real_winners += real_pnlUSD;  	
                } 
               
                $('#total_pnl').html('$ '+total_pnl.toLocaleString());
                $('#total_real_pnl').html('$ '+total_real_pnl.toLocaleString());
                $('#total_balance').html('$ '+total_balance.toLocaleString());
                $('#total_equity').html('$ '+total_equity.toLocaleString());
                $('#total_rab').html('$ '+total_rab.toLocaleString());
                $('#total_net_deposits').html('$ '+total_net_deposits.toLocaleString());
                $('#total_real_losers').html('$ '+total_real_losers.toLocaleString());
                $('#total_real_winners').html('$ '+total_real_winners.toLocaleString());	
             }
       	     });
    });
	});
}

function getLeverateDesk(){
    
	apiRequestBrand('getLeverateDesk', $('#range-form').serialize(), '#desk',true,capitalBrandName, function(data) { 
            $.each(data, function(key, value) { 
                     $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
            });
            getLeverateEmployees();
	});
}


