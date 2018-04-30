<?php 
	session_start();
	
	require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
	$depositLog3D = new Deposit3dLog();		
	
	$depositLog3D->createEntry(
		$_SESSION["pre_post"]['userId'],
	    'American Volume 3D',
		$_SESSION["pre_post"]['currency'],
		$_SESSION["post"]['amount'],
		$_SESSION["post"]['ccn'],
		$_SESSION["post"]['exp_year'],
		$_SESSION["post"]['exp_month'],
		$_SESSION['GlobaCountryIso'],
		'',
	    implode(" ", $_POST),
	    'success'
	   );
	echo "<div id='content'><h1 class='msg'>Payment Success!</h1>
		<div>Please update the deposit in Spot Option CRM for user {$_SESSION['post']['email']}</div></div>";
	die();