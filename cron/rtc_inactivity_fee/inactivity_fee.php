<?php
/*error_reporting(E_ALL);
ini_set('display_errors', 1);*/

require_once "Dormant.php";

$dormantHelper = new DormantHelper();

$config = new config();

$dormantHelper->setBrandName('rtc');
$dormantHelper->setLeverateCRM('rtc_leverate');
$dormantHelper->setInventivaCRM('rtc_inventiva');
$dormantHelper->setDbHost('mssql_rds');
$dormantHelper->setLeverateCRMDB($config::get_db_name('rtc_leverate'));
$dormantHelper->setInventivaCRMDB($config::get_db_name('rtc_inventiva'));
$dormantHelper->setBrandTp('rtc_tp');

$dormantHelper->setLeverateConnection();

$dormantData = $dormantHelper->getDormantData();

$accounts = $dormantHelper->getInactiveAccounts();

$tpAccounts = array();
foreach($accounts as $key=>$account){
	$tpAccounts[]=$account['tpAccount'];
}

$dormantHelper->setTpConnection();
             
$inactiveTpAccounts = $dormantHelper->getInactiveTpAccounts($tpAccounts);

$tpAccountCount = 0;
$tpAccountChanges = array();

$dormantHelper->setLeverateApi();

foreach($accounts as $key=>$account){
    	
    if(!isset($accountId) || $accountId == $account['accountGUID']){
    	$tpAccountCount++;
    }else{
    	if($tpAccountCount == sizeof($tpAccountChanges)){
    		$dormantHelper->tpAccountInactivityFees($tpAccountChanges);
    	}
    	$tpAccountCount = 1;
    	$tpAccountChanges = array();
    }
    foreach($inactiveTpAccounts as $key=>$inactiveTpAccount){
    	if($account['tpAccount'] == $inactiveTpAccount['tpAccount']){
    		unset($inactiveTpAccount['tpAccount']);
    		$tpAccountChanges[] = array_merge($account,$inactiveTpAccount);
    		break;
    	}
    }
    $accountId = $account['accountGUID'];    
     	
}

if($tpAccountCount == sizeof($tpAccountChanges)){
    $dormantHelper->tpAccountInactivityFees($tpAccountChanges);
}

?>