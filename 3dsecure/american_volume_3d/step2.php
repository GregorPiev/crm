<?php
session_start();
/*

echo "<div id='content'>
	session </br>
	".var_dump($_SESSION)." <br />
	post <br />
".var_dump($_POST)."
	
</div>";die;
*/


require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$depositLog3D = new Deposit3dLog();
$_SESSION["post"] = $_POST;

$depositLog3D->createEntry(
	$_POST["user_id"],
	'American Volume 3D',
	$_POST['currency'],
	$_POST['amount'],
	$_POST['ccn'],
	$_POST['exp_year'],
	$_POST['exp_month'],
	$_SESSION['GlobaCountryIso'],
	'',
	'',
	'in progress'
);


        $action = $_POST["action"];
		$exp = $_POST["exp_month"].$_POST["exp_year"];
        $cc = $_POST['ccn'];
		$cvv = $_POST["cvc_code"];
		
		$curl = curl_init();
		
		curl_setopt($curl, CURLOPT_URL, $action);
		curl_setopt($curl, CURLOPT_FAILONERROR, true);
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($curl, CURLOPT_POSTFIELDS, array('cc_number'=>$cc,'billing-cc-exp'=>$exp,'cvv'=>$cvv));//Setting post data as xml
		
		$result = curl_exec($curl);
		$http_status = curl_getinfo($result, CURLINFO_HTTP_CODE);
  		$curl_errno= curl_errno($result);
		curl_close($curl);
	   

        if ($result===false) {
           $depositLog3D->createEntry(
				$_POST["user_id"],
				'American Volume 3D',
				$_POST['currency'],
				$_POST['amount'],
				$_POST['ccn'],
				$_POST['exp_year'],
				$_POST['exp_month'],
				$_SESSION['GlobaCountryIso'],
				'',
				'',
				'lost connection to american volume'
			);
			$_SESSION["gwResponse"]["result-text"] = "Lost Connection Please Try Again";
			echo "<div id='content'>";
			include_once 'lib/fail.php';	
			echo "</div>";
			
       
		}elseif($result==''){
			$depositLog3D->createEntry(
				$_POST["user_id"],
				'American Volume 3D',
				$_POST['currency'],
				$_POST['amount'],
				$_POST['ccn'],
				$_POST['exp_year'],
				$_POST['exp_month'],
				$_SESSION['GlobaCountryIso'],
				'',
				'',
				'wrong details'
			);
			$_SESSION["gwResponse"]["result-text"] = "Wrong Details Please try again";
			echo "<div id='content'>";
			include_once 'lib/fail.php';	
			echo "</div>";
		}else{
			echo "<div id='content'>
				".$result."	
				</div>";
			
		}
		
    
   



