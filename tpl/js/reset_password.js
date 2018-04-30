$(document).ready(function (){
    $("#callBack").hide();
    $("#error").hide();
    $("#reqError").hide();
    $("#changepass-form")[0].reset();


    $("#cahangePass").click(function(e){
        var id = $('#customerId').val();
        if (id == '') {
            $("#reqError").css("font-size" , "18px");
            $("#reqError").html("&nbsp;&nbsp;please fill customer id.");
            $("#reqError").show();
            e.preventDefault();
        }else if(!$.isNumeric(id)){
            $("#reqError").css("font-size" , "18px");
            $("#reqError").html("&nbsp;&nbsp;id must be a number.");
            $("#reqError").show();
            e.preventDefault();
        } else {
            var pass = $('#new-password').val();
            var retype = $('#retype-new-password').val();
            var valid = (checkPass(pass, retype) ? true : false);
            if (valid) {
                e.preventDefault();
                editCustomerPassword();
            } else {
                e.preventDefault();
            }
        }
    });

});

function checkPass(pass , retype){

    if(pass == '' || retype == ''){
        $("#error").text('both new password and retype password can not be empty');
        $("#error").show();
        return false;
    }else if (pass != retype) {
        $("#error").text('new password do not match retype password ');
        $("#error").show();
        return false;
    }else if(!pass.match(/^(?=.*\d)(?=.*[a-zA-Z])(?!.*\s).{6,13}$/)){
        $("#error").html('<i style="margin-left:250px;" class="fa fa-arrow-up"></i>');
        $("#req").css("font-size" , "18px");
        $("#error").show();
        return false;
    }else{
        return true;
    }

}

function editCustomerPassword() {

        apiRequest('newPasswordCustomer', $('#changepass-form').serialize(), 'form-container', function (data) {
            if(data["success"]) {
                $("#changepass-form").hide();
                $("#callBack").text(data["success"]);
                $('#callBack').css('font-size', '30px');
                $('#callBack').css('line-height', '14');
                $("#callBack").show();
            }


        });
}

function Focus(elem){
    $("#error").hide();
    $("#reqError").hide();
    elem.value='';
}
