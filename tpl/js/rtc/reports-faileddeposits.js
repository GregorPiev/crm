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
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
    range = range.split('-');
    var endDate = new Date(range[1],range[0]-1,1);
    var startDate = new Date(range[1],range[0]-1,1);
  
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }
    
    getFailedDeposits();

}

$(document).ready(function() {
     $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
     $('#dpStart, #dpEnd').datepicker();
        
     $("#campaign").select2( {
            placeholder: "Select Campaign or leave blank for all",
            width: "100%",
            allowClear: true        
     });         
    
     $("#employee").select2({
            width: "100%",
            placeholder: "Select Employee or leave blank for all",
            allowClear: true                
     });
     
     getLeverateDesk();               
     getLeverateCampaigns();
     getLeverateEmployees();    
     getFailedDeposits();
    
     $('#dpStart, #dpEnd, #campaign,#employee, #ftd').change(function(){
            getFailedDeposits();
     });
    
     $('#desk').change(function(){
            $('#employee').select2('data',null);
            getLeverateEmployees();
            getFailedDeposits();
     });
        
   
  });


function getFailedDeposits(){ 
  apiRequestBrand('getFailedDeposits',$('#range-form').serialize(),'#failedDeposits_table_holder',true,capitalBrandName,function(data){
      var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';  
      
    $('#failedDeposits_table').dataTable( {
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
      "bAutoWidth":false,
      "aaData": data,
      "aaSorting": [[ 8, "desc" ]],                    
      "aoColumns": [
      { "mData": "AccountId", "sTitle": "Customer Id" , "sType": "numeric",
          "fnRender":function(oObj){
                     return "<a href='"+ url +"/?id="+oObj.aData.AccountId +"'  target='_blank'>"+oObj.aData.AccountId+"</a>";
           }
       },
      { "mData": "customerName", "sTitle": "Customer Name"},
      { "mData": "tpAccount", "sTitle": "Tp Account"},
      { "mData": "country", "sTitle": "Country"},
      { "mData": "amount", "sTitle": "Amount"},
      
      { "mData": "currency", "sTitle": "Currency"},
      { "mData": "reason", "sTitle": "Reason"},
      { "mData": "processor", "sTitle": "Processor"},
      { "mData": "date", "sTitle": "Date", "sType": "date"},
      { "mData": "cardNum", "sTitle": "Card Num"},
      { "mData": "ipAddress", "sTitle": "IP"},      
      { "mData": "campaign", "sTitle": "Campaign"},      
      { "mData": "employee", "sTitle": "Employee"},
      { "mData": "businessUnit", "sTitle": "Desk"},      
      { "mData": "ftd", "sTitle": "FTD"},     
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
        $(".show").removeClass("show");
        $(".clear").addClass("show");
      }
    } );
  });
}

function getLeverateDesk(){                
     apiRequestBrand('getLeverateDesk','', '#faileddepositsdesk',true,capitalBrandName,function(data) {			
	      $.each(data, function(key, value) { 
		     $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
	      });
	  });
}
function getLeverateCampaigns(){                
	apiRequestBrand('getLeverateCampaigns','','#faileddepositsdesk',true,capitalBrandName,function(data){
            
	  $.each(data, function() {
                        $('#campaign').append($('<option>', { value : this.name }).text(this.name)); 
                    });
	});
}

function getLeverateEmployees () {    
    
    $('#employee').find('option').remove();
    
    var param ={desk : $("#desk").val()};
    
    apiRequestBrand('getLeverateEmployees',param,'#failedDeposits_table_holder',true,capitalBrandName,function(data){         
        
      $.each(data, function() {
        $('#employee').append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });

    });    
    
}
