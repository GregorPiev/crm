<?php
session_start();
require_once 'lib/ThreeDS_Processing_Client.php';
require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$deposit3dLog = new Deposit3dLog();


if($_SERVER['REQUEST_METHOD'] == "POST"){

    $request_arr = array(
        'trans_amount' => $_SESSION['post_data']['trans_amount'],
        'trans_id' => $_SESSION['post_data']['trans_id'],
        'cc_num' => $_SESSION['post_data']['cc_num'],
        'cc_exp_yr' => $_SESSION['post_data']['cc_exp_yr'],
        'cc_exp_mth' => $_SESSION['post_data']['cc_exp_mth'],
        'cc_cvv' => $_SESSION['post_data']['cc_cvv'],
        'PaRes' => $_POST['PaRes'],
        'MD' => $_POST['MD'],
        //make sure to update step 2
        'mid' => $_SESSION['post_data']['processing_mid']
    );
    $client = new ThreeDS_Processing_Client();
    $client->set_request_data($request_arr);
    $pa_res = $client->parse_pares();
	
    if($pa_res){
        //perform normal PROCESSING.COM API with CAVV,ECI AND XID
       
        $proc_request_arr = array(
            'account_username' => 'onetwotrade',
            'account_password' => 'Ti97tWXX',
            'type' => 'purchase',
            'amount' => $_SESSION['post_data']['trans_amount'],
            "mid" => $_SESSION['post_data']['processing_mid'],
            "mid_q" => $_SESSION['post_data']['processing_mid_q'],
            'referenceid' => time(),
            'cavv' => $client->pares_response['result']['cavv'], // new
            'xid' => $client->pares_response['result']['xid'], // new
            'eci' => $client->pares_response['result']['eci'], // new
            'secure_hash' => $client->pares_response['status']['secure_hash'], //new

            'recurring' => 0,
            'initial_recurring' => '',
            'first_name' => $_SESSION['post_data']['fname'],
            'last_name' => $_SESSION['post_data']['lname'],
            'street_address_1' => '',
            'street_address_2' => '',
            'city' => '',
            'state' => '',
            'zip' => '',
            'country' => '',
            'phone_number' => $_SESSION['post_data']['phone'],
            'email_address' => $_SESSION['post_data']['email'],
            'ip_address' => $_SERVER['REMOTE_ADDR'],
            'card_guid' => '',
            'card_number' => $_SESSION['post_data']['cc_num'],
            //'card_number' => '5313339000001001', // just overriding the cc to use bank's test card instead of actual one
            //"card_number" => "4111111111111111",
            'card_expiry_month' => $_SESSION['post_data']['cc_exp_mth'],
            'card_expiry_year' => $_SESSION['post_data']['cc_exp_yr'],
            'card_cvv2' => $_SESSION['post_data']['cc_cvv'],
            'use_gateway_id' => '',
            'gateway_trans_id' => 'ALPHANUM000',
        );

        $res = $client->process_api($proc_request_arr);
        $res_string = implode(" ", $res);   
        if($res['code'] === '00'){
        	 
            echo '<div id="content">';
            
            require_once 'lib/success.php';
            echo "</div>";
        }else{
             echo '<div id="content">';
            
            require_once 'lib/failed.php';
            echo "</div>";
        }
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
             $res_string,
            'faild',
            'unable to auth 3d secure'
            
        );
    	
        //u8ser didn't auth with 3dsecure. may have hit back or cancel
        echo "<div id='content' style='float:left;font-size:20px;width:100%;'>
            unable to auth 3d secure. <a href='./step1.php'>Go back</a>
            </div>
        ";
    }
}
