<?php
session_start();

require_once 'lib/AV_helper.php';
require_once $_SERVER['DOCUMENT_ROOT']."/inc/logs/3d_deposit_log.php";
$depositLog3D = new Deposit3dLog();if (!empty($_GET['token-id'])) {

    // Step Three: Once the browser has been redirected, we can obtain the token-id and complete
    // the transaction through another XML HTTPS POST including the token-id which abstracts the
    // sensitive payment information that was previously collected by the Payment Gateway.
    $tokenId = $_GET['token-id'];
    $xmlRequest = new DOMDocument('1.0','UTF-8');
    $xmlRequest->formatOutput = true;
	
    $xmlCompleteTransaction = $xmlRequest->createElement('complete-action');
    appendXmlNode($xmlRequest, $xmlCompleteTransaction,'api-key',$APIKey);
    appendXmlNode($xmlRequest, $xmlCompleteTransaction,'token-id',$tokenId);
    $xmlRequest->appendChild($xmlCompleteTransaction);
	
	
    // Process Step Three
  
    $data = sendXMLviaCurl($xmlRequest,$gatewayURL);
    $gwResponse = @new SimpleXMLElement((string)$data);
	$_SESSION['gwResponse'] = json_decode(json_encode((array)$gwResponse), TRUE);
    
    if ((string)$gwResponse->result == 1 ) {
    	include_once 'lib/success.php';
		die;
       /*
        print " <p><h3> Transaction was Approved, XML response was:</h3></p>\n";
               print '<pre>' . (htmlentities($data)) . '</pre>';
       */
       
    } elseif((string)$gwResponse->result == 2)  {
    	include_once 'lib/decline.php';
		die;
       /*
        print " <p><h3> Transaction was Declined.</h3>\n";
               print " Decline Description : " . (string)$gwResponse->{'result-text'} ." </p>";
               print " <p><h3>XML response was:</h3></p>\n";
               print '<pre>' . (htmlentities($data)) . '</pre>';*/
       
    } else {
    	include_once 'lib/fail.php';
		die;
      /*
        print " <p><h3> Transaction caused an Error.</h3>\n";
              print " Error Description: " . (string)$gwResponse->{'result-text'} ." </p>";
              print " <p><h3>XML response was:</h3></p>\n";
              print '<pre>' . (htmlentities($data)) . '</pre>';*/
      
    }
  


} else {
  print "ERROR IN SCRIPT<BR>";
}