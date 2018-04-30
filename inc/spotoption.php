<?php
/**
 * SpotOption API
 *
 * @package		SpotOption API
 * @author		Iliya Reyzos
 * @copyright	Copyright (c) 2014
 * @license		
 * @since		Version 1.0
 */

// ------------------------------------------------------------------------

/**
 * SpotOption Class
 */
class SpotOption {

	private $url;
	private $auth;
	private $assets;


	public function __construct()
	{

		$this->url = "http://api-spotplatform.hedgestonegroup.com/api";
	 	$this->auth = array(
            "api_username" => "hsg_website_rnd",
            "api_password" => "0K4stcFuK6"
        );

	}


    /**
     * Get open position
     *
     * @param int $id - customer's spotoption id
     *
     * @return array
     */

    public function getPositions() {
    	$fields = array(
            "MODULE" => "AssetsHistory",
            "COMMAND" => "view",
            "FILTER[assetId]" => "2",
           
        );
        return $this->proccessRequest($fields);
        // if($this->proccessRequest($fields)['success']) {
        // 	return (array)$this->proccessRequest($fields);
        // }
        // else {
        // 	return false;
        // }
    }


    /**
     * Proccess data before cURL
     */

    private function proccessRequest($fields) {
    	$result = $this->sendRequest($fields);
        $xml = $this->loadXml($result);
        // var_dump($xml); die;

        $connectionSuccess = $this->checkStatus($xml);

        if($connectionSuccess){
            $arrErrors = $this->hasErrors($xml);
            
            if(empty($arrErrors)){
                return array("success" => true, "data" => (array)$xml);
            }
            else{
                return $this->fail($arrErrors);
            }
        }
        else{
            return $this->connectionError();
        }
    }



    /**
      * Send the cURL request
      *
      * @param array $fields
      * @param string $url
      */ 

    private function sendRequest($fields, $url=""){
        if($url == ""){
            $url = $this->url;
        }

        $fields_strings = $this->urlify($fields);
        $fields_strings = $this->authenticate($fields_strings);

        //$put_file = file_put_contents(BASEPATH."cache/_debug_spotoption_query.json", json_encode($fields_strings));
        //$logname = BASEPATH.'cache/logs/spot_'.date('m-d-Y_hia');
        
        // if ($this->savelogs)
        //   $put_file = file_put_contents($logname.'.txt', $fields_strings);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields_strings);

        $result = curl_exec($ch);
        curl_close($ch);
        
        //$savelogs
        // if ($this->savelogs)
        //   file_put_contents($logname.'.xml', $result);

        return $result;
    }



    /**
      * Turn aray to valid CRUD request
      */ 

    private function urlify($array){
        $urlified = "";
        foreach($array as $key=>$value) { $urlified .= urlencode($key).'='.urlencode($value).'&'; }
        rtrim($urlified, '&');
        return $urlified;
    }



    /**
     * Will add authentication to the request
     */

    private function authenticate($urlified){
        return $urlified.$this->urlify($this->auth);
    }

    private function loadXml($data){
        ob_start();
        $parsed = simplexml_load_string($data);
        $errors = ob_get_clean();
        if($errors){
            return '';
        }
        return $parsed;
    }



    /**
     * Checks the connection status
     */

    private function checkStatus($xml){
    
        if(!$xml) return false;
        
        if($xml && $xml->connection_status == "successful"){
            return true;
        }
        return false;
    }



    /**
     * Check if theres errors
     */

    private function hasErrors($xml){

        if($xml->operation_status == "failed"){
            $arrErrors = array();

            if(isset($xml->errors->error)) {
	            foreach($xml->errors->error as $key=>$val){
	                $arrErrors[] = (string)$val;
	            }
	            return $arrErrors;
            }
            return true;
        }
        else{
            return false;
        }
    }



    /**
     * return fail response
     */

    private function fail($errors){
        return array("success" => false, "error" => $errors);
    }

    public function removeCreditcardFromUser($userId, $creditcardId){
        $fields = array(
            "MODULE" => "CreditCardUser",
            "COMMAND" => "edit",
            "customerId" => $userId,
            "creditCardId" => $creditcardId,
            "status" => "canceled"
        );

        $result = $this->sendRequest($fields);
        $xml = $this->loadXml($result);
        $connectionSuccess = $this->checkStatus($xml);

        if($connectionSuccess){
            $arrErrors = $this->hasErrors($xml);
            if(empty($arrErrors)){
                return array("success" => true);
            }
            else{
                return $this->fail($arrErrors);
            }
        }
        else{
            return $this->connectionError();
        }

    }
    public function addDepositWithNewCreditcard($data, $userId){
       // $user = $this->platformCustomersDAO->getUserById($userId);
        $cardType = $data["cardtype"];
        if($data["expirationdate"] < 10) $data["expirationdate"] = "0".$data["expirationdate"];
        $fields = array(
            "MODULE" => "CustomerDeposits",
            "COMMAND" => "add",
            "customerId" => $userId,
            "amount" => $data["deposit-amount"],
            "method" => "creditCard",
            "FirstName" => $data["firstname"],
            "LastName" => $data["lastname"],
            "cardNum" => $data["creditcard"],
            "cardType" => $cardType,
            "ExpMonth" => $data["expirationdate"],
            "ExpYear" => $data["year"],
            "fundId" => "-1",
            "Address" => $data["your-address"],
            "City" => $data["your-city"],
            "Country" => $data["country"],
            "postCode" => "12345",
            //"Phone" => $user["Phone"],
            "Phone" => $data["Phone"],
            "CVV2/PIN" => $data["securitycode"],
            "IPAddress" => $data["IPAddress"]
        );

      //  if(!$this->isValidDepositAmount($userId, $data["deposit-amount"])) return false;

        $result = $this->sendRequest($fields);
        $xml = $this->loadXml($result);
        $connectionSuccess = $this->checkStatus($xml);

        if($connectionSuccess){
            $arrErrors = $this->hasErrors($xml);
            if(empty($arrErrors)){
                return array("success" => true);
            }
            else{
                return $this->fail($arrErrors);
            }
        }
        else{
            return $this->connectionError();
        }

    }
    private function connectionError(){
        // Let's not echo this out, makes the ajax response go wild
        // echo "<div id='connection_status' style='display: none;'>connection error</div>";
        return array("error" => "We are sorry - we are experiencing communication difficulties. Please try again later.","success" => false);
    }
    public function depositTerminal($userId, $data, $description = false){

        $processor = (isset($_SESSION['defrayment']) && $_SESSION['defrayment']) ? $_SESSION['defrayment'] : "unknown";

        if($description) {
            $processor = $description;
        }


        $fields = array(
            "MODULE" => "CustomerDeposits",
            "COMMAND" => "add",
            "method" => "depositTerminal",
            "paymentMethod" => "Credit Card",
            "customerId" => $userId,
            "amount" => $data['amount'],
            "transactionID" => $data['transactionId'],
            "IPAddress" => getUserIpAddr(),
            "description" => $processor
        );

        //if(!$this->isValidDepositAmount($userId, $amount)) return false;

        $result = $this->sendRequest($fields);
        $xml = $this->loadXml($result);
        $connectionSuccess = $this->checkStatus($xml);

        if($connectionSuccess){
            $arrErrors = $this->hasErrors($xml);
            if(empty($arrErrors)){
                return array("success" => true);
            }
            else{
                return $this->fail($arrErrors);
            }
        }
        else{
            return $this->connectionError();
        }

    }

	public function editUserById($id, $fields){
	    // print_r($fields); die;
	
	    $moduleCommand = array(
	        "MODULE" => "Customer",
	        "COMMAND" => "edit",
	        "customerId" => $id
	    );
	    $fields = array_merge($fields, $moduleCommand);
	
	    $result = $this->sendRequest($fields);
	
	    $xml = $this->loadXml($result);
	
	    $connected = $this->checkStatus($xml);
	    if($connected){
	        $arrErrors = $this->hasErrors($xml);
	        if(empty($arrErrors)){
	            return array("success" => true);
	        }
	        else{
	            return $this->fail($arrErrors);
	        }
	    }
	    else{
	        return $this->connectionError();
	    }
	}
	
	public function addCallById($id, $fields){
	
	    $moduleCommand = array(
	        "MODULE" => "Call",
	        "COMMAND" => "add",
	        "clientId" => $id
	    );
	    $fields = array_merge($fields, $moduleCommand);
		
	    $result = $this->sendRequest($fields);
	    $xml = $this->loadXml($result);
	
	    $connected = $this->checkStatus($xml);
	    if($connected){
	        $arrErrors = $this->hasErrors($xml);
	        if(empty($arrErrors)){
	            return array("success" => true);
	        }
	        else{
	            return $this->fail($arrErrors);
	        }
	    }
	    else{
	        return $this->connectionError();
	    }
	}
}
/* End of file spotoption.php */
/* Location: ./application/libraries/spotoption.php */
