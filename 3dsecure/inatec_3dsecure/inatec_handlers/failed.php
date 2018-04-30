
<?php 
	session_start();
	
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();
	
	$deposit3dLog->createEntry(
            $_SESSION['post']['user_id'],
            'inatec',
            $_SESSION['post']['currency'],
            $_SESSION['post']['amount'],
            $_SESSION['post']['ccn'],
            $_SESSION['post']['exp_year'],
            $_SESSION['post']['exp_month'],
            $_SESSION['post']['country'],
            $_SESSION['post']['city'],
            '',
            'failed',
            $_GET['error']
        );
		
	
?>

<!DOCTYPE html>
<html>
	<head>
		<title>Deposit Failed</title>
	</head>
	<body>
		<h1>Deposit Failed, Please try again(in failed.php).</h1>
		<h2>Reason: <span class="reason">
			    <?php echo $_GET['error'];?>
		</span></h2>
	</body>
</html>