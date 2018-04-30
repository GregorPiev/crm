<?php
/**
 * Leverate API
 *
 * @package        Leverate API
 * @author        Eyal Mahalal
 * @copyright    Copyright (c) 2016
 * @license
 * @since        Version 1.0
 */

/**
 * Leverate Class
 */

class Leverate
{

    private $config = [];

    /**
     * Leverate constructor.
     */
    public function __construct($key, $value)
    {
        $db = new SITEDBi();

        $sql = "SELECT `business_unit_id`, `owner_user_id` FROM `lavarate_customers` 
            WHERE `{$db->escape($key)}` = '{$db->escape($value)}' order by id desc limit 1";
        try {
            $result = $db->fetchAll($sql);
            if(sizeof($result) > 0) {
                $business_unit_id = $result['0']['business_unit_id'];
                $owner_user_id = $result['0']['owner_user_id'];
            } else {
                die('Cannot get correct leverate business unit');
            }
        } catch (Exception $e) {
            die( $e->getMessage() );
        }

        $sql = "SELECT `id`, `key`, `value` FROM `data_api_parameters` WHERE `brand_id` = 2 and `api_id` = 3";
        try {
            $result = $db->fetchAll($sql);
            $this->collectConfig($result, $business_unit_id, $owner_user_id);
        } catch (Exception $e) {
            die( $e->getMessage() );
        }
    }

    private function collectConfig($result, $business_unit_id, $owner_user_id)
    {
        $config_array = [];
        foreach ($result as $item) {
            if($item['key'] == 'business_unit_name') {
                if($business_unit_id == $item['id']) {
                    $config_array[$item['key']] = $item['value'];
                }
            } elseif($item['key'] == 'owner_user_id') {
                if($owner_user_id == $item['id']) {
                    $config_array[$item['key']] = $item['value'];
                }
            } else {
                $config_array[$item['key']] = $item['value'];
            }
        }

        $this->config = [
            'wsdl' => $config_array['wsdl'],
            'apiLocation' => $config_array['apiLocation'],
            'organization' => $config_array['organization_name'],
            'businessUnitName' => $config_array['business_unit_name'],
            'ownerUserId' => $config_array['owner_user_id'],
            'username' => $config_array['username'],
            'password' => $config_array['password'],
            'tradingPlatforms' => [
                'DEMO' => [
                    'name' => $config_array['DEMO_platform_name'],
                    'id' => $config_array['DEMO_platform_id']
                ],
                'REAL' => [
                    'name' => $config_array['REAL_platform_name'],
                    'id' => $config_array['REAL_platform_id']
                ],
            ],
            'wsdlCache' => WSDL_CACHE_MEMORY
        ];
    }

    private function _getCrm($config)
    {
        return new LeverateCrm($config['wsdl'], array(
            'login' => $config['username'],
            'password' => $config['password'],
            'location' => $config['apiLocation'],
            'encoding' => 'UTF-8',
            'cache_wsdl' => $config['wsdlCache'],
            'trace' => true
        ));
    }

    /**
     * Send the cURL request
     * @param $request
     * @param $function
     * @param string $url
     * @return mixed
     */
    private function sendRequest($request, $function, $url = "")
    {
        $request->TradingPlatformId = $this->real_platform_id;
        $request->organizationName = $this->organizationName;
        $request->ownerUserId = $this->ownerUserId;
        $request->businessUnitName = $this->businessUnitName;

        if ($url == "") {
            $url = $this->url;
        }

        $url = $url . $function;

        echo "url => " . $url . "\n";

        echo "request";
        echo "<pre>";
        var_dump($request);
        //die;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 5);
        curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($request));

        $result = curl_exec($ch);
        $info = curl_getinfo($ch);
        echo "info";
        echo "<pre>";
        var_dump($info);
        curl_close($ch);

        return $result;
    }

    public function GetBalanceLeverate($lavarateId)
    {
        $leverateCrm = $this->_getCrm($this->config);

        $request = new GetTradingPlatformAccountBalance();
        $request->ownerUserId = $this->config['ownerUserId'];
        $request->organizationName = $this->config['organization'];
        $request->businessUnitName = $this->config['businessUnitName'];
        $request->tradingPlatformAccountName = $lavarateId;

        $response = $leverateCrm->GetTradingPlatformAccountBalance($request)->GetTradingPlatformAccountBalanceResult;

        $resultInfo = $response->Result;
        $tpAccountBalance = $response->TradingPlatformAccountBalance;
        $tpAccountId = $response->TradingPlatformAccountId;

        $balance = $tpAccountBalance->Balance;
        $credit = $tpAccountBalance->Credit;
        $margin = $tpAccountBalance->Margin;
        $equity = $tpAccountBalance->Equity;

        $requestId = $resultInfo->RequestId;
        $success = $resultInfo->Code;
        $message = $resultInfo->Message;
        $result = $tpAccountBalance;

        return $tpAccountBalance;
    }

    public function UpdateAccountBalance($amount, $tradingPlatformAccountId, $depositId)
    {
        try {
            $leverateCrm = $this->_getCrm($this->config);

            $info = new MonetaryTransactionRequestInfo();
            $info->Amount = $amount;
            $info->AffiliateTransactionId = $depositId;
            $info->InternalComment = 'Deposit from CRM';
            $info->TradingPlatformAccountId = $tradingPlatformAccountId;
            $info->PaymentInfo = new CreditCardPaymentInfo();
            //$info->PaymentInfo = new CashPaymentInfo();
            $info->OriginalAmount = null;
            $info->OriginalCurrency = null;

            /*$dynamicAttributeInt = new DynamicAttributeInfo();
            $dynamicAttributeInt->Name = 'lv_withdrawalreason';
            $dynamicAttributeInt->DynamicAttributeType = 'Picklist';
            $dynamicAttributeInt->Value = new SoapVar(3, XSD_INT, "int", "http://www.w3.org/2001/XMLSchema");

            $dynamicAttributeString = new DynamicAttributeInfo();
            $dynamicAttributeString->Name = 'lv_internalcomment';
            $dynamicAttributeString->DynamicAttributeType = 'String';
            $dynamicAttributeString->Value = new SoapVar("some string", XSD_STRING, "string", "http://www.w3.org/2001/XMLSchema");

            $dynamicAttributeBit = new DynamicAttributeInfo();
            $dynamicAttributeBit->Name = 'lv_managementapproval';
            $dynamicAttributeBit->DynamicAttributeType = 'Bit';
            $dynamicAttributeBit->Value = new SoapVar(true, XSD_BOOLEAN, "boolean", "http://www.w3.org/2001/XMLSchema");*/

            $request = new DepositRequest();
            $request->IsCancellationTransaction = false;
            $request->ShouldAutoApprove = true;
            $request->UpdateTPOnApprove = true;
            $request->MonetaryTransactionRequestInfo = $info;
            //$request->AdditionalAttributes = array($dynamicAttributeInt, $dynamicAttributeString, $dynamicAttributeBit);

            $query = new CreateMonetaryTransaction();
            $query->ownerUserId = $this->config['ownerUserId'];
            $query->organizationName = $this->config['organization'];
            $query->businessUnitName = $this->config['businessUnitName'];
            $query->monetaryTransactionRequest = $request;

            $response = $leverateCrm->CreateMonetaryTransaction($query);

            $ResultInfo = new ResultInfo();
            $ResultInfo = $response->CreateMonetaryTransactionResult->Result;

            $result = $ResultInfo->RequestId;
            $success = $ResultInfo->Code;
            $message = $ResultInfo->Message;

            $returnArray = array();
            if ($success == 'Success') {
                $returnArray['success'] = true;
                $returnArray['message'] = $message;
                $returnArray['requestId'] = $result;
            } else {
                $returnArray['success'] = false;
                $returnArray['errorCode'] = $success;
                $returnArray['message'] = $message;
                $returnArray['requestId'] = $result;
            }

            return $returnArray;
        } catch (Exception $e) {
            echo "error";
            echo "<prE>";
            var_dump($e->getMessage());
        }
    }

    /**
     * @param array $details
     * $details Example:
     * [['type' => 'Email', 'value' => 'example@mail.com']]
     * type can be Email or AccountId
     * @return array
     */
    public function GetAccountDetails($details = [])
    {

        try {
            $ownerUserId = new guid();
            $ownerUserId = $this->config['ownerUserId'];

            $request = new AccountDetailsRequest();

            foreach ($details as $detail) {
                $request->FilterType = $detail['type'];
                $request->FilterValue = $detail['value'];
            }

            $getAccountDetails = new GetAccountDetails();
            $getAccountDetails->ownerUserId = $ownerUserId;
            $getAccountDetails->organizationName = $this->config['organization'];
            $getAccountDetails->businessUnitName = $this->config['businessUnitName'];
            $getAccountDetails->accountDetailsRequest = $request;

            $leverateCrm = $this->_getCrm($this->config);

            $response = new GetAccountDetailsResponse();
            $response = $leverateCrm->GetAccountDetails($getAccountDetails);

            $result = $response->GetAccountDetailsResult;

            $ResultInfo = new ResultInfo();
            $ResultInfo = $result->Result;

            $result = $result->AccountsInfo;
            $success = $ResultInfo->Code;
            $message = $ResultInfo->Message;

            return [
                'result' => $result,
                'success' => $success,
                'message' => $message
            ];

        } catch (Exception $e) {
            return [
                'result' => 'error',
                'success' => 'Fail',
                'message' => $e->getMessage()
            ];
        }
    }

    public function UpdateCustomerBalance()
    {

    }

    public function createCase($subject, $content, $accountLeverateId)
    {
        $leverateCrm = $this->_getCrm($this->config);

        $requestCase = new caseCreationRequest();
        $requestCase->AccountId = $accountLeverateId;
        $requestCase->Title = $subject;
        $requestCase->Description = $content;

        $request = new CreateCase();
        $request->ownerUserId = $this->config['ownerUserId'];
        $request->organizationName = $this->config['organization'];
        $request->businessUnitName = $this->config['businessUnitName'];
        $request->caseCreationRequest = $requestCase;

        $caseResult = $leverateCrm->CreateCase($request)->CreateCaseResult;

        if ($caseResult->Code == 'Success') {
            return true;
        } else {
            return false;
        }
    }
}
