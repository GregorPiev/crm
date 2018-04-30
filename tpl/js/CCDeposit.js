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
		apiRequest('getCCDeposit',$('#ccDeposit').serialize(),'#promoCodesData_table_holder',function(customerData){
				if(customerData[0]['City']==''){
					customerData[0]['City']='NA';
				}
				if(customerData[0]['Street']==''){
					customerData[0]['Street']='NA';
				}
				if(customerData[0]['Postal_Code']==''){
					customerData[0]['Postal_Code']='00000';
				}
				jQuery.each( customerData[0], function( key, value ) {
					(key=='currency_symbol')?
						$('#'+key).html(value):
						$('#'+key).val(value);
				});
				$('#deposit_amount').val(jQuery('#depositAmount').val());
				$('#ccDeposit').addClass('visibility');
				$('#creditCardForm').removeClass('visibility');
			}

		);


		return false;

	});

	$("input,select,textarea").not("[type=submit]").jqBootstrapValidation({semanticallyStrict: true,
		submitSuccess: function ($form, event) {

			if ($form.attr('id')=='creditCardForm') {

				$('#depositAmountHidden').val($('#depositAmount').val());
				apiRequest('depositNewCC',$('#creditCardForm').serialize(),'#promoCodesData_table_holder',function(data){
					console.info("deposit" , data);
					if(data.success == "true" || data.success == true ) {

						$('#ccDeposit').removeClass('visibility');
						$('#creditCardForm').addClass('visibility');
						$("input").not("[type=submit]").not("[type=button]").val('');
						$('#depositAmount').val(250);

						}

				});

			}

			event.preventDefault();

		}
	});
});




