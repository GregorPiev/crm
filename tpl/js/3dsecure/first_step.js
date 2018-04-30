var ftd ='';

jQuery(document).ready(function($) {
		var host = window.location.hostname;
		var hostArr = host.split('.');
		var site = hostArr[1];
		site="onetwotrade";
	$("#tdsubmit").click(function(e) {
		
		var Id = $("#user_id").val();
		var Email = $("#email").val();
		var CC = $("#cc_number").val();
		var emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
		
		if( CC ===""){
			msgbox('Error','CC Number field is required ','close');
            return false;
		}
		if( !CC.match(/^[0-9]+$/) ){
			msgbox('Error','CC Number field must be numbers only','close');
            return false;
		}
		
		if (CC.length<13 || CC.length>19) {

					msgbox('Error','CC Number must be between 13 and 19 charecters ','close');
	            	return false;
		}
		
		
		
		if( !emailReg.test( Email ) ) {
            msgbox('Error','Please enter valid email.','close');
            return false;
        }
        
		if((Id != '' && Email != '') || (Id == '' && Email == '')){
			msgbox('Error','please fill Id or Email.','close');
			return false;
		}
		  apiRequest('getCustomer3DDeposit',$('#tddeposit').serialize(),'#promoCodesData_table_holder',function(customerData){
				
				if(!customerData.length > 0 ){
					msgbox('Error','User Does Not Exist','close');
					return false;
				}
				var currency = customerData[0].Currency;
				
				jQuery.each( customerData[0], function( key, value ) {
						$('#tddeposit').append('<input   name="'+key+'" value="'+value+'" type="hidden" />');
				});
				
				ccLuhnCheck(site, currency , CC ,customerData);
				
				ccBinCheck(site , currency , CC ,customerData);
				
			}
		
		);
	
		
	    return false;

	});
	
	function ccLuhnCheck(site , currency , CC, customerData){
		
		$("#tdsubmit").attr('disabled','disabled');
		var postData = customerData[0];
		postData.cc_number = CC;
		apiRequest('ccLuhnCheck',$("#tddeposit").serialize(), '#tddeposit', function (data) {
			
			if (data.result == 'fail'){
				msgbox('Error','<b>'+data.msg+'<b><br>','close');
				return data;
			}
			else{
				//msgbox('Success','<b>'+data.msg+'<b><br>','close');
			}
		});
	}
	
	function ccBinCheck(site , currency , CC, customerData){
		$("#tdsubmit").attr('disabled','disabled');
		var postData = customerData[0];
		postData.cc_number = CC;
		apiRequest('ccBinCheck',$("#tddeposit").serialize(), '#tddeposit', function (data) {
		   var length = data.length;
		   
		   if(length==1){
		    	var blockedCC = data[0]; 
		    	
				if(blockedCC.County_blocked!=0){
					msgbox('Error','<b>Credit Card failed bin validation</b> <br/><br/><b>CC Company</b>: '+blockedCC.Card_Brand+'<br/><b>Issue Country</b>: '+blockedCC.Country+'<br/><b>CC description code</b>: '+blockedCC.Card_Use_Code+'<br/><b>CC description</b>: '+blockedCC.Brand_Description+'<br/>','close');
					//log
					apiRequest('ccBinLog',postData, '', function (data) {
						$("#tdsubmit").removeAttr('disabled');
						return data;				
					});
					
				}else{
					
					setDefraymentDataAndFormAction(site , currency , CC);
				}
			}else{
				
					// log 
					postData.response_length = length;
					apiRequest('ccBinLog',postData, '', function (data) {
						
						setDefraymentDataAndFormAction(site , currency , CC);		
					});
					
					
				}	
       
       
    });
		
		
	}
	
	function get_all_defrayment_currency_data(site){
		$.ajax({
			url: "https://www."+site+".com/ott?cmd=get_all_defrayment_currency_data",
			//url: "http://dev-angelika-ns.ott-dev.tech/ott?cmd=get_all_defrayment_currency_data",
	        //url: "https://www.onetwotrade.com/ott?cmd=get_all_defrayment_currency_data",
	        type: "POST",	        
	        dataType: "json",
	        success: function (data) {
				return data;
			}
		});	
	}

	function setDefraymentDataAndFormAction(site , currency, CC){

		$('#tddeposit').attr('action', '3dDepositsStage2');
	
		$.ajax({
	        url: "https://www."+site+".com/ott?cmd=get_defrayment_data",
			//url: "http://dev-angelika-ns.ott-dev.tech/ott?cmd=get_defrayment_data",
	        type: "POST",
	        data: "currency="+currency,
	       // data: "currency=test",
	        dataType: "json",
	        success: function (customerData) {
	        	console.info('customerDataSuccess',customerData);
	        	if(customerData.length == 0){
	        		alert("no such customer");
	        		return false;
	        	}	//customerData[0].defrayment = 'american_volume';
						switch(customerData[0].defrayment){
							
							case 'processing':
									$('#tddeposit').append('<input type="hidden" name="processing_mid" value="'+customerData[0].processing_mid+'"/>');
									$('#tddeposit').append('<input type="hidden" name="processing_mid_q" value="'+customerData[0].processing_mid_q+'"/>');
									$('#tddeposit').append('<input type="hidden" name="processor" value="'+customerData[0].defrayment+'"/>');
									$('#tddeposit').attr('action', 'processing');	
								 break;
							 case 'inatec':
							 		 $('#tddeposit').append('<input type="hidden" name="processor" value="'+customerData[0].defrayment+'"/>');
									 $('#tddeposit').attr('action', 'inatec');	
								 break;
								case 'american_volume':
							 		 $('#tddeposit').append('<input type="hidden" name="processor" value="'+customerData[0].defrayment+'"/>');
									 $('#tddeposit').attr('action', 'american_volume');	
								 break; 
								 
							case 'fibonatix':	
							 		 $('#tddeposit').append('<input type="hidden" name="processor" value="'+customerData[0].defrayment+'"/>');
									 $('#tddeposit').attr('action', 'fibonatix');	
								 break;
							 default:
							 		$('#tddeposit').append('<input type="hidden" name="processor" value="'+customerData[0].defrayment+'"/>');
									$('#tddeposit').append('<input type="hidden" name="channel" value="'+customerData[0].channel+'"/>');
									$('#tddeposit').attr('action', '3dDepositsStage2');	
						}
					
				
				
				$("#tddeposit").submit();
				
	        	
	        	
	        },
	        error:function (customerData) {
	        	console.info('customerDataError',customerData);
	        	
	        	}	
	        
	    });
	}


	$("#applyPromoBtn").on("click",function() {
		api('applyPromoCode','args='+$("#promoCode").val());
	});

	$("#promoCode").on("blur",function() {
		api('applyPromoCode','args='+$("#promoCode").val());
	});
    

	window.parent.$(window).load(function(){

		if(ftd) {
			$(".bonus-wrapper").fadeIn();
			var dAmount = (!isNaN($("#depositAmount").val())) ? Number($("#depositAmount").val()) : 0;
			highlight(dAmount);
		  	
			setTimeout(function(){ highlight(dAmount); }, 3000);

			$('#depositAmount').on('input',findPackage);
		}

	});

	function findPackage(){
		var dAmount = (!isNaN($("#depositAmount").val())) ? Number($("#depositAmount").val()) : 0;
		highlight(dAmount);
	}

	function highlight(dAmount) {
		
	  $.each(window.parent.$(".package"),function(k,v) {
	    var max = window.parent.$(this).data("max");
	    var min = window.parent.$(this).data("min");
	    var bonus = window.parent.$(this).data("bonus");
	    var symbol = window.parent.$(this).data("symbol");

	    if(dAmount >= min && dAmount <= max) {
	      window.parent.$(this).addClass("highlight");
	      if(bonus > 0) {
	      	$(".bonus").html(symbol+Math.floor(dAmount*(bonus/100)));
	      }
	      else {
	      	$(".bonus").html("Please contact your OneTwoTrade</br> representative for more details");
	      }
	    }
	    else {
	      window.parent.$(this).removeClass("highlight");
	    }
	    
	  });
	}

	function api(cmd,string) {
		$.ajax({
	        url: "https://www.onetwotrade.com/ott?cmd="+cmd,
	        type: "POST",
	        data: string,
	        dataType: "json",
	        success: function (e) {
	        	if(cmd == "applyPromoCode") {
	        		if(e.error) {
	        			$("#promoCodeIcon").removeClass();
	        			$("#promoCodeIcon").addClass("icon-remove color-red");
	        		}
	        		else {
	        			$("#promoCodeIcon").removeClass();
	        			$("#promoCodeIcon").addClass("icon-ok color-green");
	        		}
	        	}
	        }
	    });
    }


});

