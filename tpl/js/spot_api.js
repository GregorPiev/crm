
function getCustomer(){
	apiRequest('getCustomer',$('#range-form').serialize(),'#customerData',function(data){
		if(data)
			msgbox("","Connection OK","close");
		
	});
}

$(document).ready(function() {


	$("#submit").click(function(e){
		e.preventDefault();

			//$('#submit').attr("disabled", true);
			getCustomer ();
	});

});