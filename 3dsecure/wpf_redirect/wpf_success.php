<?php 
session_start();
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();
	
	$deposit3dLog->createEntry(
            $_SESSION['post']['user_id'],
            'ECP',
            $_SESSION['post']['Currency'],
            $_SESSION['post']['amount'],
            '',
            '',
            '',
            $_SESSION['post']['Country_iso'],
            'NA',
             $msg,
            'success'
            
        );
	
	$data = array(
					'status'=>'success',
					'userIp'=> $_GET['userIp'],
					'amount' => floor($_GET['amount']),
					'currency' => $_GET['currency'],
					'transactionId' => $_GET['transactionId'],
					'reason' => $_GET['reason'],
					'codeStatus' => $_GET['codeStatus'],
					'timeStamp' => $_GET['timeStamp'],
					'msg' => $_GET['msg'],
					'promo' => (isset($_COOKIE['promoCode'])?$_COOKIE['promoCode']:false)
              	);
	
	$dataQueryString = http_build_query($data);
	
 ?>
<!DOCTYPE html>
<html>
	<head>
		<title>Payment Success</title>
	</head>
	<body>
		<h1>Payment Success!</h1>
		<div>Please update the deposit in Spot Option CRM for user <?php echo $_SESSION['post']['email'] ?></div>

		
	</body>
</html>