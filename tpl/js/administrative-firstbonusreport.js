
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


//$("#range-form").append('<input type="hidden" name="transactiondesk"  id="transactiondesk"   value="0" />');
//$("#range-form").append('<input type="hidden" name="transactionemployee" id="transactionemployee"   value="0" />');

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
  
  getFirstBonus();
  
}

$(document).ready(function() {
    getDesk();
        
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    
    getFirstBonus();
    getCurrentEmployees();

    $('#dpStart, #dpEnd, #currentdesk, #employee,  #retention, #bonusaction').change(function() 
    {
        getFirstBonus();
    });

    $('#currentdesk').change(function() 
    {
    	getCurrentEmployees();
    });
});

function getCurrentEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getCurrentEmployees',$('#range-form').serialize(),'#firstbonus_table_holder',function(data){
    	jQuery.each(data, function() {
    		$('#employee')
    		.append($('<option>', { value : this.userId })
      		.text(this.userId + ' - ' + this.employeeName)); 
  		});
    });
}

function getFirstBonus(){

    apiRequest('getFirstBonus',$('#range-form').serialize(),'#firstbonus_table_holder',function(data){
        //console.log(data);
         
      var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      var href = '';
      for(var i=0,j=data.length; i<j; i++){
          href = url + '/?id='+data[i].customerId;
          data[i].customerId = '<a href="'+href+'" target="_blank">'+data[i].customerId+'</a>' ;
          data[i].customerName = '<a href="'+href+'" target="_blank">'+data[i].customerName+'</a>' ;
      };

        
         var oTable = $('#firstbonus_table').dataTable( {
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
           "aaSorting": [[ 6, "desc" ]],                    
           "aoColumns": [
            //{ "mData": "id", "sTitle": "#"},
            { "mData": "customerId", "sTitle": "Customer Id","sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "countryName", "sTitle": "Country"},
            { "mData": "bonusAction", "sTitle": "Bonus Action"},
            { "mData": "amount", "sTitle": "Amount", "sType": "numeric"},
            { "mData": "currency", "sTitle": "Currency"},
            { "mData": "confirmTime", "sTitle": "Date Confirmed", "sType": "date"},
            { "mData": "grantedby", "sTitle": "Granted By Employee"},
            { "mData": "approvedby", "sTitle": "Approve By Employee"},
            { "mData": "assignedto", "sTitle": "Assigned To At Transaction"},
            { "mData": "status", "sTitle": "Status"}
           ],
           
           "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
            
           } 
           
    } );
});
      
  function sortObject(object){  
      var sortedObj = {},
          keys = Object.keys(object);
  
      keys.sort(function(key1, key2){
          key1 = key1.toLowerCase(), key2 = key2.toLowerCase();
          if(key1 < key2) return -1;
          if(key1 > key2) return 1;
          return 0;
      });
  
      for(var index in keys){
          var key = keys[index];
          if(typeof object[key] == 'object' && !(object[key] instanceof Array)){
              sortedObj[key] = sortObject(object[key]);
          } else {
              sortedObj[key] = object[key];
          }
      }
  
      return sortedObj;
  }
        
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#currentdesk', function(data) {			
		$.each(data, function(key, value) {
			 $('#currentdesk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
		});
	});
}
