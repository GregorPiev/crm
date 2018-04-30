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
    
    getNotCalledDepositors();

}

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
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
}

$(document).ready(function() {    
	     getDesk();       
        $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
        $('#dpStart, #dpEnd').datepicker();
        getUserSpotId();
       
        $('#dpStart, #dpEnd, #desk, #employee').change(function(){
            getNotCalledDepositors();
        });
    
        $('#desk').change(function(){
          getEmployees();
        });
    
        getNotCalledDepositors();
  });

function  getUserSpotId(){
  	apiRequest('getUserSpotId',$('#range-form').serialize(),'#transactions_table_holder',function(spotId){
  		if (spotId==0) {
			$("#employee").parent().show();
  			$("#desk").parent().show();
  			getEmployees();
  		}
  		
  	});	
  }
function getNotCalledDepositors(){
  apiRequest('getNotCalledDepositors',$('#range-form').serialize(),'#notCalledDepositors_table_holder',function(data){
      	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      	var href = '';
      for(var i=0,j=data.length; i<j; i++){
      		href = url + '/?id='+data[i].customerId;
		 	data[i].customerId = '<a href="'+href+'" target="_blank">'+data[i].customerId+'</a>' ;
		 	data[i].customerName = '<a href="'+href+'" target="_blank">'+data[i].customerName+'</a>' ;
		};
      
    $('#notCalledDepositors_table').dataTable( {
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
      "aaSorting": [[ 0, "desc" ]],                    
      "aoColumns": [
      { "mData": "customerId", "sTitle": "Customer Id" , "sType": "numeric"},
      { "mData": "customerName", "sTitle": "Customer Name"},
      { "mData": "firstDepositDate", "sTitle": "FDD", "sType": "date"},
      { "mData": "lastLoginDate", "sTitle": "Last Login", "sType": "date"},
      { "mData": "country", "sTitle": "Country"},
      { "mData": "amountUSD", "sTitle": "Amount (USD)"},
      { "mData": "currency", "sTitle": "Currency"},
      { "mData": "aff_id", "sTitle": "Affiliate"},      
      { "mData": "employee", "sTitle": "Employee"},      
      
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
        $(".show").removeClass("show");
        $(".clear").addClass("show");
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
