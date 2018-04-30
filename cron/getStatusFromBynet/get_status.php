<?php

require_once "/opt/ott/sites/ns/inc/db.php";

$nowDate = date('Y-m-d H:i');
$fromDate = date("Y-m-d H:i", strtotime("-1 minutes", strtotime($nowDate)));

$campaignId = 0;
$toDate = "";

$getStatusParams = array("campaignId" => $campaignId, "fromDate" => $fromDate, "toDate" => $toDate, "returnFields" => 'B, C');

$URL = "http://31.168.4.178:5005/dialer/getStatus";
$ch = curl_init($URL);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json'));
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($getStatusParams));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$result = curl_exec($ch);
curl_close($ch);

$result_arr = json_decode($result);	
$finalResult = json_decode($result_arr->result);

foreach($finalResult as $value){
	
	$dialStatus = getDialStatus($value->status);
	$dialTime = str_replace('T', ' ', $value->dialTime);
	
	/*if ($dialStatus['spotStatus'] != '')
	{
		$employeeId = $value->B;
		$id = $value->personalId;
		//$salestatus = $dialStatus['spotStatus'];
		addCustomerCall($employeeId, $id);
	}*/
	
	$accountNumber = $value->accountNumber;
	$bynetStatus = $dialStatus['bynetStatus'];
	
	$northStarDB = new MySqlDriver();
	$sql = "UPDATE autodialer_Records SET dailStatusID=$bynetStatus, callTime='$dialTime', updatedBy='by process', updatedTime=NOW() WHERE accountNumber='$accountNumber'";
    $result = $northStarDB->exec($sql);
}

function getDialStatus($dialStatus){
	$status = array();
	$status['spotStatus'] = '';

	switch($dialStatus) {
	    case 'handled':
	        $status['bynetStatus'] = 1;
	        $status['spotStatus'] = '';
	        break;
	    case 'no_answer':
	        $status['bynetStatus'] = 2;
	        $status['spotStatus'] = 'noAnswer';
	        break;
	    case 'wrong_number':
	        $status['bynetStatus'] = 3;
	        $status['spotStatus'] = 'checkNumber';
	        break;
	    case 'busy':
	        $status['bynetStatus'] = 4;
	        $status['spotStatus'] = 'noCall';
	        break;
	    case 'fax':
	        $status['bynetStatus'] = 5;
	        $status['spotStatus'] = 'checkNumber';
	        break;
	    case 'answer_machine':
	        $status['bynetStatus'] = 6;
	        $status['spotStatus'] = 'checkNumber';
	        break;
	    case 'skipped_by_agent':
	        $status['bynetStatus'] = 7;
	        $status['spotStatus'] = 'noCall';
	        break;
	    case 'retry':
	        $status['bynetStatus'] = 8;
	        break;
	    case 'in_queue':
	        $status['bynetStatus'] = 9;
	        break;
	    case 'waiting':
	        $status['bynetStatus'] = 10;
	        break;
	    case 'aborted':
	        $status['bynetStatus'] = 11;
	        $status['spotStatus'] = 'noCall';
	        break;
	    default:
	    	$status['bynetStatus'] = 12;
	        break;
	}
	return $status;
}

function addCustomerCall($employeeId, $id)
{
	$api = new SpotOption();
	
	$subject = "Call from autodialer";
	$content = "Call made by autodialer in "+ $dialTime;

	$salestatus = $data["salestatus"];

    $fields = array(
        "subject" => $subject,
        "content" => $content,
        "employeeId" => $employeeId
    );
	
    $result = $api->addCallById($id, $fields);
	
    if ($result["success"]) {
    	//$userfields = array(
            //"saleStatus" => (string)$salestatus
        //);

        //$resultedit = $api->editUserById($id, $userfields);
		
        //die('{"success":"2","message":"add call"}');
    }

    //die('{"error":"' . $result['error'][0] . '"}');
}

?>