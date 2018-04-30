
$(document).ready(function() {				  
    getFTDBonusesData();
    $("#addCallBack").css('color', '#f00');
  });


function addForm(fields){

	$('div.portlet-content').prepend('<form id="addForm"><h6>* all fields are required</h6></form>');
	for(var field in fields){
		ignoreArr = ['id'];
		boolFieldsArr = [];
		textFieldsArr = ['start_val','bonus','title','features'];
		
		ignore = ignoreArr.indexOf(fields[field])==-1;
		bool = boolFieldsArr.indexOf(fields[field])!=-1;
		text = textFieldsArr.indexOf(fields[field])!=-1;
		
		//fields[field] = (fields[field] == "hash" ? "promo code" : fields[field]);
		fieldLable = fields[field].replace("_", " ") ;

		if(ignore && !bool && text && fields[field] == "features")
			$("#addForm").append('<div class="form_row"><span>'+fieldLable+'</span><input type="text" id="'+fields[field].replace(" ", "")+'" name="'+fields[field]+'" class="tagsinput form-control minimize" onblur="checkField(this.id , this.value);" onfocus="resetBorder(this.id);"/> </div>');
		else if(ignore && !bool && text)
			$("#addForm").append('<div class="form_row"><span>'+fieldLable+'</span><input type="text" id="'+fields[field].replace(" ", "")+'" name="'+fields[field]+'" class="form-control minimize" onblur="checkField(this.id , this.value);" onfocus="resetBorder(this.id);"/> </div>');
		else
			if(ignore && bool)
				$("#addForm").append('<div class="form_row"><span>'+fieldLable+'</span><select name="'+fields[field]+'" id="'+fields[field]+'" class="form-control minimize" ><option value="1">yes</option><option value="0">no</option> </select> </div>');	
	}
	//defalt fields
	$("#addForm").append('<input id="id" type="hidden" name="id" value="" />');

	$('.tagsinput').tagsinput();

}

function editForm(bonus_data){

	$('.tagsinput').tagsinput('destroy');

	$("#addCallBack").hide();
	$("#addForm").show('fast', function() {
		$(window).scrollTop(0);
		$("#ToolTables_promoCodesData_table_0").hide();
		$("#ToolTables_promoCodesData_table_3").show();
		$("#ToolTables_promoCodesData_table_4").show();

		 $.each(bonus_data, function(index , value) {
		 	$("#"+index).val(value);
		});

		$('.tagsinput').tagsinput();
		
	});
	
}

function getFTDBonusesData(){

  apiRequest('getFTDBonusesData',$('#range-form').serialize(),'#promoCodesData_table_holder',function(data){
     
         for(var row in data){
        	 data[row].edit_button 		= '<i id="'+data[row].id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify(data[row])+')\'></i>';
        	 data[row].delete_button 	= '<i id="'+data[row].id+'" class="fa fa-trash-o  edit" onclick=\'deleteBonus('+JSON.stringify(data[row].id)+')\'></i>';

         }
         var fields = Object.keys(data[row]);
         
         if (document.getElementById('addForm') instanceof Object==false)
         	addForm(fields);
         
         	
        	 
         

        $('#promoCodesData_table').dataTable( {
           "sDom": 'T<"clear">lfrtip',
           "oTableTools": {
            "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
            	
            "aButtons": [	
				
				{"sExtends": "select","sButtonText": "Add FTD Bonus",
				  "fnClick": function (nButton, oConfig, oFlash) {
				  	  $('.tagsinput').tagsinput('removeAll');
					  $("#addForm").show();
					  $("#ToolTables_promoCodesData_table_0").hide();	
					  $("#ToolTables_promoCodesData_table_1").show();	
					  $("#ToolTables_promoCodesData_table_2").show();	
					  $("#addCallBack").hide();
					  			  
				    }
				},
				{"sExtends": "select","sButtonText": "Cancel",
					"fnClick": function (nButton, oConfig, oFlash) {
						$('.tagsinput').tagsinput('removeAll');
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
					  		 	insertNewBonus();
					  		 	
					  		}
					    }
					},
					{"sExtends": "select","sButtonText": "Update Promo",
				  "fnClick": function (nButton, oConfig, oFlash) {
				  		
					  	if(formSubmit()) UpdateBonus();
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
				}
					
            ]
          },
          "bDestroy": true,
          "bLengthChange": true,
          "aaData": data,
          "aaSorting": [[ 0, "asc" ]],                    
          "aoColumns": [
	          { "mData": "title", "sTitle": "Title" },
	          { "mData": "start_val", "sTitle": "From Deposit" },
	          { "mData": "bonus", "sTitle": "Bonus (%)" },
	          { "mData": "features", "sTitle": "Features",
	          "fnRender": function (oObj) {
	          		var features = oObj.aData.features;
              	    return features.replace(/,/g, "<br>");
                 }
              },
	          { "mData": "edit_button", "sTitle": "Edit" },
	          { "mData": "delete_button", "sTitle": "Delete" },
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


function insertNewBonus(){
	apiRequest('addNewFTDBonus',$('#addForm').serialize(),'#addCallBack',function(data){
			if(data.promoAdded !='' && data.promoAdded != 'undefined' ){
				getFTDBonusesData();
				text = data.bonusAdded+' was successfully added !';
				success = "true";
				callbackMassage(text , success);
			}else{
				text = '* there was a problem adding FTD bonus '+data.success;
				success = "false";
				callbackMassage(text , success);
			}

	});	
		
}

function UpdateBonus(){
		apiRequest('updateBonus',$('#addForm').serialize(),'#addCallBack',function(data){
			if(data.bonusUpdated !='' && data.promoUpdated != 'undefined' ){
				getFTDBonusesData();
				text = data.bonusUpdated+' was successfully updated !';
				success = "true";
				callbackMassage(text , success);
				
				
			}else{
				
				text = '* there was a problem updating '+data.success;
				success = "false";
				callbackMassage(text , success);
			}
			
	});
}

Obj = function 
(id) {
	   this.id = id;
	}

function deleteBonus(id){
	  var id_json = new Obj(id);
	  apiRequest('deleteFTDBonus',id_json,'#addCallBack',function(data){
	    if (!data.error) {
	      $('#addForm').hide();
	      getFTDBonusesData();
	    };
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