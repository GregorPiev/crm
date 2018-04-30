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

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}

function addForm(fields){
  $("#affiliate_add").prop('disabled' , false);
  $('#addForm #aff_disabled').val('');
    $("#ToolTables_transactions_table_2").hide();
    $("#ToolTables_transactions_table_1").show();
}

function editForm(aff_to_camp){
  $('#addForm #affiliate_add option[value="0"]').attr("selected", "selected");
  console.log(aff_to_camp);
 
  
    formValueAppend(aff_to_camp[0]);
  $("#addForm").show('fast', function() {
    $(window).scrollTop(0);
     $("#affiliate_add").prop('disabled' , true);
     $("#ToolTables_transactions_table_0").hide();
     $("#ToolTables_transactions_table_1").hide();
     $("#ToolTables_transactions_table_2").hide();
     $("#ToolTables_transactions_table_3").show();
     $("#ToolTables_transactions_table_4").show();
      
      
  });
  
}
function formValueAppend(aff){
  $('#addForm #aff_disabled').val(aff);
  option_id = $('#addForm #aff_disabled').val();
  $('#addForm #affiliate_add option[value="'+option_id+'"]').attr("selected", "selected");
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
  
  getATCReport();
  
}

function getATCReport() {
      apiRequest('getATCReport',$('#range-form').serialize(),'#transactions_table_holder',function(data){
          
             for(var row in data){
               data[row].edit_button = '<i id="'+data[row].atc_affiliate_id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify(data[row].edit)+')\'></i>';
               data[row].delete_button = '<i id="'+data[row].atc_affiliate_id+'" class="fa fa-trash-o  edit" onclick=\'deleteAtc('+JSON.stringify(data[row].deleteButton)+')\'></i>';
             
              }

              
         
              if (document.getElementById('addForm') instanceof Object==false)
               addForm(data);

          $('#transactions_table').dataTable( {
              "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                "aButtons": [  
                            {"sExtends": "select","sButtonText": "Add New",
                                "fnClick": function (nButton, oConfig, oFlash) {
                                  $("#addForm").show();
                                  
                                  $("#affiliate_add").prop('disabled' , false);
                                  $('#addForm #aff_disabled').val('');
                                  $("#ToolTables_transactions_table_0").hide(); 
                                  $("#ToolTables_transactions_table_3").hide(); 
                                  $("#ToolTables_transactions_table_4").hide(); 
                                  $("#ToolTables_transactions_table_1").show(); 
                                   $("#ToolTables_transactions_table_2").show();
                                          
                                  }
                              },
                              {"sExtends": "select","sButtonText": "Add",
                              "fnClick": function (nButton, oConfig, oFlash) {
                                    addNewAtc();
                                }
                            },
                              {"sExtends": "select","sButtonText": "Cancel",
                                "fnClick": function (nButton, oConfig, oFlash) {
                                  $("#ToolTables_transactions_table_0").show();
                                  $("#ToolTables_transactions_table_1").hide();
                                  $("#ToolTables_transactions_table_2").hide();
                                  $("#affiliate_add").prop('disabled' , false);
                                  $('#addForm #aff_disabled').val('');
                                  
                                   $("#addForm").hide();
                                }
                              },
                            
                            {"sExtends": "select","sButtonText": "Update",
                            "fnClick": function (nButton, oConfig, oFlash) {
                                 UpdateAtc();
                              }
                          },
                          {"sExtends": "select","sButtonText": "cancel",
                            "fnClick": function (nButton, oConfig, oFlash) {
                                  $("#ToolTables_transactions_table_0").show(); 
                                  $("#ToolTables_transactions_table_3").hide(); 
                                  $("#ToolTables_transactions_table_4").hide();
                                  $("#affiliate_add").prop('disabled' , false);
                                  $('#addForm #aff_disabled').val('');
                                  
                                  $("#addForm").hide();
                                    
                              }
                          },
                ]
            },
          
          
          
             "bDestroy": true,
             "bLengthChange": true,
             "aaData": data,
             "aaSorting": [[ 0, "desc" ]],                    
             "aoColumns": [
              { "mData": "atc_affiliate_company", "sTitle": "Affiliate"},
              { "mData": "atc_campaign_name", "sTitle": "Campaign"},            
              { "mData": "edit_button", "sTitle": "Edit"},
              { "mData": "delete_button", "sTitle": "Delete"},
             ],

             "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            $(".show").removeClass("show");
            $(".clear").addClass("show");
            $("#ToolTables_transactions_table_1").hide();
            $("#ToolTables_transactions_table_2").hide();
          $("#ToolTables_transactions_table_3").hide();
            $("#ToolTables_transactions_table_4").hide();
           
          }
      });
    });
}

function getHasOptionsAffiliates () {
    apiRequest('getHasOptionsAffiliates',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID+' - '+this.company)); 
      });
    });
    apiRequest('getHasOptionsAffiliates',$('#addForm').serialize(),'#transactions_table_holder',function(data){
      jQuery.each(data, function() {
        $('#affiliate_add')
            .append($('<option>', { value : this.affID })
            .text(this.affID+' - '+this.company)); 
      });
    });
}
function getSpotOptionCampaigns () {
    apiRequest('getSpotOptionCampaigns',$('#range-form').serialize(),'#transactions_table_holder',function(data){
      jQuery.each(data, function() {
        $('#campaigns')
            .append($('<option>', { value : this.id })
            .text(this.id+' - '+this.name)); 
      });
      
    }); 
    apiRequest('getSpotOptionCampaigns',$('#addForm').serialize(),'#transactions_table_holder',function(data){
      jQuery.each(data, function() {
        if(this.id!=0){
	        $('#campaigns_add')
	          .append($('<option>', { value : this.id })
	          .text(this.id+' - '+this.name)); 
	      }
       });
      
    }); 
}

function geoPlugin(data){
  total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",",""));
  $('#total_usd_all').html('$'+total_usd_all.toLocaleString());
}

function addNewAtc(){
  apiRequest('addNewAtc',$('#addForm').serialize(),'#addCallBack',function(data){

    if (!data.error) {
      $('#addForm').find('select').val('0');
      $('#addForm').hide();
       getATCReport();
    };
   
  }); 
    
}

Obj = function arrayToObj(array) {
   this.aff_id = array[0];
}

function deleteAtc(aff_id){
  
  var aff_id_json = new Obj(aff_id);
 
  apiRequest('deleteAtc',aff_id_json,'#addCallBack',function(data){
    if (!data.error) {
      
      $('#addForm').hide();
       getATCReport();
    };
   
  }); 
    
}

function UpdateAtc(){

  apiRequest('UpdateAtc',$('#addForm').serialize(),'#addCallBack',function(data){
    if (!data.error) {
      
      $('#addForm').hide();
       getATCReport();
    };
   
  }); 
    
}