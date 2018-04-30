<?php

echo "start <br>";
	require_once 'EngageSilverPop.php';

	$apiHost = 'api2.ibmmarketingcloud.com'; // need to replace with the real host
	$username = 'eyal.m@onetwotrade.com'; // need to replace with username
	$password = 'OneTwo12@'; // need to replace with passworrd
	
	try{
		echo "in try api ".$apiHost."<br>";
		$engage = new Engage($apiHost);
		$engage->login($username, $password);
		
		$engage->uploadFile("testCustomerData_silver.csv", "CustomerDataMAP_asTable.xml");
		
		$requestImportData = '<ImportTable><MAP_FILE>CustomerDataMAP_asTable.xml</MAP_FILE><SOURCE_FILE>testCustomerData_silver.csv</SOURCE_FILE></ImportTable>';
		$response = $engage->execute($requestImportData);
		
		echo "<pre>";
		var_dump($response);
		echo "<br>";
		
		$engage->logout();
		
	} catch (Exception $e) {
		echo $e->getMessage() . "\n";
		print_r($engage->getLastRequest());
		print_r($engage->getLastResponse());
		print_r($engage->getLastFault());
	}
	
?>