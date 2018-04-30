<?php 
	session_start();
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$deposit3dLog = new Deposit3dLog();

	if($_POST['status'] != "approved"){
		$deposit3dLog->createEntry(
            $_SESSION['post']['user_id'],
            'fibonatix',
            $_SESSION['post']['currency'],
            $_SESSION['post']['amount'],
            $_SESSION['post']['ccn'],
            $_SESSION['post']['exp_year'],
            $_SESSION['post']['exp_month'],
            $_SESSION['GlobaCountryIso'],
            $_SESSION['post']['city'],
            implode(" ", $_POST),
            'failed',
            $_POST['error_message']
            
        );
		echo "<div id='content'><h1>Deposit Failed, Please try again.</h1>
				<h2>Reason: <span class='reason'>".$_POST['error_message']."</span></h2></div>";
		die();
	}else{
		$deposit3dLog->createEntry(
        	$_SESSION['post']['user_id'],
            'fibonatix',
            $_SESSION['post']['currency'],
            $_SESSION['post']['amount'],
            $_SESSION['post']['ccn'],
            $_SESSION['post']['exp_year'],
            $_SESSION['post']['exp_month'],
            $_SESSION['GlobaCountryIso'],
            $_SESSION['post']['city'],
            implode(" ", $_POST),
           'approved'
        
    );
		echo "<div id='content'><h1 class='msg'>Payment Success!</h1>
			<div>Please update the deposit in Spot Option CRM for user {$_GET['email']}</div></div>";
	}
?>