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
    'declined',
   	$_SESSION["gwResponse"]["result-text"]
   );
   
echo "<div id='content'><h1>Deposit Decline, Please try again.</h1>
		<h2>Reason: <span class='reason'>".$_SESSION["gwResponse"]["result-text"]."</span></h2></div>";

die();