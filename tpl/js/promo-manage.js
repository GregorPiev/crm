
$(document).ready(function() {				  
    getPromoCodesData();
    $("#addCallBack").css('color', '#f00');
  });


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


function addForm(fields){

	$('div.portlet-content').prepend('<form id="addForm"><h6>* all fields are required</h6></form>');

	var	ignoreArr = ['id','userid','never_expired'];
	var boolFieldsArr = ['reusable','enabled','ftd','once_per_customer','agreement_popup'];
	var textFieldsArr = ['hash','desc','percentage','min_deposit','max_deposit' , 'expire_date'];
	
	for(var field in fields){
		
		ignore = ignoreArr.indexOf(fields[field])==-1;
		bool = boolFieldsArr.indexOf(fields[field])!=-1;
		text = textFieldsArr.indexOf(fields[field])!=-1;
		
		fields[field] = (fields[field] == "hash" ? "promo code" : fields[field]);
		fields[field] = (fields[field] == "once_per_customer" ? "one time" : fields[field]);
		fields[field] = (fields[field] == "agreement_popup" ? "auto bonus" : fields[field]);
		fieldLable = fields[field].replace(/_/g, " ") ;

		if(ignore && !bool && text)
			$("#addForm").append('<div class="form_row" style="width:345px;"><span style="width:130px;">'+fieldLable+'</span><input type="text" id="'+fields[field].replace(" ", "")+'" name="'+fields[field]+'" class="form-control minimize" onblur="checkField(this.id , this.value);" onfocus="resetBorder(this.id);"/> </div>');
		else
			if(ignore && bool)
				$("#addForm").append('<div class="form_row" style="width:345px;"><span style="width:130px;">'+fieldLable+'</span><select name="'+fields[field].replace(" ", "")+'" id="'+fields[field].replace(" ", "")+'" class="form-control minimize"><option value="1">yes</option><option value="0">no</option> </select> </div>');
	}
	//defalt fields
	$("#addForm").append('<input type="hidden" name="userid" value="0" /><input type="hidden" name="never_expire" value="1" /><input id="id" type="hidden" name="id" value="" />');

}

function editForm(promo_data){

	$("#addCallBack").hide();
	$("#addForm").show('fast', function() {
		$(window).scrollTop(0);
		$('#expire_date').datepicker({
			format: "yyyy-mm-dd"
		  });  
		$("#ToolTables_promoCodesData_table_0").hide();
		$("#ToolTables_promoCodesData_table_3").show();
		$("#ToolTables_promoCodesData_table_4").show();

		 $.each(promo_data, function(index , value) {
		 	value=value.replace("yes", "1");
		 	value=value.replace("no", "0");
		 	index=index.replace("hash", "promocode");
		 	index=index.replace("once_per_customer", "onetime");

			 index=index.replace("agreement_popup", "autobonus");

		 	$("#"+index).val(value);
		});
		
	});
	
}


/*function editButtomBuilder(data){
	var field_data = [];
	$("#promoCodesData_table thead tr").append('<th></th>');
	$("#promoCodesData_table tbody tr").each(function(){
		 
		  var data_arr = jQuery.makeArray( data );
		  var id = $(this).find("td:nth-child(1)").text();
		  var name = $(this).find("td:nth-child(2)").text();
		  var desc = $(this).find("td:nth-child(3)").text();
		  var reusable = $(this).find("td:nth-child(4)").text();
		  var enabled = $(this).find("td:nth-child(5)").text();
		  var ftd = $(this).find("td:nth-child(6)").text();
		  var percentage = $(this).find("td:nth-child(7)").text();
		  var min_deposit = $(this).find("td:nth-child(8)").text();
		  var max_deposit = $(this).find("td:nth-child(9)").text();
		  var expire_date = $(this).find("td:nth-child(10)").text();
		  field_data.push(id,name,desc,reusable,enabled,ftd,percentage,min_deposit,max_deposit,expire_date);

		  	keys = data_arr;
			values = field_data;
			data_obj = {}

			for (i = 0; i < keys.length; i++) {
   				 data_obj[keys[i]] = values[i];
			}

		$(this).append('<td style="width:30px;"><i id="'+id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify(data_obj)+')\'></i></td>');
			field_data.length = 0;
		}) 

}
*/
function getPromoCodesData(){

  apiRequest('getPromoCodesData',$('#range-form').serialize(),'#promoCodesData_table_holder',function(data){
     
         for(var row in data){
        	 data[row].reusable = ( data[row].reusable == 1) ? "yes": "no";	 
        	 data[row].enabled = ( data[row].enabled == 1) ? "yes": "no";	 
        	 data[row].ftd = ( data[row].ftd == 1) ? "yes": "no";
        	 data[row].agreement_popup = ( data[row].agreement_popup == 1) ? "yes": "no";
        	 data[row].once_per_customer = ( data[row].once_per_customer == 1) ? "yes": "no";
        	 data[row].edit = '<i id="'+data[row].id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify(data[row])+')\'></i>';
        	 
         }
         var fields = Object.keys(data[row]);
          if (document.getElementById('addForm') instanceof Object==false)
         	addForm(fields);
         
         	
        	 
         

        $('#promoCodesData_table').dataTable( {
           "sDom": 'T<"clear">lfrtip',
           "oTableTools": {
            "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
            	
            "aButtons": [	
				
				{"sExtends": "select","sButtonText": "Add Promo Code",
				  "fnClick": function (nButton, oConfig, oFlash) {
					  $("#addForm").show();
					  $('#expire_date').datepicker({
		                    format: "yyyy-mm-dd"
		                });  
					  $("#ToolTables_promoCodesData_table_0").hide();	
					  $("#ToolTables_promoCodesData_table_1").show();	
					  $("#ToolTables_promoCodesData_table_2").show();	
					  $("#addCallBack").hide();
					  			  
				    }
				},
				{"sExtends": "select","sButtonText": "Cancel",
					"fnClick": function (nButton, oConfig, oFlash) {
						$("#ToolTables_promoCodesData_table_0").show();
						$("#ToolTables_promoCodesData_table_1").hide();
						$("#ToolTables_promoCodesData_table_2").hide();
						$("#addCallBack").hide();
						$("#addForm").hide();
						resetAllBorders();
						$("h6").hide();
					}
				},
				{"sExtends": "select","sButtonText": "Add",
					  "fnClick": function (nButton, oConfig, oFlash) {
					  		
					  		if(formSubmit()){
					  		 	insertNewPromo();
					  		 	
					  		}
					    }
					},
					{"sExtends": "select","sButtonText": "Update Promo",
				  "fnClick": function (nButton, oConfig, oFlash) {
				  		
					  	if(formSubmit()) UpdatePromo();
				    }
				},
				{"sExtends": "select","sButtonText": "cancel",
				  "fnClick": function (nButton, oConfig, oFlash) {
				  			$("#ToolTables_promoCodesData_table_0").show();	
					 		$("#ToolTables_promoCodesData_table_3").hide();	
					  		$("#ToolTables_promoCodesData_table_4").hide();
					  		$("#addCallBack").hide();
					  		$('#addForm')[0].reset();
					  		$("#addForm").hide();
								  
				    }
				},
					
            ]
          },
          "bDestroy": true,
          "bLengthChange": true,
          "aaData": data,
          "aaSorting": [[ 7, "desc" ]],                    
          "aoColumns": [
          { "mData": "id", "sTitle": "ID"},
          { "mData": "hash", "sTitle": "Promo Code"},
          { "mData": "desc", "sTitle": "Desc"},
          { "mData": "reusable", "sTitle": "Reusable"},
          { "mData": "enabled", "sTitle": "Enabled"},
          { "mData": "ftd", "sTitle": "FTD"},
          { "mData": "once_per_customer", "sTitle": "One Time"},
          { "mData": "percentage", "sTitle": "%"},
          { "mData": "min_deposit", "sTitle": "Min Deposit"},
          { "mData": "max_deposit", "sTitle": "Max Deposit"},
          { "mData": "agreement_popup", "sTitle": "Auto Bonus"},
          { "mData": "expire_date", "sTitle": "Expire Date", "sType": "date"},
          { "mData": "edit", "sTitle": "Edit"},
          ],
   
          "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {

            $(".show").removeClass("show");
            $(".clear").addClass("show");
            $("#ToolTables_promoCodesData_table_1").hide();
            $("#ToolTables_promoCodesData_table_2").hide();
 			$("#ToolTables_promoCodesData_table_3").hide();
            $("#ToolTables_promoCodesData_table_4").hide();
           
          }


        } );
		
});


}


function insertNewPromo(){
	apiRequest('addNewPromo',$('#addForm').serialize(),'#addCallBack',function(data){
			if(data.promoAdded !='' && data.promoAdded != 'undefined' ){
				getPromoCodesData();
				text = data.promoAdded+' was successfully added !';
				success = "true";
				callbackMassage(text , success);
			}else{
				text = '* there was a problem adding promo '+data.success;
				success = "false";
				callbackMassage(text , success);
			}

	});	
		
}

function UpdatePromo(){
		apiRequest('updatePromo',$('#addForm').serialize(),'#addCallBack',function(data){
			if(data.promoUpdated !='' && data.promoUpdated != 'undefined' ){
				getPromoCodesData();
				text = data.promoUpdated+' was successfully updated !';
				success = "true";
				callbackMassage(text , success);
				
				
			}else{
				
				text = '* there was a problem updating '+data.success;
				success = "false";
				callbackMassage(text , success);
			}
			
	});
}

function callbackMassage(text , success){
	$("#addCallBack").show();
	$("#addCallBack").css({
		'font-size': '16px',
		'padding': '6px',
	});
	if (success=="true") {
			$("#addCallBack").css('color', '#009500');
			$("#addCallBack").text(text);
			$('#addForm')[0].reset();
			$("#addForm").hide();
	}else{
		$("#addCallBack").css('color', '#0f0 !important');
		$("#addCallBack").text(text);
	}
}