
jQuery(document).ready(function($) {
	$("#binData").hide();
	$("#binData").html('');
		var host = window.location.hostname;
		var hostArr = host.split('.');
		var site = hostArr[1];
		site="onetwotrade";
	$("#binCheck").submit(function(e) {
		e.preventDefault();
		ccFieldValidate();
	});

	function ccFieldValidate(){
		
		var CC = $("#cc_number").val();
		
		
		if( CC ===""){
			msgbox('Error','CC Number field is required ','close');
            return false;
		}
		if( !CC.match(/^[0-9]+$/) ){
			msgbox('Error','CC Number field must be numbers only','close');
            return false;
		}
		
		switch (CC.length) {
			case 16: break;
			case 19: break;
			default:
					msgbox('Error','CC Number must be 16 or 19 characters long','close');
	            	return false;
		}
		ccBinData( CC );
		
	}

	function ccBinData( CC ){
		$("#binData").html('');
		apiRequest('ccBinCheck',$("#binCheck").serialize(), '#binCheck', function (data) {
			var length = data.length;
		   
		   if(length==1){
			var binData = data[0];
			binData['County_blocked'] = (binData['County_blocked'] === "1" ? "<span style='color:#f00;'>yes</span>" : "<span style='color:#f00;'>no</span>");
			Object.keys(binData).forEach(function (key) {
				
                Key = key.replace(/_/g, " ");
                if(Key == 'Card num of digits')
					Key = 'Card # of digits';
 
                $("#binData").append("<div><b>"+Key+"</b> : "+binData[key]+"</div>");
                $("#binData").show();
            });
				
				
			}else{
				$("#binData").hide();
				$("#binData").html('');
				msgbox('!','CC Number has no bin data','close');
            return false;
			}
		});
	}
});