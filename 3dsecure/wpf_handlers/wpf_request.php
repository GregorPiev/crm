<?php
	session_start();
	$_SESSION['post'] = $_POST;	

	
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();

	
	require_once('config.php');

	// WPF Parameters
	$params=array(
		"REQUEST.VERSION"=>'1.0',
 	
		"SECURITY.SENDER"=>'8a8394c348c111f80148d162e7843f06',
		"SECURITY.TOKEN"=>'M9RZJMG3RyFwMGRF',
		
		"USER.LOGIN"=>'8a8394c348c111f80148d162e7853f08',
		"USER.PWD"=>'fKBrBq6j',
		
		"TRANSACTION.MODE"=>'LIVE',
		// "TRANSACTION.CHANNEL"=>'',
			
		"TRANSACTION.RESPONSE"=>'ASYNC',
		"IDENTIFICATION.TRANSACTIONID"=>date('dMHis',time()), // Make this unique in production
		
		"FRONTEND.ENABLED"=>'true',
		"FRONTEND.POPUP"=>'false',
		"FRONTEND.MODE"=>'DEFAULT',
		"FRONTEND.LANGUAGE"=>'en',
		"FRONTEND.RESPONSE_URL"=>$wpf_handlers_base.'/wpf_receiver.php',
		"FRONTEND.REDIRECT_TIME"=>0,
		"FRONTEND.CSS_PATH"=>$wpf_customizations_base.'/css/wpf.css',
		"FRONTEND.JSCRIPT_PATH"=>$wpf_customizations_base.'/js/wpf.js',
		"FRONTEND.FORM_WIDTH"=>'500',
		"FRONTEND.HEIGHT"=>'500',
		"FRONTEND.SUPPORT_NUMBER"=>'',
		"FRONTEND.LINK.1.KIND"=>'TERMS',
		"FRONTEND.LINK.1.LINK"=>'http://XXXXXXXXXXXXXXXX/TC.pdf',
		"FRONTEND.LINK.1.AREA"=>'EMBEDDED_CHECKBOX',
		"FRONTEND.LINK.1.POPUP_WIDTH"=>'800',
		"FRONTEND.LINK.1.POPUP_HEIGHT"=>'600',
		
		// "FRONTEND.BANNER.1.LINK"=>$wpf_customizations_base.'/include/bottom.html',
		// "FRONTEND.BANNER.1.AREA"=>'BOTTOM',
		// "FRONTEND.BANNER.1.HEIGHT"=>'100',
		
		// "FRONTEND.BANNER.2.LINK"=>$wpf_customizations_base.'/include/top.html',
		// "FRONTEND.BANNER.2.AREA"=>'TOP',
		// "FRONTEND.BANNER.2.HEIGHT"=>'89',
		// "FRONTEND.PM.1.METHOD"=>'CC',
		
		// "PAYMENT.CODE"=>'CC.DB',
		
		// Set parameters from user's POST
		"NAME.SALUTATION"=>'Mr',
		"NAME.TITLE"=>'',
		"NAME.GIVEN"=>$_POST['First_Name'],
		"NAME.FAMILY"=>$_POST['Last_Name'],
		"NAME.COMPANY"=>'',
		
		"ADDRESS.STREET"=>$_POST['Street'],
		"ADDRESS.ZIP"=>$_POST['Postal_Code'],
		"ADDRESS.CITY"=>$_POST['City'],
		"ADDRESS.STATE"=>$_POST['State'],
		"ADDRESS.COUNTRY"=>$_POST['Country'],
		
		"CONTACT.EMAIL"=>$_POST['Email'],
		"CONTACT.MOBILE"=>'',
		"CONTACT.IP"=>$_SERVER['REMOTE_ADDRESS'],
		"CONTACT.PHONE"=>'',
		
		"PRESENTATION.AMOUNT"=>$_POST['amount'],
		"PRESENTATION.CURRENCY"=>$_POST['Currency'],
		"PRESENTATION.USAGE"=>'WPF TEST',
		"TRANSACTION.CHANNEL" => $_POST['channel']
	);

	// if(1) {
		//$params['TRANSACTION.CHANNEL'] = '8a8394c34ba1d0ca014bd9c2b74f13a9';
	// }
	// else {
		//USD
		//$params['TRANSACTION.CHANNEL'] = '8a8394c64a5889eb014ab9f2981d4279';
	// }
	

	// Call WPF service
	// Service should respond with ACK and the WPF URL for this transaction which we are going to embed as an IFRAME
	
	$ch = curl_init();	

	curl_setopt($ch, CURLOPT_URL, $wpf_gateway);
	curl_setopt($ch, CURLOPT_USERAGENT, 'PHP Tester');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, TRUE); // Change to TRUE in production
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($params));
	curl_setopt($ch, CURLINFO_HEADER_OUT, TRUE);
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
		// WPF expects UTF-8 encoding
		"Content-Type: application/x-www-form-urlencoded; charset=UTF-8"
	));
	
	$curl_result = curl_exec($ch); // Call
	$curl_error = curl_error($ch);
	$curl_info = curl_getinfo($ch);
	
	curl_close($ch); // Cleanup

	// Debug Parameters
	//var_dump($params);
	// echo "<br/>";
	// Debug CURL
	//var_dump($curl_error);
	// echo "<br/>";
	//var_dump($curl_info);
	// echo "<br/>";
	// Debug gateway result
	//var_dump($curl_result);

	// Parse the response from WPF
	parse_str($curl_result,$wpf_response);
	
	// Handle the result
	$wpf_iframe_src='';
	if($wpf_response['POST_VALIDATION']=='ACK'){

		
		$deposit3dLog->createEntry(
            $_SESSION['post']['user_id'],
            'ECP',
            $_SESSION['post']['Currency'],
            '',
            '',
            '',
            '',
            $_SESSION['post']['Country_iso'],
            'NA',
             json_encode($wpf_response),
            'in progress'
            
        );
		
		

		$wpf_iframe_src = urldecode($wpf_response['FRONTEND_REDIRECT_URL']);
	}

?>
