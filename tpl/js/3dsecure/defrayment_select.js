jQuery(document).ready(function($) {
		var host = window.location.hostname;
		var hostArr = host.split('.');
		var site = hostArr[1];
		site="onetwotrade";
		get_all_defrayment_currency_data(site);
		
		$( "#defrayment_select" ).change(function() {
			console.log($("#defrayment_select").val());
			switch($("#defrayment_select").val()){
							
				case 'processing':
						$("#gotodef").append('<input type="hidden" value="'+$("#defrayment_select").val()+'" name="processor"/>');
						$("#gotodef").append('<input type="hidden" value="'+$("#user_id").val()+'" name="user_id"/>');
						$('#gotodef').attr('action', 'processing');	
					 break;
					 
				 case 'american_volume':
						$("#gotodef").append('<input type="hidden" value="'+$("#defrayment_select").val()+'" name="processor"/>');
						$("#gotodef").append('<input type="hidden" value="'+$("#user_id").val()+'" name="user_id"/>');
						$('#gotodef').attr('action', 'american_volume');	
					 break;
				 	 
				 case 'inatec':
				 		 $("#gotodef").append('<input type="hidden" value="'+$("#user_id").val()+'" name="user_id"/>');
				 		 $("#gotodef").append('<input type="hidden" value="'+$("#defrayment_select").val()+'" name="processor"/>');
						 $('#gotodef').attr('action', 'inatec');	
					 break;
				case 'fibonatix':
						 $("#gotodef").append('<input type="hidden" value="'+$("#user_id").val()+'" name="user_id"/>');
				 		 $("#gotodef").append('<input type="hidden" value="'+$("#defrayment_select").val()+'" name="processor"/>');
						 $('#gotodef').attr('action', 'fibonatix');	
					 break;
				 default:
				 	 	$("#gotodef").append('<input type="hidden" value="'+$("#user_id").val()+'" name="user_id"/>');
				 		$("#gotodef").append('<input type="hidden" value="'+$("#defrayment_select").val()+'" name="processor"/>');
						$('#gotodef').attr('action', '3dDepositsStage2');	
			}

		 	$("#gotodef").submit();	
		});
		
		function get_all_defrayment_currency_data(site){
			$.ajax({
		        url: "https://www."+site+".com/ott?cmd=get_all_defrayment_currency_data",
		        type: "POST",	        
		        dataType: "json",
		        success: function (data) { 
		        	var defrayments = data[0]; 
		        	var currencies = data[1]; 
		        	       	
		        	$.each(defrayments, function(index , value) {
		        	
						if(value.channel != ''){
							$("#gotodef").append('<input type="hidden" value="'+value.channel+'" name="channel"/>');
						}
						$("#defrayment_select").append('<option value="'+value.defrayment+'">'+value.defrayment+'</option>');
					
					});
					
					$.each(currencies, function(index , value) {
		        		if(value.currency != 'default' && value.currency != 'test'){
							$("#gotodef").append('<input type="hidden" value="'+value.mid+'" name="'+value.currency+'_mid"/>');
							$("#gotodef").append('<input type="hidden" value="'+value.mid_q+'" name="'+value.currency+'_mid_q"/>');
						}
						
					});
				}
			});	
		}
		
});