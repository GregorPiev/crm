<?php
require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$deposit3dLog = new Deposit3dLog();

$deposit3dLog->createEntry(
            $_SESSION['post_data']['user_id'],
            'processing',
            $_SESSION['post_data']['currency'],
            $_SESSION['post_data']['trans_amount'],
            $_SESSION['post_data']['cc_num'],
            $_SESSION['post_data']['cc_exp_yr'],
            $_SESSION['post_data']['cc_exp_mth'],
            $_SESSION['post_data']['Country'],
            'NA',
             $res_string,
            'approved'
            
        );

?>
<!DOCTYPE html>
<html>
	<head>
		<title>Payment Success!</title>
	</head>
	<body>
		<h1 class="msg">Payment Success!</h1>
		<div>
			Please update the deposit in Spot Option CRM for user <?php echo $_SESSION['post_data']['email'] ?>
		</div>
		<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.2/jquery.min.js"></script>
	</body>
</html>