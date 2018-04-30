<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

date_default_timezone_set("UTC");

ini_set('memory_limit', '-1');


require_once "inc/db.php";
require_once "inc/config.php";

session_start();

if (isset($_GET['debug'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

//if request is not login attempt
//and no session exists, block it
if (isset($_GET['cmd']) && $_GET['cmd'] != "login") {
    if (!isset($_SESSION["user_is_loggedin"]) || !$_SESSION["user_is_loggedin"]) {
        die('{"error":"No Access"}');
    }
}

$config = new config();
$brandName = 'vincicm';
$leverate_CRM = 'vinci';
$inventiva_CRM = 'vinci_rds';
$db_host = 'mssql_rds';
$lfs = true;
$leverate_CRM_DB = $config::get_db_name('vinci');
$inventiva_CRM_DB = $config::get_db_name('vinci_rds');
$brand_tp = 'vinci_tp';
$site_name_lowercase = strtolower($config::SITE_NAME);

switch ($_GET['cmd']) {
	case 'getLeverateCustomer':
		$customerId = trim($_POST["customerId"]);
		$customerEmail = trim($_POST["customerEmail"]);
		 
		if (empty($customerId) && empty($customerEmail))
            die('{"error":"Missing arguments"}');
        if(!empty($customerId)){
        	die(json_encode(getLeverateCustomer($customerId)));
        }else {
        	if (!filter_var($customerEmail, FILTER_VALIDATE_EMAIL))
			   die('{"error":"Insert Valid Email"}');
        	$customer = getLeverateCustomerByEmail($customerEmail);
			if(empty($customer))
			   die(json_encode($customer));
			if(sizeof($customer)>1)
			   die(json_encode(array("multiple email"=> $customer)));
			die(json_encode(getLeverateCustomer($customer[0]['AccountId'])));
        }
	
	case 'getCustomerDeposits':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getCustomerDeposits($_POST["customerId"]));
		exit();
	
	case 'getCustomerBonus':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getCustomerBonus($_POST["customerId"]));
		exit();
	
	case 'getCustomerDepositLog':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getCustomerDepositLog($_POST["customerId"]));
		exit();
				
	case 'getCustomerCommunications':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getCustomerCommunications($_POST["customerId"]));
		exit();
	
	case 'getCustomerPositions':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getCustomerPositions($_POST["customerId"]));
		exit();
			
	case 'getActiveTPAccounts':
		if(!isset($_POST["customerId"]))
		   die('{"error":"Missing arguments"}');  
		echo json_encode(getActiveTPAccounts(array($_POST["customerId"])));
		exit();
			
	case 'getLeverateDesk':
		echo json_encode(getLeverateDesk());
		exit();
		
	case 'getLeverateEmployeesForRetention':
        if (!isset($_POST["desk"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(getLeverateEmployeesForRetention($_POST["desk"]));
        exit();
	
	case 'getLeverateEmployees':
        if (!isset($_POST["desk"]))
            die('{"error":"Missing arguments"}');
		$short = isset($_POST['short']) ? true : false;	
        echo json_encode(getLeverateEmployees($_POST["desk"],$short));
        exit();
		
	case 'getCountries':
		echo json_encode(getCountries());
		exit();
		 	
	case 'getLeverateTransactionsForCommission':
	    if(!isset($_POST["dpStart"]) || !isset($_POST["dpEnd"]) || !isset($_POST["desk"]) || !isset($_POST["employee"]))
		    die('{"error":"Missing arguments"}');
		echo json_encode(getLeverateTransactionsForCommission($_POST["dpStart"], $_POST["dpEnd"], $_POST["desk"], $_POST["employee"]));
        exit();
			
	case 'getAllCommissionBonuses':
		if (!isset($_POST["dpStart"]) || !isset($_POST["dpEnd"]) || !isset($_POST["desk"]) || !isset($_POST["employee"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(getAllCommissionBonuses($_POST["dpStart"], $_POST["dpEnd"], $_POST["desk"], $_POST["employee"]));
        exit();
	
	case 'getCommissionBonus':     
        if (!isset($_POST["dpStart"]) || !isset($_POST["dpEnd"]) || !isset($_POST["desk"]) || !isset($_POST['employee']) || !isset($_POST['bonusType']))
            die('{"error":"Missing arguments"}');
        echo json_encode(getCommissionBonus($_POST["dpStart"], $_POST["dpEnd"], $_POST["desk"], $_POST['employee'], $_POST['bonusType']));
        exit();
	
	case 'getCommissionDifference':
        if (!isset($_POST["dpEnd"]) || !isset($_POST["desk"]) || !isset($_POST["employee"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(getCommissionDifference($_POST["dpEnd"], $_POST["desk"], $_POST["employee"]));
        exit();
		
	case 'addCommissionSplit':
	    if (!isset($_POST["split"]) || !isset($_POST["transactionId"]))
            die('{"error":"Missing arguments"}');
	    echo json_encode(addCommissionSplit(json_decode($_POST['split'],true),$_POST['transactionId']));	
		exit();
		
	case 'addCommissionBonus':
        if (!isset($_POST["bonusType"]) || !isset($_POST["bonusDate"]) || !isset($_POST["bonusEmployee"]) || !isset($_POST["bonusCurrency"]) 
            || !isset($_POST["bonusAmount"]) || !isset($_POST["bonusPaymentMethod"]) || !isset($_POST["bonusReason"])
			)
            die('{"error":"Missing arguments"}');			
        $extra_bonusMonth = isset($_POST["extra_bonusMonth"]) ? $_POST["extra_bonusMonth"] : false; 
        echo json_encode(addCommissionBonus($_POST["bonusType"],$_POST["bonusDate"],$_POST["bonusEmployee"],$_POST["bonusCurrency"],$_POST["bonusAmount"],$_POST["bonusPaymentMethod"],$_POST["bonusReason"],$extra_bonusMonth));
        exit();
	
	case 'addCommissionPaid':
		if (!isset($_POST["paidDate"]) || !isset($_POST["paidEmployee"]) || !isset($_POST["paidAmount"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(addCommissionPaid($_POST["paidDate"], $_POST["paidEmployee"], $_POST["paidAmount"]));
        exit();
		
	case 'addCommissionDifference':
		if (!isset($_POST["differenceMonth"]) || !isset($_POST["differenceEmployeeId"]) || !isset($_POST["differenceAmount"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(addCommissionDifference($_POST["differenceMonth"], $_POST["differenceEmployeeId"], $_POST["differenceAmount"]));
        exit();
		
	case 'addCommissionChangeEmployee':
		if(!isset($_POST["transactionId"]) || !isset($_POST["changeEmployee"]))
		    die('{"error":"Missing arguments"}');		
		echo json_encode(addCommissionChangeEmployee($_POST['transactionId'],$_POST["changeEmployee"]));
		exit();	
    
	case 'deleteCommissionBonus':
        if (!isset($_POST["id"]) || !isset($_POST["bonusType"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(deleteCommissionBonus($_POST["id"],$_POST["bonusType"]));
        exit();
	
	case 'deleteCommissionDifference':
        if (!isset($_POST["id"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(deleteCommissionDifference($_POST["id"]));
        exit();
		
    case 'deleteCommissionSplit':
	    if (!isset($_POST["transactionId"]))
            die('{"error":"Missing arguments"}');
	    echo json_encode(deleteCommissionSplit($_POST['transactionId']));
		exit();
	
	case 'deleteCommissionChangeEmployee':
		if(!isset($_POST["transactionId"]))
		    die('{"error":"Missing arguments"}');
		echo json_encode(deleteCommissionChangeEmployee($_POST['transactionId']));
		exit();
	
	case 'getStringData':
		if(!isset($_POST["table"]) || !isset($_POST["field"]))
		    die('{"error":"Missing arguments"}');
		echo json_encode(getStringData($_POST['table'],$_POST['field']));
		exit();
	
	case 'getLeverateCampaigns':    
        echo json_encode(getLeverateCampaigns());
        exit();
	
    case 'getLeverateTransactions':
		if(!isset($_POST['dpStart']) || !isset($_POST['dpEnd']) || !isset($_POST['desk']) || !isset($_POST['employee']))
		   die('{"error":"Missing arguments"}'); 
		$campaigns = isset($_POST['campaigns']) ? $_POST['campaigns'] : false;
		$current = isset($_POST['current']) ? true : false;
		
		echo json_encode(getLeverateTransactions($_POST['dpStart'],$_POST['dpEnd'],$campaigns,$_POST['desk'],$_POST['employee'],$current));
		exit();
		 			
	case 'getRealPNLByAgents':
		echo getRealPNLByAgents('2017-01-01','2017-01-26',0);
		exit();
	
	case 'getAgentPortfolio':
		if(!isset($_POST['employee']) || !isset($_POST['fdd']) || !isset($_POST['withdrawal']) || !isset($_POST['redeposit']) 
		   || !isset($_POST['totalDeposits']))
		   die('{"error":"Missing arguments"}'); 
		$countries = isset($_POST['countries']) ? $_POST['countries'] : false;   
		$leadStatus = isset($_POST['leadStatus']) ? $_POST['leadStatus'] : false;
		$accountStatus = isset($_POST['accountStatus']) ? $_POST['accountStatus'] : false;
		echo json_encode(getAgentPortfolio($_POST['employee'],$_POST['fdd'],$countries,$leadStatus,$accountStatus,$_POST['withdrawal'],$_POST['redeposit'],
		                                  $_POST['totalDeposits']));
		exit();
	
	case 'portfolioSummary':
		if(!isset($_POST['customers'])){
			echo json_encode(array());
			exit();
		} 
		echo json_encode(portfolioSummary($_POST['customers']));
		exit();
		   
    case 'customerSearch':
		echo json_encode(customerSearch($_POST['search']));
		exit();
	
	case 'assignAccountOwner':
		if(!isset($_POST['customer']) || !isset($_POST['employee']))
		   die('{"error":"Missing arguments"}');
		echo json_encode(assignAccountOwner($_POST['customer'],$_POST['employee']));
		exit();
	
	case 'addNewCommunication':
	    if(!isset($_POST['customer']) || !isset($_POST['title']) || !isset($_POST['description']) || !isset($_POST['leadStatus']))
		   die('{"error":"Missing arguments"}');
		echo json_encode(addNewCommunication($_POST['customer'],$_POST['title'],$_POST['description'],$_POST['leadStatus']));
		exit();
	
	case 'editCustomer':
		if(!isset($_POST['customerId']) || !isset($_POST['params']))
		   die('{"error":"Missing arguments"}');
		$params = json_decode($_POST['params'],true);  
		echo json_encode(editCustomer($_POST['customerId'],$params));
		exit();
	
	case 'getAccountTypes':
	    echo json_encode(getAccountTypes());
		exit();
	
    case 'getCustomersData':
		if(!isset($_POST['accountType']) || !isset($_POST['desk']) || !isset($_POST['onlineStatus']))
		   die('{"error":"Missing arguments"}');
		$campaign = isset($_POST['campaign']) ? $_POST['campaign'] : false;
		$exclude_campaign = isset($_POST['exclude_campaign']) ? $_POST['exclude_campaign'] : false;
		$employee = isset($_POST['employee']) ? $_POST['employee'] : false;
		$countries = isset($_POST['countries']) ? $_POST['countries'] : false;
		$leadStatus = isset($_POST['leadStatus']) ? $_POST['leadStatus'] : false;
		$accountStatus = isset($_POST['accountStatus']) ? $_POST['accountStatus'] : false;
		$exclude_accountStatus = isset($_POST['exclude_accountStatus']) ? $_POST['exclude_accountStatus'] : false;
		$regStart = isset($_POST['regStart']) ? $_POST['regStart'] : false;
		$regEnd = isset($_POST['regEnd']) ? $_POST['regEnd'] : false; 
		$loginStart = isset($_POST['loginStart']) ? $_POST['loginStart'] : false;
		$loginEnd = isset($_POST['loginEnd']) ? $_POST['loginEnd'] : false;
		
		echo json_encode(getCustomersData($_POST['accountType'],$campaign,$exclude_campaign,$_POST['desk'],$employee,$countries,$leadStatus,$accountStatus,$exclude_accountStatus,$_POST['onlineStatus'],$regStart,$regEnd,$loginStart,$loginEnd));
		exit();
	
    case 'changeOwnerForCustomers':
	    if(!isset($_POST['customers']) || !isset($_POST['employee']) || !isset($_POST['leadStatus']))
		   die('{"error":"Missing arguments"}');
		$leadStatus = json_decode($_POST['leadStatus'],true);
		$customers = json_decode($_POST['customers'],true);
		echo json_encode(changeOwnerForCustomers($customers,$_POST['employee'],$leadStatus));
		exit();
	
    case 'getLeadsByField':
	    if(!isset($_POST['dpStart']) || !isset($_POST['dpEnd']) || !isset($_POST['field']))
		   die('{"error":"Missing arguments"}');
		$campaign = isset($_POST['campaign']) ? $_POST['campaign'] : false;  
	    echo json_encode(getLeadsByField($_POST['dpStart'],$_POST['dpEnd'],$_POST['field'],$campaign));
		exit();
	
	case 'getAllLeads':
		echo json_encode(getAllLeads());
		exit();
	
	case 'getUncalledCustomers':
		if(!isset($_POST['dpStart']) || !isset($_POST['dpEnd']) || !isset($_POST['field']))
		   die('{"error":"Missing arguments"}');
		$field = json_decode($_POST['field'],true);   
		$campaign = isset($_POST['campaign']) ? $_POST['campaign'] : false;
		echo json_encode(getUncalledCustomers($_POST['dpStart'],$_POST['dpEnd'],$field,$campaign));
		exit();
	
	case 'getFailedAttempts':
		if(!isset($_POST['dpStart']) || !isset($_POST['dpEnd']) || !isset($_POST['field']))
		   die('{"error":"Missing arguments"}');
		$field = json_decode($_POST['field'],true);   
		$campaign = isset($_POST['campaign']) ? $_POST['campaign'] : false;
		echo json_encode(getFailedAttempts($_POST['dpStart'],$_POST['dpEnd'],$field,$campaign));
		exit();			   		  		    				 									     			    	    	

    case 'getAgentRates':
        if(!isset($_POST["agentId"]))
            die('{"error":"Missing arguments"}');
		$default = isset($_POST["default"]) ? true : false;
        echo json_encode(getAgentRates($_POST["agentId"], $_POST["id"],$default));
        die;

    case 'addAgentRates':
    case 'updateAgentRates':
        if(!isset($_POST["AgentId"]) || !isset($_POST["RateCreditCardUpper"]) || !isset($_POST["RateCreditCardLower"]) || !isset($_POST["RateWire"]))
            die('{"error":"Missing arguments"}');
        echo json_encode($_GET['cmd']($_POST));
        die;

    case 'deleteAgentRates':
        if(!isset($_POST["rowId"]) || !isset($_POST["agentId"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(deleteAgentRates($_POST["rowId"], $_POST["agentId"]));
        die;
    
	case 'getTPAccounts':
		if(!isset($_POST["customerId"]))
            die('{"error":"Missing arguments"}');
        echo json_encode(getTPAccounts($_POST["customerId"]));
		die;

	case 'getRealPnl':
		if(!isset($_POST["pStart"]) || !isset($_POST["pEnd"]) | !isset($_POST["desk"]))
            die('{"error":"Missing arguments"}');
		$employee = $_POST['employee'] ? $_POST['employee'] : false;
		$onlyClose = isset($_POST['closePnl']) ? true : false;  
        echo json_encode(getRealPnl($_POST["pStart"], $_POST["pEnd"],$_POST["desk"],$employee,$onlyClose));
        die;
	
	case 'getTpAccountNetCredit':
		if(!isset($_POST['tpAccountGUID']))
		    die('{"error":"Missing arguments"}');
		echo json_encode(getTpAccountNetCredit($_POST['tpAccountGUID']));
		exit();
	
	case 'editCredit':
	    if(!isset($_POST['tpAccountGUID']) || !isset($_POST['type']) || !isset($_POST['amount']))
		    die('{"error":"Missing arguments"}');						   		  		    	
		echo json_encode(editCredit($_POST['tpAccountGUID'],$_POST['type'],$_POST['amount']));
		exit();
	
	case 'getRetentionCustomers':

        $countries   = isset($_POST['countries'])   ? $_POST['countries']   : false;
		$employee    = isset($_POST['employee'])    ? $_POST['employee']    : array();
        $excEmployee = isset($_POST['excEmployee']) ? $_POST['excEmployee'] : array();
        $drStart     = isset($_POST['drStart'])     ? $_POST['drStart']     : false;
        $drEnd       = isset($_POST['drEnd'])       ? $_POST['drEnd']       : false;
        $fdStart     = isset($_POST['fdStart'])     ? $_POST['fdStart']     : false;
        $fdEnd       = isset($_POST['fdEnd'])       ? $_POST['fdEnd']       : false;
        $ldStart     = isset($_POST['ldStart'])     ? $_POST['ldStart']     : false;
        $ldEnd       = isset($_POST['ldEnd'])       ? $_POST['ldEnd']       : false;
        $llStart     = isset($_POST['llStart'])     ? $_POST['llStart']     : false;
        $llEnd       = isset($_POST['llEnd'])       ? $_POST['llEnd']       : false;
        $lnStart     = isset($_POST['lnStart'])     ? $_POST['lnStart']     : false;
        $lnEnd       = isset($_POST['lnEnd'])       ? $_POST['lnEnd']       : false;
        $aStart      = isset($_POST['aStart'])      ? $_POST['aStart']      : false;
        $aEnd        = isset($_POST['aEnd'])        ? $_POST['aEnd']        : false;
        $leadStatus  = isset( $_POST['leadstatus'] )    ? $_POST['leadstatus']      : false;
		
        $closed = isset($_POST['closed']) && $_POST['closed'] == 'on' ? true : false;
        echo json_encode(getRetentionCustomers($_POST['desk'], $employee, $excEmployee, $countries, $drStart, $drEnd, $fdStart, $fdEnd, $ldStart, $ldEnd, $llStart, $llEnd, $lnStart, $lnEnd, $aStart, $aEnd, $leadStatus,$closed));
        exit();
	
    case 'getExcludeEmployees':
		if(!isset($_POST['desk']))
		    die('{"error":"Missing arguments"}');
		echo json_encode(getExcludeEmployees($_POST['desk']));
		exit();
	
	case 'addPreExcludeEmployee':
		if(!isset($_POST['employee']))
		    die('{"error":"Missing arguments"}');
		echo json_encode(addPreExcludeEmployee($_POST['employee']));
		exit();
	
    case 'deletePreExcludeEmployee':
		if(!isset($_POST['id']))
		    die('{"error":"Missing arguments"}');
		echo json_encode(deletePreExcludeEmployee($_POST['id']));
		exit();
		 				
    default:
        die('{"error":"Unknown command"}');	
		
}

function getLeverateCustomerByEmail($customerEmail){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT AccountId, Name FROM AccountBase
	        WHERE EMailAddress1 = '$customerEmail'";
			
	return $leverateConnect->fetchAll($sql,array('AccountId'));					
}

function getLeverateCustomer($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT accounts.AccountId AS Id,
	               accounts.Lv_FirstName AS First_Name,
			       accounts.Lv_LastName AS Last_Name,
			       accounts.EMailAddress1 AS Email,
			       accounts.Lv_Phone1CountryCode AS Country_Code,
			       accounts.Lv_Phone1AreaCode AS Area_Code,
			       accounts.Lv_Phone1Phone AS Phone_Number,   
			       countries.Lv_name AS Country,
			       CONVERT(DATETIME2(0),accounts.Lv_DateOfBirth) AS BirthDay,
			       leadStatus.Value AS Lead_Status,
			       accountStatus.Value AS Account_Status,
			       statusCode.Value AS Status,
			       accountType.Value AS Account_Type,
			       accounts.lv_utmcampaign AS Campaign,
			       employees.FullName AS Employee,
			       desks.Name AS Desk,
			     --  currencies.ISOCurrencyCode AS Currency,
			       CONVERT(DATETIME2(0),accounts.CreatedOn) AS Registration_Time
			    /*   ISNULL(transactions.totalDeposits,0) AS Total_Deposits,
			       ISNULL(transactions.totalWithdrawals,0) AS Total_Withdrawals,
			       ISNULL(transactions.netCredit,0) AS Total_Net_Credit	*/		       
	        FROM AccountBase AS accounts
	        LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'AccountBase'
      /*      LEFT JOIN (SELECT  deposits.lv_accountid AS accountId,
                               SUM(CASE WHEN transactionType.Value = 'Deposit' AND methodOfPayment.Value <> 'Internal'
			                        THEN deposits.Lv_Amount
			                        ELSE CASE WHEN transactionType.Value = 'Deposit Cancelled' AND methodOfPayment.Value <> 'Internal'
			                                  THEN -deposits.Lv_Amount
			                                  ELSE 0
			                             END      
			                   END) AS totalDeposits,
			                   SUM(CASE WHEN (transactionType.Value = 'Withdrawal' OR transactionType.Value= 'Charge Back')  AND methodOfPayment.Value <> 'Internal'
                                        THEN deposits.Lv_Amount
				                        ELSE (CASE WHEN (transactionType.Value = 'Withdrawal Cancelled' OR transactionType.Value= 'Charge Back Cancelled')  AND methodOfPayment.Value <> 'Internal'
                                                   THEN -deposits.Lv_Amount
				                                   ELSE 0
					                          END )
			                       END) AS totalWithdrawals,
			                   SUM(CASE WHEN transactionType.Value = 'Credit' OR transactionType.Value = 'Bonus' OR transactionType.Value = 'Debit Cancelled'
                                        THEN deposits.Lv_Amount
				                        ELSE (CASE WHEN transactionType.Value = 'Credit Cancelled' OR transactionType.Value = 'Bonus Cancelled' OR transactionType.Value = 'Debit'
                                                   THEN -deposits.Lv_Amount
				                                   ELSE 0
					                          END )
			                       END) AS netCredit    
			           FROM Lv_monetarytransactionBase AS deposits
			           LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                               FROM MetadataSchema.Entity
                               GROUP BY BaseTableName, ObjectTypeCode) AS transactionObject ON transactionObject.BaseTableName = 'Lv_monetarytransactionBase'
			           LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = transactionObject.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
                       LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = transactionObject.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 ". 
                   //    ($GLOBALS['lfs'] ? "LEFT JOIN dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = transactionObject.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
                       "WHERE ".
                     //  ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	                   "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	                    deposits.Lv_TransactionApproved = 1
	                    GROUP BY  deposits.lv_accountid  
	                   ) AS transactions ON transactions.accountId = accounts.AccountId  */                     
	        LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
	     --   LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = accounts.TransactionCurrencyId
	        LEFT JOIN SystemUserBase AS employees ON employees.SystemUserId = accounts.OwnerId
	        LEFT JOIN BusinessUnitBase AS desks ON desks.BusinessUnitId = employees.BusinessUnitId
	        LEFT JOIN StringMapBase AS leadStatus ON leadStatus.ObjectTypeCode = objects.ObjectTypeCode AND leadStatus.AttributeValue = accounts.lv_leadstatus AND leadStatus.AttributeName = 'lv_leadstatus' AND leadStatus.LangId=1033
	        LEFT JOIN StringMapBase AS accountStatus ON accountStatus.ObjectTypeCode = objects.ObjectTypeCode AND accountStatus.AttributeValue = accounts.lv_accountstatus AND accountStatus.AttributeName = 'lv_accountstatus' AND accountStatus.LangId=1033
	        LEFT JOIN StringMapBase AS statuscode ON statuscode.ObjectTypeCode = objects.ObjectTypeCode AND statuscode.AttributeValue = accounts.statuscode AND statuscode.AttributeName = 'statuscode' AND statuscode.LangId=1033
	        LEFT JOIN StringMapBase AS accountType ON accountType.ObjectTypeCode = objects.ObjectTypeCode AND accountType.AttributeValue = accounts.Lv_AccountType AND accountType.AttributeName = 'lv_accounttype' AND accountType.LangId=1033
	        WHERE accounts.AccountId = '$customerId'";
	$customer = $leverateConnect->fetchAll($sql,array('Id'));
	if(empty($customer))
	   return $customer;
/*	$sql = "SELECT tpAccounts.Lv_name AS tpAccountId
            FROM Lv_tpaccountBase AS tpAccounts 
            LEFT JOIN Lv_tradingplatformBase AS tradingPlatforms ON tradingPlatforms.Lv_tradingplatformId = tpAccounts.lv_tradingplatformid
            WHERE tradingPlatforms.Lv_TradingType = 2
            AND tpAccounts.lv_accountid = '$customerId'";
    $accounts = $leverateConnect->fetchAll($sql);
	if(empty($accounts)){
		$customer[0]['Total_Balance'] = 0;
		$customer[0]['Total_Entity'] = 0;
		$customer[0]['Total_Pnl'] = 0;
		$customer[0]['Real_Pnl'] = 0;
		$customer[0]['Real_Account_Balance'] = 0;
		return $customer;
	}
	$accountIds = array();
	foreach($accounts as $key=>$value){
		$accountIds[] = $value['tpAccountId'];
	}               
	$dbConnect = new DB_Connect('leverate_tp',$GLOBALS['brand_tp'],'social');
	$sql = "SELECT SUM(users.balance) AS Total_Balance,
                   SUM(users.equity) AS Total_Equity,
                   SUM(IFNULL(pnl.totalProfit,0)+ROUND(users.equity - users.balance - users.credit,2)) AS Total_Pnl
            FROM  {$GLOBALS['brandName']}_users AS users
            LEFT JOIN (SELECT platform_user_id, 
                              SUM(ROUND(profit+commission+taxes+swaps,2)) AS totalProfit 
                       FROM {$GLOBALS['brandName']}_trades 
                       WHERE is_open = 0
                       GROUP BY platform_user_id) AS pnl ON pnl.platform_user_id=users.platform_user_id
            WHERE users.platform_user_id IN ('".implode("','",$accountIds)."')";		
	$tpResults = $dbConnect->fetchAll($sql);
	
	$customer[0] = array_merge($customer[0],$tpResults[0]);
	$customer[0]['Real_Pnl'] = max($customer[0]['Total_Pnl'],-($customer[0]['Total_Deposits']-$customer[0]['Total_Withdrawals']));
	$customer[0]['Real_Account_Balance'] = $customer[0]['Total_Deposits']-$customer[0]['Total_Withdrawals'] + $customer[0]['Real_Pnl'];		
	
	return $customer;	*/
	$customer[0]['edit_bonus'] = $_SESSION['userdata']['per_editbonus'];
	$customer[0]['edit_assign'] = $_SESSION['userdata']['per_assign']; 
	$customer['tpAccountDetails'] = getActiveTPAccounts(array($customerId),$leverateConnect);
	foreach($customer['tpAccountDetails'] as $key=>$value){
		$customer['tpAccountDetails'][$key]['totalNetCredit'] = $value['totalCredit'] - $value['totalDebit'];
		unset($customer['tpAccountDetails'][$key]['totalCredit'],$customer['tpAccountDetails'][$key]['totalDebit'],$customer['tpAccountDetails'][$key]['accountId']);
	}
	return $customer;
	        
}

function getCustomerCommunications($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT accounts.AccountId,
	               accounts.Name AS customerName,
	               ISNULL(CAST(communications.Subject AS TEXT),'') AS subject, 
                   ISNULL(CAST(communications.NoteText AS TEXT),'') AS noteText,
			       CONVERT(DATETIME2(0),communications.CreatedOn) AS createDate,
			       creator.FullName AS userName
            FROM AnnotationBase AS communications
            LEFT JOIN SystemUserBase AS creator ON creator.SystemUserId = communications.CreatedBy
            LEFT JOIN AccountBase AS accounts ON accounts.AccountId = communications.ObjectId
            WHERE  communications.ObjectTypeCode = (SELECT ObjectTypeCode
                                                    FROM MetadataSchema.Entity
                                                    WHERE BaseTableName = 'AccountBase'
                                                    GROUP BY ObjectTypeCode) 
                   AND communications.ObjectId = '$customerId'";               
    return $leverateConnect->fetchAll($sql,array('AccountId'));                
}

function getCustomerDeposits($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT tpAccounts.Lv_name AS tpAccount,
	               methodOfPayment.Value AS methodOfPayment,
	               transactionType.Value AS transactionType,
	               currencies.ISOCurrencyCode AS currency, 
	               CONVERT(DATETIME2(0),deposits.Lv_ApprovedOn) AS ApprovedOn,
	               deposits.Lv_Amount AS amount,
	               deposits.Lv_USDValue AS amountUSD,
	               transaction_employees.FullName AS transactionEmployee,
	               createOwners.Name AS createEmployee,
	               CONVERT(DATETIME2(0),deposits.CreatedOn) AS CreatedOn
            FROM Lv_monetarytransactionBase AS deposits
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
            LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = deposits.lv_tpaccountId
            LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId 
            LEFT JOIN dbo.AccountBase AS customers ON customers.AccountId = deposits.lv_accountid 
            LEFT JOIN dbo.SystemUserBase AS transaction_employees ON transaction_employees.SystemUserId = deposits.lean_TransactionOwner
            LEFT JOIN dbo.OwnerBase AS createOwners ON createOwners.OwnerId = deposits.CreatedBy
            LEFT JOIN dbo.BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = deposits.OwningBusinessUnit
            LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033  
            LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 ". 
          //  ($GLOBALS['lfs'] ? "LEFT JOIN dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
            "WHERE deposits.lv_accountid = '$customerId' AND ".
                //   ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	              "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	               deposits.Lv_TransactionApproved = 1   
	               AND methodOfPayment.Value <> 'Internal'
	               AND transactionType.Value IN ('Deposit','Deposit Cancelled')";              
	return $leverateConnect->fetchAll($sql);               
}

function getCustomerBonus($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT tpAccounts.Lv_name AS tpAccount,
	               methodOfPayment.Value AS methodOfPayment,
	               transactionType.Value AS transactionType,
	               currencies.ISOCurrencyCode AS currency, 
	               CONVERT(DATETIME2(0),deposits.Lv_ApprovedOn) AS ApprovedOn,
	               deposits.Lv_Amount AS amount,
	               deposits.Lv_USDValue AS amountUSD,
	               transaction_employees.FullName AS transactionEmployee,
	               createOwners.Name AS createEmployee,
	               CONVERT(DATETIME2(0),deposits.CreatedOn) AS CreatedOn
            FROM Lv_monetarytransactionBase AS deposits
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
            LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = deposits.lv_tpaccountId 
            LEFT JOIN dbo.AccountBase AS customers ON customers.AccountId = deposits.lv_accountid
            LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId 
            LEFT JOIN dbo.SystemUserBase AS transaction_employees ON transaction_employees.SystemUserId = deposits.lean_TransactionOwner
            LEFT JOIN dbo.OwnerBase AS createOwners ON createOwners.OwnerId = deposits.CreatedBy
            LEFT JOIN dbo.BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = deposits.OwningBusinessUnit
            LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033
            LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 ". 
          //  ($GLOBALS['lfs'] ? "LEFT JOIN dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
            "WHERE deposits.lv_accountid = '$customerId' AND ".
              //     ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	              "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	               deposits.Lv_TransactionApproved = 1   
	               AND transactionType.Value IN ('Credit','Credit Cancelled','Credit Line','Credit Line Cancelled','Bonus','Bonus Cancelled','Debit','Debit Cancelled')";              
	return $leverateConnect->fetchAll($sql);               
}

function getCustomerDepositLog($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql ="SELECT CONVERT(DATETIME2(0),dLog.CreatedOn) AS date,
                  dLog.Lv_DepositAmount AS amount,
                  dLog.Lv_DepositCCLast4digits AS cardNum,
                  Tools.dbo.customSplit(SUBSTRING(dLog.Description,1,CHARINDEX('ErrorCode',dLog.Description)-1),' -> ',2) AS reason
		   FROM IncidentBase AS dLog 
           WHERE dLog.Title = 'Credit Card Deposit Failure'
                 AND dLog.CustomerId = '$customerId'";
	return $leverateConnect->fetchAll($sql);			 
}

function getActiveTPAccounts($customers,$connection = false){
	$leverateConnect = $connection ? $connection : new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT accountId,
	               tpAccount,
	               currency,
                   SUM(CASE WHEN (transactionType = 'Deposit'  AND methodOfPayment <> 'Internal') 
                                  OR  (transferred='No' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                              OR  (transferred='Yes' AND transactionType = 'Transfer Between Trading Platform Accounts')  
                            THEN amount
				            ELSE (CASE WHEN (transactionType = 'Deposit Cancelled'  AND methodOfPayment <> 'Internal')
							                 OR  (transferred='Yes' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                                         OR  (transferred='No' AND transactionType = 'Transfer Between Trading Platform Accounts')
                                       THEN -amount
				                       ELSE 0
			                      END )
			           END ) AS totalDeposits,
                   SUM(CASE WHEN (transactionType = 'Withdrawal' OR transactionType= 'Charge Back')  AND methodOfPayment <> 'Internal'
                            THEN amount
				            ELSE (CASE WHEN (transactionType = 'Withdrawal Cancelled' OR transactionType= 'Charge Back Cancelled') AND methodOfPayment <> 'Internal'
                                       THEN -amount
				                       ELSE 0
					              END )
			           END ) AS totalWithdrawals,
                   SUM(CASE WHEN transactionType = 'Credit' OR transactionType = 'Bonus' OR transactionType = 'Credit Line'
                            THEN amount
				            ELSE (CASE WHEN transactionType = 'Credit Cancelled' OR transactionType = 'Bonus Cancelled' OR transactionType = 'Credit Line Cancelled'
                                       THEN -amount
				                       ELSE 0
			                      END )	
			            END ) AS totalCredit,
		           SUM(CASE WHEN transactionType = 'Debit'
                            THEN amount
				            ELSE (CASE WHEN transactionType = 'Debit Cancelled'
                                       THEN -amount
				                       ELSE 0
			                      END )
			            END	) AS totalDebit	 
            FROM (SELECT deposits.lv_accountid AS accountId,
                         tpAccounts.Lv_name AS tpAccount,
                         currencies.ISOCurrencyCode AS currency, 
	                     methodOfPayment.Value AS methodOfPayment,
	                     transactionType.Value AS transactionType,
	                     deposits.Lv_Amount AS amount,
	                     'No' AS transferred
                  FROM dbo.Lv_monetarytransactionBase AS deposits
                  LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                             FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                             GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
                  LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = deposits.lv_tpaccountId
                  LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId 
                  LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
                  LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 ". 
             //     ($GLOBALS['lfs'] ? "LEFT JOIN dbo.StringMapBase AS transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
                  "WHERE deposits.lv_accountid IN ('".implode("','",$customers)."') AND ".
               //         ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	                    "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	                     deposits.Lv_TransactionApproved = 1 
                  UNION ALL 
                  SELECT deposits.lv_accountid AS accountId,
                         tpAccounts.Lv_name AS tpAccount,
                         currencies.ISOCurrencyCode AS currency, 
	                     methodOfPayment.Value AS methodOfPayment,
	                     transactionType.Value AS transactionType,
	                     deposits.Lv_Amount AS amount,
	                     'Yes' AS transferred
                  FROM dbo.Lv_monetarytransactionBase AS deposits
                  LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                             FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                             GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
                  LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = deposits.lv_oppositeaccountid
                  LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId  
                  LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
                  LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 ". 
              //    ($GLOBALS['lfs'] ? "LEFT JOIN dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
                  "WHERE deposits.lv_accountid IN ('".implode("','",$customers)."') AND ".
                  //      ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	                    "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	                     deposits.Lv_TransactionApproved = 1 AND 
	                   (transactionType.Value = 'Transfer Between Trading Platform Accounts' OR transactionType.Value = 'Transfer Between Trading Platform Accounts Cancelled')   ) AS transactions   
                  GROUP BY accountId, tpAccount, currency";             
    $tpAccounts = $leverateConnect->fetchAll($sql,array('accountId'));
    if(empty($tpAccounts)){
    	return array();
    }
    $accountIds = array();
    $initial = array('currency'=>'USD','balance'=>'0','equity'=>'0','closedPNL'=>'0','openPNL'=>'0','turnover'=>'0','openPositions'=>'0','pnl'=>'0','realPNL'=>'0','realAccountBalance'=>'0','updateTime'=>'0000-00-00 00:00:00');
    foreach($tpAccounts as $key=>$value){
    	if($value['tpAccount']==''){
    		$tpAccounts[$key] = array_merge($value,$initial);
    	}else{
    	    $accountIds[] = $value['tpAccount'];
    	}	
    }
    if(!empty($accountIds)){
    $dbConnect = new DB_Connect('leverate_tp',$GLOBALS['brand_tp'],'social');
    
    $sql = "SELECT users.platform_user_id, 
                   users.balance,
                   users.equity,
                   IFNULL(trades.totalProfit,0) AS closedPNL,
                   ROUND(users.equity - users.balance - users.credit,2) AS openPNL,
               --    IFNULL(trades.turnOver,0) AS turnOver,
                   IFNULL(trades.openPositions,0) AS openPositions,
                   sync_platformusers_time_modified AS updateTime
            FROM  {$GLOBALS['brandName']}_users AS users
            LEFT JOIN (SELECT platform_user_id, 
                              SUM(IF(is_open = 0 ,ROUND(profit+commission+taxes+swaps,2),0)) AS totalProfit,
                           --   SUM(amount) AS turnOver,
                              SUM(IF(is_open = 1 AND margin_rate<>0,1,0)) AS openPositions 
                       FROM {$GLOBALS['brandName']}_trades 
                       GROUP BY platform_user_id) AS trades ON trades.platform_user_id=users.platform_user_id
            WHERE users.platform_user_id IN (".implode(',',$accountIds).")";
	$tpResults = $dbConnect->fetchAll($sql);
	foreach($tpAccounts as $key=>$value){
		foreach($tpResults as $tpKey=>$tpValue){
			if($value['tpAccount']==$tpValue['platform_user_id']){
				unset($tpValue['platform_user_id']);
				$tpAccounts[$key] = array_merge($value,$tpValue);
				$tpAccounts[$key]['pnl'] = $tpValue['closedPNL'] + $tpValue['openPNL'];
				$tpAccounts[$key]['realPNL'] = max($tpAccounts[$key]['pnl'],-($tpAccounts[$key]['totalDeposits']-$tpAccounts[$key]['totalWithdrawals']));
				$tpAccounts[$key]['realAccountBalance'] = number_format($tpAccounts[$key]['totalDeposits']-$tpAccounts[$key]['totalWithdrawals'] + $tpAccounts[$key]['realPNL'], 2, ".", ""); 	
				break;
			}
		}
	}
	}				   
    return $tpAccounts;              
}
function getCustomerPositions($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT Lv_Name AS tpId
	        FROM Lv_tpaccountBase
	        WHERE lv_accountid = '$customerId'";
	$accounts = $leverateConnect->fetchAll($sql);
	if(empty($accounts))
	   return array();
	$accountIds = array();
	foreach($accounts as $key=>$value){
		$accountIds[] = $value['tpId'];
	}
	
	$dbConnect = new DB_Connect('leverate_tp',$GLOBALS['brand_tp'],'social');
	
	$sql = "SELECT platform_user_id,
	               instrument,
	               IF(is_open = 1, 'Yes' , 'No') AS open,
	               amount,
	               time_opened AS startDate,
	               IFNULL(time_closed,'0000-00-00 00:00:00') AS endDate,
	               rate_opened,
	               rate_closed, 
	               profit AS pnl,
	               ROUND(profit + commission + taxes + swaps,2) AS totalPnl 
	        FROM {$GLOBALS['brandName']}_trades
	        WHERE platform_user_id IN (".implode(',',$accountIds).")
	              AND margin_rate<>0";
	return $dbConnect->fetchAll($sql);                
}

function getLeverateDesk(){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT BusinessUnitId AS id , 
	               Name
	        FROM dbo.BusinessUnitBase
	        WHERE IsDisabled=0";
			
	return $leverateConnect->fetchAll($sql,array('id')); 		
}

function getLeverateEmployeesForRetention($desk){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT SystemUserId AS userId,
	               FullName AS employeeName
	        FROM SystemUserBase
	        WHERE Lv_IsRetentionOwner = 1";
	if($desk){
		$sql .= " AND BusinessUnitId = '$desk'";
	}
	$sql .= " ORDER BY employeeName ASC";
	return $leverateConnect->fetchAll($sql,array('userId'));        
}

function getLeverateEmployees($desk, $short = false){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT SystemUserId AS userId,
	               FullName AS employeeName
	        FROM SystemUserBase";
	if($short){
		$sql .= " WHERE Lv_IsActive = 1";
	}		
	if($desk){
		$sql .= ($short ? " AND" : " WHERE") . " BusinessUnitId = '$desk'";
	}
	$sql .= " ORDER BY employeeName ASC";
	return $leverateConnect->fetchAll($sql,array('userId'));
}

function getCountries(){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT Lv_countryId AS countryId,
                   Lv_ShortName AS ISO,
		           Lv_name AS countryName
            FROM Lv_countryBase";
    return $leverateConnect->fetchAll($sql,array('countryId'));        
}

function getLeverateTransactionsForCommission($dpStart,$dpEnd,$desk,$employee){
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT deposits.Lv_monetarytransactionId AS depositId,
	               methodOfPayment.Value AS methodOfPayment,
	               transactionType.Value AS transactionType,
	             --  transactionStatus.Value AS transactionStatus, 
	               CONVERT(DATETIME2(0),deposits.Lv_ApprovedOn) AS ApprovedOn,
	               deposits.Lv_TransactionApproved,
	               currencies.ISOCurrencyCode AS currency,
	               ROUND(deposits.Lv_Amount*(commissionSplits.Percentage/100),2) AS amount,
	               ROUND(deposits.Lv_USDValue*(commissionSplits.Percentage/100),2) AS amountUSD,
	               commissionSplits.Percentage AS percentage,
	               'Splitted' AS split,
	               '' AS change,
	               customers.AccountId AS customerId,
                   customers.Name AS customerName,
                   owners.SystemUserId AS employeeId,
                   owners.FullName AS transactionEmployee,
	               owners.Lv_isRetentionOwner,
	               businessUnit.Name AS businessUnit,
	               deposits.Lv_FirstTimeDeposit,
	               CASE WHEN (SELECT MIN(communications.CreatedOn) AS created FROM {$GLOBALS['leverate_CRM_DB']}.dbo.AnnotationBase AS communications
	                          LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS communicationOwners ON communicationOwners.SystemUserId=communications.ObjectId
		                      WHERE ObjectTypeCode=(SELECT ObjectTypeCode
                                                    FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                                                    WHERE BaseTableName = 'AccountBase'
                                                    GROUP BY ObjectTypeCode)
		                            AND CAST(communications.CreatedOn AS DATE) = CAST(deposits.Lv_ApprovedOn AS DATE)
			                        AND communications.ObjectId = deposits.lv_accountid
			                        AND communications.CreatedBy = ISNULL(changeDeposits.OwnerId,deposits.lean_TransactionOwner)
		                      GROUP BY communications.ObjectId) IS NOT NULL
			            THEN 'Yes'
			            ELSE 'No'
	               END	AS note
            FROM {$GLOBALS['leverate_CRM_DB']}.dbo.Lv_monetarytransactionBase AS deposits
            INNER JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.CommissionSplit AS commissionSplits ON commissionSplits.DepositId = deposits.Lv_monetarytransactionId
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'  
            LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.CommissionFullDeposit AS changeDeposits ON changeDeposits.DepositId = deposits.Lv_monetarytransactionId  
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.AccountBase AS customers ON customers.AccountId = deposits.lv_accountid 
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS owners ON owners.SystemUserId = commissionSplits.OwnerId
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = owners.BusinessUnitId
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId=1033
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId=1033 ". 
          //  ($GLOBALS['lfs'] ? "LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
            "WHERE deposits.Lv_type = 1 AND ".
             //      ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	              "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	               deposits.Lv_TransactionApproved = 1
	               AND owners.Lv_IsRetentionOwner = 1
	               AND deposits.Lv_MethodofPayment <> 1
	               AND deposits.Lv_ApprovedON BETWEEN CONVERT(datetime,'{$dpStart}T00:00:00.000') AND CONVERT(datetime,'{$dpEnd}T23:59:59.999')
	               AND customers.lv_accountstatus <> 2";
  if($desk)
     $sql .= " AND businessUnit.BusinessUnitId = '$desk'";
  if($employee)
     $sql .= " AND owners.SystemUserId = '$employee'";             
  $sql .= " UNION ALL
           SELECT deposits.Lv_monetarytransactionId AS depositId,
	              methodOfPayment.Value AS methodOfPayment,
	              transactionType.Value AS transactionType,
	          --    transactionStatus.Value AS transactionStatus, 
	              CONVERT(DATETIME2(0),deposits.Lv_ApprovedOn) AS ApprovedOn,
	              deposits.Lv_TransactionApproved,
	              currencies.ISOCurrencyCode AS currency,
	              ISNULL(ROUND(deposits.Lv_Amount*(1-commissionSplits.percentSum/100),2),deposits.Lv_Amount) AS amount,
	              ISNULL(ROUND(deposits.Lv_USDValue*(1-commissionSplits.percentSum/100),2),deposits.Lv_USDValue) AS amountUSD,
	              ISNULL(100-commissionSplits.percentSum,100) AS percentage,
	              CASE WHEN commissionSplits.percentSum IS NULL
                       THEN 'Split' 
			           ELSE 'Splitted'
	              END  AS split,
	              CASE WHEN  changeDeposits.FullDepositId IS NULL
	                   THEN 'Change'
			           ELSE 'Changed'
                  END AS change,
                  customers.AccountId AS customerId,
                  customers.Name AS customerName,
                  owners.SystemUserId AS employeeId,
                  owners.FullName AS transactionEmployee,
	              owners.Lv_isRetentionOwner,
	              businessUnit.Name AS businessUnit,
	              deposits.Lv_FirstTimeDeposit,
	              CASE WHEN (SELECT MIN(communications.CreatedOn) AS created FROM {$GLOBALS['leverate_CRM_DB']}.dbo.AnnotationBase AS communications
	                         LEFT JOIN Vincicm_MSCRM.dbo.SystemUserBase AS communicationOwners ON communicationOwners.SystemUserId=communications.ObjectId
		                     WHERE ObjectTypeCode = (SELECT ObjectTypeCode
                                                     FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                                                     WHERE BaseTableName = 'AccountBase'
                                                     GROUP BY ObjectTypeCode)
		                           AND CAST(communications.CreatedOn AS DATE) = CAST(deposits.Lv_ApprovedOn AS DATE)
			                       AND communications.ObjectId = deposits.lv_accountid
			                       AND communications.CreatedBy = ISNULL(changeDeposits.OwnerId,deposits.lean_TransactionOwner)
		                     GROUP BY communications.ObjectId) IS NOT NULL
			            THEN 'Yes'
			            ELSE 'No'
	              END	AS note

           FROM {$GLOBALS['leverate_CRM_DB']}.dbo.Lv_monetarytransactionBase AS deposits
           LEFT JOIN (SELECT DepositId, SUM(Percentage) AS percentSum 
                      FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.CommissionSplit
                      GROUP BY DepositId) AS commissionSplits ON commissionSplits.DepositId = deposits.Lv_monetarytransactionId
           LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'             
           LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.CommissionFullDeposit AS changeDeposits ON changeDeposits.DepositId = deposits.Lv_monetarytransactionId  
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.AccountBase AS customers ON customers.AccountId = deposits.lv_accountid 
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS owners ON owners.SystemUserId = ISNULL(changeDeposits.OwnerId,deposits.lean_TransactionOwner)
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = owners.BusinessUnitId
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = deposits.TransactionCurrencyId
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = deposits.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId=1033  
           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = deposits.Lv_MethodofPayment AND methodOfPayment.LangId=1033 ". 
         //  ($GLOBALS['lfs'] ? "LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.StringMapBase As transactionStatus ON transactionStatus.ObjectTypeCode = objects.ObjectTypeCode AND transactionStatus.AttributeName = 'lxlite_MonetaryTransactionStatus' AND transactionStatus.AttributeValue = deposits.lxlite_MonetaryTransactionStatus " : ""). 
           "WHERE deposits.Lv_type = 1 AND ".
             //      ($GLOBALS['lfs'] ? "transactionStatus.Value = 'Approved' AND " : "").
	             "deposits.lv_TradingPlatformTransactionId IS NOT NULL AND
	              deposits.Lv_TransactionApproved = 1
	              AND owners.Lv_IsRetentionOwner = 1
	              AND deposits.Lv_MethodofPayment <> 1
	              AND deposits.Lv_ApprovedON BETWEEN CONVERT(datetime,'{$dpStart}T00:00:00.000') AND CONVERT(datetime,'{$dpEnd}T23:59:59.999')
	              AND customers.lv_accountstatus <> 2";
	if($desk)
       $sql .= " AND businessUnit.BusinessUnitId = '$desk'";
    if($employee)
       $sql .= " AND owners.SystemUserId = '$employee'";
    
    return $leverateConnect->fetchAll($sql,array('depositId','customerId','employeeId'));              	
}

function getAllCommissionBonuses($dpStart, $dpEnd, $desk, $employee)
{
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);  
    
    $chosen_month = date("Y-m-01", strtotime($dpEnd));
    $next_month = date("Y-m-d", strtotime($dpEnd . " first day of 1 month"));
    $data =array();
    
    $sql = "SELECT Rate FROM CommissionCurrencyRate
            WHERE Month='$chosen_month'";
	$currency_rate = $leverateConnect->fetchAll($sql);
	
	$data['currency_rate'] = is_numeric($currency_rate[0]['Rate']) ? $currency_rate[0]['Rate'] : false;		 
	
    $sql = " SELECT SUM(retentionPaid.Amount) AS amount
	 	     FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.RetentionPaid AS retentionPaid
	 	     LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS employees ON employees.SystemUserId = retentionPaid.employeeId
	 	     WHERE retentionPaid.Date=DATEFROMPARTS(year('$dpEnd'),month('$dpEnd'),1)";
		 
    if ($employee != '0')
        $sql .= " AND retentionPaid.EmployeeId='$employee'";

    if ($desk != '0')
        $sql .= " AND employees.BusinessUnitId ='$desk'";
	
	$paid = $leverateConnect->fetchAll($sql);
	
	$data['paid'] = is_numeric($paid[0]['amount']) ? $paid[0] : false;
	
	$bonusTypes = array('Extra Bonus','Withdrawal','Postponed Sale','Commission Deduction','Other Bonus');
	$sql = "";
	$last_key = end(array_keys($bonusTypes));
	
	foreach($bonusTypes as $key=>$bonusType){
		$bonus = getCommissionBonusTableName($bonusType);
		
		$sql .= " SELECT employees.SystemUserId AS employeeId,
	                employees.FullName AS employee,
	                bonus.Date AS date,
	                currencies.CurrencyCode AS currency,
	                bonus.Amount AS amount,
	                paymentMethod.Name AS paymentMethod,
	                '$bonusType' AS status
	                FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.{$bonus['bonusTable']} AS bonus
	                LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS employees ON employees.SystemUserId=bonus.EmployeeId
	                LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.Currency AS currencies ON currencies.CurrencyId=bonus.Currency
	                LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.PaymentMethod AS paymentMethod ON paymentMethod.MethodId=bonus.PaymentMethodId
	                WHERE bonus.Date BETWEEN '$dpStart' AND '$dpEnd' ";
       if ($employee != '0')
          $sql .= " AND bonus.EmployeeId='$employee'"; 

       if ($desk != '0')
          $sql .= " AND employees.BusinessUnitId ='$desk'";
	   
	   if($last_key != $key)
	      $sql .= " UNION ALL ";
	   	
	 }
	     
     $sql .= " UNION ALL
               SELECT employees.SystemUserId AS employeeId,
            	      employees.FullName AS employee,
	                  retentionDifference.Date AS date,
	                  '' AS currency,
	                  CAST(retentionDifference.Amount AS DECIMAL(10,3)) AS amount,
	                  '' AS paymentMethod,
	                  'Retention Difference' AS status
	           FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.RetentionDifference AS retentionDifference
	           LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS employees ON employees.SystemUserId=retentionDifference.EmployeeId
	           WHERE retentionDifference.Date BETWEEN '$chosen_month' AND '$next_month'";

    if ($employee != '0')
          $sql .= " AND retentionDifference.EmployeeId='$employee'";

    if ($desk != '0')
          $sql .= " AND employees.BusinessUnitId ='$desk'";
     
	$bonuses = $leverateConnect->fetchAll($sql,array('employeeId'));
    $data['bonuses'] = $bonuses;
    $data['rates'] = getAgentRates($employee, null, true);
    
    return $data;

}

function getCommissionBonusTableName($bonusType){
	switch($bonusType){
       case 'Extra Bonus':
          $bonusTable = "CommissionExtraBonus";
          $idField = "ExtraBonusId";
          break;
	    
	   case 'Withdrawal':
          $bonusTable = "CommissionPenalty";
          $idField = "PenaltyId";
          break;
          
       case 'Postponed Sale':
          $bonusTable = "CommissionPostponedSale";
          $idField = "PostponedSaleId";
          break;
		  
	   case 'Commission Deduction':
          $bonusTable = "CommissionFine";
          $idField = "FineId";
          break;
       
       case 'Other Bonus':
          $bonusTable = "CommissionOtherBonus";
          $idField = "OtherBonusId";
          break;         		  
    }
    
	return array("bonusTable" => $bonusTable , "idField" => $idField);
}

function getCommissionBonus($dpStart, $dpEnd, $desk, $employee,$bonusType){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
    $bonus = getCommissionBonusTableName($bonusType);

	$sql = "SELECT bonus.{$bonus['idField']} AS id,
                   currency.CurrencyCode AS currency,
                   bonus.Amount AS amount,
                   crmUser.FullName AS employee,
                   bonus.Reason AS reason,
                   paymentMethods.Name AS type, 
                   bonus.Date As date
            FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.{$bonus['bonusTable']} AS bonus
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS crmUser ON crmUser.SystemUserId=bonus.EmployeeId
            LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.BusinessUnitBase AS desks ON desks.BusinessUnitId=crmUser.BusinessUnitId
            LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.PaymentMethod AS paymentMethods ON paymentMethods.MethodId = bonus.PaymentMethodId
            LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.Currency AS currency ON currency.CurrencyId = bonus.Currency
            WHERE bonus.Date BETWEEN '$dpStart' AND '$dpEnd' ";
	if($desk)
	   $sql .= " AND crmUser.BusinessUnitId ='$desk'";
	if($employee)
	   $sql .= " AND crmUser.SystemUserId = '$employee' ";
	
	return $leverateConnect->fetchAll($sql);		
}

function getCommissionDifference($dpEnd, $desk, $employee){
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);

    $sql = " SELECT  difference.RetentionDifferenceId AS id,
	 	             employees.FullName AS employeeName,
	 	             difference.Date AS date,
	 	             CAST(difference.Amount AS DECIMAL(15,3)) AS amount           
	 	     FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.RetentionDifference AS difference
	 	     LEFT JOIN {$GLOBALS['leverate_CRM_DB']}.dbo.SystemUserBase AS employees ON employees.SystemUserId=difference.EmployeeId
	 	     WHERE difference.Date=DATEFROMPARTS(year('$dpEnd'),month('$dpEnd'),1)";

    if($desk)
	   $sql .= " AND employees.BusinessUnitId ='$desk'";
	if($employee)
	   $sql .= " AND employees.SystemUserId = '$employee'";
	
	return $leverateConnect->fetchAll($sql);   
}

function addCommissionSplit($split, $transactionId){
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    $last_key = end(array_keys($split));
    
    $sql = "SELECT SplitId FROM dbo.CommissionSplit WHERE DepositId='$transactionId'";
	
	$splitted = $leverateConnect->fetchAll($sql);
	if($splitted)
	   return 'Already Splitted';
	    
    $sql = "INSERT INTO dbo.CommissionChangeLog (Type,Action,DepositId,OwnerId,Percentage) VALUES ";
    foreach($split as $key=>$value){
    	$sql .= " ('split','add','$transactionId','{$split[$key]['employee']}',{$split[$key]['percent']}) ";
    	if($key!=$last_key) 
    	   $sql .= " , ";
    }
    
    $result = $leverateConnect->exec($sql);
    
    if(!$result)
       return false;
       
    $sql = "INSERT INTO dbo.CommissionSplit (DepositId,OwnerId,Percentage) VALUES ";
    foreach($split as $key=>$value){
    	$sql .= " ('$transactionId','{$split[$key]['employee']}',{$split[$key]['percent']}) ";
    	if($key!=$last_key) 
    	   $sql .= " , ";
    }
	
    return $leverateConnect->exec($sql);
}

function addCommissionBonus($bonusType,$bonusDate,$bonusEmployee,$bonusCurrency,$bonusAmount,$bonusPaymentMethod,$bonusReason,$extra_bonusMonth){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
	
	$bonus = getCommissionBonusTableName($bonusType);
	$bonusReason = str_replace("'", "''", $bonusReason);
	$sql = "INSERT INTO dbo.{$bonus['bonusTable']} (Currency,Amount,Date,Reason,EmployeeId,PaymentMethodId) 
	        VALUES ($bonusCurrency,$bonusAmount,'$bonusDate','$bonusReason','$bonusEmployee',$bonusPaymentMethod)";
	
	$bonusResultId = $leverateConnect->execID($sql);
	
	if($extra_bonusMonth && $bonusResultId){
		
		$sql = "INSERT INTO dbo.CommissionExtraBonus (Currency,Amount,Date,Reason,EmployeeId,PaymentMethodId)
		        VALUES ($bonusCurrency,$bonusAmount,'{$extra_bonusMonth}-01','$bonusReason','$bonusEmployee',$bonusPaymentMethod)";
		$extraBonusId = $leverateConnect->execID($sql);
		
		if(!$extraBonusId){
			return false;
		}
		$sql = "INSERT INTO dbo.CommissionAutoPostpone (PostponedSaleId,ExtraBonusId)
		        VALUES ($bonusResultId,$extraBonusId)";
		return $leverateConnect->exec($sql);		     
	}
	return $bonusResultId;
}

function addCommissionPaid($date, $employee, $amount){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
	
	$sql = "UPDATE dbo.RetentionPaid
	 	    SET Amount=$amount
	 	    WHERE Date='{$date}-01' AND EmployeeId='$employee'";
    if (($result = $leverateConnect->affectedRows($sql)) == 0) {
        $sql = "INSERT INTO dbo.RetentionPaid (EmployeeId,Amount,Date) VALUES ('$employee',$amount, '{$date}-01')";
        $result = $leverateConnect->exec($sql);
    }

    return $result;
}

function addCommissionDifference($date, $employee, $amount){
		
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    
    $sql = "SELECT Amount
	  	    FROM dbo.RetentionDifference AS retentionDifference
	  	    WHERE Date='{$date}-01' AND EmployeeId='$employee'";
    $check = $leverateConnect->fetchAll($sql);
    if (isset($check[0]) && $check[0]['amount'] == $amount) {
        return 'Difference is already added';
    }
    $sql = "UPDATE dbo.RetentionDifference 
	 	    SET Amount=$amount
	 	    WHERE Date='{$date}-01' AND EmployeeId='$employee'";
    if (($result = $leverateConnect->affectedRows($sql)) == 0) {
        $sql = "INSERT INTO dbo.RetentionDifference (EmployeeId,Amount,Date) VALUES ('$employee',$amount, '{$date}-01')";
        $result = $leverateConnect->exec($sql);
    }

    return $result;
}

function addCommissionChangeEmployee($transactionId,$changeEmployee){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    
    $sql = "SELECT FullDepositId FROM dbo.CommissionFullDeposit WHERE DepositId='$transactionId'";
	
	$changed = $leverateConnect->fetchAll($sql);
	if($changed)
	   return 'Already Changed';
	
	$sql = "INSERT INTO dbo.CommissionChangeLog (Type,Action,DepositId,OwnerId) VALUES 
            ('change','add','$transactionId','$changeEmployee') ";
    
    $result = $leverateConnect->exec($sql);
    
    if(!$result)
       return false;
	
	$sql = "INSERT INTO dbo.CommissionFullDeposit (DepositId,OwnerId) VALUES ('$transactionId','$changeEmployee') ";
    	
    return $leverateConnect->exec($sql);
}

function deleteCommissionBonus($id,$bonusType){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
	
	$bonus = getCommissionBonusTableName($bonusType);
	
	$sql = "DELETE FROM dbo.{$bonus['bonusTable']} WHERE {$bonus['idField']} = $id";
	$result = $leverateConnect->exec($sql);
	if(!$result){
	  return false;	
	}
	if($bonusType=='Extra Bonus' || $bonusType=='Postponed Sale'){
		$bonus = getCommissionBonusTableName($bonusType);
		$complementBonusType = $bonusType=='Extra Bonus' ? 'Postponed Sale' : 'Extra Bonus';
		$complementBonus = getCommissionBonusTableName($complementBonusType);
		 
		$sql = "SELECT * FROM dbo.CommissionAutoPostpone WHERE {$bonus['idField']} = $id";
		$auto_postponed = $leverateConnect->fetchAll($sql);
		if(isset($auto_postponed[0])){
			$sql = "DELETE FROM dbo.{$complementBonus['bonusTable']} WHERE {$complementBonus['idField']} = ".$auto_postponed[0][$complementBonus['idField']];
		    $deleteComplement = $leverateConnect->exec($sql);
			if(!$deleteComplement)
				return false;
			$sql = "DELETE FROM dbo.CommissionAutoPostpone WHERE {$bonus['idField']} = $id";
			$deleteAutoPostponed = $leverateConnect->exec($sql);
			if(!$deleteAutoPostponed)
				return false;
		}
	  }
	  
	  return true;   
}

function deleteCommissionDifference($id){		
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);

    $sql = "DELETE FROM dbo.RetentionDifference WHERE RetentionDifferenceId=$id";

    return $leverateConnect->exec($sql);	
}

function deleteCommissionSplit($transactionId){
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    
	$sql = "SELECT * FROM dbo.CommissionSplit WHERE DepositId='$transactionId'";
	 
	$split = $leverateConnect->fetchAll($sql,array('DepositId','OwnerId'));
	if(!$split)
	  return 'Already Deleted';
	  
	$last_key = end(array_keys($split));
	$sql = "INSERT INTO dbo.CommissionChangeLog (Type,Action,DepositId,OwnerId,Percentage) VALUES ";
    foreach($split as $key=>$value){
    	$sql .= " ('split','delete','$transactionId','{$split[$key]['OwnerId']}',{$split[$key]['Percentage']}) ";
    	if($key!=$last_key) 
    	   $sql .= " , ";
    }
    
    $result = $leverateConnect->exec($sql);
    
    if(!$result)
       return false;
       
    $sql = "DELETE FROM dbo.CommissionSplit WHERE DepositId='$transactionId'";
	
	return $leverateConnect->exec($sql);
}

function deleteCommissionChangeEmployee($transactionId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    
	$sql = "SELECT * FROM dbo.CommissionFullDeposit WHERE DepositId='$transactionId'";
	 
	$change = $leverateConnect->fetchAll($sql,array('DepositId','OwnerId'));
	if(!$change)
	  return 'Already Deleted';
	  
	$sql = "INSERT INTO dbo.CommissionChangeLog (Type,Action,DepositId,OwnerId) VALUES 
            ('change','delete','$transactionId','{$change[0]['OwnerId']}') ";
    
    $result = $leverateConnect->exec($sql);
    
    if(!$result)
       return false;
       
    $sql = "DELETE FROM dbo.CommissionFullDeposit WHERE DepositId='$transactionId'";
	
	return $leverateConnect->exec($sql);
}

function getStringData($table,$field){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT AttributeValue AS id, 
	               value
	        FROM StringMapBase smb
	        WHERE smb.ObjectTypeCode = (SELECT TOP 1 ObjectTypeCode
                                        FROM MetadataSchema.Entity
                                        WHERE BaseTableName = '$table')
				  AND LangId = 1033						
                  AND AttributeName = '$field'
            ORDER BY id";
	return $leverateConnect->fetchAll($sql);			  
}

function getLeverateCampaigns(){    
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	 
    $sql = "SELECT Lv_UtmCampaign AS name 
            FROM AccountBase 
            GROUP BY Lv_UtmCampaign";
    return $leverateConnect->fetchAll($sql);
}

function getLeverateTransactions($dpStart,$dpEnd,$campaigns,$desk,$employee,$current){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = " SELECT transactions.Lv_monetarytransactionId AS transactionId,
                    tpAccounts.Lv_name AS tpAccount,
                    countries.Lv_name AS country,
	                methodOfPayment.Value AS methodOfPayment,
	                transactionType.Value AS transactionType,
	               -- transactions.lv_TradingPlatformTransactionId AS tpTransactionId,
	                transactions.Lv_TransactionReference AS trReference,
	                CONVERT(DATETIME2(0),transactions.Lv_ApprovedOn) AS ApprovedOn,
	                transactionApproved.Value AS transactionApproved,
	                currencies.ISOCurrencyCode AS currency,
	                transactions.Lv_Amount AS amount,
	                transactions.Lv_USDValue AS amountUSD,
	                customers.Lv_UtmCampaign AS campaign,
	                customers.AccountId AS customerId,
                    customers.Name AS customerName,
                    CASE WHEN (SELECT MIN(previous.Lv_ApprovedOn)
	                           FROM Lv_monetarytransactionBase AS previous
				               WHERE previous.Lv_TransactionApproved = 1
				                     AND previous.Lv_MethodofPayment<>1
				                     AND previous.lv_TradingPlatformTransactionId IS NOT NULL
						             AND previous.lv_accountid = customers.AccountId
						             AND previous.Lv_ApprovedOn < transactions.Lv_ApprovedOn
						             AND previous.Lv_Type = 1) IS NULL 
				               AND transactionType.Value = 'Deposit'
				               AND methodOfPayment.Value <> 'Internal'
				               AND transactions.lv_TradingPlatformTransactionId IS NOT NULL  
	                     THEN 'Yes'
			             ELSE 'No'     
	                END AS FTD,
	                CASE WHEN transactions.lv_TradingPlatformTransactionId IS NOT NULL
	                     THEN 'Yes'
	                     ELSE 'No'
	                END AS tpAccountUpdate,     
	                transactionEmployees.FullName AS transactionEmployee,
	                currentEmployees.FullName AS currentEmployee,
	                businessUnit.Name AS businessUnit
	                
             FROM Lv_monetarytransactionBase AS transactions
             LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                        FROM MetadataSchema.Entity
                        GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
             LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = transactions.lv_tpaccountId 
             LEFT JOIN AccountBase AS customers ON customers.AccountId = transactions.lv_accountid
             LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = customers.Lv_countryId
             LEFT JOIN {$GLOBALS['inventiva_CRM_DB']}.dbo.CommissionFullDeposit AS changeEmployee ON changeEmployee.DepositId = transactions.Lv_monetarytransactionid 
             LEFT JOIN SystemUserBase AS transactionEmployees ON transactionEmployees.SystemUserId = ISNULL(changeEmployee.DepositId,transactions.lean_TransactionOwner)
             LEFT JOIN SystemUserBase AS currentEmployees ON currentEmployees.SystemUserId = customers.OwnerId
             LEFT JOIN BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = ".($current ? "currentEmployees" : "transactionEmployees").".BusinessUnitId  
             LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = transactions.TransactionCurrencyId
             LEFT JOIN StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033
             LEFT JOIN StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 
             LEFT JOIN StringMapBase AS transactionApproved ON transactionApproved.ObjectTypeCode = objects.ObjectTypeCode AND transactionApproved.AttributeName = 'Lv_TransactionApproved' AND transactionApproved.AttributeValue = transactions.Lv_TransactionApproved AND transactionApproved.LangId = 1033 
             WHERE transactions.Lv_TransactionApproved = 1
                 --  AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
                   AND customers.lv_accountstatus <> 2
                   AND customers.Lv_FirstName NOT LIKE '%test%'
                   AND customers.Lv_FirstName NOT LIKE '%firstname%'  
				   AND customers.Lv_LastName NOT LIKE '%test%'
				   AND customers.Lv_LastName NOT LIKE '%lastname%'
                   AND transactions.Lv_ApprovedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'";
     if($desk)
     	$sql .= " AND businessUnit.BusinessUnitId = '$desk'";
     if($employee)
        $sql .= " AND ".($current ? "currentEmployees" : "transactionEmployees").".SystemUserId = '$employee'";
     if($campaigns)
        $sql .= " AND customers.Lv_UtmCampaign IN ('".implode("','",$campaigns)."')";
     return $leverateConnect->fetchAll($sql,array('transactionId','customerId'));      	              
                   
}

function getRealPNLByAgents($startDate,$endDate,$employee){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT CASE WHEN ISNULL((SELECT MAX(audit.CreatedOn) 
                           FROM AuditBase AS audit 
                           LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                      FROM MetadataSchema.Attribute AS att 
			                          INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                           GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                           LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                      FROM MetadataSchema.Entity
                                      GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                           LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                           LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                           WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                 AND operationType.Value = 'Update'
		                         AND accounts.AccountId = auditAccounts.AccountId
		                         AND audit.CreatedOn < auditCustomer.CreatedOn) 
		                  ,auditAccounts.CreatedOn) >= '$startDate 00:00:00'
		                  THEN ISNULL((SELECT MAX(audit.CreatedOn) 
                           FROM AuditBase AS audit 
                           LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                      FROM MetadataSchema.Attribute AS att 
			                          INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                           GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                           LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                      FROM MetadataSchema.Entity
                                      GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                           LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                           LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                           WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                 AND operationType.Value = 'Update'
		                         AND accounts.AccountId = auditAccounts.AccountId
		                         AND audit.CreatedOn < auditCustomer.CreatedOn) 
		                  ,auditAccounts.CreatedOn)
		                  ELSE '$startDate 00:00:00'
		                  END   AS fromDate,
		                  CASE WHEN auditCustomer.CreatedOn > '$endDate 23:59:59'
				                     THEN '$endDate 23:59:59'
						       ELSE auditCustomer.CreatedOn
				          END	AS toDate,
                          tpAccounts.Lv_name AS tpAccount, 
                          auditAccounts.AccountId,
                          auditAccounts.Name AS customerName,   
	                      oldOwner.FullName AS Owner,
	                      'No' AS isCurrentOwner
                    FROM AuditBase AS auditCustomer 
                    LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                               FROM MetadataSchema.Attribute AS att 
			                   INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                               GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                    LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                               FROM MetadataSchema.Entity
                               GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase'
                    LEFT JOIN StringMapBase AS actionType ON actionType.ObjectTypeCode = auditObject.ObjectTypeCode AND actionType.AttributeValue = auditCustomer.Action AND actionType.AttributeName = 'Action' 
                    LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = auditCustomer.Operation AND operationType.AttributeName = 'Operation' 
                    LEFT JOIN AccountBase AS auditAccounts ON auditAccounts.AccountId = auditCustomer.ObjectId
                    LEFT JOIN SystemUserBase AS oldOwner ON oldOwner.SystemUserId = Tools.dbo.customSplit(auditCustomer.ChangeData, ',', 2)
					LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.lv_accountid = auditAccounts.AccountId
                    LEFT JOIN Lv_tradingplatformBase AS tradingPlatforms ON tradingPlatforms.Lv_tradingplatformId = tpAccounts.lv_tradingplatformid
                    WHERE auditCustomer.ObjectTypeCode=aoField.ObjectTypeCode AND auditCustomer.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                          AND operationType.Value = 'Update'
		                  AND auditAccounts.AccountId IS NOT NULL
						  AND auditCustomer.CreatedOn >= '$startDate 00:00:00'
						  AND tradingPlatforms.Lv_TradingType = 2
						  AND oldOwner.Lv_IsRetentionOwner = 1
						  AND auditAccounts.Lv_FTDExist = 1 
						  AND ISNULL((SELECT MAX(audit.CreatedOn) 
                           FROM AuditBase AS audit 
                           LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                      FROM MetadataSchema.Attribute AS att 
			                          INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                           GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                           LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                      FROM MetadataSchema.Entity
                                      GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                           LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                           LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                           WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                 AND operationType.Value = 'Update'
		                         AND accounts.AccountId = auditAccounts.AccountId
		                         AND audit.CreatedOn < auditCustomer.CreatedOn) 
		                  ,auditAccounts.CreatedOn) <= '$endDate 23:59:59'";
		    if($employee)					  
		$sql .= " AND oldOwner.SystemUserId = '$employee'";              
           $sql.=" UNION ALL
            SELECT CASE WHEN ISNULL((SELECT MAX(audit.CreatedOn) 
                                     FROM AuditBase AS audit 
                                     LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                                FROM MetadataSchema.Attribute AS att 
			                                    INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                                GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                                     LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                                FROM MetadataSchema.Entity
                                                GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                                     LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                                     LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                                     WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                           AND operationType.Value = 'Update'
		                                   AND accounts.AccountId = auditCustomer.AccountId) 
		                            ,auditCustomer.CreatedOn) >= '$startDate 00:00:00'
		                THEN ISNULL((SELECT MAX(audit.CreatedOn) 
                                     FROM AuditBase AS audit 
                                     LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                                FROM MetadataSchema.Attribute AS att 
			                                    INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                                GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                                     LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                                FROM MetadataSchema.Entity
                                                GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                                     LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                                     LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                                     WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                           AND operationType.Value = 'Update'
		                                   AND accounts.AccountId = auditCustomer.AccountId) 
		                            ,auditCustomer.CreatedOn)
						ELSE '$startDate 00:00:00'			
		           END AS fromDate,
		           CASE WHEN GETDATE() > '$endDate 23:59:59'
				        THEN '$endDate 23:59:59'
						ELSE GETDATE()
				   END	AS toDate,
		           tpAccounts.Lv_name AS tpAccount,
		           auditCustomer.AccountId,
                   auditCustomer.Name AS customerName,
		           owners.FullName AS Owner,
				   'Yes' AS isCurrentOwner
            FROM AccountBase AS auditCustomer
            LEFT JOIN SystemUserBase AS owners ON owners.SystemUserId = auditCustomer.OwnerId
            LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.lv_accountid = auditCustomer.AccountId
            LEFT JOIN Lv_tradingplatformBase AS tradingPlatforms ON tradingPlatforms.Lv_tradingplatformId = tpAccounts.lv_tradingplatformid
            WHERE tradingPlatforms.Lv_TradingType = 2
                  AND owners.Lv_IsRetentionOwner = 1
                  AND auditCustomer.Lv_FTDExist = 1
			      AND ISNULL((SELECT MAX(audit.CreatedOn) 
                              FROM AuditBase AS audit 
                              LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                         FROM MetadataSchema.Attribute AS att 
			                             INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                         GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
                              LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                         FROM MetadataSchema.Entity
                                         GROUP BY BaseTableName, ObjectTypeCode) AS auditObject ON auditObject.BaseTableName = 'AuditBase' 
                              LEFT JOIN StringMapBase AS operationType ON operationType.ObjectTypeCode = auditObject.ObjectTypeCode AND operationType.AttributeValue = audit.Operation AND operationType.AttributeName = 'Operation' 
                              LEFT JOIN AccountBase AS accounts ON accounts.AccountId = audit.ObjectId
                              WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                    AND operationType.Value = 'Update'
		                            AND accounts.AccountId = auditCustomer.AccountId) 
		                     ,auditCustomer.CreatedOn) <= '$endDate 23:59:59'";
     if($employee)
          $sql .= " AND owners.SystemUserId = '$employee'";
          	      
	 return $sql; 
}

function getAgentPortfolio($employee,$fdd,$countries,$leadStatus,$accountStatus,$withdrawal,$redeposit,$totalDeposits){
	 $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	 
	 $sql = "SELECT accounts.AccountId AS customerId,
	                accounts.Name AS customerName,
	                accounts.EMailAddress1 AS email,
	                countries.Lv_name AS country,
	                CONVERT(DATETIME2(0),accounts.CreatedOn) AS regTime,
	                deposits.fdd,  
                    CASE WHEN countTransactions> 1
			             THEN 'Yes'
			             ELSE 'No'
                    END AS redeposit,
	                leadStatus.Value AS leadStatus,
	                accountStatus.Value AS accountStatus,
	                statusCode.Value AS status,
	                accounts.lv_utmcampaign AS campaign,
	                employees.FullName AS employee,
	                desks.Name AS desk
            FROM AccountBase AS accounts
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'AccountBase'
            LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
            LEFT JOIN (SELECT transactions.lv_accountid, 
                              MIN(CONVERT(DATETIME2(0),transactions.Lv_ApprovedOn)) AS fdd,
				              COUNT(transactions.Lv_monetarytransactionId) AS countTransactions
	                   FROM Lv_monetarytransactionBase AS transactions
		               WHERE transactions.Lv_Type = 1
		                     AND transactions.Lv_MethodofPayment<>1
			                 AND transactions.Lv_TransactionApproved = 1
			                 AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
		               GROUP BY lv_accountid) AS deposits ON deposits.lv_accountid = accounts.AccountId
		    LEFT JOIN (SELECT transactions.lv_accountid,
		                      COUNT(Lv_monetarytransactionId) AS countWithdrawal, 
                              SUM(CASE WHEN transactions.Lv_TransactionApproved = 0
                                       THEN 1
                                       ELSE 0
                                  END) AS notApproved,
                              SUM(CASE WHEN transactions.Lv_TransactionApproved = 1 AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
                                       THEN 1
                                       ELSE 0
                                  END) AS approved         
	                   FROM Lv_monetarytransactionBase AS transactions
		               WHERE transactions.Lv_Type = 9
		                     AND transactions.Lv_MethodofPayment<>1
		               GROUP BY lv_accountid) AS withdrawals ON withdrawals.lv_accountid = accounts.AccountId                      
            LEFT JOIN SystemUserBase AS employees ON employees.SystemUserId = accounts.OwnerId
            LEFT JOIN BusinessUnitBase AS desks ON desks.BusinessUnitId = employees.BusinessUnitId
            LEFT JOIN StringMapBase AS leadStatus ON leadStatus.ObjectTypeCode = objects.ObjectTypeCode AND leadStatus.AttributeValue = accounts.lv_leadstatus AND leadStatus.AttributeName = 'lv_leadstatus' AND leadStatus.LangId = 1033
            LEFT JOIN StringMapBase AS accountStatus ON accountStatus.ObjectTypeCode = objects.ObjectTypeCode AND accountStatus.AttributeValue = accounts.lv_accountstatus AND accountStatus.AttributeName = 'lv_accountstatus' AND accountStatus.LangId = 1033
            LEFT JOIN StringMapBase AS statuscode ON statuscode.ObjectTypeCode = objects.ObjectTypeCode AND statuscode.AttributeValue = accounts.statuscode AND statuscode.AttributeName = 'statuscode' AND statuscode.LangId = 1033
            WHERE employees.SystemUserId = '$employee'";
     if($fdd === '0'){    
     	$sql .= " AND CONVERT(nvarchar(7),deposits.fdd, 126) <> CONVERT(nvarchar(7),GETDATE(), 126)";
     }else if($fdd === '1'){
     	$sql .= " AND CONVERT(nvarchar(7),deposits.fdd, 126) = CONVERT(nvarchar(7),GETDATE(), 126)";
     }
     if($countries){
     	$sql .= " AND countries.Lv_countryId IN ('".implode("','",$countries)."')";
     }
     if($leadStatus){
     	$sql .= " AND accounts.Lv_LeadStatus IN (".implode(",",$leadStatus).")";
     }
     if($accountStatus){
     	$sql .= " AND accounts.lv_accountstatus IN (".implode(",",$accountStatus).")";
     }
     if($redeposit === '0'){
        $sql .= " AND (deposits.countTransactions IS NULL OR deposits.countTransactions <= 1)";
	 }else if($redeposit === '1'){
        $sql .= " AND deposits.countTransactions > 1";
     }
     if($withdrawal == 'never'){
     	$sql .= " AND (withdrawals.countWithdrawal IS NULL OR withdrawals.countWithdrawal = 0)";
     }else if($withdrawal == 'notApproved'){
     	$sql .= " AND withdrawals.notApproved > 0";
     }else if($withdrawal == 'approved'){
     	$sql .= " AND withdrawals.approved > 0";
     }   
        	 
     $customers = $leverateConnect->fetchAll($sql,array('customerId'));
     if(empty($customers))
        return array();
     $customerIds = array();
     foreach($customers as $key=>$value){
     	$customerIds[]=$value['customerId'];
     }   
     $tpAccounts = getActiveTPAccounts($customerIds,$leverateConnect);
     foreach($customers as $key=>$value){
     	$customers[$key]['tpAccounts'] = array();
     	foreach($tpAccounts as $tpKey=>$tpValue){
     		if($value['customerId']==$tpValue['accountId']){
     			$customers[$key]['tpAccounts'][] = $tpValue;
     		}
     	}
     }
     
     return $customers;          
}

function portfolioSummary($customers){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT transactions.lv_accountid AS accountId,
                   tpAccounts.Lv_name AS tpAccount,
                   currencies.ISOCurrencyCode AS currency, 
	               methodOfPayment.Value AS methodOfPayment,
	               transactionType.Value AS transactionType,
	               transactions.Lv_Amount AS amount
            FROM Lv_monetarytransactionBase AS transactions
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
            LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = transactions.lv_tpaccountId
            LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = transactions.TransactionCurrencyId 
            LEFT JOIN StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
            LEFT JOIN StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 
            WHERE transactions.lv_accountid IN ('".implode("','",$customers)."') AND 
	              transactions.lv_TradingPlatformTransactionId IS NOT NULL AND
	              transactions.Lv_TransactionApproved = 1";
	return $leverateConnect->fetchAll($sql,array('accountId'));  
}

function customerSearch($search){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$search = str_replace('_','[_]',$search);
	$search = str_replace('%','[%]',$search);
	$search = str_replace( "'", "''", $search);
	$search = mb_convert_encoding($search, 'Windows-1252', 'UTF-8');
	$fields = array("accounts.Lv_FirstName","accounts.Lv_LastName","accounts.Name","accounts.EMailAddress1","tPlatformAccounts.Lv_name");
	$last_key = end(array_keys($fields));	
	$sql = "SELECT TOP 1000 
	                 accounts.AccountId AS customerId, 
                     accounts.Lv_FirstName AS firstName,
	                 accounts.Lv_LastName AS lastName,
	                 accounts.EMailAddress1 AS email,
                     CAST(STUFF((SELECT ','+tpAccounts.Lv_name 
	                                    FROM Lv_tpaccountBase AS tpAccounts 
			                            WHERE tpAccounts.lv_accountid=accounts.AccountId 
			                            FOR XML PATH('')) , 1 , 1 , '' ) AS TEXT) AS tpAccounts
              FROM AccountBase AS accounts
              LEFT JOIN Lv_tpaccountBase AS tPlatformAccounts ON tPlatformAccounts.lv_accountid = accounts.AccountId
              WHERE ";
	foreach($fields as $key=>$value){
	   	$sql .= " {$value} LIKE N'{$search}%' COLLATE SQL_Latin1_General_CP1_CI_AS";
	   	if($key!=$last_key){
	   		$sql .=" OR ";
	   	}
	   		
	}
	$sql .= " GROUP BY accounts.AccountId, accounts.Lv_FirstName, accounts.Lv_LastName, accounts.EMailAddress1";
//	return $sql;
	return $leverateConnect->fetchAll($sql,array('customerId'));   	
	
}

function assignAccountOwner($customer,$employee){
	require_once "inc/leverate/leverateApi.php";
	
	$leadStatus = array('Value'=>'1','Name'=>'New');
	
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$sql = "SELECT AccountId,
	               OwnerId,
	               Lv_LeadStatus
	        FROM AccountBase
	        WHERE AccountId ='{$customer}'";
	$currentValues = $leverateConnect->fetchAll($sql,array('AccountId','OwnerId'));
	$currentValues = $currentValues[0];
	if($employee == $currentValues['OwnerId'] && $leadStatus['Value'] == $currentValues['Lv_LeadStatus'])
	    return array('Code'=>'Success', 'response'=>'The changes are same as current values');
	    
	$leverateApi = new leverateApi($GLOBALS['brandName']);
	
	$result = $leverateApi->AssignAccountOwner($customer,$employee,$leadStatus);
	if(get_class($result) == 'ResultInfo' && $result->Code == 'Success')
	{
	   $apiCCL = array();	
	   if($employee != $currentValues['OwnerId'])
	       $apiCCL[] = array('accountId'=>$customer,'type'=>'OwnerId','oldValue'=>$currentValues['OwnerId'],'newValue'=>$employee);
	   if($leadStatus['Value'] != $currentValues['Lv_LeadStatus'])
	       $apiCCL[] = array('accountId'=>$customer,'type'=>'lv_leadstatus','oldValue'=>$currentValues['Lv_LeadStatus'],'newValue'=>$leadStatus['Value']);
	   setApiCustomerChangeLog($apiCCL,$leverateConnect);        	
	   for($count = 0; $count<10 ; $count++){
	   	   $updatedData = getUpdatedData($customer,$leverateConnect);
	   	   $newOwner = $updatedData['OwnerId'];	
	   	   if($employee == $updatedData['OwnerId'] && $leadStatus['Value'] == $updatedData['lv_leadstatus']){
	   	   	   break;
	   	   }
	   	   sleep(1);
	   }	   
    }	
	return $result;
}

function getUpdatedData($customer,$leverateConnect){
	$sql = "SELECT OwnerId, 
	               lv_leadstatus,
	               Lv_FirstName,
	               Lv_LastName,
	               Lv_Phone1CountryCode,
	               Lv_Phone1AreaCode,
	               Lv_Phone1Phone,
	               EmailAddress1
	        FROM AccountBase 
	        WHERE AccountId = '$customer'";
	$result = $leverateConnect->fetchAll($sql,array('OwnerId'));
	return $result[0];          
}

function addNewCommunication($customer,$title,$description,$leadStatus){
	require_once "inc/leverate/leverateApi.php";
	
	$ownerId = $_SESSION['userdata'][$GLOBALS['brandName'].'Id'];
	if($ownerId === '0'){
		return array('userError'=>'The user is not defined at FM System. Please contact with HelpDesk');	
	}
	
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$sql = "SELECT bu.Name AS businessUnitName
	        FROM BusinessUnitBase AS bu
	        LEFT JOIN SystemUserBase AS users ON users.BusinessUnitId = bu.BusinessUnitId
	        WHERE users.SystemUserId = '$ownerId'";
	$businessUnitName = $leverateConnect->fetchAll($sql);
	if(empty($businessUnitName))
	    return array('userError'=>'The user is not defined at CRM. Please contact with HelpDesk');
	$businessUnitName = $businessUnitName[0]['businessUnitName'];
	
	$lastNote = getLastCommunication($customer,$leverateConnect);
	
	$leverateApi = new leverateApi($GLOBALS['brandName']);
	$result = $leverateApi->CreateNote($customer,$ownerId,$title,$description,$businessUnitName);
	if($result->Code == 'Success'){
		$sql = "SELECT Lv_LeadStatus FROM AccountBase
	            WHERE AccountId = '{$customer}'";
		$preLeadStatus = $leverateConnect->fetchAll($sql);
		$preLeadStatus = $preLeadStatus[0]['Lv_LeadStatus'];
		if($preLeadStatus != $leadStatus){		
		   $leadStatus_result = $leverateApi->UpdateAccountDetails($customer,array(array('name'=>'LeadStatus','value'=>$leadStatus,'fieldName'=>'lv_leadstatus','additionalAttributeType'=>'Picklist')));
		   if(get_class($leadStatus_result) == 'ResultInfo' && $leadStatus_result->Code == 'Success'){
		   	   $apiCCL = array(array('accountId'=>$customer,'type'=>'lv_leadstatus','oldValue'=>$preLeadStatus,'newValue'=>$leadStatus));
			   setApiCustomerChangeLog($apiCCL,$leverateConnect);
		   }
		}
		for($count = 0; $count<10 ; $count++){
	   	   $updatedLastNote = getLastCommunication($customer,$leverateConnect);
	   	   if($updatedLastNote != $lastNote){
	   	   	   break;
	   	   }
	   	   sleep(1);
	   }	   
	}
	return $result;			
}

function getLastCommunication($customer,$leverateConnect){
	$sql = "SELECT TOP 1 AnnotationId
	        FROM AnnotationBase
	        WHERE ObjectId = '$customer'
	        ORDER BY CreatedOn DESC";
	return $leverateConnect->fetchAll($sql,array('AnnotationId'));        
}

function editCustomer($customerId,$params){
	require_once "inc/leverate/leverateApi.php";
	
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$preData = getUpdatedData($customerId,$leverateConnect);
	   
	$leverateApi = new leverateApi($GLOBALS['brandName']);
	$result = $leverateApi->UpdateAccountDetails($customerId,$params);   
	
	if(get_class($result) == 'ResultInfo' && $result->Code == 'Success'){
	   $apiCCL = array();
	   foreach($params as $key=>$param){
	   	   if($preData[$param['fieldName']] != $param['value']){
	   	   	  $oldValue = str_replace( "'", "''", $preData[$param['fieldName']]);
			  $newValue = str_replace( "'", "''", $param['value']);
	   	   	  $apiCCL[] = array('accountId'=>$customerId,'type'=>$param['fieldName'],'oldValue'=>$oldValue,'newValue'=>$newValue);
	   	   }
	   }		
       setApiCustomerChangeLog($apiCCL,$leverateConnect);	
	   for($count = 0; $count<10 ; $count++){
	   	   $updatedData = getUpdatedData($customerId,$leverateConnect);
		   $notUpdated = 0;
	   	   foreach($params as $key=>$param){
	   	   	   if($updatedData[$param['fieldName']] != $param['value']){
	   	   	   	  $notUpdated = 1;	
	   	   	   	  break;
	   	   	   }
	   	   }
		   if($notUpdated == 0)
		       break;	
	   	   sleep(1);
	   }	   
    }	
	return $result;   
}

function getAccountTypes(){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
	
	$sql = "SELECT AccountTypeId,
	               name 
	        FROM AccountType";
	return $leverateConnect->fetchAll($sql);		        
}

function getCustomersData($accountType,$campaign,$exclude_campaign,$desk,$employee,$countries,$leadStatus,$accountStatus,$exclude_accountStatus,$onlineStatus,$regStart,$regEnd,$loginStart,$loginEnd){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT TOP 100000
	               accounts.AccountId AS customerId,
                   accounts.Name AS customerName,
	               users.FullName AS employee,
	               mainTpAccount.lv_name AS mainTpAccount,
	               CASE WHEN accounts.lean_DateOfLastLoginReal >= DATEADD(minute,-20,GETDATE())
                        THEN 'Online'
		                ELSE 'Offline'
	               END AS onlineStatus,
	               CASE WHEN (SELECT TOP 1 transactions.Lv_monetarytransactionId
	                          FROM Lv_monetarytransactionBase AS transactions
				              WHERE transactions.Lv_Type = 1
				                    AND transactions.Lv_MethodofPayment<>1
				                    AND transactions.Lv_TransactionApproved = 1
				                    AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
						            AND transactions.lv_accountid = accounts.AccountId) IS NOT NULL
                       THEN 'Depositor'
	                   WHEN change_log.max_date IS NOT NULL
			           THEN 'Customer'
			           ELSE 'Lead'
 		           END AS accountType,		  			  
	               CONVERT(DATETIME2(0),accounts.CreatedOn) AS regTime,
	               CONVERT(DATETIME2(0),accounts.lean_DateOfLastLoginReal) AS lastLogin,
	               countries.Lv_name AS country,
                   leadStatus.Value AS leadStatus,
	               accountStatus.Value AS accountStatus,
	               accounts.Lv_UtmCampaign AS campaign,
	               accounts.EMailAddress1 AS email,
	               accounts.Lv_Phone1Phone AS phone
            FROM AccountBase AS accounts
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'AccountBase'
            LEFT JOIN (SELECT MAX(cl.max_date) AS max_date, cl.AccountId 
                       FROM
                       (SELECT MAX(audit.CreatedOn) AS max_date, audit.ObjectId AS AccountId
	                   FROM AuditBase AS audit 
                       LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                  FROM MetadataSchema.Attribute AS att 
			                      INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                  GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
				       WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                             AND audit.Operation = 2 
					   GROUP BY audit.ObjectId
					   UNION ALL
					   SELECT MAX(api.CreatedOn) AS max_date, api.AccountId
					   FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.ApiCustomerChangeLog AS api 
					   WHERE api.Type = 'OwnerId'
					   GROUP BY api.AccountId) AS cl
					   GROUP BY cl.AccountId
					   ) AS change_log ON change_log.AccountId= accounts.AccountId           
            LEFT JOIN SystemUserBase AS users ON users.SystemUserId = accounts.OwnerId
            LEFT JOIN Lv_tpaccountBase AS mainTpAccount ON mainTpAccount.Lv_tpaccountid = accounts.lv_maintpaccountid
            LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
            LEFT JOIN StringMapBase AS leadStatus ON leadStatus.ObjectTypeCode = objects.ObjectTypeCode AND leadStatus.AttributeValue = accounts.lv_leadstatus AND leadStatus.AttributeName = 'lv_leadstatus' AND leadStatus.LangId=1033
            LEFT JOIN StringMapBase AS accountStatus ON accountStatus.ObjectTypeCode = objects.ObjectTypeCode AND accountStatus.AttributeValue = accounts.lv_accountstatus AND accountStatus.AttributeName = 'lv_accountstatus' AND accountStatus.LangId=1033
            LEFT JOIN StringMapBase AS statuscode ON statuscode.ObjectTypeCode = objects.ObjectTypeCode AND statuscode.AttributeValue = accounts.statuscode AND statuscode.AttributeName = 'statuscode' AND statuscode.LangId=1033
            WHERE ((SELECT TOP 1 transactions.Lv_monetarytransactionId
	                FROM Lv_monetarytransactionBase AS transactions
				    WHERE transactions.Lv_Type = 1
				          AND transactions.Lv_MethodofPayment<>1
				          AND transactions.Lv_TransactionApproved = 1
				          AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
						  AND transactions.lv_accountid = accounts.AccountId) IS NOT NULL OR statuscode.Value='Active')
						  AND accounts.Lv_FirstName NOT LIKE '%test%'
						  AND accounts.Lv_FirstName NOT LIKE '%firstname%'
						  AND accounts.Lv_LastName NOT LIKE '%lastname%' 
						  AND accounts.Lv_LastName NOT LIKE '%test%' 
						";
     
     if($campaign)
     	$sql .= " AND accounts.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";
     
     if($exclude_campaign)
     	$sql .= " AND accounts.Lv_UtmCampaign NOT IN ('".implode("','",$exclude_campaign)."')";	
     
     if($desk)
        $sql .= " AND users.BusinessUnitId = '$desk'";
		
     if($employee)
        $sql .= " AND users.SystemUserId IN ('".implode("','",$employee)."')";
        
     if($countries)
        $sql .= " AND countries.Lv_name IN ('".implode("','",$countries)."')";       
   
     if($leadStatus)
        $sql .= " AND accounts.lv_leadstatus IN ('".implode("','",$leadStatus)."')";
         
     if($accountStatus)
        $sql .= " AND accounts.lv_accountstatus IN ('".implode("','",$accountStatus)."')";
     
     if($exclude_accountStatus)
        $sql .= " AND accounts.lv_accountstatus NOT IN ('".implode("','",$exclude_accountStatus)."')";
        
     if($regStart)
        $sql .= $regEnd ? " AND accounts.CreatedOn BETWEEN '$regStart 00:00:00' AND '$regEnd 23:59:59'" : " AND accounts.CreatedOn >= '$regStart 00:00:00'";
     else       
        $sql .= $regEnd ? " AND accounts.CreatedOn <= '$regEnd 23:59:59'" : "";
         
     if($loginStart)
        $sql .= $loginEnd ? " AND accounts.lean_DateOfLastLoginReal BETWEEN '$loginStart 00:00:00' AND '$loginEnd 23:59:59'" : " AND accounts.lean_DateOfLastLoginReal >='$loginStart 00:00:00'";
     else       
        $sql .= $loginEnd ? " AND (accounts.lean_DateOfLastLoginReal <= '$loginEnd 23:59:59' OR  accounts.lean_DateOfLastLoginReal IS NULL)": "";
	
	 if($onlineStatus!='Both')
	    $sql .= " AND CASE WHEN accounts.lean_DateOfLastLoginReal >= DATEADD(minute,-20,GETDATE())
                        THEN 'Online'
		                ELSE 'Offline'
	                  END = '$onlineStatus'";     
     
     if($accountType!='All')
        $sql .= " AND CASE WHEN (SELECT TOP 1 transactions.Lv_monetarytransactionId
	                          FROM Lv_monetarytransactionBase AS transactions
				              WHERE transactions.Lv_Type = 1
				                    AND transactions.Lv_MethodofPayment<>1
				                    AND transactions.Lv_TransactionApproved = 1
						            AND transactions.lv_accountid = accounts.AccountId) IS NOT NULL
                           THEN 'Depositor'
	                       WHEN change_log.max_date IS NOT NULL
			               THEN 'Customer'
			               ELSE 'Lead'
 		               END = '".substr($accountType, 0, -1)."'";  
	// return $sql;            
     return $leverateConnect->fetchAll($sql,array('customerId'));                  
}

function changeOwnerForCustomers($customers,$employee,$leadStatus){
	require_once "inc/leverate/leverateApi.php";
		
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT AccountId,
	               OwnerId,
	               Lv_LeadStatus
	        FROM AccountBase
	        WHERE AccountId IN ('".implode("','",$customers)."')";
	$currentValues = $leverateConnect->fetchAll($sql,array('AccountId','OwnerId'));
	$responses = array();
	$successful = 0;
	$lastCustomer = 0;
	$apiCCL = array();
	foreach($customers as $customerKey=>$customerId){
		foreach($currentValues as $key=>$value){
			if($customerId == $value['AccountId']){
				if($employee == $value['OwnerId'] && $leadStatus['Value'] == $value['Lv_LeadStatus']){
					$successful++;
					$responses[]=array('customerId'=>$customerId,'response'=>'The changes are same as current values');
					break;
				}else{
					$leverateApi = new leverateApi($GLOBALS['brandName']);
	
	                $result = $leverateApi->AssignAccountOwner($customerId,$employee,$leadStatus);
					$responses[]=array('customerId'=>$customerId,'response'=>$result);
	                if(get_class($result) == 'ResultInfo' && $result->Code == 'Success'){
	                	$successful++;	
	                	$lastCustomer = $customerId;
	                	if($employee != $value['OwnerId'])
	                		$apiCCL[] = array('accountId'=>$customerId,'type'=>'OwnerId','oldValue'=>$value['OwnerId'],'newValue'=>$employee);
						if($leadStatus['Value'] != $value['Lv_LeadStatus'])
	                	    $apiCCL[] = array('accountId'=>$customerId,'type'=>'lv_leadstatus','oldValue'=>$value['Lv_LeadStatus'],'newValue'=>$leadStatus['Value']);
	                }
	                break;
	             }
			}
		}
	}
    if(!empty($apiCCL))
	    setApiCustomerChangeLog($apiCCL,$leverateConnect);	               
	if($lastCustomer !== 0){
		for($count = 0; $count<10 ; $count++){
		   $updatedData = getUpdatedData($lastCustomer,$leverateConnect);
		  // return array($employee,$updatedData['OwnerId'],$leadStatus['Value'],$updatedData['lv_leadstatus']);
		   if($employee == $updatedData['OwnerId'] && $leadStatus['Value'] == $updatedData['lv_leadstatus'])
		      break;
		   sleep(1); 	
		}
	}
	return array('totalCustomers'=>sizeof($customers),'successfulRequests'=>$successful,'responses'=>$responses);
		       
}

function setApiCustomerChangeLog($parameters,$leverateConnect){
	$last_key = sizeof($parameters) - 1;
	$changeUserId = isset($_SESSION) ? $_SESSION['userdata']["{$GLOBALS['brandName']}Id"] : '0';	
	$sql = "INSERT INTO {$GLOBALS['inventiva_CRM_DB']}.dbo.ApiCustomerChangeLog (AccountId,Type,OldValue,NewValue,ChangeUserId) ";
	foreach($parameters as $key=>$parameter){
		$sql .= " SELECT '{$parameter["accountId"]}','{$parameter["type"]}','{$parameter["oldValue"]}','{$parameter["newValue"]}','{$changeUserId}' ";
		if($key != $last_key){
			$sql .= " UNION ALL ";
        }
	}
	return $leverateConnect->exec($sql);	
}

function getLeadsByField($dpStart,$dpEnd,$field,$campaign){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql ="SELECT leads.leadAggregateField,
                  ISNULL(leads.totalLeads,0) AS totalLeads,
	              ISNULL(leads.totalCustomers,0) AS totalCustomers,
	              ISNULL(leads.totalCustomers,0)-ISNULL(leads.totalNotCalled,0) AS totalCalled,
	              ISNULL(leads.totalNotCalledCutOff,0) AS totalNotCalledCutOff,
	              ISNULL(leads.totalNotCalled,0) AS totalNotCalled,
	              CASE WHEN leads.totalCustomers IS NULL OR leads.totalCustomers = 0
	                   THEN 0
			           ELSE CAST(100 - (CAST(ISNULL(leads.totalNotCalled,0) AS DECIMAL)/CAST(leads.totalCustomers AS DECIMAL))*100 AS DECIMAL(5,2)) 
		          END AS percentCalled,
		          ISNULL(leads.totalNoAnswer,0) AS totalNoAnswer,
		          CASE WHEN leads.totalLeads IS NULL
		               THEN 1
		               ELSE 0 
		          END AS leadNull,     
		          transactions.trAggregateField,
		          ISNULL(transactions.ftds,0) AS ftds,
		          ISNULL(transactions.ftdDepositsUSD,0) AS ftdDepositsUSD,
		          ISNULL(transactions.depositsUSD,0) AS depositsUSD,
		          ISNULL(transactions.selfDepositsUSD,0) AS selfDepositsUSD,
		          ISNULL(transactions.numberDeposits,0) AS numberDeposits,
		          ISNULL(transactions.numberSelfDeposits,0) AS numberSelfDeposits,
		          ISNULL(transactions.depositCancelledUSD,0) AS depositCancelledUSD,
		          ISNULL(transactions.withdrawalsUSD,0) AS withdrawalsUSD,
		          CASE WHEN transactions.ftds IS NULL
		               THEN 1
		               ELSE 0 
		          END AS trNull,
		          attempts.attemptAggregateField,
				  ISNULL(attempts.attemptCount,0) AS attemptCount,
				  CASE WHEN attempts.attemptCount IS NULL
		               THEN 1
		               ELSE 0 
		          END AS attemptNull 	 
          FROM 
          (SELECT ".($field=='campaign' ? "customers.Lv_UtmCampaign" : "countries.Lv_name")." AS leadAggregateField,
                  COUNT(customers.AccountId) AS totalLeads,
                  SUM(CASE WHEN change_log.max_date IS NOT NULL
	                       THEN 1
				           ELSE 0
		              END) AS totalCustomers,
                  SUM(CASE WHEN change_log.max_date IS NOT NULL AND min_communication.date IS NULL
	                       THEN 1
		                   ELSE 0
		              END) AS totalNotCalled,
                  SUM(CASE WHEN change_log.max_date IS NOT NULL AND (min_communication.date IS NULL OR min_communication.date > '$dpEnd 23:59:59')
	                       THEN 1
		                   ELSE 0
		              END) AS totalNotCalledCutOff,
		          SUM(CASE WHEN change_log.max_date IS NOT NULL AND leadStatus.Value = 'No Answer'
				           THEN 1
				           ELSE 0
				       END) AS totalNoAnswer    
            FROM AccountBase AS customers
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'AccountBase'
            LEFT JOIN (SELECT MAX(audit.CreatedOn) AS max_date, audit.ObjectId AS AccountId
	                   FROM AuditBase AS audit 
                       LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                  FROM MetadataSchema.Attribute AS att 
			                      INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                  GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
			           WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                             AND audit.Operation = 2 
			           GROUP BY audit.ObjectId) AS change_log ON change_log.AccountId= customers.AccountId
            LEFT JOIN (SELECT ObjectId, MIN(communications.CreatedOn) AS date
                       FROM AnnotationBase AS communications
                       WHERE communications.ObjectTypeCode = (SELECT ObjectTypeCode
                                                              FROM MetadataSchema.Entity
                                                              WHERE BaseTableName = 'AccountBase'
                                                              GROUP BY ObjectTypeCode)
		               GROUP BY ObjectId) AS min_communication ON min_communication.ObjectId = customers.AccountId".
		   ($field=='campaign' ? "" : " LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = customers.Lv_countryId").             
           " LEFT JOIN StringMapBase AS statuscode ON statuscode.ObjectTypeCode = objects.ObjectTypeCode AND statuscode.AttributeValue = customers.statuscode AND statuscode.AttributeName = 'statuscode' AND statuscode.LangId = 1033
		     LEFT JOIN StringMapBase AS leadStatus ON leadStatus.ObjectTypeCode = objects.ObjectTypeCode AND leadStatus.AttributeValue = customers.lv_leadstatus AND leadStatus.AttributeName = 'lv_leadstatus' AND leadStatus.LangId = 1033
		     WHERE customers.CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'
		           AND ((SELECT TOP 1 transactions.Lv_monetarytransactionId
	                     FROM Lv_monetarytransactionBase AS transactions
				         WHERE transactions.Lv_Type = 1
				               AND transactions.Lv_TransactionApproved = 1
				               AND transactions.Lv_MethodofPayment<>1
				               AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
						       AND transactions.lv_accountid = customers.AccountId) IS NOT NULL OR statuscode.Value='Active')
			       AND customers.lv_accountstatus <> 2
			       AND customers.Lv_FirstName NOT LIKE '%test%'
			       AND customers.Lv_FirstName NOT LIKE '%firstname%' 
				   AND customers.Lv_LastName NOT LIKE '%test%' 
				   AND customers.Lv_LastName NOT LIKE '%lastname%' ";
      if($campaign)
        $sql .= " AND customers.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";           
 $sql .= " GROUP BY ".($field=='campaign' ? "customers.Lv_UtmCampaign" : "countries.Lv_name").") AS leads
          FULL JOIN (SELECT  ".($field=='campaign' ? "customers.Lv_UtmCampaign" : "countries.Lv_name")." AS trAggregateField,
                             SUM(CASE WHEN firstDeposit.date = transactions.Lv_ApprovedOn
				                           AND transactionType.Value = 'Deposit'     
	                                  THEN 1
			                          ELSE 0     
	                             END) AS ftds,
                             SUM(CASE WHEN firstDeposit.date = transactions.Lv_ApprovedOn
				                           AND transactionType.Value = 'Deposit' 
	                                  THEN transactions.Lv_USDValue
			                          ELSE 0     
	                              END) AS ftdDepositsUSD,
                             SUM(CASE WHEN transactionType.Value = 'Deposit' 
		                              THEN transactions.Lv_USDValue
				                      ELSE 0
			                     END) AS depositsUSD,
                             SUM(CASE WHEN transactionType.Value = 'Deposit'
                                           AND methodOfPayment.Value <> 'Internal' 
		                                   AND (transactions.CreatedOn < min_communication.date OR min_communication.date IS NULL)
		                              THEN transactions.Lv_USDValue
				                      ELSE 0
			                     END) AS selfDepositsUSD,    
                             SUM(CASE WHEN transactionType.Value = 'Deposit'
		                              THEN 1
				                      ELSE 0
			                     END) AS numberDeposits,
                             SUM(CASE WHEN transactionType.Value = 'Deposit'
		                                   AND (transactions.CreatedOn < min_communication.date OR min_communication.date IS NULL)
		                              THEN 1
				                      ELSE 0
			                     END) AS numberSelfDeposits,
                             SUM(CASE WHEN transactionType.Value = 'Deposit Cancelled'
		                              THEN transactions.Lv_USDValue
				                      ELSE 0
			                     END) AS depositCancelledUSD,
                             SUM(CASE WHEN transactionType.Value = 'Withdrawal'
		                              THEN transactions.Lv_USDValue
				                      ELSE 0
			                     END) AS withdrawalsUSD 
                     FROM Lv_monetarytransactionBase AS transactions
                     LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                FROM MetadataSchema.Entity
                                GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'           
                     LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = transactions.lv_tpaccountId 
                     LEFT JOIN AccountBase AS customers ON customers.AccountId = transactions.lv_accountid
                     LEFT JOIN (SELECT ObjectId, MIN(communications.CreatedOn) AS date
                                FROM AnnotationBase AS communications
                                WHERE communications.ObjectTypeCode = (SELECT ObjectTypeCode
                                                                       FROM MetadataSchema.Entity
                                                                       WHERE BaseTableName = 'AccountBase'
                                                                       GROUP BY ObjectTypeCode)
		                        GROUP BY ObjectId) AS min_communication ON min_communication.ObjectId = customers.AccountId
                     LEFT JOIN (SELECT  previous.lv_accountid AS accountId, MIN(previous.Lv_ApprovedOn) AS date
	       						FROM Lv_monetarytransactionBase AS previous
		   						WHERE previous.Lv_TransactionApproved = 1
		   						      AND previous.Lv_MethodofPayment<>1
			     					  AND previous.lv_TradingPlatformTransactionId IS NOT NULL
				 					  AND previous.Lv_Type = 1
		   						GROUP BY previous.lv_accountid) AS firstDeposit ON firstDeposit.AccountId = customers.AccountId			
		   			LEFT JOIN StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033			 		   									   
                    LEFT JOIN StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 ".
		            ($field=='campaign' ? "" : " LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = customers.Lv_countryId").             
                  " WHERE transactions.Lv_TransactionApproved = 1
                          AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
                          AND transactions.Lv_ApprovedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'
                          AND methodOfPayment.Value <> 'Internal'
                          AND customers.lv_accountstatus <> 2
                          AND customers.Lv_FirstName NOT LIKE '%test%'
			              AND customers.Lv_FirstName NOT LIKE '%firstname%' 
				          AND customers.Lv_LastName NOT LIKE '%test%' 
				          AND customers.Lv_LastName NOT LIKE '%lastname%' 
                          ";
     if($campaign)
                $sql .= " AND customers.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";                     
     $sql .= " GROUP BY ".($field=='campaign' ? "customers.Lv_UtmCampaign" : "countries.Lv_name").") AS transactions ON transactions.trAggregateField = leads.leadAggregateField
               FULL JOIN (SELECT ".($field=='campaign' ? "accounts.Lv_UtmCampaign" : "countries.Lv_name")." AS attemptAggregateField,
		                   COUNT(DISTINCT dLog.CustomerId) AS attemptCount
		            FROM IncidentBase AS dLog
		            LEFT JOIN AccountBase AS accounts ON accounts.AccountId = dLog.CustomerId
		            LEFT JOIN (SELECT  previous.lv_accountid AS accountId, MIN(previous.Lv_ApprovedOn) AS date
	       						FROM Lv_monetarytransactionBase AS previous
		   						WHERE previous.Lv_TransactionApproved = 1
		   						      AND previous.Lv_MethodofPayment<>1
			     					  AND previous.lv_TradingPlatformTransactionId IS NOT NULL
				 					  AND previous.Lv_Type = 1
		   						GROUP BY previous.lv_accountid) AS firstDeposit ON firstDeposit.AccountId = accounts.AccountId".
		   			($field=='campaign' ? "" : " LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId").			 
                  " WHERE dLog.Title = 'Credit Card Deposit Failure'
		                  AND dLog.CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'
				          AND (firstDeposit.date IS NULL OR firstDeposit.date > '$dpEnd 23:59:59')
						  AND accounts.lv_accountstatus <> 2
						  AND accounts.Lv_FirstName NOT LIKE '%test%'
						  AND accounts.Lv_FirstName NOT LIKE '%firstname%' 
				          AND accounts.Lv_LastName NOT LIKE '%test%' 
				          AND accounts.Lv_LastName NOT LIKE '%lastname%' 
				          ";
		if($campaign)
                $sql .= " AND accounts.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";		          
		$sql .=	" GROUP BY ".($field=='campaign' ? "accounts.Lv_UtmCampaign" : "countries.Lv_name").") AS attempts ON attempts.attemptAggregateField = transactions.trAggregateField OR attempts.attemptAggregateField = leads.leadAggregateField";
     
     $results = $leverateConnect->fetchAll($sql);
     $leads = array();
     $null_rows = array();
     foreach($results as $key=>$result){
     	if($result['leadAggregateField'] == '' && $result['trAggregateField'] == '' && $result['attemptAggregateField'] == ''){
     	   $null_rows[] = $result; 	
    	}else{
     	   if($result['leadAggregateField'] == '')
		      $result['leadAggregateField'] = $result['trAggregateField']!='' ? $result['trAggregateField'] : $result['attemptAggregateField']; 	
     	   unset($result['trAggregateField'],$result['attemptAggregateField']);
		   $leads[] = $result;
     	}
     }
     if(empty($null_rows))
         return $leads;
     $rowParams = array('leadNull'    => array('isNull'=> 1, 'fields' => array('totalLeads','totalCustomers','totalCalled','totalNotCalledCutOff','totalNotCalled','percentCalled','totalNoAnswer')),
	                 'trNull'      => array('isNull'=> 1, 'fields' => array('ftds','ftdDepositsUSD','depositsUSD','selfDepositsUSD','numberDeposits','numberSelfDeposits','depositCancelledUSD','withdrawalsUSD')),
	                 'attemptNull' => array('isNull'=> 1, 'fields' => array('attemptCount'))
	                );
	 $last_row = array('leadAggregateField'=>'');
	 foreach($null_rows as $key=>$value){
	 	foreach($rowParams as $pKey=>$pValue){
	 	 	
	 		if($value[$pKey] == 0){
	 			 
	 			$rowParams[$pKey]['isNull'] = 0;
				foreach($rowParams[$pKey]['fields'] as $fKey=>$fValue){
					$last_row[$fValue] = $value[$fValue]; 
				} 
	 		} 
	     }
	 }
     foreach($rowParams as $pKey=>$pValue){
	 		if($rowParams[$pKey]['isNull'] == 1){
				foreach($rowParams[$pKey]['fields'] as $fKey=>$fValue){
					$last_row[$fValue] = 0; 
				}
			}	
	 }
	
     $leads[] = $last_row;
     return $leads;     
}

function getAllLeads(){
	 $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	 	
	 $sql = "SELECT customers.Lv_UtmCampaign AS campaignName,
                    COUNT(customers.AccountId) AS totalLeads,
                    SUM(CASE WHEN change_log.max_date IS NOT NULL
	                         THEN 1
				             ELSE 0
		                END) AS totalCustomers,
                    SUM(ISNULL(transactions.totalDepositsUSD,0)) AS totalDepositsUSD,
	                SUM(ISNULL(transactions.totalDepositCancelledUSD,0)) AS totalDepositCancelledUSD
             FROM AccountBase AS customers
             LEFT JOIN (SELECT MAX(audit.CreatedOn) AS max_date, audit.ObjectId AS AccountId
	                    FROM AuditBase AS audit 
                        LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                   FROM MetadataSchema.Attribute AS att 
			                       INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                   GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
			            WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                              AND audit.Operation = 2 
			            GROUP BY audit.ObjectId) AS change_log ON change_log.AccountId= customers.AccountId
             LEFT JOIN (SELECT transactions.lv_accountid AS accountId, 
                               SUM(CASE WHEN transactionType.Value = 'Deposit'
				                        THEN transactions.Lv_USDValue
						                ELSE 0
					               END) AS totalDepositsUSD,
                               SUM(CASE WHEN transactionType.Value = 'Deposit Cancelled'
				                        THEN transactions.Lv_USDValue
						                ELSE 0
					               END) AS totalDepositCancelledUSD 
                         FROM Lv_monetarytransactionBase AS transactions
		                 LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                    FROM MetadataSchema.Entity
                                    GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
		                 LEFT JOIN StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033
		                 WHERE transactions.Lv_TransactionApproved = 1
		                       AND transactions.Lv_MethodofPayment<>1
				               AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
		                 GROUP BY transactions.lv_accountid) AS transactions ON transactions.accountId = customers.AccountId
		     WHERE customers.lv_accountstatus <> 2
				   AND customers.Lv_FirstName NOT LIKE '%test%'
				   AND customers.Lv_FirstName NOT LIKE '%firstname%' 
				   AND customers.Lv_LastName NOT LIKE '%test%' 
				   AND customers.Lv_LastName NOT LIKE '%lastname%'            
             GROUP BY customers.Lv_UtmCampaign";
    return $leverateConnect->fetchAll($sql);         
}

function getUncalledCustomers($dpStart,$dpEnd,$field,$campaign){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$fieldName = $field['name'] == 'campaign' ? 'customers.Lv_UtmCampaign' : 'countries.Lv_Name';
	$fieldFilter = $field['value'] == '' ? "$fieldName IS NULL" : "$fieldName = '{$field["value"]}'";
	$sql = "SELECT customers.AccountId,
	               customers.Name AS customerName 
	        FROM AccountBase AS customers
	        LEFT JOIN (SELECT MAX(audit.CreatedOn) AS max_date, audit.ObjectId AS AccountId
	                   FROM AuditBase AS audit 
                       LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                  FROM MetadataSchema.Attribute AS att 
			                      INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                  GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
			           WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                             AND audit.Operation = 2 
			           GROUP BY audit.ObjectId) AS change_log ON change_log.AccountId= customers.AccountId
            LEFT JOIN (SELECT ObjectId, MIN(communications.CreatedOn) AS date
                       FROM AnnotationBase AS communications
                       WHERE communications.ObjectTypeCode = (SELECT ObjectTypeCode
                                                              FROM MetadataSchema.Entity
                                                              WHERE BaseTableName = 'AccountBase'
                                                              GROUP BY ObjectTypeCode)
		               GROUP BY ObjectId) AS min_communication ON min_communication.ObjectId = customers.AccountId".
		    ($field=='campaign' ? "" : " LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = customers.Lv_countryId").           
	        " WHERE customers.CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'
	              AND change_log.max_date IS NOT NULL 
	              AND min_communication.date IS NULL
	              AND ((SELECT TOP 1 transactions.Lv_monetarytransactionId
	                     FROM Lv_monetarytransactionBase AS transactions
				         WHERE transactions.Lv_Type = 1
				               AND transactions.Lv_TransactionApproved = 1
				               AND transactions.Lv_MethodofPayment<>1
				               AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
						       AND transactions.lv_accountid = customers.AccountId) IS NOT NULL OR customers.statuscode = 1)
			      AND customers.lv_accountstatus <> 2
			      AND customers.Lv_FirstName NOT LIKE '%test%' 
				  AND customers.Lv_LastName NOT LIKE '%test%' 
	              AND $fieldFilter";
	if($campaign)
	   $sql .= " AND customers.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";
	return $leverateConnect->fetchAll($sql,array('AccountId'));                                 
}

function getFailedAttempts($dpStart,$dpEnd,$field,$campaign){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$fieldName = $field['name'] == 'campaign' ? 'accounts.Lv_UtmCampaign' : 'countries.Lv_Name';
	$fieldFilter = $field['value'] == '' ? "$fieldName IS NULL" : "$fieldName = '{$field["value"]}'";
	$sql = "SELECT accounts.AccountId,
	               accounts.Name AS customerName,
	               Tools.dbo.customSplit(SUBSTRING(dLog.Description,1,CHARINDEX('ErrorCode',dLog.Description)-1),' -> ',2) AS reason,
			       dLog.Lv_DepositAmount AS depositAmount,
			       CONVERT(DATETIME2(0),dLog.CreatedOn) AS date        
		    FROM IncidentBase AS dLog
		    INNER JOIN (SELECT CustomerId, MAX(CreatedOn) AS maxDate FROM IncidentBase AS d
			            WHERE Title = 'Credit Card Deposit Failure'
			                  AND CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'
                        GROUP BY CustomerId 
					   ) AS dLog2 ON dLog2.CustomerId = dLog.CustomerId AND dLog2.maxDate = dLog.CreatedOn 
		    LEFT JOIN AccountBase AS accounts ON accounts.AccountId = dLog.CustomerId
		    LEFT JOIN (SELECT  previous.lv_accountid AS accountId, MIN(previous.Lv_ApprovedOn) AS date
	       			   FROM Lv_monetarytransactionBase AS previous
		   			   WHERE previous.Lv_TransactionApproved = 1
		   					 AND previous.Lv_MethodofPayment<>1
			     			 AND previous.lv_TradingPlatformTransactionId IS NOT NULL
				 			 AND previous.Lv_Type = 1
		   			   GROUP BY previous.lv_accountid) AS firstDeposit ON firstDeposit.AccountId = accounts.AccountId".
		    ($field=='campaign' ? "" : " LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId").			 
            " WHERE (firstDeposit.date IS NULL OR firstDeposit.date > '$dpEnd 23:59:59')
			        AND accounts.lv_accountstatus <> 2
			        AND accounts.Lv_FirstName NOT LIKE '%test%' 
				    AND accounts.Lv_LastName NOT LIKE '%test%'
			        AND $fieldFilter  
	        ";
	if($campaign)
	   $sql .= " AND customers.Lv_UtmCampaign IN ('".implode("','",$campaign)."')";
	return $leverateConnect->fetchAll($sql,array('AccountId'));                                 
}

function getAgentRates($agentId, $rangeId = null, $default = false) {

    $sql = "SELECT CommissionAgentRateId, 
                   RateCreditCardLower,
                   RateCreditCardUpper, 
                   RateWire, 
                   CONVERT(VARCHAR(10), StartDate, 120) AS StartDate, 
                   CONVERT(VARCHAR(10), EndDate, 120) AS EndDate
            FROM CommissionAgentRate 
            WHERE AgentId = '{$agentId}'";
    if(!is_null($rangeId) && !empty($rangeId)) {
        $sql .= " AND CommissionAgentRateId = {$rangeId}";
    } else {
        $sql .= " ORDER BY CommissionAgentRate.StartDate DESC";
    }

    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);

    $result = $leverateConnect->fetchAll($sql);

    if($default === true) {
        $sql = "SELECT TOP 1 CommissionAgentRateId, 
                       RateCreditCardLower,
                       RateCreditCardUpper, 
                       RateWire, 
                       NULL StartDate, 
                       NULL EndDate
                FROM CommissionAgentRate 
                WHERE AgentId IS NULL 
                ORDER BY CommissionAgentRateId ASC";
        $result['DEFAULT'] = $leverateConnect->fetchAll($sql)[0];
    }

    return $result;
}

function addAgentRates($f) {
    $agentId = $f['AgentId'];
    $ccU = $f['RateCreditCardUpper'];
    $ccL = $f['RateCreditCardLower'];
    $wire = $f['RateWire'];
    $startDate  = $f['StartDate'];
    $endDate  = !empty($f['EndDate']) ? $f['EndDate'] : null;
    
    if($startDate > $endDate && !is_null($endDate))
        return ['error' => 'Start Date cannot be bigger than End Date'];

    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['inventiva_CRM']);

    // if no end date was send, check if it is the last range, if no - error
    if(is_null($endDate) && checkIfLastRange($leverateConnect, $startDate, $agentId) === false) {
        return ['error' => 'You should set End Date for this range'];
    }

    // check if dates do not cross previously saved dates
    $crossRange = checkCrossRanges($leverateConnect, $startDate, $endDate, $agentId);
	
    if( sizeof( array_filter($crossRange) ) )
        return ['error' => 'Dates that you choosed cross with already existing ranges'];

    $sql = "SELECT TOP 1 *, CONVERT(VARCHAR(10), StartDate, 120) AS StartDate, 
            CONVERT(VARCHAR(10), EndDate, 120) AS EndDate 
          FROM CommissionAgentRate 
          WHERE AgentId = '{$agentId}' 
          ORDER BY CommissionAgentRate.StartDate DESC";
		  
    $prevRange = $leverateConnect->fetchAll($sql, ['AgentId'])[0];

    if(is_null($endDate)) {
        $sql = "
        INSERT INTO CommissionAgentRate
          (AgentId, RateCreditCardUpper, RateCreditCardLower, RateWire, StartDate)
        VALUES
          ('{$agentId}','{$ccU}','{$ccL}','{$wire}', '{$startDate}');
        ";
    } else {
        $sql = "
        INSERT INTO CommissionAgentRate
          (AgentId, RateCreditCardUpper, RateCreditCardLower, RateWire, StartDate, EndDate)
        VALUES
          ('{$agentId}','{$ccU}','{$ccL}','{$wire}', '{$startDate}', '{$endDate}');
        ";
    }

    logRatesChanges($leverateConnect, $agentId, null, $f);

    $result = $leverateConnect->affectedRows($sql);
    
    if($result > 0) {

        // update previous range for this user if he had NULL in the EndDate
        if(!empty($prevRange) && empty($prevRange['EndDate']) && $startDate > $prevRange['StartDate']) {
            $prevRange['EndDate'] = date('Y-m-d', strtotime('-1 day', strtotime($startDate)));
            updateAgentRates($prevRange);
        }

        return ['success' => $result];
    }
    return ['error' => 'Data was not stored'];
}

function updateAgentRates($f) {
    $id = isset($f['CommissionAgentRateId']) ? $f['CommissionAgentRateId'] : null;
    $agentId = $f['AgentId'];
    $ccU = $f['RateCreditCardUpper'];
    $ccL = $f['RateCreditCardLower'];
    $wire = $f['RateWire'];
    $startDate  = $f['StartDate'];
    $endDate  = !empty($f['EndDate']) ? $f['EndDate'] : null;

    if($startDate > $endDate && !is_null($endDate))
        return ['error' => 'Start Date cannot be bigger than End Date'];

    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['inventiva_CRM']);

    // if no end date was send, check if it is the last range, if no - error
    if(is_null($endDate) && checkIfLastRange($leverateConnect, $startDate, $agentId,$id) === false) {
        return ['error' => 'You should set End Date for this range'];
    }

    // check if dates do not cross previously saved dates
    $crossRange = checkCrossRanges($leverateConnect, $startDate, $endDate, $agentId, $id);
    if( sizeof( array_filter($crossRange) ) )
        return ['error' => 'Dates that you choosed cross with already existing ranges'];

    $oldValue = getCommissionLogValues($leverateConnect, $id, $agentId);
    $log = logRatesChanges($leverateConnect, $agentId, $oldValue, $f);
    if($log === false || !preg_match('/^(\d){1,}$/', $log))
        return ['error' => 'Internal error happened'];

    $sql = "
      UPDATE CommissionAgentRate
      SET 
          RateCreditCardUpper = '{$ccU}',
          RateCreditCardLower = '{$ccL}',
          RateWire = '{$wire}',
          UpdatedOn = getdate(),
          StartDate = '{$startDate}'";
    if(is_null($endDate)) {
        $sql .= ", EndDate = NULL ";
    } else {
        $sql .= ", EndDate = '{$endDate}' ";
    }
    $sql .= "WHERE CommissionAgentRateId = '{$id}' AND AgentId = '{$agentId}'";

    $result = $leverateConnect->affectedRows($sql);

    if($result > 0) {
        return ['success' => $result];
    }
    return ['error' => 'Data was not stored: ' . $result, 'sql' => $sql];
}

function deleteAgentRates($rowId, $agentId) {

    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['inventiva_CRM']);

    $oldValue = getCommissionLogValues($leverateConnect, $rowId, $agentId);
    $log = logRatesChanges($leverateConnect, $agentId, $oldValue);
    if($log === false || !preg_match('/^(\d){1,}$/', $log))
        return ['error' => 'Internal error happened'];

    $sql = "DELETE FROM CommissionAgentRate
            WHERE CommissionAgentRateId = {$rowId} AND AgentId = '{$agentId}'";

    if( $leverateConnect->affectedRows($sql) ) {
        return ['success' => true];
    } else {
        return ['error' => 'Data was not deleted'];
    }
}

function logRatesChanges($connection, $userId, $oldValue = null, $newValue = null) {
    $changeUserId = $_SESSION['userdata'][$GLOBALS['brandName'].'Id'];
    $type = debug_backtrace()[1]['function'];

    if(!is_null($oldValue)) {
        ksort($oldValue);
        $oldValue = "'" . json_encode($oldValue) . "'";
    } else {
        $oldValue = 'NULL';
    }

    if(!is_null($newValue)) {
        ksort($newValue);
        $newValue = "'" . json_encode($newValue) . "'";
    } else {
        $newValue = 'NULL';
    }

    $sql = "INSERT INTO CommissionRateChangeLog
            (UserId, Type, OldValue, NewValue, ChangeUserId) 
            VALUES ('{$userId}', '{$type}', {$oldValue}, {$newValue}, '{$changeUserId}')";

    return $connection->execId($sql);
}

function getCommissionLogValues($connection, $id, $agentId) {
    $sql = "SELECT TOP 1 *, convert(varchar(10), StartDate, 120) StartDate, convert(varchar(10), EndDate, 120) EndDate
          FROM CommissionAgentRate 
          WHERE CommissionAgentRateId = {$id} AND AgentId = '{$agentId}' 
          ORDER BY CommissionAgentRateId DESC";
    return $connection->fetchAll($sql, ['AgentId'])[0];
}

function checkCrossRanges($connection, $startDate, $endDate, $agentId, $id = null) {
    $sql = "SELECT * FROM CommissionAgentRate
      WHERE (
        '{$startDate}' BETWEEN StartDate AND EndDate OR
		'{$endDate}' BETWEEN StartDate AND EndDate OR
        StartDate BETWEEN '{$startDate}' AND '{$endDate}' OR 
        EndDate BETWEEN '{$startDate}' AND '{$endDate}')
        AND AgentId = '{$agentId}'";
    if(!is_null($id))
        $sql .= "AND CommissionAgentRateId <> '{$id}'";

    return $connection->fetchAll($sql, ['AgentId']);
}

function checkIfLastRange($connection, $startDate, $agentId,$agentRateId=false) {
    $sql = "SELECT COUNT(*) rows_above 
            FROM CommissionAgentRate
            WHERE StartDate > '{$startDate}'
                AND AgentId = '{$agentId}'";
    if($agentRateId)
      $sql .= " AND CommissionAgentRateId <> '$agentRateId' ";
    $result = $connection->fetchAll($sql)[0];

    if($result['rows_above'] > 0) {
        return false;
    }
    return true;
}

function getTPAccounts($customerId){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['leverate_CRM']);	
	$sql = "SELECT tp.Lv_tpaccountId AS tpGUID, 
                   tp.lv_name AS tpId,
	               tplatform.Lv_name AS tradingPlatform,
	               CASE WHEN tp.Lv_tpaccountId = customers.lv_maintpaccountid
	                    THEN 'Yes'
	                    ELSE 'No'
	               END AS mainTP     
            FROM Lv_tpaccountBase AS tp
            LEFT JOIN Lv_tradingplatformBase AS tplatform ON tplatform.Lv_tradingplatformId = tp.lv_tradingplatformId
            LEFT JOIN AccountBase AS customers ON customers.AccountId = tp.lv_accountid
            WHERE lv_accountid = '$customerId'";
	return $leverateConnect->fetchAll($sql,array('tpGUID'));		
}

function getRealPnl($startDate,$endDate,$desk,$employee,$onlyClose){
    $today = date('Y-m-d',strtotime("now"));
    if($startDate > $endDate || ($startDate > $today && $endDate > $today))
	   return array();
	$startDate = $startDate > $today ? $today : $startDate;
	$endDate = $endDate > $today ? $today : $endDate;
	$startOffset = 2; 
	$endOffset = 2;
	   	
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['leverate_CRM']);
    $sql = "SELECT DST_Start,
                   DST_End
            FROM Tools.dbo.DST";
	$dst = $leverateConnect->fetchAll($sql);
	foreach($dst as $key=>$value){
	   if($value['DST_Start'] < $startDate && $value['DST_End'] >= $startDate)
	     $startOffset = 3;
	   if($value['DST_Start'] <= $endDate && $value['DST_End'] > $startDate)
	     $endOffset = 3;  
	}
	$startTime = date("Y-m-d H:i:s",strtotime("-$startOffset hours", strtotime("$startDate 00:00:00")));
	$endTime = date("Y-m-d H:i:s",strtotime("-$endOffset hours", strtotime("$endDate 23:59:59")));
	
    $sql = "SELECT accountId,
	               tpAccount,
	               accountName,
	               country,
	               currency,
	               employee,
                   ROUND(SUM(CASE WHEN (((transactionType = 'Deposit' OR transactionType = 'Withdrawal Cancelled' OR transactionType= 'Charge Back Cancelled')  AND methodOfPayment <> 'Internal') 
                                         OR (transferred='No' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                                     OR (transferred='Yes' AND transactionType = 'Transfer Between Trading Platform Accounts'))
	                                   AND trApprovedOn < '$startTime'   
                                  THEN amount
				                  WHEN (((transactionType = 'Deposit Cancelled' OR transactionType = 'Withdrawal' OR transactionType= 'Charge Back')  AND methodOfPayment <> 'Internal')
							                 OR  (transferred='Yes' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                                         OR  (transferred='No' AND transactionType = 'Transfer Between Trading Platform Accounts'))
									   AND trApprovedOn < '$startTime'		 
                                  THEN -amount
				                  ELSE 0
			                 END ),2) AS preNetDeposits,
			       ROUND(SUM(CASE WHEN (((transactionType = 'Deposit' OR transactionType = 'Withdrawal Cancelled' OR transactionType= 'Charge Back Cancelled')  AND methodOfPayment <> 'Internal') 
                                         OR (transferred='No' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                                     OR (transferred='Yes' AND transactionType = 'Transfer Between Trading Platform Accounts'))
	                                   AND trApprovedOn <= '$endTime'   
                                  THEN amount
				                  WHEN (((transactionType = 'Deposit Cancelled' OR transactionType = 'Withdrawal' OR transactionType= 'Charge Back')  AND methodOfPayment <> 'Internal')
							                 OR  (transferred='Yes' AND transactionType= 'Transfer Between Trading Platform Accounts Cancelled') 
	                                         OR  (transferred='No' AND transactionType = 'Transfer Between Trading Platform Accounts'))
									   AND trApprovedOn <= '$endTime'		 
                                  THEN -amount
				                  ELSE 0
			                 END ),2) AS endNetDeposits          
            FROM (SELECT transactions.lv_accountid AS accountId,
                         tpAccounts.Lv_name AS tpAccount,
                         accounts.Name AS accountName,
                         countries.Lv_name AS country,
                         currencies.ISOCurrencyCode AS currency, 
	                     methodOfPayment.Value AS methodOfPayment,
	                     transactionType.Value AS transactionType,
	                     transactions.Lv_Amount AS amount,
	                     transactions.Lv_ApprovedOn AS trApprovedOn,
	                     users.FullName AS employee,
	                     'No' AS transferred
                  FROM Lv_monetarytransactionBase AS transactions
                  LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                             FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                             GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
                  LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = transactions.lv_tpaccountId
                  LEFT JOIN AccountBase AS accounts ON accounts.AccountId = tpAccounts.lv_accountid
                  LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
                  LEFT JOIN SystemUserBase AS users ON users.SystemUserId = accounts.OwnerId
                  LEFT JOIN BusinessUnitBase AS desks ON desks.BusinessUnitId = users.BusinessUnitId
                  LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = transactions.TransactionCurrencyId 
                  LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
                  LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 
				  WHERE transactions.lv_TradingPlatformTransactionId IS NOT NULL 
						AND transactions.Lv_TransactionApproved = 1
						AND transactions.Lv_ApprovedOn <= '$endTime'
						AND tpAccounts.Lv_tpaccountId IS NOT NULL
						AND accounts.lv_accountstatus <> 2
			            AND accounts.Lv_FirstName NOT LIKE '%test%'
			            AND accounts.Lv_FirstName NOT LIKE '%firstname%' 
				        AND accounts.Lv_LastName NOT LIKE '%test%' 
				        AND accounts.Lv_LastName NOT LIKE '%lastname%'  ";
	      if($desk)
	          $sql .= " AND desks.BusinessUnitId = '$desk' ";
	      if($employee)
	          $sql .= " AND users.SystemUserId  IN ('".implode("','",$employee)."') ";
	    $sql .= " UNION ALL 
                  SELECT transactions.lv_accountid AS accountId,
                         tpAccounts.Lv_name AS tpAccount,
                         accounts.Name AS accountName,
                         countries.Lv_name AS country,
                         currencies.ISOCurrencyCode AS currency, 
	                     methodOfPayment.Value AS methodOfPayment,
	                     transactionType.Value AS transactionType,
	                     transactions.Lv_Amount AS amount,
	                     transactions.Lv_ApprovedOn AS trApprovedOn,
	                     users.FullName AS employee,
	                     'Yes' AS transferred
                  FROM dbo.Lv_monetarytransactionBase AS transactions
                  LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                             FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                             GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
                  LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_tpaccountId = transactions.lv_oppositeaccountid
                  LEFT JOIN AccountBase AS accounts ON accounts.AccountId = tpAccounts.lv_accountid
                  LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
                  LEFT JOIN SystemUserBase AS users ON users.SystemUserId = accounts.OwnerId
                  LEFT JOIN BusinessUnitBase AS desks ON desks.BusinessUnitId = users.BusinessUnitId
                  LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = transactions.TransactionCurrencyId  
                  LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033 
                  LEFT JOIN dbo.StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = objects.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033 
				  WHERE transactions.lv_TradingPlatformTransactionId IS NOT NULL AND
	                    transactions.Lv_TransactionApproved = 1 AND   
	                    (transactionType.Value = 'Transfer Between Trading Platform Accounts' OR transactionType.Value = 'Transfer Between Trading Platform Accounts Cancelled') AND 
	                    transactions.Lv_ApprovedOn <= '$endTime'
	                    AND tpAccounts.Lv_tpaccountId IS NOT NULL
	                    AND accounts.lv_accountstatus <> 2
			            AND accounts.Lv_FirstName NOT LIKE '%test%'
			            AND accounts.Lv_FirstName NOT LIKE '%firstname%' 
				        AND accounts.Lv_LastName NOT LIKE '%test%' 
				        AND accounts.Lv_LastName NOT LIKE '%lastname%' ";
	      if($desk)
	          $sql .= " AND desks.BusinessUnitId = '$desk' ";
	      if($employee)
	          $sql .= " AND users.SystemUserId  IN ('".implode("','",$employee)."') ";
  $sql .= ") AS transactions   
           GROUP BY accountId, tpAccount, accountName, country, currency, employee";
           
    $customers = $leverateConnect->fetchAll($sql,array('accountId'));
    if(!empty($customers)){
       $tpAccounts = array();    
       foreach($customers as $key=>$value){
    	$tpAccounts[] = $value['tpAccount'];
       }	
       $dbConnect = new DB_Connect('sirix_reports',$GLOBALS['brand_tp'],'sirix_reports');
       
       $sql = "SELECT accounts.LOGIN,
	                   ROUND(accounts.pre_Closed_Pnl,2) AS pre_Closed_Pnl,
	                   ROUND(accounts.pre_Open_Pnl,2) AS pre_Open_Pnl,
                       ROUND(accounts.pre_Pnl,2) AS pre_Pnl,
                       ROUND(accounts.end_Closed_Pnl ".($endDate == $today ? "+ IFNULL(closed_positions.profit,0)" : "").",2) AS end_Closed_Pnl,
                       ROUND(".($endDate == $today ? "users.EQUITY - users.BALANCE - users.CREDIT" 
										           : "accounts.end_Open_Pnl").",2) AS end_Open_Pnl,
					   ROUND(accounts.end_Closed_Pnl ".($endDate == $today ? "+ IFNULL(closed_positions.profit,0) + users.EQUITY - users.BALANCE - users.CREDIT" 
					                                                       : "+ accounts.end_Open_Pnl").",2) AS end_Pnl,					           
					   ROUND(".($endDate == $today ? "users.BALANCE"
					                               : "IFNULL((SELECT BALANCE 
					                                          FROM {$GLOBALS['brandName']}_daily_view
					                                          WHERE LOGIN = accounts.LOGIN
					                                                AND TIME ='$endDate 23:59:59'       
					                                          ),0)").",2) AS balance,
					   ROUND(".($endDate == $today ? "users.EQUITY"
					                               : "IFNULL((SELECT EQUITY 
					                                          FROM {$GLOBALS['brandName']}_daily_view
					                                          WHERE LOGIN = accounts.LOGIN
					                                                AND TIME ='$endDate 23:59:59'       
					                                          ),0)").",2) AS equity                                       					           
       
                FROM (     SELECT LOGIN, 
                                  SUM(IF(TIME<'$startDate 00:00:00',PROFIT_CLOSED,0)) AS pre_Closed_Pnl, 
                                  SUM(IF(TIME<'$startDate 00:00:00',PROFIT-PROFIT_CLOSED,0)) AS pre_Open_Pnl, 
				                  SUM(IF(TIME<'$startDate 00:00:00',PROFIT,0)) AS pre_Pnl,
                                  SUM(PROFIT_CLOSED) AS end_Closed_Pnl, 
                                  SUM(PROFIT-PROFIT_CLOSED) AS end_Open_Pnl, 
				                  SUM(PROFIT) AS end_Pnl
		                   FROM {$GLOBALS['brandName']}_daily_view
		                   WHERE TIME <= '$endDate 23:59:59'
		                         AND LOGIN IN (".implode(",",$tpAccounts).")
		                   GROUP BY LOGIN ".
		                   ($endDate == $today ? "UNION ALL
                                                  SELECT users.LOGIN,
                                                         0 AS pre_Closed_Pnl,
                                                         0 AS pre_Open_Pnl,
                                                         0 AS pre_Pnl,
                                                         0 AS end_Closed_Pnl,
                                                         0 AS end_Open_Pnl,
                                                         0 AS end_Pnl
                                                  FROM {$GLOBALS['brandName']}_users_view AS users
                                                  WHERE users.REGDATE BETWEEN '$endDate 00:00:00' AND '$endDate 23:59:59'
                                                        AND users.LOGIN IN (".implode(",",$tpAccounts).")" 
                                               : "")."
                           ) AS accounts
                ".($endDate == $today ? "LEFT JOIN (SELECT LOGIN ,
                                                           SUM(COMMISSION+SWAPS+TAXES+PROFIT) AS profit
                                                    FROM {$GLOBALS['brandName']}_trades_view
                                                    WHERE CLOSE_TIME BETWEEN '$endDate 00:00:00' AND '$endDate 23:59:59'
							                              AND CMD NOT IN (6,7)
														  AND LOGIN IN (".implode(",",$tpAccounts).")
                                                          GROUP BY LOGIN) AS closed_positions ON closed_positions.LOGIN = accounts.LOGIN
                                        LEFT JOIN {$GLOBALS['brandName']}_users_view AS users ON users.LOGIN = accounts.LOGIN"
									  : "");
	$platform= $dbConnect->fetchAll($sql);
	foreach($customers as $key=>$customer){
		foreach($platform as $platformKey=>$platformValue){
			if($customer['tpAccount'] == $platformValue['LOGIN']){
				unset($platformValue['LOGIN']);
				$customers[$key] = array_merge($customer,$platformValue);
				$pre_PnlKey = $onlyClose ? 'pre_Closed_Pnl' : 'pre_Pnl';
				$end_PnlKey = $onlyClose ? 'end_Closed_Pnl' : 'end_Pnl';
				$customers[$key]['pre_RAB'] = number_format(max($customers[$key]['preNetDeposits'] + $customers[$key][$pre_PnlKey],0), 2, '.', '');
				$customers[$key]['end_RAB'] = number_format(max($customers[$key]['endNetDeposits'] + $customers[$key][$end_PnlKey],0), 2, '.', '');
				$customers[$key]['pnl'] = number_format($customers[$key][$end_PnlKey] - $customers[$key][$pre_PnlKey], 2, '.', '');
				$customers[$key]['real_pnl'] = number_format(max(-$customers[$key]['endNetDeposits'],$customers[$key][$end_PnlKey]) - max(-$customers[$key]['preNetDeposits'],$customers[$key][$pre_PnlKey]), 2, '.', '');
				break;
			}
		}
	
	}								  	
    }
    return $customers;

}

function getTpAccountNetCredit($tpAccountGUID){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	
	$sql = "SELECT tpAccounts.Lv_tpaccountId AS tpAccountGUID,
	               tpAccounts.lv_name AS tpAccount,
	               currencies.ISOCurrencyCode AS currency,
	               ROUND(ISNULL((SELECT SUM(CASE WHEN transactionType.Value IN ('Credit','Bonus','Credit Line','Debit Cancelled')
                                       THEN transactions.Lv_Amount
                                    WHEN transactionType.Value IN ('Credit Cancelled','Bonus Cancelled','Credit Line Cancelled','Debit')
                                    THEN -transactions.Lv_Amount
				                    ELSE 0
			                   END )
	               FROM Lv_monetarytransactionBase AS transactions
	               LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                              FROM {$GLOBALS['leverate_CRM_DB']}.MetadataSchema.Entity
                              GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'Lv_monetarytransactionBase'
	               LEFT JOIN dbo.StringMapBase AS transactionType ON transactionType.ObjectTypeCode = objects.ObjectTypeCode AND transactionType.AttributeValue = transactions.Lv_Type AND transactionType.AttributeName = 'Lv_Type' AND transactionType.LangId = 1033
	               WHERE transactions.lv_tpaccountid = tpAccounts.Lv_tpaccountId
				         AND transactionType.Value IN ('Credit','Credit Cancelled','Bonus','Bonus Cancelled','Credit Line','Credit Line Cancelled','Debit','Debit Cancelled')
						 AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
	                     AND transactions.Lv_TransactionApproved = 1
				   ),0),2) AS totalNetCredit
	        FROM lv_tpaccountBase AS tpAccounts
	        LEFT JOIN TransactionCurrencyBase currencies ON currencies.TransactionCurrencyId = tpAccounts.lv_basecurrencyid
	        WHERE tpAccounts.Lv_tpaccountId = '$tpAccountGUID'";
	return $leverateConnect->fetchAll($sql,array('tpAccountGUID'));
	        
}

function editCredit($tpAccountGUID,$type,$amount){
	require_once "inc/leverate/leverateApi.php";
	
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$lastTransaction = getLastTransaction($tpAccountGUID,$leverateConnect);
	   
	$leverateApi = new leverateApi($GLOBALS['brandName']);
	$result = $leverateApi->internalTransaction($tpAccountGUID,$amount,$type);
	
	if($result['response'] && $result['response']->Result->Code == 'Success' ){
		for($count = 0; $count<10 ; $count++){
	   	   $updatedLastTransaction = getLastTransaction($tpAccountGUID,$leverateConnect);
	   	   if($updatedLastTransaction != $lastTransaction){
	   	   	   break;
	   	   }
	   	   sleep(1);
	   }
	}
	return isset($result['response']) ? $result['response']->Result : $result;
}

function getLastTransaction($tpAccountGUID,$leverateConnect){
	$sql = "SELECT TOP 1 Lv_monetarytransactionId AS lastTransaction
	        FROM Lv_monetarytransactionBase
	        WHERE lv_tpaccountid = '$tpAccountGUID'
	        ORDER BY CreatedOn DESC";
	return $leverateConnect->fetchAll($sql,array('lastTransaction'));
	        
}

function getRetentionCustomers($desk, $employee, $excEmployee, $countries, $drStart, $drEnd, $fdStart, $fdEnd, $ldStart, $ldEnd, $llStart, $llEnd, $lnStart, $lnEnd, $aStart, $aEnd, $leadStatus,$closed){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']);
	$pre_excludeEmployees = array();
	
	$exclude = getExcludeEmployees($desk,$leverateConnect);
	if(!empty($exclude)){
		foreach($exclude as $key=>$value){
			$pre_excludeEmployees[] = $value['EmployeeId'];
		}
	}
	$excEmployee = array_merge($excEmployee,$pre_excludeEmployees);
	   		
	$assignDate = "ISNULL((SELECT CONVERT(DATETIME2(0),MAX(audit.CreatedOn)) AS max_date
	                       FROM AuditBase AS audit 
                           LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                      FROM MetadataSchema.Attribute AS att 
			                          INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                      GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
			                          WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                                            AND audit.Operation = 2
							                AND audit.ObjectId = accounts.AccountId),
				          (SELECT MAX(api.CreatedOn) AS max_date
					       FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.ApiCustomerChangeLog AS api 
					       WHERE api.Type = 'OwnerId'
					             AND api.AccountId = accounts.AccountId
				          ))";
	$sql = "SELECT accounts.AccountId AS customerId,
                   accounts.Name AS customerName,
	               countries.Lv_name AS Country,
	   			   accounts.Lv_UtmCampaign,
	               leadStatus.Value AS leadStatus,
	               deposits.totalDepositUSD,
	               CONVERT(DATETIME2(0),deposits.firstDepositDate) AS firstDepositDate,
	               CONVERT(DATETIME2(0),deposits.lastDepositDate) AS lastDepositDate,
	               CONVERT(DATETIME2(0),accounts.CreatedOn) AS registrationDate,
	               CONVERT(DATETIME2(0),accounts.lean_DateOfLastLoginReal) AS lastLogin,
	               CONVERT(DATETIME2(0),change_log.max_date) AS assignDate,
                   CONVERT(DATETIME2(0),lastNote.maxDate) AS lastNote,
		           CAST(lastNote.Subject AS text) AS Subject,
		           CAST(lastNote.Note AS text) AS Note,
	               employees.FullName As employee
            FROM AccountBase AS accounts
            LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                       FROM MetadataSchema.Entity
                       GROUP BY BaseTableName, ObjectTypeCode) AS objects ON objects.BaseTableName = 'AccountBase'
            LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
            LEFT JOIN SystemUserBase AS employees ON employees.SystemUserId = accounts.OwnerId
            LEFT JOIN (SELECT communications.CreatedOn AS maxDate,
                              communications.Subject,
				              communications.NoteText AS Note,
				              communications.ObjectId
                       FROM AnnotationBase AS communications
		               INNER JOIN (SELECT MAX(n.CreatedOn) AS maxDate,  
		                                  n.ObjectId
		                           FROM AnnotationBase AS n
					               WHERE n.ObjectTypeCode = (SELECT ObjectTypeCode
                                                             FROM MetadataSchema.Entity
                                                             WHERE BaseTableName = 'AccountBase'
                                                             GROUP BY ObjectTypeCode)
                                   GROUP BY n.ObjectId) AS communications2 ON communications.ObjectId = communications2.ObjectId AND communications.CreatedOn = communications2.maxDate
                       WHERE communications.ObjectTypeCode = (SELECT ObjectTypeCode
                                                              FROM MetadataSchema.Entity
                                                              WHERE BaseTableName = 'AccountBase'
                                                              GROUP BY ObjectTypeCode)
		  
		              ) AS lastNote ON lastNote.ObjectId = accounts.AccountId
		    LEFT JOIN StringMapBase AS statuscode ON statuscode.ObjectTypeCode = objects.ObjectTypeCode AND statuscode.AttributeValue = accounts.statuscode AND statuscode.AttributeName = 'statuscode' AND statuscode.LangId = 1033          
            LEFT JOIN StringMapBase AS leadStatus ON leadStatus.ObjectTypeCode = objects.ObjectTypeCode AND leadStatus.AttributeName = 'lv_leadstatus' AND leadStatus.AttributeValue = accounts.Lv_LeadStatus AND leadStatus.LangId = 1033
            LEFT JOIN (SELECT transactions.lv_accountid,
                              SUM(transactions.Lv_USDValue) AS totalDepositUSD,
                              MIN(transactions.Lv_ApprovedOn) AS firstDepositDate,
				              MAX(transactions.Lv_ApprovedOn) AS lastDepositDate
                       FROM Lv_monetarytransactionBase AS transactions
		               LEFT JOIN (SELECT BaseTableName, ObjectTypeCode
                                  FROM MetadataSchema.Entity
                                  GROUP BY BaseTableName, ObjectTypeCode) AS transactionObject ON transactionObject.BaseTableName = 'Lv_monetarytransactionBase'
                       LEFT JOIN StringMapBase AS methodOfPayment ON methodOfPayment.ObjectTypeCode = transactionObject.ObjectTypeCode AND methodOfPayment.AttributeName = 'Lv_MethodofPayment' AND methodOfPayment.AttributeValue = transactions.Lv_MethodofPayment AND methodOfPayment.LangId = 1033
		               WHERE transactions.Lv_Type = 1
		                     AND methodOfPayment.Value NOT IN ('Internal','Fee','Inactivity Fee')
			                 AND transactions.Lv_TransactionApproved = 1
			                 AND transactions.lv_TradingPlatformTransactionId IS NOT NULL
                       GROUP BY transactions.lv_accountid
				      ) AS deposits ON deposits.lv_accountid = accounts.AccountId
			LEFT JOIN (SELECT MAX(cl.max_date) AS max_date, cl.AccountId 
                       FROM
                       (SELECT MAX(audit.CreatedOn) AS max_date, audit.ObjectId AS AccountId
	                   FROM AuditBase AS audit 
                       LEFT JOIN (SELECT ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber 
                                  FROM MetadataSchema.Attribute AS att 
			                      INNER JOIN MetadataSchema.Entity AS ent ON att.EntityId = ent.EntityId
                                  GROUP BY ent.BaseTableName, ent.ObjectTypeCode, att.name, att.ColumnNumber) AS aoField  ON aoField.BaseTableName='AccountBase' AND aoField.name='OwnerId'
				       WHERE audit.ObjectTypeCode=aoField.ObjectTypeCode AND audit.AttributeMask LIKE '%,'+ CAST(aoField.ColumnNumber AS VARCHAR)+',%'
                             AND audit.Operation = 2 
					   GROUP BY audit.ObjectId
					   UNION ALL
					   SELECT MAX(api.CreatedOn) AS max_date, api.AccountId
					   FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.ApiCustomerChangeLog AS api 
					   WHERE api.Type = 'OwnerId'
					   GROUP BY api.AccountId) AS cl
					   GROUP BY cl.AccountId
					   ) AS change_log ON change_log.AccountId= accounts.AccountId	      
			WHERE deposits.firstDepositDate IS NOT NULL
			      AND accounts.lv_accountstatus <> 2
			      AND accounts.Lv_FirstName NOT LIKE '%test%'
			      AND accounts.Lv_FirstName NOT LIKE '%firstname%' 
				  AND accounts.Lv_LastName NOT LIKE '%test%' 
				  AND accounts.Lv_LastName NOT LIKE '%lastname%'";
    if($desk)
    	$sql .= " AND employees.BusinessUnitId = '$desk'";
    
    if($employee)
    	$sql .= " AND employees.SystemUserId IN ('".implode("','",$employee)."')";   
    
    if($excEmployee)
    	$sql .= " AND employees.SystemUserId NOT IN ('".implode("','",$excEmployee)."')";    
    
    if($countries)
        $sql .= " AND countries.Lv_name IN ('".implode("','",$countries)."')";
 
    if($drStart)
        $sql .= $drEnd ? " AND accounts.CreatedOn BETWEEN '$drStart 00:00:00' AND '$drEnd 23:59:59'" : " AND accounts.CreatedOn >= '$drStart 00:00:00'";
     else       
        $sql .= $drEnd ? " AND accounts.CreatedOn <= '$drEnd 23:59:59'" : "";
        
    if($fdStart)
        $sql .= $fdEnd ? " AND deposits.firstDepositDate BETWEEN '$fdStart 00:00:00' AND '$fdEnd 23:59:59'" : " AND deposits.firstDepositDate >= '$fdStart 00:00:00'";
    else       
        $sql .= $fdEnd ? " AND deposits.firstDepositDate <= '$fdEnd 23:59:59'" : "";
        
	if($ldStart)
        $sql .= $ldEnd ? " AND deposits.lastDepositDate BETWEEN '$ldStart 00:00:00' AND '$ldEnd 23:59:59'" : " AND deposits.lastDepositDate >= '$ldStart 00:00:00'";
    else       
        $sql .= $ldEnd ? " AND deposits.lastDepositDate <= '$ldEnd 23:59:59'" : "";	    
    
	if($llStart)
        $sql .= $llEnd ? " AND accounts.lean_DateOfLastLoginReal BETWEEN '$llStart 00:00:00' AND '$llEnd 23:59:59'" : " AND accounts.lean_DateOfLastLoginReal >= '$llStart 00:00:00'";
    else       
        $sql .= $llEnd ? " AND (accounts.lean_DateOfLastLoginReal IS NULL OR accounts.lean_DateOfLastLoginReal <= '$llEnd 23:59:59')" : "";
	 
	if($lnStart)
        $sql .= $lnEnd ? " AND lastNote.maxDate BETWEEN '$lnStart 00:00:00' AND '$lnEnd 23:59:59'" : " AND lastNote.maxDate >= '$lnStart 00:00:00'";
     else       
        $sql .= $lnEnd ? " AND (lastNote.maxDate IS NULL OR lastNote.maxDate <= '$lnEnd 23:59:59')" : "";
	
	if($aStart)
        $sql .= $aEnd ? " AND change_log.max_date BETWEEN '$aStart 00:00:00' AND '$aEnd 23:59:59'" : " AND change_log.max_date >= '$aStart 00:00:00'";
     else       
        $sql .= $aEnd ? " AND (change_log.max_date IS NULL OR change_log.max_date <= '$aEnd 23:59:59')" : "";
	
    if($leadStatus)
        $sql .= " AND accounts.Lv_LeadStatus IN (".implode(",",$leadStatus).")";			 	 
	
	if($closed)
	    $sql .= " AND accounts.Name LIKE '%close%'";
    else
		$sql .= " AND accounts.Name NOT LIKE '%close%'";
		 		
    return $leverateConnect->fetchAll($sql,array('customerId'));   				      
}

function getExcludeEmployees($desk,$connection = false){
	$leverateConnect = !$connection ? new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['leverate_CRM']) : $connection;
	
	$sql = "SELECT exclude.ExcludeEmployeeId,
	               exclude.EmployeeId,
	               employees.FullName
	        FROM {$GLOBALS['inventiva_CRM_DB']}.dbo.ExcludeEmployee AS exclude
	        LEFT JOIN SystemUserBase AS employees ON employees.SystemUserId = exclude.EmployeeId";
	if($desk)
	  $sql .= " WHERE employees.BusinessUnitId = '$desk'";
	
	return $leverateConnect->fetchAll($sql,array('EmployeeId'));
	
}

function addPreExcludeEmployee($employee){
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
    
    $sql = " SELECT * FROM ExcludeEmployee
	         WHERE EmployeeId='$employee'";
	$excluded = $leverateConnect->fetchAll($sql,array('EmployeeId'));		 
	$isExcluded = isset($excluded[0]);  
	if($isExcluded)
	  return 'Employee is already excluded';
	$sql = " INSERT INTO ExcludeEmployee (EmployeeId) VALUES ('$employee')";
	return $leverateConnect->exec($sql);
    
}

function deletePreExcludeEmployee($id){
	$leverateConnect = new leverateDB_Connection($GLOBALS['db_host'],$GLOBALS['inventiva_CRM']);
	
	$sql = "DELETE FROM ExcludeEmployee WHERE ExcludeEmployeeId = $id";
	return $leverateConnect->exec($sql);
	
}
?>

