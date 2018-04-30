<?php
/*
 *
 * Gets ACS redirection URL and redirects customer to ACS page for 3Dsecure confirmation
 *
 */

session_start();

require_once 'lib/ThreeDS_Processing_Client.php';
require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$deposit3dLog = new Deposit3dLog();

//the url customer should return to after 3Dsecure confirmation
$callback_url = "http://".$_SERVER['HTTP_HOST']."/agenttools/processingstep3";


if($_SERVER["REQUEST_METHOD"] == "POST"){

    // using session to store credit card ## without exposes to a URL. This is so you can retrieve billing info after returning to the callback url
    // you can also use any other storage method like a database to store.

    $trans_id = time(); //should be trx id from ecommerce platform
    $_SESSION['post_data'] = $_POST;
    $_SESSION['post_data']['trans_id'] = $trans_id;

    $request_arr = array(
        'trans_amount' => $_POST['trans_amount'],
        'trans_id' => $trans_id,
        'cc_num' => $_POST['cc_num'],
        'cc_exp_yr' => $_POST['cc_exp_yr'],
        'cc_exp_mth' => $_POST['cc_exp_mth'],
        'cc_cvv' => $_POST['cc_cvv'],
        //make sure to also update on step 3
        'mid' => $_POST['processing_mid'] 
    );
    
    $client = new ThreeDS_Processing_Client();
    $client->set_request_data($request_arr);
    $client->set_return_url($callback_url);
    $res = $client->request_acs();
    
    //$res['message'] = "frud card";
	//header("LOCATION: 'lib/failed.php'");
	//die();
	
    if($res){
    	$deposit3dLog->createEntry(
            $_SESSION['post_data']['user_id'],
            'processing',
            $_SESSION['post_data']['currency'],
            $_SESSION['post_data']['trans_amount'],
            $_SESSION['post_data']['cc_num'],
            $_SESSION['post_data']['cc_exp_yr'],
            $_SESSION['post_data']['cc_exp_mth'],
            $_SESSION['GlobaCountryIso'],
            'NA',
             $res,
            'in progress'
            
        );
        error_log('redirecting to acs: ' . $client->acs_response['result']['acs_url']);
        $client->redirect_to_acs_url();
    }else{
    	$deposit3dLog->createEntry(
            $_SESSION['post_data']['user_id'],
            'processing',
            $_SESSION['post_data']['currency'],
            $_SESSION['post_data']['trans_amount'],
            $_SESSION['post_data']['cc_num'],
            $_SESSION['post_data']['cc_exp_yr'],
            $_SESSION['post_data']['cc_exp_mth'],
            $_SESSION['GlobaCountryIso'],
            'NA',
             $res,
            'failed',
            'card is not enrolled in 3dsecure'
            
        );
        //card not enrolled process card normally or deny progression
         die ("<div id='content' style='float:left;font-size:20px;width:100%;'>card is not enrolled in 3dsecure.</div>");
    }

   



 } 

