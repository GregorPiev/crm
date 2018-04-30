<?php
/** Author: Eli Hallufgil
*  Date: 2017-01-23
*/
/*error_reporting(E_ALL);
ini_set('display_errors', 1);*/

require_once dirname(__DIR__).'/db.php';
require_once 'SoapProxy.php';
require_once 'UpdatedLeverateCrm.php';

class leverateApi {
	
	private $config;
	private $leverateCRM;
	
	public function __construct($brand){
	    $this->config = $this->getApiConfig($brand);	
	    try
	    {	
	      $this->leverateCRM = $this->getCrm();
		}catch (Exception $e){
		  die(json_encode(array('leverateApiError' => $e->getMessage()))); 	
		}   	
	}
	
	public function getCrm(){
		$apiConfig = $this->config;										
		return new LeverateCrm($apiConfig['wsdl'], 
		                       array('login' => $apiConfig['username'],
                                     'password' => $apiConfig['password'],
                                     'location' => $apiConfig['apiLocation'],
                                     'encoding'=>'UTF-8',
                                     'cache_wsdl' => WSDL_CACHE_MEMORY,
                                     'trace' => true 
                                ));
	}
	
	public function getApiConfig($brand){
	    $dbConnection = new MySqlDriver();
		$apiKeys = array('wsdl','username','password','apiLocation','organization','ownerUserId','businessUnitName');
		$sql = "SELECT brand_api_config.configKey,
		               brand_api_config.configValue
		        FROM brand_api_config 
		        LEFT JOIN brands ON brands.id=brand_api_config.brandId
		        WHERE brands.name = '$brand'";
		$result = $dbConnection->fetchAll($sql);
		
		if(empty($result)){
			die(json_encode(array('leverateApiError' => 'Configuration Error')));
		}
		
		$config = array();
		$configFlag = 0;
		foreach($apiKeys as $key => $apiKey){
			foreach($result as $resultKey=>$resultValue){
				if($apiKey == $resultValue['configKey']){
					$config[$resultValue['configKey']]=$resultValue['configValue'];
					$configFlag = 1;
					break;
				}
			}
            if($configFlag == 0){
            	die(json_encode(array('leverateApiError' => 'Configuration Error')));
            }
			$configFlag = 0; 
		}
		return $config;		
	}

    public function AssignAccountOwner($accountId,$userId,$leadStatus,$ownerUserId = false,$businessUnitName = false){
    	try{
    				
    	  $params = new AssignAccountOwner();
          $params->ownerUserId = $ownerUserId ? $ownerUserId : $this->config['ownerUserId'];
          $params->organizationName = $this->config['organization'];
          $params->businessUnitName = $businessUnitName ? $businessUnitName : $this->config['businessUnitName'];
          $params->accountId = $accountId;
          $params->userId = $userId;
		  $params->leadStatus = $leadStatus;
		  
		  $response = $this->leverateCRM->AssignAccountOwner($params);
		  
          $ResultInfo = new ResultInfo();
          $ResultInfo = $response->AssignAccountOwnerResult;
		  return $ResultInfo;
		    
		}catch (Exception $e) {
		   	return array('leverateApiError' => $e->getMessage());
		}
		
    }
	
	public function CreateNote($accountId,$ownerId,$title,$description,$businessUnitName){
		try{	
		  $request = new NoteCreationRequest();
          $request->AccountId = $accountId;
          $request->Title = $title;
          $request->Description = $description;
          $request->OwnerId = $ownerId;
		
		  $params = new CreateNote();
          $params->ownerUserId = $ownerId;
          $params->organizationName = $this->config['organization'];
          $params->businessUnitName = $businessUnitName;
          $params->request = $request;
		  $response = $this->leverateCRM->CreateNote($params);
		  
          $ResultInfo = new ResultInfo();
          $ResultInfo = $response->CreateNoteResult;
		  return $ResultInfo;
		  
		}catch (Exception $e) {
		  die(json_encode(array('leverateApiError' => $e->getMessage())));
		}
		
	}
	
	public function UpdateAccountDetails($accountId,$update){
		try{
		  $request = new UpdateAccountDetailsRequest();
		  $request->AccountId = $accountId;
		  foreach($update as $key=>$value){
		  	if(!isset($value['additionalAttributeType']))
			   $request->{$value['name']} = $value['value'];
			else {
			   $type = $value['additionalAttributeType'];	 
			   $additionalAttribute = new DynamicAttributeInfo();
			   $additionalAttribute->Name = $value['fieldName'];
			   $additionalAttribute->DynamicAttributeType = $type;
               switch($type){
			   	case 'String':
					$encoding = XSD_STRING;
					$type_name = 'string';
					break;
				case 'Bit':
					$encoding = XSD_BOOLEAN;
					$type_name = 'boolean';
					break;
				case 'Picklist':
					$encoding = XSD_INT;
					$type_name = 'int';		  
               }
               $additionalAttribute->Value = new SoapVar($value['value'], $encoding, $type_name, "http://www.w3.org/2001/XMLSchema");
			   $request->AdditionalAttributes[] = $additionalAttribute; 	   	
			}
		  }
		  $params = new UpdateAccountDetails();
          $params->ownerUserId = $this->config['ownerUserId'];
		  $params->organizationName = $this->config['organization'];
		  $params->businessUnitName = $this->config['businessUnitName'];
		  $params->updateAccountDetailsRequest = $request;		
		
		  $response = $this->leverateCRM->UpdateAccountDetails($params);
		  
		  $ResultInfo = new ResultInfo();
          $ResultInfo = $response->UpdateAccountDetailsResult->Result;
		  return $ResultInfo; 
		}catch(Exception $e){
		  return array('leverateApiError' => $e->getMessage()); 	
		}	
	}

    public function InactivityFee($tpAccountGUID, $amount, $dynamicAttributes){
    	$info = new MonetaryTransactionRequestInfo();
		$info->TradingPlatformAccountId = $tpAccountGUID;
		$info->Amount = $amount; 
		$info->PaymentInfo = new CashPaymentInfo();
		  
		$request = new WithdrawalMonetaryTransactionRequest();
        $request->ShouldAutoApprove = true;
        $request->UpdateTPOnApprove = true;
        $request->MonetaryTransactionRequestInfo = $info;
        $request->WithdrawalCompleteTradingRequest = true;
        $request->WithdrawalHasDocuments = true;
        $request->WithdrawalHasEnoughFundsInTradingPlatform = true;
        $request->WithdrawalIsMethodOfPaymentSuitable = true;
        $request->WithdrawalManagementApproval = true;
        $request->WithdrawalPaid = true;
        $request->WithdrawalRetentionOwnerApproval = true;
        $request->WithdrawalRequestDate = date("Y-m-d");
        $request->WithdrawalPaymentDetails = "";
        $request->WithdrawalReason = "";
        $request->WithdrawalStatus = "";
		  
		foreach($dynamicAttributes as $key=>$value){
		  	
		  $type = $value['dynamicAttributeType'];	 
		  $dynamicAttribute = new DynamicAttributeInfo();
		  $dynamicAttribute->Name = $value['fieldName'];
		  $dynamicAttribute->DynamicAttributeType = $type;
		  $dynamicAttribute->ShouldOverride = $value['override'];
          switch($type){
			case 'String':
			   $encoding = XSD_STRING;
			   $type_name = 'string';
			   break;
			case 'Bit':
			   $encoding = XSD_BOOLEAN;
			   $type_name = 'boolean';
			   break;
			case 'Picklist':
			   $encoding = XSD_INT;
			   $type_name = 'int';		  
           }
           $dynamicAttribute->Value = new SoapVar($value['value'], $encoding, $type_name, "http://www.w3.org/2001/XMLSchema");
		   $request->AdditionalAttributes[] = $dynamicAttribute; 	   	
		}
		  	
    
		$query = new CreateMonetaryTransaction();
		$query->ownerUserId = $this->config['ownerUserId'];
		$query->organizationName = $this->config['organization'];
		$query->businessUnitName = $this->config['businessUnitName'];
		$query->monetaryTransactionRequest = $request;	
    	
    	try{
    	  
		  $response = $this->leverateCRM->CreateMonetaryTransaction($query);
		
          $ResultInfo = new ResultInfo();
          $ResultInfo = $response->CreateMonetaryTransactionResult;
		  return array('request'=>$query,'response'=>$ResultInfo);	
    	}catch (Exception $e) {
    	  return array('request'=>$query,'leverateApiError' => $e->getMessage());	
    	}
    }

    public function tpAccountDetails($tpAccountGUID){
    	try{
    	  
		  $query = new GetTradingPlatformAccountBalance();
		  $query->ownerUserId = $this->config['ownerUserId'];
		  $query->organizationName = $this->config['organization'];
		  $query->businessUnitName = $this->config['businessUnitName'];
		  $query->tradingPlatformAccountName = $tpAccountGUID;
		  
		  $response = $this->leverateCRM->GetTradingPlatformAccountBalance($query);
		  
		  $ResultInfo = new ResultInfo();
          $ResultInfo = $response->GetTradingPlatformAccountBalanceResult;
		  return $ResultInfo;
		   	
    	}catch (Exception $e) {
		   	return array('leverateApiError' => $e->getMessage());
		}
    }
	
	public function internalTransaction($tpAccountGUID, $amount, $type){
		if(!in_array($type, array('Deposit','Withdrawal','Credit','Debit')))
		   	return false;
			
		$info = new MonetaryTransactionRequestInfo();
		$info->TradingPlatformAccountId = $tpAccountGUID;
		$info->Amount = $amount; 
		$info->PaymentInfo = new InternalPaymentInfo();
		
		if($type == 'Withdrawal'){
			$request = new WithdrawalMonetaryTransactionRequest();
            $request->ShouldAutoApprove = true;
            $request->UpdateTPOnApprove = true;
            $request->MonetaryTransactionRequestInfo = $info;
            $request->WithdrawalCompleteTradingRequest = true;
            $request->WithdrawalHasDocuments = true;
            $request->WithdrawalHasEnoughFundsInTradingPlatform = true;
            $request->WithdrawalIsMethodOfPaymentSuitable = true;
            $request->WithdrawalManagementApproval = true;
            $request->WithdrawalPaid = true;
            $request->WithdrawalRetentionOwnerApproval = true;
            $request->WithdrawalRequestDate = date("Y-m-d");
            $request->WithdrawalPaymentDetails = "";
            $request->WithdrawalReason = "";
            $request->WithdrawalStatus = "";
		}else{
		    $request = new DepositRequest();
		    $request->IsCancellationTransaction = false;
		    $request->ShouldAutoApprove = true;
		    $request->UpdateTPOnApprove = true;
		    $request->MonetaryTransactionRequestInfo = $info;
			
			if($type !='Deposit'){
				$dynamicAttribute = new DynamicAttributeInfo();
		        $dynamicAttribute->Name = 'lv_type';
		        $dynamicAttribute->DynamicAttributeType = 'Picklist';
		        $dynamicAttribute->ShouldOverride = true; 
				$dynamicAttribute->Value = new SoapVar(($type == 'Credit' ? 15 : 17), XSD_INT, 'int', "http://www.w3.org/2001/XMLSchema");
				$request->AdditionalAttributes = array($dynamicAttribute);
			}
		}
		  
		$query = new CreateMonetaryTransaction();
		$query->ownerUserId = $this->config['ownerUserId'];
		$query->organizationName = $this->config['organization'];
		$query->businessUnitName = $this->config['businessUnitName'];
		$query->monetaryTransactionRequest = $request;
		
		try{
    	  
		  $response = $this->leverateCRM->CreateMonetaryTransaction($query);
		
          $ResultInfo = new ResultInfo();
          $ResultInfo = $response->CreateMonetaryTransactionResult;
		  return array('request'=>$query,'response'=>$ResultInfo);	
    	}catch (Exception $e) {
    	  return array('request'=>$query,'leverateApiError' => $e->getMessage());	
    	}
		
	}
	
	public function getConfig(){
		return $this->config;
	}
}
						
?>