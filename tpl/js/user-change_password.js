$(document).ready(function() {				  
	$("#callBack").hide();
    $("#error").hide();
     getUserProfileData();
  	$("#changepass-form")[0].reset();
  	$("#cahangePass").click(function(e){
  		 
  		pass = $('#new-password').val();
  		retype = $('#retype-new-password').val();
  		var valid =  (checkPass(pass , retype)? true : false);
  		if(valid){
  			e.preventDefault();
  			changePassword();
  		}else{
  			e.preventDefault();
  		}
  	});
 });

function getUserProfileData() {		
  apiRequest('getUserProfileData',$('#changepass-form').serialize(),'form-container',function(data){
	 			fillForm(data);		 			
	});	
	
}
 
function fillForm(data) {
	$('#full-name').text(data[0].fullname);	
	// $('#login-username').val(data[0].username);	
	// $('#login-password').val(data[0].password);	
 }
 
function changePassword(){
 	 apiRequest('changeNsPassword',$('#changepass-form').serialize(),'form-container',function(data){
		 $("#changepass-form").hide();
		 $("#callBack").text(data);
		 $("#callBack").show();
	});	
}
 
function checkPass(pass , retype){
	
	if(pass == '' || retype == ''){
		    $("#error").text('both new password and retype password can not be empty');
		    $("#error").show();
		    return false;
	}else if (pass != retype) {
		 $("#error").text('new password do not match retype password ');
		 $("#error").show();
		 return false;	
	 }else if(!pass.match(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])([a-zA-Z0-9]{8,})$/)){
		 $("#error").html('<i style="margin-left:250px;" class="fa fa-arrow-up"></i>');
		 $("#req").css("font-size" , "18px");
		 $("#error").show();
		 return false;
	}else{
		return true;
	}
	
}
 
function Focus(elem){
	$("#error").hide();
	elem.value='';
}
