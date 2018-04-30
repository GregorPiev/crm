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

var global_userdata = [];

$(document).ready(function() {
        $("#employee").select2( {
          placeholder: "Select Employees",
          allowClear: true,
          width: "100%"          
        });
        $("#countries").select2( {
          placeholder: "Select Countries",
          allowClear: true,         
          width: "100%"
        });
        $("#leadStatus").select2( {
           placeholder: "Select Lead Status",
           allowClear: true,
           width: "100%"
        });
        $("#accountStatus").select2( {
           placeholder: "Select Account Status",
           allowClear: true,
           width: "100%"
        });
    
        getUserData();
        getLeverateDesk();
        getCountries();
        getLeadStatus();
        getAccountStatus(); 
        $('#desk').change(function(){
            getLeverateEmployees();
        });
	 
        $("#getPortfolio").click(function(e){
            e.preventDefault();
            var agentId = $("#agentId").val();
            var employee = $('#employee').val();
            if(employee==0)
                bootbox.alert("<h4>Please select an employee</h4>");
            else 
                getAgentPortfolio();
                
         });

});
function  getUserData(){
    
  	apiRequest('getUserData',$('#range-form').serialize(),'#employee',function(userdata){
  		
  		global_userdata = userdata;
  		if (userdata.spotId==0) {
  			getLeverateEmployees();
  			$('#getPortfolio').removeClass('disabled');
			$(".employee").show();
  			$(".desk").show();
  		}else{
  			$(".employee").remove();
  			$(".desk").hide();
  			if(userdata[globalBrandName+"Id"] != 0){
  			   $('#getPortfolio').removeClass('disabled');	
  			   $("#range-form").append('<input type="hidden" name="employee" value="'+userdata[globalBrandName+"Id"]+'"/>'); 	
  			}else
  			   bootbox.alert("<h4>The user is not defined at FM System. Please contact with HelpDesk</h4>");
  			
  		}
  		
  	});	
}

function getLeverateEmployees () {
       
    $('#employee').find('option').remove().end().append('<option value="0">All</option>').val('0');
    var param = {desk: $("#desk option:selected").val(),short:true};
    
    apiRequestBrand('getLeverateEmployees',param,'#portfolio_table_holder',true,capitalBrandName,function(data){
      $.each(data, function() {
        $('#employee').append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });

    });
}

function getCountries () {
    
    apiRequestBrand('getCountries','','#countries',true,capitalBrandName,function(data){
        
      $.each(data, function() {
      	if (this.ISO!='') {
	        $('#countries').append($('<option>', { value : this.countryId , text:this.countryName + ' - ' + this.ISO}));
      	}
      });

    });
}

function getLeadStatus(){   
	
   var param ={table:'AccountBase' ,field:'lv_leadstatus'};
   apiRequestBrand('getStringData',param,'#leadStatus',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#leadStatus').append($('<option>',{value: value.id, text: value.value}));
		});		
   });
}

function getAccountStatus(){
   var param ={table:'AccountBase' , field:'lv_accountstatus'};
   apiRequestBrand('getStringData',param,'#accountStatus',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#accountStatus').append($('<option>',{value: value.id, text: value.value}));
		});
	});
}

function getAgentPortfolio(){
	
	$('#getPortfolio').addClass('disabled');
	
	var totalDepositFilter = $('#totalDeposits').val();
	var portfolio = [];
	var customerIds = [];
	var currencyDate=new Date().format("yyyy-MM-dd");  	     
    var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var date = currencyDate;
    var keyRate = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+date+'.json?app_id='+keyRate;
    var rates = 0;
    
    $.getJSON( api )
    .fail(function(jqXHR, textStatus, error){
       bootbox.alert('<h4>Currency Rate Error. Please contact with Tech Department</h4>');
       $('#getPortfolio').removeClass('disabled');	 
    }) 
    .done(function(dataRate){     
       rates = dataRate.rates; 	
       apiRequestBrand('getAgentPortfolio',$('#range-form').serialize(),'#portfolio_table_holder',true,capitalBrandName,function(data){    	 
       
          var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';      
      	  var href = '';
      	  
      	  var account_keys = ['totalDeposits','totalWithdrawals','balance','equity','credit','pnl','realPNL','realAccountBalance'];
          for(var i=0;i<data.length; i++){
		 	  
		 	  $.each(account_keys,function(){
		 	  	  data[i][this+'USD'] = 0;
		 	  });
		 	  $.each(data[i]['tpAccounts'],function(key,value){
		 	  	 $.each(account_keys,function(){
		 	  	 	data[i][this+'USD'] += parseFloat(value[this])/rates[value['currency']];
		 	  	 });
		 	  });
		 	  if(totalDepositFilter == '1k' && parseFloat(data[i]['totalDepositsUSD']) < 1000){
		 	  	 portfolio.push(data[i]);
		 	  	 customerIds.push(data[i]['customerId']);
		 	  }else if(totalDepositFilter == '1k-5k' && parseFloat(data[i]['totalDepositsUSD']) >= 1000 && parseFloat(data[i]['totalDepositsUSD']) <= 5000){
		 	  	 portfolio.push(data[i]);
		 	  	 customerIds.push(data[i]['customerId']);
		 	  }else if(totalDepositFilter == '5k' && parseFloat(data[i]['totalDepositsUSD']) > 5000){
		 	  	 portfolio.push(data[i]);
		 	  	 customerIds.push(data[i]['customerId']);
		 	  }else if(totalDepositFilter == ''){
		 	  	 portfolio.push(data[i]);
		 	  	 customerIds.push(data[i]['customerId']);
		 	  }
		 	  	 	  	  
		 }
		 
		 portfolioSummary(customerIds,rates);
		 
		 for(var i=0;i<portfolio.length; i++){
		 	  $.each(account_keys,function(){
		 	  	  portfolio[i][this+'USD'] = portfolio[i][this+'USD'].toLocaleString('en-US', { minimumFractionDigits: 2,maximumFractionDigits: 2 });
		 	  });
		 }

	      $('#portfolio_table').dataTable( {
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
	         "aaData": portfolio,
	         "aaSorting": [[ 0, "desc" ]],                    
	         "aoColumns": [
	            { "mData": "customerId", "sTitle": "Customer Id", "bUseRendered": false,
	              "fnRender": function(oObj){
	              	 href = url + '/?id='+oObj.aData.customerId;
		             return '<a href="'+href+'" target="_blank">'+oObj.aData.customerId+'</a>' ;
	              }
	            },
	            { "mData": "customerName", "sTitle": "Customer Name", "bUseRendered": false,
	              "fnRender": function(oObj){
	              	 href = url + '/?id='+oObj.aData.customerId;
		             return '<a href="'+href+'" target="_blank">'+oObj.aData.customerName+'</a>' ;
	              }   
	            },
	            { "mData": "email", "sTitle": "Email"},
	            { "mData": "regTime", "sTitle": "Registration"},
	           	{ "mData": "fdd", "sTitle": "FDD"},
	            { "mData": "country", "sTitle": "Country"},
	            { "mData": "totalDepositsUSD", "sTitle": "Total Deposits USD", "sType": "commaseparated-num"},
	            { "mData": "totalWithdrawalsUSD", "sTitle": "Total Withdrawals USD", "sType": "commaseparated-num"},
	            { "mData": "balanceUSD", "sTitle": "Balance USD", "sType": "commaseparated-num"},
	            { "mData": "equityUSD", "sTitle": "Equity USD", "sType": "commaseparated-num"},
	            { "mData": "pnlUSD", "sTitle": "Pnl USD", "sType": "commaseparated-num"},
	            { "mData": "realPNLUSD", "sTitle": "RealPnl USD", "sType": "commaseparated-num"},
	            { "mData": "realAccountBalanceUSD", "sTitle": "RAB USD", "sType": "commaseparated-num"},	             
	           ]
          } );
         if(global_userdata.per_export == 0)
             $('#portfolio_table_holder .DTTT_container').css('display','none');
         });
         $('#getPortfolio').removeClass('disabled');
       });   
}


function portfolioSummary(customers,rates){ 
	var total_deposits = 0;
	var total_deposits_cancelled = 0;
	var total_withdrawals = 0;
	var total_withdrawals_cancelled = 0;
	var total_net_credits = 0;
	var total_net_debits = 0;
	
    post_data = {customers: customers};
	apiRequestBrand('portfolioSummary',post_data,'#summary',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			var amount = parseFloat(value['amount'])/rates[value['currency']];
			if(value.transactionType == 'Deposit' && value.methodOfPayment != 'Internal'){
				total_deposits += amount;
			}
			if(value.transactionType == 'Deposit Cancelled' && value.methodOfPayment != 'Internal'){
				total_deposits_cancelled += amount;
			}
			if((value.transactionType == 'Withdrawal' || value.transactionType == 'Charge Back') && value.methodOfPayment != 'Internal'){
				total_withdrawals += amount;
			}
			if((value.transactionType == 'Withdrawal Cancelled' || value.transactionType == 'Charge Back Cancelled') && value.methodOfPayment != 'Internal'){
				total_withdrawals_cancelled += amount;
			}
			if(value.transactionType == 'Credit' || value.transactionType == 'Bonus' || value.transactionType == 'Credit Line'){
				total_net_credits += amount;
			}
			if(value.transactionType == 'Credit Cancelled' || value.transactionType == 'Bonus Cancelled' || value.transactionType == 'Credit Line Cancelled'){
				total_net_credits -= amount;
			}
			if(value.transactionType == 'Debit'){
				total_net_credits += amount;
			}
			if(value.transactionType == 'Debit Cancelled'){
				total_net_credits -= amount;
			}
		});
		
		$('#total_deposits').html('$ '+total_deposits.toLocaleString());
	    $('#total_deposits_cancelled').html('$ '+total_deposits_cancelled.toLocaleString());
	    $('#total_withdrawals').html('$ '+total_withdrawals.toLocaleString());
	    $('#total_withdrawals_cancelled').html('$ '+total_withdrawals_cancelled.toLocaleString());
	    $('#total_net_credits').html('$ '+total_net_credits.toLocaleString());
	    $('#total_net_debits').html('$ '+total_net_debits.toLocaleString());
			
	});
}

function getLeverateDesk(){
           
        apiRequestBrand('getLeverateDesk', '', '#desk',true,capitalBrandName,function(data) {
            
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
			});
	}); 
}