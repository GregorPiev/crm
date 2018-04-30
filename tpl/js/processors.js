
$(document).ready(function() {				  
    getProcessorsData();
    $("#addCallBack").css('color', '#f00');
  });



function addForm(data){
	$('div.portlet-content').prepend('<form id="addForm">');
	$("#addForm").append(
		
	'<div class="form_row"><span>Currency</span><select type="text" id="currency" name="currency" class="form-control minimize" "></select> </div><div class="form_row"><span>Processor</span><select type="text" id="processor" name="processor" class="form-control minimize" "></select> </div>'
	);		
	for(var field in data){
		$("#currency").append('<option value='+data[field].currency+'>'+data[field].currency+'</option>');		
	}
	 getProcessor();
	 
	 $("#addForm").append('<input id="id" type="hidden" name="id" value="" />');
	
}	 	

function getProcessor(){
	apiRequest('getProcessor',$('#range-form').serialize(),'#processors_table_holder',function(processors){
		
		for(var field in processors){
			$("#processor").append('<option value='+processors[field].processor+'>'+processors[field].processor+'</option>');		
		}
	});
}


function editForm(processor_data){
	
	$("#id").val(processor_data.id);
	$("#addCallBack").hide();
	$("#addForm").show('fast', function() {
		$(window).scrollTop(0);
		$("#ToolTables_processors_table_0").show();
		$("#ToolTables_processors_table_1").show();

		 $.each(processor_data, function(index , value) {
		 	
		 	$("#"+index).val(value);
		});
		
	});
	
}


function getProcessorsData(){

  apiRequest('getProcessorsData',$('#range-form').serialize(),'#processors_table_holder',function(data){
		   $processors = data["results"]; 
		   $perProcessor = data["perProcessor"][0].per_processors; 
		  if($perProcessor == 1) {
		  	 for(var row in $processors){
		                 $processors[row].edit = '<i id="'+$processors[row].id+'" class="fa fa-pencil-square-o edit" onclick=\'editForm('+JSON.stringify($processors[row])+')\'></i>';
		                                  }
		            
            
	     	var fields = Object.keys($processors[row]);        
	        
         }
           if (document.getElementById('addForm') instanceof Object==false)
	              addForm($processors);    
	              
	       
	       var dataTableConfig = {
					    "sDom": 'T<"clear">lfrtip',
					    "oTableTools": {
					        "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
					        "aButtons": [
					
					            {
					                "sExtends": "select",
					                "sButtonText": "Update",
					                "fnClick": function(nButton, oConfig, oFlash) {
					                    UpdateProcessor();
					                }
					            }, {
					                "sExtends": "select",
					                "sButtonText": "cancel",
					                "fnClick": function(nButton, oConfig, oFlash) {
					
					                    $("#ToolTables_processors_table_0").hide();
					                    $("#ToolTables_processors_table_1").hide();
					                    $("#addCallBack").hide();
					                    $('#addForm')[0].reset();
					                    $("#addForm").hide();
					                }
					            },
					        ]
					    },
					    "bDestroy": true,
					    "bLengthChange": true,
					    "aaData": $processors,
					    "aaSorting": [
					        [0, "desc"]
					    ],
					    "aoColumns": [],
					
					    "fnFooterCallback": function(nRow, aaData, iStart, iEnd, aiDisplay) {
					
					
					        $(".show").removeClass("show");
					        $(".clear").addClass("show");
					        $("#ToolTables_processors_table_0").hide();
					        $("#ToolTables_processors_table_1").hide();
					        $("#addForm").hide();
					
					    }
					};
					
	       if($perProcessor == 1){
	       	dataTableConfig['aoColumns'].push({ 
					        "mData": "currency",
					        "sTitle": "Currency"
					    }, {
					        "mData": "cc_processor",
					        "sTitle": "Processor"
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
					        "mData": "cc_processor",
					        "sTitle": "Processor"
					    }); 
					    	
		    }
		    
		    
           $('#processors_table').dataTable(dataTableConfig);
	});
}


function UpdateProcessor(){
		apiRequest('UpdateProcessor',$('#addForm').serialize(),'#addCallBack',function(data){
			
			if(data.success)
				getProcessorsData();
			
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