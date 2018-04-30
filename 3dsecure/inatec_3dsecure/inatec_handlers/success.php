<?php 
	session_start();
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();
	
	if(isset($_POST['errormessage']) && $_POST['errormessage'] != '')
	{
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
            $_POST['errormessage']
            
        );
		echo "<div id='content'><h1>Deposit Failed, Please try again.</h1>
				<h2>Reason: <span class='reason'>".$_POST['errormessage']."</span></h2></div>";
		die();
	}else{
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
            'success'
        );
		echo "<div id='content'><h1 class='msg'>Payment Success!</h1>
			<div>Please update the deposit in Spot Option CRM for user {$_GET['email']}</div></div>";
	}
		
	
?>