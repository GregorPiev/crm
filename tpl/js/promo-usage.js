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
    
    getPromoUsage();

}

$(document).ready(function() {
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    
    getPromoUsage();
    
    $('#dpStart, #dpEnd').change(function() 
    {
      getPromoUsage();
    });

  });

function addForm(fields){
    $("#ToolTables_commissions_table_2").hide();
    $("#ToolTables_commissions_table_1").show();
}

function getPromoUsage(){

  apiRequest('getPromoUsage',$('#range-form').serialize(),'#commissions_table_holder',function(data){
        //console.log(data);
         //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime

         $('#commissions_table').dataTable( {
           "sDom": 'T<"clear">lfrtip',
           "oTableTools": {
            "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
            "aButtons": [				
              {"sExtends": "select","sButtonText": "Add Promo Usage",
                "fnClick": function (nButton, oConfig, oFlash) {
                  $("#addForm").show();
                  $("#ToolTables_commissions_table_0").hide(); 
                  $("#ToolTables_commissions_table_1").show(); 
                  $("#ToolTables_commissions_table_2").show(); 
                  }
              },
              {"sExtends": "select","sButtonText": "Cancel",
                "fnClick": function (nButton, oConfig, oFlash) {
                  $("#ToolTables_commissions_table_0").show();
                  $("#ToolTables_commissions_table_1").hide();
                  $("#ToolTables_commissions_table_2").hide();
                  $("#addForm").hide();
                }
              },
              {"sExtends": "select","sButtonText": "Add",
                  "fnClick": function (nButton, oConfig, oFlash) {
                      
                      if(formSubmit()){
                        addNewPromoUsage();
                        
                      }
                    }
                }
            ]
          },
          "bDestroy": true,
          "bLengthChange": true,
          "aaData": data,
          "aaSorting": [[ 3, "desc" ]],                    
          "aoColumns": [
          { "mData": "hash", "sTitle": "Promo"},
          { "mData": "user_id", "sTitle": "Customer ID"},
          { "mData": "redeem_time", "sTitle": "Redeem Time", "sType": "date"}
          ],
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            $(".show").removeClass("show");
            $(".clear").addClass("show");
            $("#ToolTables_commissions_table_1").hide();
            $("#ToolTables_commissions_table_2").hide();
            
          }


        } );

});


}

function addNewPromoUsage(){
  apiRequest('addNewPromoUsage',$('#addForm').serialize(),'#addCallBack',function(data){

    if (!data.error) {
      $('#addForm').find('select').val('0');
      $('#addForm').hide();
       getPromoUsage();
    };
   
  }); 
}
