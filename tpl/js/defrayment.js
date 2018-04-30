
$(document).ready(function() {				  
    getDefraymentData();
    $("#addCallBack").css('color', '#f00');
  });



function addForm(data){
	$('div.portlet-content').prepend('<form id="addForm">');
	$("#addForm").append(
		
	'<div class="form_row"><span>Currency</span><select type="text" id="currency" name="currency" class="form-control minimize" "></select> </div><div class="form_row"><span>Defrayment</span><select type="text" id="defrayment" name="defrayment" class="form-control minimize" "></select> </div>'
	);		
	//for(var field in data){
	//	$("#currency").append('<option value='+data[field].currency+'>'+data[field].currency+'</option>');
	//}
	$.each(data, function (row) {

		//$.each(this, function (name, value) {
			$("#currency").append('<option value='+data[row].currency+'>'+data[row].currency+'</option>');
		//	$("#defrayment").append('<option value='+data[row].processor_id+'>'+data[row].processor_name+'</option>');
	//	console.log(data[row].currency+'='+data[row].processor_id);
	//	});

	});
	 getDefrayments();
	 
	 $("#addForm").append('<input id="id" type="hidden" name="id" value="" />');
	
}	 	

function getDefrayments(){
	apiRequest('getDefrayments',$('#range-form').serialize(),'#defraymentData_table_holder',function(defrayments){

		$dataArray=JSON.parse(defrayments);

		$.each($dataArray, function (row) {

			$("#defrayment").append('<option value='+$dataArray[row].id+'>'+$dataArray[row].processor+'</option>');

		});
		//for(var field in defrayments){
		//	$("#defrayment").append('<option value='+defrayments[field].defrayment+'>'+defrayments[field].defrayment+'</option>');
		//}
	});
}

function editForm(defrayment_data){
	
	$("#id").val(defrayment_data.id);
	$("#addCallBack").hide();
	$("#addForm").show('fast', function() {
		$(window).scrollTop(0);
		$("#ToolTables_defraymentData_table_0").show();
		$("#ToolTables_defraymentData_table_1").show();

		 $.each(defrayment_data, function(index , value) {
		 	
		 	$("#"+index).val(value);
		});
		
	});
	
}


function getDefraymentData(){

	apiRequest('getDefraymentData',$('#range-form').serialize(),'#defraymentData_table_holder',function(data){
		console.log('data ', data);
		$defraymentData = data["results"]; 
		$perDefrayment = data["perDefrayment"][0].per_defrayment;

		$dataArray=JSON.parse($defraymentData);
		if($perDefrayment == 1) {


			$.each($dataArray, function (row) {
					$dataArray[row].edit = '<i id="'+$dataArray[row].id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify($dataArray[row])+')\'></i>';

			});
			var fields = Object.keys($dataArray[0]);

        }
        if (document.getElementById('addForm') instanceof Object==false)

			addForm($dataArray);

	       var dataTableConfig = {
					    "sDom": 'T<"clear">lfrtip',
					    "oTableTools": {
					        "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
					        "aButtons": [
					
					            {
					                "sExtends": "select",
					                "sButtonText": "Update",
					                "fnClick": function(nButton, oConfig, oFlash) {
					                    UpdateDefrayment();
					                }
					            }, {
					                "sExtends": "select",
					                "sButtonText": "cancel",
					                "fnClick": function(nButton, oConfig, oFlash) {
					
					                    $("#ToolTables_defraymentData_table_0").hide();
					                    $("#ToolTables_defraymentData_table_1").hide();
					                    $("#addCallBack").hide();
					                    $('#addForm')[0].reset();
					                    $("#addForm").hide();
					                }
					            },
					        ]
					    },
					    "bDestroy": true,
					    "bLengthChange": true,
					    "aaData": $dataArray,
					    "aaSorting": [
					        [0, "desc"]
					    ],
					    "aoColumns": [],
					
					    "fnFooterCallback": function(nRow, aaData, iStart, iEnd, aiDisplay) {
					
					
					        $(".show").removeClass("show");
					        $(".clear").addClass("show");
					        $("#ToolTables_defraymentData_table_0").hide();
					        $("#ToolTables_defraymentData_table_1").hide();
					        $("#addForm").hide();
					
					    }
					};

	       if($perDefrayment == 1){
	       	dataTableConfig['aoColumns'].push({ 
					        "mData": "currency",
					        "sTitle": "Currency"
					    }, {
					        "mData": "processor_name",
					        "sTitle": "Defrayment"
					    }, {
					        "mData": "edit",
					        "sTitle": "Edit",					       
					    });  	
			     
		    }
	   	  else {
	    	dataTableConfig['aoColumns'].push({ 
					        "mData": "currency",
					        "sTitle": "Currency"
					    }, {
					        "mData": "processor_name",
					        "sTitle": "Defrayment"
					    }); 
					    	
		    }
		    
		    
           $('#defraymentData_table').dataTable(dataTableConfig);
	});
}


function UpdateDefrayment(){

		apiRequest('UpdateDefrayment',$('#addForm').serialize(),'#addCallBack',function(data){

			if(data.success)
				getDefraymentData();
			
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