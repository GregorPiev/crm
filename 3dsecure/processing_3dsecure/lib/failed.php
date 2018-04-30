
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
            $res['message'].' '. $res['sub_code'] . "|" . $res['sub_message']
            
        );

?>
<!DOCTYPE html>
<html>
	<head>
		<title>Deposit Failed</title>
	</head>
	<body>
		
		<h1>Deposit Failed, Please try again.</h1>
		<h2>Reason: <span class="reason">
			    <?php echo $res['message'];?>
		</span></h2>
<!--.' '. $res['sub_code'] . "|" . $res['sub_message']-->
		
	</body>
</html>