<?php
/**
 * Created by PhpStorm.
 * User: veronica
 * Date: 9/27/16
 * Time: 4:42 PM
 */

use Omnipay\Omnipay;
class SafeCharge{
    const  MERCHANT_ID = 'merchant_id';
    const  MERCHANT_SITE_ID = 'merchant_site_id';
    const TIME_STAMP = 'time_stamp';
    const TOTAL_AMOUNT = 'total_amount';
    const CURRENCY = 'currency';
    const USER_TOKEN_ID = 'user_token_id';
    const SECRET_ID = 'secret_id';

    const SUCCESS_URL = 'success_url';
    const ERROR_URL = 'error_url';
    const BACK_URL = 'back_url';
    const PENDING_URL = 'pending_url';
    const NOTIFY_URL = 'notify_url';

    const CHECKSUM = 'checksum';
    const VERSION = 'version';
    const ITEM_NAME_1 = 'item_name_1';
    const ITEM_NUMBER_1 = 'item_number_1';
    const ITEM_AMOUNT_1 = 'item_amount_1';
    const ITEM_QUANTITY_1 = 'item_quantity_1';
    const USER_TOKEN = 'user_token';
    const ITEM_OPEN_AMOUNT_1 = 'item_open_amount_1';
    const ITEM_MIN_AMOUNT_1 = 'item_min_amount_1';
    const ITEM_MAX_AMOUNT_1 = 'item_max_amount_1';

    const FIRST_NAME = 'first_name';
    const LAST_NAME = 'last_name';
    const EMAIL = 'email';
    const ADDRESS1 = 'address1';
    const CITY = 'city';
    const COUNTRY = 'country';
    const ZIP = 'zip';
    const PHONE1 = 'phone1';
    const PAYMENT_METHOD = 'payment_method';
    const USERID = 'userid';

    private $_merchant_id = '6645286868887126031';
    private $_merchant_site_id = '149748';
    private $_secret_id = 'R3ylVisAlS5GnjyolVUW58BHearP6P71XunJlm0L9dmXW4pscAh9tB6ye29kJHpw';
    private $_payment_method ='cc_card';
                           //R3ylVisAlS5GnjyolVUW58BHearP6P71XunJlm0L9dmXW4pscAh9tB6ye29kJHpw
//6645286868887126031
//USD
//1.23
//Cashier Test product1
    private $_time_stamp = '';
    private $_currency;
    private $_totalamount;
    private $_first_name;
    private $_last_name;
    private $_email;
    private $_address1;
    private $city;
    private $_country;
    private $_zip;
    private $_phone1;

    private $_userid;
    private $_depositId;
    private $_lavarateId;

    protected $liveEndpoint = 'https://secure.safecharge.com/ppp/purchase.do?';

    protected $testEndpoint = 'https://ppp-test.safecharge.com/ppp/purchase.do?';

    //protected $_back_point_Url = 'http://dev-veronica-mc.hedgestonegroup.com/api.php?cmd=SafeChargeback&';
    protected $_back_point_Url = 'http://mc.hedgestonegroup.com/api.php?cmd=SafeChargeback&';
    protected $_item_name_1 = 'Binary data Test One2Trade';
    protected $transaction_id = '';
    protected $default_data_arr = array();

    public function __construct($post = array()){
        if(!empty($post)){
        $this->setTimeStamp();
        $this->setDefaultDataArr(array( self::TIME_STAMP            => $this->getTimeStamp(),
                                        self::MERCHANT_SITE_ID      => $this->getMerchantSiteId(),
                                        self::MERCHANT_ID           => $this->getMerchantId(),
                                        self::USER_TOKEN            =>'auto',
                                        self::ITEM_OPEN_AMOUNT_1    => 'false',
                                        self::VERSION               => '3.0.0',
                                        //self::VERSION               => '4.0.0',
                                        self::PAYMENT_METHOD        => 'cc_card',
                                        self::ITEM_NAME_1           =>  $this->getItemName1(),
                                       // self::ITEM_MIN_AMOUNT_1     =>'1',
                                       // self::ITEM_MAX_AMOUNT_1     =>'100',
                                        self::ITEM_NUMBER_1         => '1',
                                        self::ITEM_QUANTITY_1       => '1',
                                        self::BACK_URL              => $this->getBackPointUrl().'callbackSCh=back',
                                        self::PENDING_URL           => $this->getBackPointUrl().'callbackSCh=pending',
                                        self::SUCCESS_URL           => $this->getBackPointUrl().'callbackSCh=success',
                                        self::ERROR_URL             => $this->getBackPointUrl().'callbackSCh=error',
                                       // self::NOTIFY_URL            => $this->getBackPointUrl().'callbackSCh=notify',
        ));

        $this->setPostArray($post);
        }
        
 }

    /**
     * @return array
     */
    public function getDefaultDataArr()
    {
        return $this->default_data_arr;
    }

    /**
     * @param array $default_data_arr
     */
    public function setDefaultDataArr($default_data_arr)
    {
        $this->default_data_arr = $default_data_arr;
    }
    
    public function openSafeCharge($data){
        $arr_def = $this->getDefaultDataArr();

        $data_arr = array(

            self::TOTAL_AMOUNT          => $this->getTotalamount(),
            self::CURRENCY              => $this->getCurrency(),

            self::ITEM_AMOUNT_1         => $this->getTotalamount(),
            self::USER_TOKEN_ID         => $this->getDepositId(),
            self::FIRST_NAME            => $this->getFirstName(),
            self::LAST_NAME             => $this->getLastName(),
            self::EMAIL                 => $this->getEmail(),
            self::ADDRESS1              => $this->getAddress1(),
            self::CITY                  => $this->getCity(),
            self::COUNTRY               => $this->getCountry(),
            self::ZIP                   => $this->getZip(),
            self::PHONE1                => $this->getPhone1(),
            self::USERID                => $this->getLavarateId(),

           /* self::FIRST_NAME            => 'test',
            self::LAST_NAME             => 'test',
            self::EMAIL                 => 'test@test.com',
            self::ADDRESS1              => 'test',
            self::CITY                  => 'test',
            self::COUNTRY               => 'GB',
            self::ZIP                   => '123456',
            self::PHONE1                => '123456',
            self::PAYMENT_METHOD        => 'cc_card',
            self::USERID                => 'test1234',*/

        );

        $data_arr = array_merge($arr_def,$data_arr);
        $data_arr[self::CHECKSUM] = $this->createAdvanceResponseChecksum();
       // $data_arr[self::CHECKSUM] = $this->createAdvanceResponseChecksum4($data_arr);
        $res['url'] = $this->_sendCurlRequest($data_arr, $this->getLiveEndpoint());
       // $res['url'] =  $this->getBackPointUrl().'ppp_status=OK&cardCompany=Visa&nameOnCard=Solomon+Krok&first_name=eyal&last_name=test&address1=beverli+hills&city=aa12&country=DE&email=eyal.m1%40gmail.com&zip=90210&phone1=054479300559&currency=GBP&merchant_site_id=149748&merchant_id=6645286868887126031&merchantLocale=de_DE&requestVersion=3.0.0&PPP_TransactionID=1889447238&productId=Binary+data+Test+One2Trade&userid=112&customData=Leverate+Multi&unknownParameters=callbackSCh%3Dback&payment_method=cc_card&responseTimeStamp=2016-10-09.14%3A17%3A57&message=Success&Error=Success&userPaymentOptionId=61272428&Status=APPROVED&ExErrCode=0&ErrCode=-1&AuthCode=651879&ReasonCode=0&Token=ZQBvADUAaABQAEoAdQBWAE0AcAAnAEwAPgAuADYAcgAmAGcAdABZAFkAYAAkAEYAQQAnADUAawBrAGQAZwBjAHEAcwBxAEkATQA5ACYAYgB2ADMA&tokenId=1533848037&responsechecksum=e0e5cc6e859630f4188b66899c566b9f&advanceResponseChecksum=367dd04d3eb1b92dabd892241f9021d4&totalAmount=100.00&TransactionID=384507113&dynamicDescriptor=Leverate442037347241&uniqueCC=CgiQARqI4KIArLF4vmFWp7hBpdk%3D&orderTransactionId=508976098&item_number_1=1&item_amount_1=100.00&item_quantity_1=1&';
      
        /**
         * GET /api.php?cmd=SafeChargeback&ppp_status=OK&cardCompany=Visa&nameOnCard=C+B+Segal&first_name=eyal&last_name=test&address1=beverli+hillsss&city=aa12&country=DE&email=eyal.m1%40gmail.com&zip=90210&phone1=054479300559&currency=GBP&merchant_site_id=149748&merchant_id=6645286868887126031&merchantLocale=de_DE&requestVersion=3.0.0&PPP_TransactionID=1899411578&productId=Binary+data+Test+One2Trade&userid=112&customData=Leverate+Multi&unknownParameters=callbackSCh%3Dback&payment_method=cc_card&responseTimeStamp=2016-10-13.12%3A29%3A01&message=Success&Error=Success&userPaymentOptionId=61676298&Status=APPROVED&ExErrCode=0&ErrCode=0&AuthCode=205391&ReasonCode=0&Token=RwBvADYAbgBxAEwAZQBIAFYAaABAAGIAPQBeADcAKwBxADcAJQBxAF4APgBHAD0AdgBEACoARABnAGoANQAsAGQARABGAGMAYwA7AE0AawBrADMA&tokenId=477783348&responsechecksum=470966a68b4232884846de43947cd189&advanceResponseChecksum=7146bb21af708909a322c1dfc22bc8e4&totalAmount=100.00&TransactionID=386805924&dynamicDescriptor=Leverate442037347241&uniqueCC=MfCi4t6t4Lc4fxvqTozjJ28mPUk%3D&orderTransactionId=515009738&item_number_1=1&item_amount_1=100.00&item_quantity_1=1&
         */
/*
 *
https://secure.safecharge.com/ppp/purchase.do?
time_stamp=2016-10-13%2011%3A35%3A21
&merchant_site_id=149748
&merchant_id=6645286868887126031
&user_token=auto&
item_open_amount_1=false
&version=3.0.0&
payment_method=cc_card
&item_name_1=Binary%20data%20Test%20One2Trade
&item_number_1=1
&item_quantity_1=1
&back_url=https%3A%2F%2Fdev-veronica-mc.hedgestonegroup.com%2Fapi.php%3Fcmd
&callbackSCh=notify
&pending_url=https%3A%2F%2Fdev-veronica-mc.hedgestonegroup.com%2Fapi.php%3Fcmd
&success_url=https%3A%2F%2Fdev-veronica-mc.hedgestonegroup.com%2Fapi.php%3Fcmd
&error_url=https%3A%2F%2Fdev-veronica-mc.hedgestonegroup.com%2Fapi.php%3Fcmd
&notify_url=https%3A%2F%2Fdev-veronica-mc.hedgestonegroup.com%2Fapi.php%3Fcmd
&total_amount=250
&currency=GBP
&item_amount_1=250
&user_token_id=1125269341476358521
&first_name=eyal
&last_name=test
&email=eyal.m1%40gmail.com
&address1=beverli%20hillsss
&city=aa12&country=
&zip=90210
&phone1=054479300559
&userid=112
&checksum=dbf1a97818f3888e3cdacd29d2185552
 */
        $res['spot_id'] = $this->getUserid();
        $res['lavarateId'] = $this->getLavarateId();
        $res['depositId'] = $this->getDepositId();
         return $res;
    }
    /**
     * @return string
     */
    public function getMerchantId()
    {
        return $this->_merchant_id;
    }

    /**
     * @return string
     */
    public function getMerchantSiteId()
    {
        return $this->_merchant_site_id;
    }

    /**
     * @return string
     */
    public function getSecretId()
    {
        return $this->_secret_id;
    }



    /**
     * @return string
     */
    public function getTimeStamp()
    {
        return $this->_time_stamp;
    }

    /**
     * @param string $time_stamp
     */
    public function setTimeStamp()
    {
        $this->_time_stamp = date('Y-m-d h:i:s');
    }

    private function setTransactionId($userId = null){

        $this->transaction_id = (!empty($userId)) ? $userId.$this->getTimeStamp() : $this->getTimeStamp();

    }

    /**
     * @return mixed
     */
    public function getCurrency()
    {
        return $this->_currency;
    }

    /**
     * @return mixed
     */
    public function getTotalamount()
    {
        return $this->_totalamount;
    }

    /**
     * @param mixed $currency
     */
    public function setCurrency($currency)
    {
        $this->_currency = $currency;
    }

    /**
     * @param mixed $totalamaunt
     */
    public function setTotalamount($totalamount)
    {
        $this->_totalamount = $totalamount;
    }

    /**
     * @return string
     */
    public function getBackPointUrl()
    {
        return $this->_back_point_Url;
    }

    public function createAdvanceResponseChecksum()
    {
        $checksum = '';

        $checksum .= trim($this->getSecretId());//Secretkey
        $checksum .= trim($this->getMerchantId());//Merchantid
        $checksum .= trim($this->getCurrency());//Currency
        $checksum .= trim($this->getTotalamount());//Total amount
        $checksum .= trim($this->getItemName1());//Item name 1
        $checksum .= trim($this->getTotalamount());//Item amount 1
        $checksum .= '1';//Item quantity 1 – 1
       // $checksum .= 'false';//Open amount – true
       // $checksum .= '1';//Min amount – 1
       // $checksum .= '100';//Max amount - 100
        //$checksum .= trim($this->getTransactionId());
        $checksum .= trim($this->getDepositId());
        $checksum .= trim($this->getTimeStamp());

        return md5($checksum);
    }

    public function createAdvanceResponseChecksum4($arr_data)
    {
        $checksum = '';
        foreach ($arr_data as $key=>$value){
            $checksum .= trim($value);
        }

        return md5($checksum);
    }

    /**
     * @return string
     */
    public function getLiveEndpoint()
    {
        return $this->liveEndpoint;
    }

    /**
     * @return string
     */
    public function getTestEndpoint()
    {
        return $this->testEndpoint;
    }

    private function _sendCurlRequest($data=array(),$url){

      //  $ch = curl_init();
        $request_str = '';
        $request_url =  $url;
        if(!empty($data)){
            foreach ($data as $key => $value){
                $request_str .=$key.'='.$value.'&';
            }
            $request_url .= substr($request_str, 0, -1);
        }


        //var_dump( urldecode($url.http_build_query($data)));

       // var_dump( $url.http_build_query($data));

        return $request_url;
    }

    /**
     * @return string
     */
    public function getTransactionId()
    {
        return $this->transaction_id;
    }


    private function setPostArray($post_arr = array()){
        if(!empty($post_arr)){
            foreach ($post_arr as $key => $value){
                switch ($key){
                    case 'firstName': $this->setFirstName($value);
                        break;
                    case 'lastName': $this->setLastName($value);
                        break;
                    case 'country': $this->setCountry($value);
                        break;
                    case 'depositEmail': $this->setEmail($value);
                        break;
                    case 'postalCode': $this->setZip($value);
                        break;
                    case 'address': $this->setAddress1($value);
                        break;
                    case 'city': $this->setCity($value);
                        break;
                    case 'phone': $this->setPhone1($value);
                        break;
                    case 'amount': $this->setTotalamount($value);
                        break;
                    case 'currency': $this->setCurrency($value);
                        break;
                    case 'spotId': $this->setUserid($value);
                        break;
                    case 'lavarateId': $this->setLavarateId($value);
                        break;
                    case 'depositId': $this->setDepositId($value);
                        break;
                    default :

                }
            }
        }

    }

    /**
     * @return mixed
     */
    public function getAddress1()
    {
        return $this->_address1;
    }

    /**
     * @return mixed
     */
    public function getCountry()
    {
        return $this->_country;
    }

    /**
     * @return mixed
     */
    public function getEmail()
    {
        return $this->_email;
    }

    /**
     * @return mixed
     */
    public function getFirstName()
    {
        return $this->_first_name;
    }

    /**
     * @return mixed
     */
    public function getLastName()
    {
        return $this->_last_name;
    }

    /**
     * @return string
     */
    public function getPaymentMethod()
    {
        return $this->_payment_method;
    }

    /**
     * @return mixed
     */
    public function getZip()
    {
        return $this->_zip;
    }

    /**
     * @return mixed
     */
    public function getPhone1()
    {
        return $this->_phone1;
    }

    /**
     * @param mixed $address1
     */
    public function setAddress1($address1)
    {
        $this->_address1 = $address1;
    }

    /**
     * @param mixed $country
     */
    public function setCountry($country)
    {
        $this->_country = $country;
    }

    /**
     * @param mixed $email
     */
    public function setEmail($email)
    {
        $this->_email = $email;
    }

    /**
     * @param mixed $first_name
     */
    public function setFirstName($first_name)
    {
        $this->_first_name = $first_name;
    }

    /**
     * @param mixed $last_name
     */
    public function setLastName($last_name)
    {
        $this->_last_name = $last_name;
    }

    /**
     * @param mixed $phone1
     */
    public function setPhone1($phone1)
    {
        $this->_phone1 = $phone1;
    }

    /**
     * @param mixed $zip
     */
    public function setZip($zip)
    {
        $this->_zip = $zip;
    }

    /**
     * @return mixed
     */
    public function getUserid()
    {
        return $this->_userid;
    }

    /**
     * @param mixed $userid
     */
    public function setUserid($userid)
    {
        $this->_userid = $userid;
    }

    /**
     * @return mixed
     */
    public function getDepositId()
    {
        return $this->_depositId;
    }

    /**
     * @param mixed $depositId
     */
    public function setDepositId($depositId)
    {
        $this->_depositId = $depositId;
    }

    /**
     * @return mixed
     */
    public function getLavarateId()
    {
        return $this->_lavarateId;
    }

    /**
     * @param mixed $lavarateId
     */
    public function setLavarateId($lavarateId)
    {
        $this->_lavarateId = $lavarateId;
    }

    /**
     * @return mixed
     */
    public function getCity()
    {
        return $this->city;
    }

    /**
     * @param mixed $city
     */
    public function setCity($city)
    {
        $this->city = $city;
    }

    /**
     * @return string
     */
    public function getItemName1()
    {
        return $this->_item_name_1;
    }

    function getTextExErrCode($ExErrCode){
        $textExErrCode = '';
        switch ($ExErrCode){
            case '1001': $textExErrCode = 'Invalid expiration date.';
                break;
            case '1002': $textExErrCode = 'Expiration date has expired already.';
                break;
            case '1101': $textExErrCode = 'Invalid card number (alpha numeric).';
                break;
            case '1102': $textExErrCode = 'Invalid card number (digits count).';
                break;
            case '1103': $textExErrCode = 'Invalid card number (MOD 10).';
                break;
            case '1104': $textExErrCode = 'Invalid CVV2.';
                break;
            case '1105': $textExErrCode = 'Auth Code/Trans ID/Credit card number mismatch.';
                break;
            case '1106': $textExErrCode = 'Credit amount exceed total charges.';
                break;
            case '1107': $textExErrCode = 'Cannot credit this credit card company.';
                break;
            case '1108': $textExErrCode = 'Illegal interval between authorization and force.';
                break;
            case '1109': $textExErrCode = 'Not allowed to process this credit card company.';
                break;
            case '1110': $textExErrCode = 'Unrecognized credit card company.';
                break;
            case '1111': $textExErrCode = 'This transaction was charged back.';
                break;
            case '1112': $textExErrCode = 'Sale/Settle was already credited.';
                break;
            case '1113': $textExErrCode = 'Terminal is not ready for this credit card company.';
                break;
            case '1114': $textExErrCode = 'Black listed card number.';
                break;
            case '1115': $textExErrCode = 'Illegal BIN number.';
                break;
            case '1116': $textExErrCode = 'Custom Fraud Screen Filter.';
                break;
            case '1118': $textExErrCode = '\'N\' cannot be a Positive CVV2 reply.';
                break;
            case '1119': $textExErrCode = '\'B\'/\'N\' cannot be a Positive AVS reply.';
                break;
            case '1120': $textExErrCode = 'Invalid AVS.';
                break;
            case '1121': $textExErrCode = 'CVV2 check is not allowed in Credit/Settle/Void.';
                break;
            case '1122': $textExErrCode = 'AVS check is not allowed in Credit/Settle/Void.';
                break;
            case '1124': $textExErrCode = 'Credits total amount exceeds restriction.';
                break;
            case '1125': $textExErrCode = 'Format error.';
                break;
            case '1126': $textExErrCode = 'Credit amount exceeds limit.';
                break;
            case '1127': $textExErrCode = 'Limit exceeding amount.';
                break;
            case '1128': $textExErrCode = 'Invalid Transaction Type code.';
                break;
            case '1129': $textExErrCode = 'General filter error.';
                break;
            case '1130': $textExErrCode = 'Bank required fields are missing or incorrect.';
                break;
            case '1131': $textExErrCode = 'This transaction type is not allowed for this bank.';
                break;
            case '1132': $textExErrCode = 'Amount exceeds bank limit.';
                break;
            case '1133': $textExErrCode = 'Gateway required fields are missing.';
                break;
            case '1134': $textExErrCode = 'AVS processor error.';
                break;
            case '1135': $textExErrCode = 'Only one credit per sale is allowed.';
                break;
            case '1136': $textExErrCode = 'Mandatory fields are missing.';
                break;
            case '1137': $textExErrCode = 'Credit count exceeded credit card company restriction.';
                break;
            case '1138': $textExErrCode = 'Invalid credit type.';
                break;
            case '1139': $textExErrCode = 'This card is not supported in the CFT Program.';
                break;
            case '1140': $textExErrCode = 'Card must be processed in the Gateway system.';
                break;
            case '1141': $textExErrCode = 'Transaction type is not allowed.';
                break;
            case '1142': $textExErrCode = 'AVS required fields are missing or incorrect.';
                break;
            case '1143': $textExErrCode = 'Country does not match ISO Code.';
                break;
            case '1144': $textExErrCode = 'Must provide UserID in a Rebill transaction';
                break;
            case '1145': $textExErrCode = 'Your Rebill profile does not support this transaction type.';
                break;
            case '1146': $textExErrCode = 'Void is not allowed due to credit card company restriction.';
                break;
            case '1147': $textExErrCode = 'Invalid account number.';
                break;
            case '1148': $textExErrCode = 'Invalid cheque number.';
                break;
            case '1201': $textExErrCode = 'Invalid amount.';
                break;
            case '1202': $textExErrCode = 'Invalid currency.';
                break;
            case '1149': $textExErrCode = 'Account number/Trans ID mismatch.';
                break;
            case '1150': $textExErrCode = 'UserID/Trans Type /Trans ID mismatch.';
                break;
            case '1151': $textExErrCode = 'Transaction does not exist in the rebill system.';
                break;
            case '1152': $textExErrCode = 'Transaction was already canceled.';
                break;
            case '1153': $textExErrCode = 'Invalid Bank Code(digits count).';
                break;
            case '1154': $textExErrCode = 'Invalid Bank Code (alpha numeric).';
                break;
            case '1155': $textExErrCode = 'VBV Related transaction is missing or incorrect.';
                break;
            case '1156': $textExErrCode = 'Debit card required fields are missing or incorrect.';
                break;
            case '1157': $textExErrCode = 'No update parameters were supplied.';
                break;
            case '1158': $textExErrCode = 'VBV PaRes value is incorrect.';
                break;
            case '1159': $textExErrCode = 'State does not match ISO Code.';
                break;
            case '1160': $textExErrCode = 'Invalid Bank Code (checksum digit).';
                break;
            case '1161': $textExErrCode = 'This bank allows only 3 digits in CVV2 value.';
                break;
            case '1163': $textExErrCode = 'Transaction must contain a credit card number/Token.';
                break;
            case '1164': $textExErrCode = 'Invalid token.';
                break;
            case '1165': $textExErrCode = 'Token mismatch.';
                break;
            default:
        }
        return $textExErrCode;

    }

    public function GeneralResponseCodes($ErrCode, $ExErrCode,$depositid){
        $description = '';

        if (!$ExErrCode){
            switch ($ErrCode){
                case '0': $description = 'APPROVED/PENDING';
                    break;
                case '-1': $description = '“Deposit Declined . The deposit attempt was not processed successfully due to a business decline. Transaction ID ['.$depositid.'] was created';
                    break;
                case '-1001': $description = 'Invalid Login';
                    break;
                case '-1005': $description = 'IP out of range';
                    break;
                case '-1003': $description = 'APPROVED/PENDING';
                    break;
                case '-1203': $description = 'Timeout/Retry';
                    break;
            }
        }elseif($ExErrCode>0){
            $description = 'Deposit failed - some error occurred preventing the deposit attempt to be processed.  Transaction ID ['.$depositid.'] was created.';
        }elseif ($ExErrCode<0){
            $description = 'ERROR (Gateway/Bank Error)';
        }
     return $description;
    }
}