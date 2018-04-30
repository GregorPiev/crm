<?php
session_start();
require_once "Fibonatix3dHelper.php";
require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$deposit3dLog = new Deposit3dLog();

$_SESSION['post'] = $_POST;
$userId = $_POST["user_id"];

$fields = fibonatixNewDepositCC($_POST , $userId , $deposit3dLog);

if(isset($fields["error"])){
	$deposit3dLog->createEntry(
            $userId,
            'fibonatix',
            $_SESSION['post']['currency'],
            $_SESSION['post']['amount'],
            $_SESSION['post']['ccn'],
            $_SESSION['post']['exp_year'],
            $_SESSION['post']['exp_month'],
            $_SESSION['post']['country'],
            $_SESSION['post']['city'],
            $resultDeposit,
            'failed',
            'unknown'
        );
	echo "<div id='content' style='float:left;font-size:25px !important;font-weight:bold;'>".$fields["error"]."</div>	
	";
	
}else{
	$fields  = parse_str($fields);
	
	echo "<div id='content'>".$html."</div>";
}

function fibonatixNewDepositCC($post ,$userId , $deposit3dLog){
	
    $api = new fibonatixHelper($post);
	
    $resultDeposit = $api->addDepositWithNewCreditcard(); //deposit with new credit card

    $resultDeposit = preg_replace('/[\r\n]+/', '', $resultDeposit); //remove new line characters
	parse_str($resultDeposit , $resultDepositArr); //parse response

    //check if mandatory parameters are exists without errors
    if(isset($resultDepositArr['merchant-order-id']) && 
        isset($resultDepositArr['paynet-order-id']) && 
        isset($resultDepositArr['serial-number']) &&
        !isset($resultDepositArr['error-code']) &&
        !isset($resultDepositArr['error-message'])) {
        	
		 $deposit3dLog->createEntry(
            $userId,
            'fibonatix',
            $post['currency'],
            $post['amount'],
            $post['ccn'],
            $post['exp_year'],
            $post['exp_month'],
            $post['country'],
            $post['city'],
            $resultDeposit,
            'in progress'
        );
		
        //let Fibonatix few seconds to proccess before moving on
        sleep(10);
        
        //check transaction status
        $success = fibonatixCheckStatus($api,$post,$userId,$resultDepositArr['merchant-order-id'],$resultDepositArr['paynet-order-id'],$resultDepositArr['serial-number']);
       	$success_vars =  parse_str($success);
		
	       if($status == "approved"){
	       	return $success;
	       }
	       if(isset($html)){
	       	return $success;
	       }else         //let Fibonatix few more seconds to proccess if still under processing
	        if($status == "processing") {
			    for ($i=3; $i < 0; $i++) { 
				
	                sleep(5);
	
	                //check transaction status
					$success = fibonatixCheckStatus($api,$post,$userId,$resultDepositArr['merchant-order-id'],$resultDepositArr['paynet-order-id'],$resultDepositArr['serial-number']);				
					$success_vars =  parse_str($success);
	                if($status == "approved") {
	                   return $success;
	                }
	
	            }
	
	           
	        }else{
	        	$deposit3dLog->createEntry(
								            $userId,
								            'fibonatix',
								            $post['currency'],
								            $post['amount'],
								            $post['ccn'],
								            $post['exp_year'],
								            $post['exp_month'],
								            $_SESSION['GlobaCountryIso'],
								            $post['city'],
								            $success,
								            'failed',
								            $success['error-messege']
								        );
								        return array("error" => "there was a problem please try again or change processors"); 
				}
	    }else {
			$deposit3dLog->createEntry(
	            $userId,
	            'fibonatix',
	            $post['currency'],
	            $post['amount'],
	            $post['ccn'],
	            $post['exp_year'],
	            $post['exp_month'],
	            $_SESSION['GlobaCountryIso'],
	            $post['city'],
	            $resultDeposit,
	            'failed',
	            'unknown'
	        );
	        return array("error" => "there was a problem please try again or change processors"); 
			  
	    }
	    
	      
	}


function fibonatixCheckStatus($api,$post,$userId,$merchant_order_id,$paynet_order_id,$serial_number) {


    //check order by deposit response
    $resultOrderCheck = $api->checkOrderStatus($merchant_order_id,$paynet_order_id,$serial_number);
    return $resultOrderCheck;
    
}