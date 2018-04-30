var ftd ='';

jQuery(document).ready(function($) {
	var host = window.location.hostname;
	var hostArr = host.split('.');
	var site = hostArr[1];

	$("#submitForm").click(function(e) {

		var Id = $("#userId").val();
		var Email = $("#userEmail").val();
		if(Id != '' && Email != ''){
			alert('please fill Id or Email');
			return false;
		}
		apiRequest('getCustomer3DDeposit',$('#ccDeposit').serialize(),'#promoCodesData_table_holder',function(customerData){
				console.log('customer data', customerData);
				$('#ccDeposit').addClass('visibility');
				$('#creditCardForm').removeClass('visibility');
				$("#secureDepositIframe").attr("src", "https://deposit.globalapisystems.com/?amount="+jQuery('#depositAmount').val()+"&currency="+customerData[0]['Currency']+"&id="+customerData[0]['user_id']+"&referrer=3&brand=2");
			}

		);

		return false;

	});
});




