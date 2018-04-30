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
            'failed'
            
        );
	$data = array(
					'status'=>'failed',
					'userIp'=> $_GET['userIp'],
					'amount' => floor($_GET['amount']),
					'currency' => $_GET['currency'],
					'transactionId' => $_GET['transactionId'],
					'reason' => $_GET['reason'],
					'codeStatus' => $_GET['codeStatus'],
					'timeStamp' => $_GET['timeStamp'],
					'msg' => $_GET['msg'],
              	);
	$dataQueryString = http_build_query($data);
	
 ?>
<!DOCTYPE html>
<html>
	<head>
		<title>Deposit Failed test 11</title>
	</head>
	<body>
		<h1>Deposit Failed, Please try again.</h1>
		<h2>Reason: <span class="reason">
			<?php echo $_GET['msg'];?>
		</span></h2>

		
		
	</body>
</html>
