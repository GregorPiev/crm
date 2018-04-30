<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: *");
header("Content-Type: application/json");

date_default_timezone_set("UTC");

ini_set('memory_limit', '-1');


require_once "inc/db.php";
require_once "inc/SoapProxy.php";
require_once "inc/LeverateCrm.php";
require_once "inc/leverate.php";
require_once "inc/config.php";
require_once 'inc/safecharge.php';
require_once 'inc/rain.tpl.class.php';
raintpl::configure("base_url", "/");
raintpl::configure("tpl_dir", "tpl/");
raintpl::configure("cache_dir", "tmp/");
raintpl::configure('path_replace', false);

require_once "inc/email/Email.php";


session_start();

if (isset($_GET['debug'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
}

//if request is not login attempt
//and no session exists, block it
if (isset($_GET['cmd']) && $_GET['cmd'] != "login") {
    if ((!isset($_SESSION["user_is_loggedin"]) || !$_SESSION["user_is_loggedin"]) && $_GET['cmd'] != "resetPassword" && $_GET['cmd'] != "loginBrandChoice") {
        die('{"error":"No Access"}');
    }
}

$config = new config();
$brandName = 'rtc';
$leverate_CRM = 'rtc_leverate';
$inventiva_CRM = 'rtc_inventiva';
//$brandName = 'vincicm';
//$leverate_CRM = 'vinci';
//$inventiva_CRM = 'vinci_rds';
$db_host = 'mssql_rds';
$lfs = true;
$leverate_CRM_DB = $config::get_db_name('rtc_leverate');
$inventiva_CRM_DB = $config::get_db_name('rtc_inventiva');
$brand_tp = 'rtc_tp';
//$leverate_CRM_DB = $config::get_db_name('vinci');
//$inventiva_CRM_DB = $config::get_db_name('vinci_rds');
//$brand_tp = 'vinci_tp';
$site_name_lowercase = strtolower($config::SITE_NAME);

switch ($_GET['cmd']) {
    case 'getUsers':
        echo json_encode(getUsers());
        exit();
    case 'getUserData':
        $userData = $_SESSION['userdata'];
        unset($userData['password'], $userData['updatePasswordDate'], $userData['password_valid']);
        echo json_encode($userData);
        exit();
    case 'getEditableUserColumns':
        echo json_encode(getEditableUserColumns());
        exit();
    case 'changeUser':
        echo json_encode(changeUser($_POST));
        exit();
    case 'resetPassword':
        if (!isset($_POST['username']))
            die('{"error":"Missing Arguments"}');
        echo json_encode(resetPassword($_POST['username']));
        exit();
    case 'getFailedDeposits':

        if (!isset($_POST["dpStart"]) || !isset($_POST["dpEnd"]) || !isset($_POST["ftd"]) || !isset($_POST["desk"]))
            die('{"error":"Missing arguments"}');

        $campaigns = !isset($_POST["campaign"]) ? false : $_POST["campaign"];
        $employee = !isset($_POST["employee"]) ? false : $_POST["employee"];

        echo json_encode(getFailedDeposits($_POST["dpStart"], $_POST["dpEnd"], $campaigns, $_POST["desk"], $employee, $_POST["ftd"]));
        exit();
    case 'getTemplateList':
        echo json_encode(getTemplateList());
        exit;

    default:
        die('{"error":"Unknown command"}');
}
function getFailedDeposits($dpStart, $dpEnd, $campaigns, $desk, $employee, $ftd) {
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['leverate_CRM']);

    $sql = "SELECT accounts.AccountId,
                   accounts.Name AS customerName,
                   countries.Lv_name AS country,
                   CONVERT(DATETIME2(0),dLog.CreatedOn) AS date,
                   dLog.Lv_DepositAmount AS amount,
                   currencies.ISOCurrencyCode AS currency,
                   CASE WHEN CHARINDEX('TP Name',dLog.Description) <> 0 AND CHARINDEX('transaction_id',dLog.Description) <> 0
				        THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('TP Name',dLog.Description),CHARINDEX('transaction_id',dLog.Description)-CHARINDEX('TP Name',dLog.Description)),'->',2)
						ELSE NULL
                    END
                    AS tpAccount,
                   CASE WHEN CHARINDEX('card last 4 digits',dLog.Description) <> 0 AND CHARINDEX('card expiry month',dLog.Description) <> 0
				        THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('card last 4 digits',dLog.Description),CHARINDEX('card expiry month',dLog.Description)-CHARINDEX('card last 4 digits',dLog.Description)),'->',2)
						ELSE NULL
                    END
				    AS cardNum,
                   CASE WHEN CHARINDEX('PROCESSOR',dLog.Description) <> 0
				        THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('PROCESSOR',dLog.Description),LEN(dLog.Description)-CHARINDEX('PROCESSOR',dLog.Description)+1),'=',2)
						ELSE NULL
                    END
				    AS processor,
                   CASE WHEN CHARINDEX('reason of deposit failure',dLog.Description) <> 0 AND CHARINDEX('card last 4 digits',dLog.Description) <> 0
				        THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('reason of deposit failure',dLog.Description),CHARINDEX('card last 4 digits',dLog.Description)-CHARINDEX('reason of deposit failure',dLog.Description)),'->',2)
						ELSE NULL
                    END
				    AS reason,
					CASE WHEN CHARINDEX('IP address',dLog.Description) <> 0 AND CHARINDEX('currency',dLog.Description) = 0
				        THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('IP address',dLog.Description),(CASE WHEN CHARINDEX('PROCESSOR',dLog.Description) <> 0 THEN CHARINDEX('PROCESSOR',dLog.Description) ELSE LEN(dLog.Description) END)-CHARINDEX('IP address',dLog.Description)),'->',2)
						ELSE NULL
                    END
				    AS ipAddress,
				   accounts.Lv_UtmCampaign AS campaign,
				   employee.FullName AS employee,
				   CASE WHEN firstDeposit.date IS NULL OR dLog.CreatedOn < firstDeposit.date
				        THEN 'YES'
				        ELSE 'NO'
				   END AS ftd
		    FROM IncidentBase AS dLog
		    LEFT JOIN AccountBase AS accounts ON accounts.AccountId = dLog.CustomerId
		    LEFT JOIN Lv_tpaccountBase AS tpAccounts ON tpAccounts.Lv_name = (CASE WHEN CHARINDEX('TP Name',dLog.Description) <> 0 AND CHARINDEX('transaction_id',dLog.Description) <> 0
				                                                              THEN Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('TP Name',dLog.Description),CHARINDEX('transaction_id',dLog.Description)-CHARINDEX('TP Name',dLog.Description)),'->',2)
						                                                      ELSE NULL
                                                                              END)
            LEFT JOIN (SELECT  previous.lv_accountid AS accountId, MIN(previous.Lv_ApprovedOn) AS date
	       						FROM Lv_monetarytransactionBase AS previous
		   						WHERE previous.Lv_TransactionApproved = 1
		   						      AND previous.Lv_MethodofPayment<>1
			     					  AND previous.lv_TradingPlatformTransactionId IS NOT NULL
				 					  AND previous.Lv_Type = 1
		   						GROUP BY previous.lv_accountid) AS firstDeposit ON firstDeposit.AccountId = accounts.AccountId
		    LEFT JOIN Lv_countryBase AS countries ON countries.Lv_countryId = accounts.Lv_countryId
		    LEFT JOIN TransactionCurrencyBase AS currencies ON currencies.TransactionCurrencyId = tpAccounts.lv_basecurrencyid
		    LEFT JOIN SystemUserBase AS employee ON employee.SystemUserId =  accounts.OwnerId
		    LEFT JOIN BusinessUnitBase AS businessUnit ON businessUnit.BusinessUnitId = employee.BusinessUnitId
            WHERE dLog.Title LIKE '%deposit failure%'
                  AND dLog.CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'";
    if ($desk)
        $sql .= " AND businessUnit.BusinessUnitId = '$desk'";
    if ($campaigns)
        $sql .= " AND accounts.Lv_UtmCampaign IN ('" . implode("','", $campaigns) . "')";
    if ($employee)
        $sql .= " AND employee.SystemUserId IN ('" . implode("','", $employee) . "')";

    if ($ftd != 'all') {
        if ($ftd)
            $sql .= " AND (firstDeposit.date IS NULL OR dLog.CreatedOn < firstDeposit.date) ";
        else
            $sql .= " AND firstDeposit.date <= dLog.CreatedOn ";
    }
    /*         SELECT dLog2.CustomerId ,
      MAX(CONVERT(DATETIME2(0),dLog.CreatedOn) AS date) AS mxDate,
      accounts.[AccountId] AS AccountId,
      accounts.Name AS customerName,
      accounts.Lv_Currencies AS currency,
      accounts.Lv_IP AS ip,
      accounts.Lv_UtmCampaign AS campaign,
      countriesList.Lv_name AS country,
      currencyBase.ISOCurrencyCode As  currency,
      employeeList.FullName  As employee,
      monetary.Lv_USDValue  As USDValue,
      Tools.dbo.customSplit(SUBSTRING(dLog.Description,CHARINDEX('reason of deposit failure',dLog.Description),CHARINDEX('card last 4 digits',dLog.Description)-CHARINDEX('reason of deposit failure',dLog.Description)),'->',2) AS reason,
      dLog.Lv_DepositAmount AS depositAmount,
      CONVERT(DATETIME2(0),dLog.CreatedOn) AS date,
      monetary.Lv_TransactionApproved AS ftds

      FROM IncidentBase AS dLog
      LEFT JOIN AccountBase AS accounts ON accounts.AccountId = dLog.CustomerId
      LEFT JOIN Lv_countryBase AS countriesList  ON countriesList.Lv_countryId = accounts.lv_ipcountryid


      LEFT JOIN Lv_monetarytransactionBase AS monetary on monetary.lv_accountid = accounts.AccountId

      LEFT JOIN TransactionCurrencyBase AS currencyBase  ON currencyBase.TransactionCurrencyId = monetary.TransactionCurrencyId
      LEFT JOIN SystemUserBase AS employeeList ON employeeList.[SystemUserId] =  accounts.OwnerId
      LEFT JOIN BusinessUnitBase AS desks ON desks.BusinessUnitId = employeeList.BusinessUnitId

      LEFT JOIN (SELECT  previous.lv_accountid AS accountId, MIN(previous.Lv_ApprovedOn) AS date
      FROM Lv_monetarytransactionBase AS previous
      WHERE previous.Lv_TransactionApproved = 1
      AND previous.Lv_MethodofPayment<>1
      AND previous.lv_TradingPlatformTransactionId IS NOT NULL
      AND previous.Lv_Type = 1
      GROUP BY previous.lv_accountid) AS firstDeposit ON firstDeposit.AccountId = accounts.AccountId ";
      $sql .="INNER JOIN (SELECT CustomerId, MAX(CreatedOn) AS maxDate FROM IncidentBase AS d
      WHERE Title LIKE '%deposit failure%'
      AND CreatedOn BETWEEN '$dpStart 00:00:00' AND '$dpEnd 23:59:59'

      GROUP BY CustomerId) AS dLog2 ON (dLog.CustomerId=dLog2.CustomerId  AND dLog.CreatedOn=dLog2.maxDate )";
      $sql .="  Where monetary.Lv_name = 'Deposit' ";
      $sql .="And   dLog.CreatedOn =(SELECT MAX(CreatedOn) AS maxDateCreate FROM IncidentBase AS insBase Where insBase.CustomerId =dLog.CustomerId  )";

      if($campaignId!='0'){
      $sql .=" And  accounts.Lv_UtmCampaign   IN ('".implode("','",$campaignId)."')";
      }
      if($employeeId!='0'){
      $sql .=" And employeeList.SystemUserId IN ('".implode("','",$employeeId)."') ";
      }
      if($ftdId!='3'){
      $sql .="And monetary.Lv_TransactionApproved=$ftdId ";
      }
      if($desk){
      $sql .= " AND desks.BusinessUnitId = '$desk' ";
      }
      //$sql .=" Group By  dLog2.CustomerId  Order by date DESC";
      //echo $sql;

     */

    return $leverateConnect->fetchAll($sql, array('AccountId'));
}
function getUsers() {
    // $TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();

//                 $sql = "SELECT users.*
//                 , desks.name AS desk, CONCAT(UCASE(LEFT(departments.name, 1)),SUBSTRING(departments.name, 2)) AS department
//                 FROM users
    // LEFT JOIN desks ON desks.id = users.deskId
    //LEFT JOIN departments ON departments.id = users.departmentId
    //WHERE affiliate_user = 0";
//                 $sql = "SELECT users.*,
//                             (SELECT desks.name FROM desks where desks.id=user_desks.deskId) Desk
//                             FROM users
//                             LEFT JOIN departments ON departments.id = users.departmentId
//                             LEFT JOIN user_desks ON user_desks.userId = users.id
//                             WHERE `affiliateCanSee` = 0";
    // $sql = "SELECT users.*  FROM users ";
    $sql = " SELECT users.* ,
                                (Select GROUP_CONCAT(brand_access.brandId SEPARATOR ',')
                                FROM brand_access WHERE brand_access.userId =users.id ) as brands,
                                (SELECT GROUP_CONCAT(brands.name SEPARATOR ',') as brName FROM brands where brands.id in (
                                        Select brand_access.brandId FROM brand_access WHERE brand_access.userId =users.id
                                )) as brandNames
                                FROM users";

    $users = $MySqlDriverDB->fetchAll($sql);
    if (!empty(array_filter($users))) {
        return $users;
    } else {
        return false;
    }
}
/**
 * @return bool|array
 */
function getEditableUserColumns() {
    //$TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();
    //$query = "CALL editableUserColumns()";
    $query = "SELECT COLUMN_NAME,
		IF(DATA_TYPE='tinyint' OR DATA_TYPE='enum' ,'SELECT','INPUT') AS TYPE, DATA_TYPE, COLUMN_TYPE  ,
                                REPLACE (CONCAT(UCASE(LEFT(COLUMN_NAME, 1)), SUBSTRING(COLUMN_NAME, 2)),'_',' ') AS TITLE
                                FROM information_schema.columns
                                WHERE table_schema = 'MainCoon'
                                AND table_name = 'users'
                                AND column_name NOT IN ('updatePasswordDate', 'session' , 'password_valid')
                                Order by DATA_TYPE DESC";
    $columns = $MySqlDriverDB->fetchAll($query);

    if (!empty(array_filter($columns))) {
        foreach ($columns as $key => $value) {
            if ($value['DATA_TYPE'] == 'enum') {
                $column_type = $value['COLUMN_TYPE'];
                preg_match('/enum\((.*)\)$/', $column_type, $matches);
                $matches = str_replace("'", "", $matches[1]);
                $enum_values = explode(',', $matches);
                $columns[$key]['OPTIONS'] = array();
                foreach ($enum_values as $enum_key => $enum_value) {
                    $columns[$key]['OPTIONS'][] = array("value" => $enum_value, "text" => $enum_value);
                }
            } else if ($value['DATA_TYPE'] == 'tinyint' && $value['COLUMN_NAME'] !== 'per_desk') {
                $columns[$key]['OPTIONS'] = array(array("value" => "0", "text" => "No"), array("value" => "1", "text" => "Yes"));
            } else if ($value['DATA_TYPE'] == 'tinyint' && $value['COLUMN_NAME'] == 'per_desk') {

                $TradingPlatformDB = new spotDB_TradingPlatform();
                $query2 = "SELECT desks.id  as deskId, desks.name as desk  FROM desks";
                $option_values_2 = $TradingPlatformDB->fetchAll($query2);
                if (!empty(array_filter($option_values_2))) {
                    $columns[$key]['OPTIONS'] = array();
                    foreach ($option_values_2 as $option_key => $option_value) {
                        $columns[$key]['OPTIONS'][] = array("value" => $option_value['deskId'], "text" => $option_value['desk']);
                    }
                }
            }
        }
        $lengthColumns = count($columns);
        $columns[$lengthColumns]['COLUMN_NAME'] = 'brands';
        $columns[$lengthColumns]['TYPE'] = 'SELECT2';
        $columns[$lengthColumns]['DATA_TYPE'] = 'tinyint';
        $columns[$lengthColumns]['OPTIONS'] = array();
        $columns[$lengthColumns]['TITLE'] = 'Brands';
        $columns[$lengthColumns]['COLUMN_TYPE'] = 'tinyint(1)';


        $query2 = "SELECT brands.id as brandId, brands.name as brand FROM brands";
        $option_values_3 = $MySqlDriverDB->fetchAll($query2);
        if (!empty(array_filter($option_values_3))) {

            foreach ($option_values_3 as $option_key => $option_value) {
                $columns[$lengthColumns]['OPTIONS'][] = array("value" => $option_value['brandId'], "text" => $option_value['brand']);
            }
        }
        asort($columns);
        return $columns;
    } else {
        return false;
    }
}
function changeUser($params) {
    $MySqlDriverDB = new MySqlDriver();

    if (!array_key_exists('brands', $params)) {
        $params['brands'] = 0;
    }

    if (!isset($params['type']) || !in_array($params['type'], array('edit', 'add'))) {
        return array('status' => 'error', 'error_message' => 'Missing or Invalid type');
    }

    $type = $params['type'];
    unset($params['type']);
    $editableColumns = getEditableUserColumns();


    foreach ($editableColumns as $key => $value) {
        if ($type == 'add' && $value['COLUMN_NAME'] == 'id')
            continue;
        if (!isset($params[$value['COLUMN_NAME']]))
            return array('status' => 'error', 'error_message' => 'Missing ' . $value['COLUMN_NAME']);
    }
    //echo "Stage 3<br>\n";

    foreach ($params as $key => $value) {
        $column_exist = 0;
        foreach ($editableColumns as $column_key => $column_value) {
            if ($key == $column_value['COLUMN_NAME']) {
                $column_exist = 1;
                break;
            }
        }
        if ($column_exist == 0) {
            return array('status' => 'error', 'error_message' => $key . ' is not user parameter.');
        }
    }

    //echo "Stage 4<br>\n";
    if (!filter_var($params['email'], FILTER_VALIDATE_EMAIL))
        return array('status' => 'error', 'error_message' => 'Invalid Email');

    //echo "Stage 5<br>\n";

    $user_exist = $type == 'add' ? getByUserName($params['username']) : getById($params['id']);
    setUserParams();

    //echo "Stage 6<br>\n";

    if ($type == 'add') {
        $query_email_test = "SELECT count(*) cnt FROM users where email='" . trim($params['email']) . "'";
        $email_test = $MySqlDriverDB->fetchAll($query_email_test);
        if ($email_test[0]['cnt'] >= 1) {
            return array('status' => 'error', 'error_message' => 'Email like this exist yet. Please choose other');
        }


        if ($user_exist)
            return array("status" => "error", "error_message" => "User Name exists");
        //$params['creatorId'] = isset($_SESSION) ? $_SESSION['userid'] : 0 ;
        unset($params['id']);
        $userId = set($params);
        //echo "Stage 7<br>\n";
    }else {

        $query_email_test = "SELECT count(*) cnt FROM users where email='" . trim($params['email']) . "' And id<>{$params['id']}";
        $email_test = $MySqlDriverDB->fetchAll($query_email_test);
        if ($email_test[0]['cnt'] >= 1) {
            return array('status' => 'error', 'error_message' => 'Email like this exist yet. Please choose other');
        }


        if (!$user_exist)
            return array("status" => "error", "error_message" => "User does not exist");
        $username_exist = getByUserName($params['username']);
        if ($username_exist && $username_exist['id'] != $params['id'])
            return array("status" => "error", "error_message" => "User Name exists");
        unset($params['id']);



        $userId = updateById($user_exist['id'], $params) ? $user_exist['id'] : false;
        //echo "Stage 8<br>\n";
    }

    if (!$userId)
        return array("status" => "error", "error_message" => "Unable to {$type} user");
    return array('status' => 'success', 'username' => $params['username']);
}
/**
 * @param  string $username
 * @return bool|array
 */
function getByUserName($username) {
    //$TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();
    $query = "SELECT * FROM users WHERE username= '{$username}'";

    $user = $MySqlDriverDB->fetchAll($query);
    if (!empty(array_filter($user)))
        return $user[0];
    return false;
}
/**
 * @param  int $userId
 * @return bool|array
 */
function getById($userId) {
    //$TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();
    $query = "SELECT * FROM users WHERE id={$userId} LIMIT 1";

    $user = $MySqlDriverDB->fetchAll($query);
    if (!empty(array_filter($user)))
        return $user[0];
    return false;
}
/**
 * @param  array $params
 * @return bool|int
 */
function set($params) {
    // $TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();
    $keys = array_keys($params);
    $fields = implode(',', $keys);
    //$values = implode(',',$keys);
    $fields = str_replace(',brands', '', $fields);

    $itr = 0;
    foreach ($params as $key => $value) {
        //$stmt->bindValue(":{$key}",$value);
        if ($key == 'brands') {
            if ($value == 0) {
                $brand = 0;
            } else {
                $brand = $value;
            }
        } else {
            if ($itr == 0) {
                $values .= '"' . $value . '"';
            } else {
                $values .= ',"' . $value . '"';
            }
            $itr++;
        }
    }

    $query = "INSERT INTO users ({$fields}) VALUES ({$values})";
    //echo $query."\n";
    $MySqlDriverDB->exec($query);
    $user = $MySqlDriverDB->execID();

    if ($brand != 0) {
        foreach ($brand as $keyc => $valc) {
            $queryci = "insert into brand_access (`userId`,`brandId`) values({$user},{$valc})";
            $MySqlDriverDB->exec($queryci);
        }
    }


    if ($user)
        return $user;
    return false;
}
/**
 * @param  int   $userId
 * @param  array $params
 * @return bool
 */
function updateById($userId, $params) {
    $MySqlDriverDB = new MySqlDriver();
    $last_key = end(array_keys($params));
    $query = "UPDATE users SET ";
    $iter = 0;
    foreach ($params as $key => $value) {
        if ($key == 'brands') {
            //updateBrands($value,$userId);
            if ($value == 0) {
                $queryd = "DELETE from brand_access where userId={$userId}";
                $MySqlDriverDB->exec($queryd);
            } else {
                $value_string = implode(",", $value);
                $querycd = "DELETE from brand_access where userId={$userId} And brandId not in ({$value_string})";
                $MySqlDriverDB->exec($querycd);

                foreach ($value as $keyc => $valc) {
                    $queryc = "select * from brand_access where userId={$userId} And brandId ={$valc}";
                    $branc = $MySqlDriverDB->fetchAll($queryc);
                    if (empty(array_filter($branc))) {
                        $queryci = "insert into brand_access (`userId`,`brandId`) values({$userId},{$valc})";
                        $MySqlDriverDB->exec($queryci);
                    };
                }
            }
        } else {
            if ($iter == 0) {
                $query .= "$key = '{$value}' ";
            } else {
                $query .= ",$key = '{$value}' ";
            }
            $iter++;
        }
    }
    $query .= "WHERE id = {$userId}";
    $MySqlDriverDB->exec($query);
    return true;
}
/*
 *
 */
function updateBrands($value, $userId) {
    $MySqlDriverDB = new MySqlDriver();
    if ($value == 0) {
        $query = "DELETE from brand_access where userId={$userId}";
        $MySqlDriverDB->exec($query);
    }
}
/**
 * @param  string $url
 * @return void
 */
function setUserParams($url = '') {
    //$TradingPlatformDB = new spotDB_TradingPlatform();
    $MySqlDriverDB = new MySqlDriver();
    $userId = isset($_SESSION['userid']) ? (int) $_SESSION['userid'] : 0;
    $userIp = isset($_SESSION['user_ip']) ? $_SESSION['user_ip'] : '';
}
/*
 * @param  string $username
 */
function resetPassword($username) {
    if (empty($username))
        die('{"msg":"Invalid username."}');

    $username = addslashes($username);
    //$username = mysql_real_escape_string($username);

    $MySqlDriverDB = new MySqlDriver();
    $query = "SELECT * FROM users WHERE username='{$username}'";
    $result = $MySqlDriverDB->fetchAll($query);

    if ($result[0]['userStatus'] == 'inactive')
        die('{"msg":"The account is inactive."}');

    if (count($result) >= 1) {
        if (!filter_var($result[0]['email'], FILTER_VALIDATE_EMAIL))
            die('{"msg":"Invalid Email."}');


        $user = ['username' => $username, 'id' => $result[0]['id'], 'email' => $result[0]['email']];
        $keySecret = generateKey();
        $setSecretKey = setSecretKey($user['id'], $keySecret);

        if (!$setSecretKey) {
            die('{"msg":"Please try again."}');
        }

        $email = new Email();
        $email->resetPassword($user, $keySecret);

        $email_result = $email->sendEmail($user['email']);
        if ($email_result)
            die('{"msg":"Link is sent to email ' . $user["email"] . '."}');
        else
            die('{"msg":"Please try again."}');
    } else {
        die('{"msg":"Username not found please signup now!!"}');
    }
}
function setSecretKey($userId, $keySecret) {
    $MySqlDriverDB = new MySqlDriver();
    $query = "INSERT INTO secret_keys (secret_key,userId,isActivated) VALUES ('{$keySecret}', {$userId}, 0)";
    return $MySqlDriverDB->exec($query) ? true : false;
}
/*
 *
 */
function generateKey() {
    $chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"; // Base62
    $key = '';
    for ($i = 0; $i < 32; $i++) {
        $randNum = rand(0, 61);
        $key .= $chars[$randNum];
    }
    return $key;
}
/**
 *
 */
function getTemplateList() {
    $leverateConnect = new leverateDB_Connection($GLOBALS['db_host'], $GLOBALS['inventiva_CRM']);

    $sql = "SELECT [CommunicationTemplateId] as id ,[Name] , [Subject], [NoteText],[LeadStatus]
	            FROM dbo.CommunicationTemplate";

    return $leverateConnect->fetchAll($sql, array());
}
?>