

function resetBorder (fieldId) {
	$("#"+fieldId).css("border", "1px solid #ccc");
}

function resetAllBorders () {
	$('#addForm :text').each(function(){
			$(this).filter(':input').css("border", "1px solid #ccc");
 		})

	$('#addForm')[0].reset();
	$("span.error").remove();
}
 function checkForm(){

 }


function checkField(fieldName , fieldValue){

	switch(fieldName){
	    case "promocode":
	    case "desc":
	    case "title":
	    case "features":
	    case "alphaNumeric":
	       		if(alphaNumeric(fieldName,fieldValue)){
	       			return;
	       		}else{
	       			$("#"+fieldName).css("border", "1px solid #f00");
	       			if (fieldName == "desc")
	       				$("#"+fieldName).before('<span class="error " style="margin-left:50px !important;">* numbers and letters only</span>');
	       			else
	       				$("#"+fieldName).before('<span class="error alphaNumeric">* numbers and letters only</span>');
	       		}
	        break;
	    case "percentage":
	    case "min_deposit":
	    case "max_deposit":
	    case "isNum":
	        	if(!isNum(fieldName,fieldValue)){
	        		$("#"+fieldName).css("border", "1px solid #f00");
	        		if(fieldName == "percentage")
	        			$("#"+fieldName).before('<span class="error" style="margin-left:5px !important;">* numbers only</span>').show();
	        		else
	        			$("#"+fieldName).before('<span class="error isNum"  >* numbers only</span>').show();
	        	}else{

	        	}
	        break;

	}
}

function alphaNumeric(name,value){
	return (value!="" && value.match(/^[0-9a-zA-Z_ %]+$/));
		 
	}

function isNum(name,value){
	return (value!="" && value.match(/^[0-9]/));
		
}

function formSubmit(){
var field=0;
 $('#addForm>.form_row>input[type=text]').not(".tagsinput").each(function(){ 
        if( $.trim($(this).val()) == "" ) field++;     
    });
    if (field>0) {
    	$("h6").show();	
    	return false;
    } 	
    else{
    	$("h6").hide();
    	$("span.error").remove();	
    	return true;	
    }  
}

function check(name,value){
	
	if(name=="username")	
	{
		if(value.indexOf(' ') >= 0)
			$("#username").before('<span class="error" id="error1">*please enter no spaces</spane>');
        else
        	$("#error1").remove();		
        	
    	apiRequest('isFinduserName',$('#addForm').serialize(),'#jhfhj',function(data){
			if(data == true)
				$("#username").before('<span class="error" id="error">*Existing User Name</spane>');
			else 
        		$("#error").remove();	
		});	
		
	}
	if(name=="password")
	{
		if(value){
		    if(!value.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/)) {
			   	$("#password").before('<span class="error" id="error2" style="margin-left:30px !important;">*password must be 8 characters containing at least 1 number and 1 capital letter and lower</spane>');

			}else{    
		       	$("#error2").remove();
		    }
        }	

	}
 
}

function DeleteContent(){
   $('#addForm')[0].reset();
}


