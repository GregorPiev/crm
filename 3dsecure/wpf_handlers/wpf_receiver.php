<?php

	// Solidpayment gateway send the result of the transaction to this handler
	// and lets us know a transaction has been completed either successfully or with a failure
	// we can then decide where to direct the client
	
	require_once('config.php');
	
	
	$result = $_POST['PROCESSING_RESULT'];

	// Here you can check that you are truly expecting this transaction by verifying the unique id
	// AND / OR also do a hash check (Web Payment Frontend PDF p.24 section 7.1) to validate the response parameters

	$str = $_POST['PAYMENT_CODE'].'|'.
				 $_POST['IDENTIFICATION_TRANSACTIONID'].'|'.
				 $_POST['IDENTIFICATION_UNIQUEID'].'|'.
				 $_POST['CLEARING_AMOUNT'].'|'.
				 $_POST['CLEARING_CURRENCY'].'|'.
				 $_POST['PROCESSING_RISK_SCORE'].'|'.
				 $_POST['TRANSACTION_MODE'].'|'.
				 $_POST['PROCESSING_RETURN_CODE'].'|'.
				 $_POST['PROCESSING_REASON_CODE'].'|'.
				 $_POST['PROCESSING_STATUS_CODE'].'|'.
				 'c5dWcFsFkWca3MQF'; // secret (SECURITY.TOKEN) 
				 
	// CC.DB|1369310918.6051|ff8080813ecba681013ed14e14646542||||CONNECTOR_TEST|600.200.700|10|70|7ghYHFqxCMFsHa7W

	$hash = sha1($str);

	$msg = "?msg=".urlencode($_POST['PROCESSING_RETURN']);
	$msg .= "&amount=".urlencode($_POST['PRESENTATION_AMOUNT']);
	$msg .= "&currency=".urlencode($_POST['PRESENTATION_CURRENCY']);
	$msg .= "&transactionId=".urlencode($_POST['IDENTIFICATION_UNIQUEID']);
	$msg .= "&userIp=".urlencode($_POST['CONTACT_IP']);
	$msg .= "&reason=".urlencode($_POST['PROCESSING_REASON']);
	$msg .= "&codeStatus=".urlencode($_POST['PROCESSING_STATUS_CODE']);
	$msg .= "&timeStamp=".urlencode($_POST['PROCESSING_TIMESTAMP']);

	if(strpos($result,'ACK') !== FALSE){
		
		// GET param is just for DEBUGGING the integration
		echo $wpf_redirection_base.'/wpf_success.php'.$msg;
	}
	else{
	
		// GET param is just for DEBUGGING the integration
		echo $wpf_redirection_base.'/wpf_failed.php'.$msg;
	}
	
?>