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

/* $.extend( $.fn.dataTableExt.oSort, {
    "commaseparated-num-pre": function ( a ) {
        a = a.replace(",", "" );
        return parseFloat( a );
    },
 
    "commaseparated-num-asc": function ( a, b ) {
        return a - b;
    },
 
    "commaseparated-num-desc": function ( a, b ) {
        return b - a;
    }
} ); added to footer.html as a plugin*/

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
	getDesk();
	$('#desk').change(function(){
		getEmployeesForRetention();
	});
	
});

$(document).on('click','a.positions',function(){
	event.preventDefault();
	var customerId=$(this).attr('data-id');
	var customerName=$(this).attr('data-customerName');
	var currency=$(this).attr('data-currency');
	var currencyLowerCase=currency.toLowerCase();
	var pnl=parseFloat($(this).attr('data-pnl').replace(",",""));
	var realPnl=parseFloat($(this).attr('data-realPnl').replace(",",""));
	var pnlUSD=(pnl/rates[currency]);
	var realPnlUSD=(realPnl/rates[currency]);
	
	var positions_modal = bootbox.dialog({
	   title : "Expired Positions",
	   message : '<div class="row">'+
	             '<div class="row col-md-10">'+
	             '<form id="positions-form">'+
	             '<div class="col-md-2">'+
	             '<h4>Expire Start</h4>'+
	             '<input id="expireStart" name="expireStart" class="form-control" value="'+$("#pStart").val()+'" onfocus="this.blur();"/>'+
	             '</div>'+
	             '<div class="col-md-2">'+
	             '<h4>Expire End</h4>'+
	             '<input id="expireEnd" name="expireEnd" class="form-control" value="'+$("#pEnd").val()+'" onfocus="this.blur();"/>'+
	             '</div>'+
	             '<div class="col-md-2">'+
	             '<h4>Customer ID</h4>'+
	             '<input id="customerId" name="customerId" class="form-control" value="'+customerId+'" onfocus="this.blur();"/>'+
	             '</div>'+
	             '<div class="col-md-2">'+
	             '<h4>Customer Name</h4>'+
	             '<input id="customerName" name="customerName" class="form-control" value="'+customerName+'" onfocus="this.blur();"/>'+
	             '</div>'+
	             '</form>'+
	             '<div class="col-md-2">'+
	             '<h4>Currency</h4>'+
	             '<input class="form-control" value="'+currency+'" onfocus="this.blur();"/>'+
	             '</div>'+
	             '</div> <!-- col-md-10 -->'+
	             '<div class="col-md-12"><h3></h3></div>'+
	             '<div class="col-md-10">'+
	             '<div class="list-group col-md-3">'+
				 '<a href="" class="list-group-item "><h3 class="pull-right"><i class="fa fa-'+currencyLowerCase+'"></i></h3><h4 class="list-group-item-heading" id="pnl">'+pnl.toLocaleString()+'</h4>'+
				 '<p class="list-group-item-text"><h5>PNL</h5></p>'+
				 '</a>'+
				 '<a href="" class="list-group-item "><h3 class="pull-right"><i class="fa fa-'+currencyLowerCase+'"></i></h3><h4 class="list-group-item-heading" id="real_pnl">'+realPnl.toLocaleString()+'</h4>'+
				 '<p class="list-group-item-text"><h5>Real PNL</h5></p>'+
				 '</a>'+
				 '</div>'+
				 '<div class="list-group col-md-3">'+
				 '<a href="" class="list-group-item "><h3 class="pull-right"><i class="fa fa-usd"></i></h3><h4 class="list-group-item-heading" id="pnlUSD">$ '+pnlUSD.toLocaleString()+'</h4>'+
				 '<p class="list-group-item-text"><h5>PNL USD</h5></p>'+
				 '</a>'+
				 '<a href="" class="list-group-item "><h3 class="pull-right"><i class="fa fa-usd"></i></h3><h4 class="list-group-item-heading" id="real_pnlUSD">$ '+realPnlUSD.toLocaleString()+'</h4>'+
				 '<p class="list-group-item-text"><h5>Real PNL USD</h5></p>'+
				 '</a>'+
				 '</div>'+
				 '</div> <!-- col-md-10 -->'+  
	             '<div class="col-md-12"><h3></h3></div>'+
	             '<div class="col-md-12">'+
	             '<div class="portlet" id="positions_table_holder">'+
        		 '<div class="portlet-header" >'+
				 '<h3><i class="fa fa-table"></i>Positions</h3>'+   
		         '</div> <!-- portlet-header -->'+
		         '<div class="portlet-content">'+
		         '<table id="positions_table" class="table table-striped table-bordered table-hover table-highlight"></table>'+
		         '</div> <!-- portlet-content -->'+
	             '</div>'+
	             '</div> <!-- col-md-12'+

	             '</div> <!-- row -->',
	   buttons : {
	   	success:{
	   	  label:"OK",
	   	  className: "btn-success"
	   	}
	   }          	
	});
	$(positions_modal[0]).attr('id','positions_modal');
	$('#positions_modal .modal-dialog').addClass('modal-large');
	getPositions();
});

function getPositions(){
	apiRequest('getPositionsForRealPNL',$('#positions-form').serialize(),'#positions_table_holder',function(data){
	   	for(var i=0;i<data.length;i++){
			data[i].rate=parseFloat(data[i].rate);
		}
		$('#positions_table').dataTable( {
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
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Position ID"},
            { "mData": "assetName", "sTitle": "Asset Name"}, 
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "endDate", "sTitle": "Expiry Date","sType":"date"},
            { "mData": "rate", "sTitle": "Entry Rate"},
            { "mData": "amount", "sTitle": "Investment"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "payout", "sTitle": "Payout"},
            { "mData": "product", "sTitle": "Product"}
            ]
         });
	});
}

function getEmployeesForRetention () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    

    apiRequest('getEmployeesForRetention',$('#range-form').serialize(),'#pnl_table_holder',function(data){
      
      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
      });
      
    });
    
}

function getRealPNL(){
  	var today = new Date().format("yyyy-MM-dd");     
  	var currencyDate = $('#pEnd').val()>today ? today : $('#pEnd').val();
	var base = 'https://openexchangerates.org/api';
    var method = 'historical';
    var key = 'e658b8bd7566446eb9e141c0082b7ed6';
    var api = base+'/'+method+'/'+currencyDate+'.json?app_id='+key;
    rates = [];
    $.getJSON( api, function( currencyData ) {
        rates = currencyData.rates;
    }).done(function(){
       	console.log(rates);
       	apiRequest('getRealPNLForRetention',$('#range-form').serialize(),'#pnl_table_holder',function(data){
       		for(var i in data){
       		  data[i].real_pnlUSD = parseFloat((parseFloat(data[i].real_pnl)/rates[data[i].currency]).toFixed(2)).toLocaleString();
       		  data[i].pre_deposit = parseFloat(data[i].pre_deposit).toLocaleString();
       		  data[i].pre_pnl = parseFloat(data[i].pre_pnl).toLocaleString();
       		  data[i].pre_RAB = parseFloat(data[i].pre_RAB).toLocaleString();
       		  data[i].deposit = parseFloat(data[i].deposit).toLocaleString();
       		  data[i].end_pnl = parseFloat(data[i].end_pnl).toLocaleString();
       		  data[i].end_RAB = parseFloat(data[i].end_RAB).toLocaleString();
       		  data[i].pnl = parseFloat(data[i].pnl).toLocaleString();
       		  data[i].real_pnl = parseFloat(data[i].real_pnl).toLocaleString();  	
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
             "aaSorting": [[12, "desc" ]],                    
             "aoColumns": [
             { "mData": "id", "sTitle": "Customer ID", "sType": "numeric", "bUseRendered": false,
               "fnRender": function(oObj){
             	
             	return '<a href="https://spotcrm.hedgestonegroup.com/crm/customers/page/'+oObj.aData.id+'" target="_blank">'+oObj.aData.id+'</a>';
               } 
             },
             { "mData": "customerName", "sTitle": "Customer Name"},
             { "mData": "country", "sTitle": "Country"},
             { "mData": "currency", "sTitle": "Curr"},  
             { "mData": "pre_deposit", "sTitle": "Start Net Deposit", "sType": "commaseparated-num"},
             { "mData": "pre_pnl", "sTitle": "Start PNL","sType": "commaseparated-num"},      
             { "mData": "pre_RAB", "sTitle": "Start RAB", "sType": "commaseparated-num"},
             { "mData": "deposit", "sTitle": "End Net Deposit", "sType": "commaseparated-num"},
             { "mData": "end_pnl", "sTitle": "End PNL", "sType": "commaseparated-num"},
             { "mData": "end_RAB", "sTitle": "End RAB", "sType": "commaseparated-num"},
             { "mData": "pnl", "sTitle": "PNL", "sType": "commaseparated-num"},
             { "mData": "real_pnl", "sTitle": "Real Pnl", "sType": "commaseparated-num"},
             { "mData": "real_pnlUSD", "sTitle": "Real Pnl USD", "sType": "commaseparated-num"},
             { "mData": "positions", "sTitle": "Positions", "bUseRendered": false,
               "fnRender": function(oObj){
               	 color = oObj.aData.positions == "Positions" ? "success" : "danger";
               	 return '<a href="" data-id="'+oObj.aData.id+'" data-customerName="'+oObj.aData.customerName+'" data-currency="'+oObj.aData.currency+'" '+ 
               	          'data-pnl="'+oObj.aData.pnl+'" data-realPnl="'+oObj.aData.real_pnl+'" class="btn btn-xs btn-'+color+' btn-block positions">'+oObj.aData.positions+'</a>';
               }
             },
             { "mData": "employee", "sTitle": "Employee"}
             ],
             "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
                var total_pnl = 0;
                var total_real_pnl = 0;
                var total_net_deposits = 0;
                var total_real_losers = 0;
                var total_real_winners = 0;
                var pnl = 0, real_pnlUSD = 0, net_deposit = 0;
                
                for(var i=0;i<aiDisplay.length;i++){
                   pnl = parseFloat((aaData[aiDisplay[i]].pnl).replace(/,/g,""));
                   real_pnlUSD = parseFloat((aaData[aiDisplay[i]].real_pnlUSD).replace(/,/g,""));
                   net_deposit = parseFloat((aaData[aiDisplay[i]].deposit).replace(/,/g,""))-parseFloat((aaData[aiDisplay[i]].pre_deposit).replace(/,/g,""));
                   	
                   total_pnl += pnl/rates[aaData[aiDisplay[i]].currency];
                   total_real_pnl += real_pnlUSD;
                   total_net_deposits += net_deposit/rates[aaData[aiDisplay[i]].currency];
                   real_pnlUSD>0 ? total_real_losers += real_pnlUSD : total_real_winners += real_pnlUSD;  	
                }
                $('#total_pnl').html('$ '+total_pnl.toLocaleString());
                $('#total_real_pnl').html('$ '+total_real_pnl.toLocaleString());
                $('#total_net_deposits').html('$ '+total_net_deposits.toLocaleString());
                $('#total_real_losers').html('$ '+total_real_losers.toLocaleString());
                $('#total_real_winners').html('$ '+total_real_winners.toLocaleString());	
             }
       	     });
    });
    });
	
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk option[value="4"]').attr('selected',true);
			getEmployeesForRetention();
	});
}


