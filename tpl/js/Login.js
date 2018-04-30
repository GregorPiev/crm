var Login = function () {
	"use strict";	
	return { init: init };
	function init () {
		$.support.placeholder = false;
		var test = document.createElement('input');
		if('placeholder' in test) $.support.placeholder = true;
	
		if (!$.support.placeholder) {
			$('#login-form').find ('label').show ();			
		}
    
	}
} ();

$(function () {
	Login.init ();
	
	$("#refresh").click(function() {
	   reloadCaptcha();
	   return false;
   });		   
   function reloadCaptcha() {
	   var newImage = '../securimage_show.php?sid=' + Math.random();
	   $("#siimage").attr("src",newImage);
   }

$( '#resetpass-form' ).parsley(
{
  inputs: 'input, textarea, select'
  , excluded: 'input[type=hidden]'  
  , listeners: {
     onFormSubmit: function ( isFormValid, event, ParsleyForm ) {    
      if (isFormValid) { 
          event.preventDefault();
          apiRequest('resetPassword',$('#resetpass-form').serialize(),'#resetpass-form',function(data){
      	  	 msgbox('<i class="icon-warning-sign"></i> Reset Password Link', data.msg, "Close");
      	  });             
      }
     }
  }
});
						
							
$( '#login-form' ).parsley(
{
  inputs: 'input, textarea, select'
  , excluded: 'input[type=hidden]'  
  , listeners: {
     onFormSubmit: function ( isFormValid, event, ParsleyForm ) {         
      if (isFormValid) {
          
         apiRequest('login',$('#login-form').serialize(),'#login-form',function(data){ 
             
                    if(data.hasOwnProperty('auth_error')){
                                
         		       msgbox('<i class="icon-warning-sign"></i> Oops!', data.auth_error, "Close");
         		       $('#ct_captcha').val('');
         		       $('#refresh').trigger('click');
                        
                    }else{
                        modalBrandChoice(data);
                        
                    }
         });
         event.preventDefault();         
      }
      
     }
  }

});

	
});

function modalBrandChoice(data) {

    var form_data = '<form class="form-horizontal" id="editEmail">' +
        			'<div class="form-group">' + 
        			'<label class="col-md-4 control-label" for="brands">Brand:</label> ' +
        			'<div class="col-md-6">'+
        			'<select name="brands" class="form-control">';      
    $.each(data.authorized_brands,function(dkey,dval){
       form_data +="<option value='"+JSON.stringify(dval)+"'>"+dval.name+"</a>";
    });
    
    form_data += '</select>'+
                 '</div></div>' +
                 '</form>';

    bootbox.dialog({
        title: "Choose Brand",
        message: form_data,
        buttons: {
            confirm: {
                label: "OK",
                className: "btn-success",
                callback: function () { 
                        var post_data={chosen_brand: $("select[name*='brands']").val(), 
                                       authorized_brands: JSON.stringify(data.authorized_brands) , 
                                       userdata: JSON.stringify(data.userdata)};
                        apiRequest('loginBrandChoice',post_data,'#login-form', function (data) {
                            msgbox('<i class="icon-warning-sign"></i> Oops!', 'Login Error. Please try again', "Close");
                            $('#ct_captcha').val('');
         		            $('#refresh').trigger('click');
                        });
                   
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger",
                callback: function () {
                	$('#ct_captcha').val('');
                    $('#refresh').trigger('click');
                }
            }
        }

    });
    
}


