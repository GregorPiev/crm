<?php
	session_start();
	
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();
	$_SESSION['post'] = $_POST;
	$userId = $_POST["user_id"];
	
	$_POST["language"] = 'en';
	$cc_holder = explode(' ' , $_POST['cardholder_name']);
	$_POST['param_3d'] = 'try3d';
	$_POST['orderid'] = (string)time();
	$_POST['merchantid'] = 'c5b3b8dc27a115dfde8b21998930fe1b59c7a086';
	$_POST['payment_method'] = '1';
	$_POST['url_return'] = 'http://'.$_SERVER["HTTP_HOST"].'/agenttools/inatecstep3?email='.$_POST['email'].'&user_id='.$userId;
	$_SESSION['post-data'] = $_POST;
	
	$pre_auth="https://www.taurus21.com/pay/backoffice/payment_authorize";
	$signature = "";
	ksort($_POST);
		
		foreach( $_POST as $key => $val )
		{
			if( $key != "signature" && $key != "user_id" && $key != "processor" ){
					$signature .= $val;
			}
		}	
	
	$signature .= "FC687zXRqj";	
	
	$signature = strtolower ( sha1( $signature ) );
	
	$params = array(
		"currency"=>$_POST['currency'],
		"merchantid"=>'c5b3b8dc27a115dfde8b21998930fe1b59c7a086',
		"orderid"=> $_POST['orderid'],
		"payment_method"=>'1',
		"signature"=>$signature,
		"language"=>'en',
		"url_return"=> $_POST['url_return'],
		"param_3d"=>'try3d',
		"firstname"=>$_POST['firstname'],
		"lastname"=>$_POST['lastname'],
		"street"=>$_POST['street'],
		"zip"=>$_POST['zip'], 
		"city"=>$_POST['city'],
		"country"=>$_POST['country'],
		"email"=>$_POST['email'],
		"customerip"=>$_POST['customerip'],
		"amount"=>$_POST['amount'],
		"ccn"=>$_POST['ccn'],
		"exp_year"=>$_POST['exp_year'],
		"exp_month"=>$_POST['exp_month'],
		"cvc_code"=>$_POST['cvc_code'],
		"cardholder_name"=>$_POST['cardholder_name'],
	);
	$deposit3dLog->createEntry(
            $userId,
            'inatec',
            $_POST['currency'],
            $_POST['amount'],
            $_POST['ccn'],
            $_POST['exp_year'],
            $_POST['exp_month'],
            $_POST['country'],
            $_POST['city'],
            '',
            'in progress'
        );
	
	$url = http_build_query($params);
	
	$ch = curl_init();	

	curl_setopt($ch, CURLOPT_URL, $pre_auth);
	curl_setopt($ch, CURLOPT_USERAGENT, 'PHP Tester');
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, TRUE); // Change to TRUE in production
	curl_setopt($ch, CURLOPT_POST, TRUE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $url);
	curl_setopt($ch, CURLINFO_HEADER_OUT, TRUE);
	
	curl_setopt($ch, CURLOPT_HTTPHEADER, array(
			// WPF expects UTF-8 encoding
			"Content-Type: application/x-www-form-urlencoded; charset=UTF-8"
		));
	
	
	$curl_result = curl_exec($ch); 
	$curl_error = curl_error($ch);
	$curl_info = curl_getinfo($ch);
	
	curl_close($ch); 
	
	$inatec_data = array();
	$inatec_reult = explode("&", $curl_result);
	foreach ($inatec_reult as $key => $value) {
		$value = explode("=", $value);
		$inatec_data[$value[0]] = $value[1];
		
	}
	
	$url_3ds = urldecode($inatec_data['url_3ds']);	
	$_SESSION['inatec_data'] = $inatec_data;
	
	if($inatec_data['status'] != "2000"){
		$error = urldecode($inatec_data["errormessage"]);
		$deposit3dLog->createEntry(
            $userId,
            'inatec',
            $_POST['currency'],
            $_POST['amount'],
            $_POST['ccn'],
            $_POST['exp_year'],
            $_POST['exp_month'],
            $_POST['country'],
            $_POST['city'],
            implode(" ", $inatec_reult),
            'failed',
            $error
        );
		
		echo "
		<div id='content'>
				<h1>Deposit Failed, Please try again.</h1>
				<h2>Reason: <span class='reason'>{$error}</span></h2>
		</div>";
		die();
	}	
	else{
		
		echo "<script>window.location = '".$url_3ds."'</script>";
		
		//header("location:" . $url_3ds);
		//exit();
		/*echo "
		
		<div id='content'>
				
				<iframe  width='500' height='800' src='$url_3ds' frameborder='0'></>
		</div>		
			
		
		";
		die();*/
	}
?>
