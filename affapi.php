<?php

  header("Access-Control-Allow-Orgin: *");
  header("Access-Control-Allow-Methods: *");
  header("Content-Type: application/json");
  
  //date_default_timezone_set("Europe/London");
  date_default_timezone_set("UTC");
  
  ini_set('memory_limit', '-1');
  
   if(isset($_GET['debug'])) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
   }

  require_once "inc/db.php";
  require_once "inc/spotoption.php";
  session_start();
  
  //TODO: DB This
  $office_IP = '212.143.137.36';
  $arr_apiusers['lolwot'] = array(  'api_username'  => 'lolwot',
                                    'api_password'  => 'jDVwmSZj6aCEKvXm',
                                    'api_ips'       => array('104.130.230.165'),
                                    'api_campaigns' => array(519, 524, 525));
  
  if(!function_exists('getUserIpAddr')) {
    function getUserIpAddr() {
      if (!empty($_SERVER['HTTP_CLIENT_IP'])) { 
        return $_SERVER['HTTP_CLIENT_IP'];
      } elseif(!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $tmpaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
        $pos = strrpos($tmpaddress, ",");
        if($pos !== false) {
          $tmpaddress = substr($tmpaddress,0,$pos); 
        }
        return $tmpaddress;
      } else {
        return $_SERVER['REMOTE_ADDR'];
      }
    }
  }
  function validateDateStr($dp) {
    $date_regex = '/^(19|20)\d\d[\-\/.](0[1-9]|1[012])[\-\/.](0[1-9]|[12][0-9]|3[01])$/';
    if (!preg_match($date_regex, $dp)) {
      return false;
    } else {
      return true;
    }
  }
  
  function validateOrderStr($order) {
    if(trim(strtolower($order)) == 'desc' || trim(strtolower($order)) == 'asc') {
      return true;
    } else {
      return false;
    }
  } 
  
  // Vlidation Step 1: User & Password
  if (!isset($_REQUEST["api_username"]) || !isset($_REQUEST["api_password"])) {
    die('{"error":"Missing username or password"}');
  } else {
    //TODO: Get by user & password form DB
    if(isset($arr_apiusers[$_REQUEST["api_username"]]) && $arr_apiusers[$_REQUEST["api_username"]]['api_password'] == $_REQUEST["api_password"]) {
      $api_user = $arr_apiusers[$_REQUEST["api_username"]];
    } else {
      die('{"error":"Bad username or password"}');
    }
  }

  // Vlidation Step 2: IP
  $ip = getUserIpAddr();
  if(!in_array($ip, $api_user['api_ips']) && $ip!=$office_IP) {
    die('{"error":"Invalid IP address"}');
  }
  
  switch ($_GET['cmd']) {
    case 'getPerformanceSummary':
      echo json_encode(getPerformanceSummary($api_user));
      break;
    case 'valDate':
      echo json_encode(validateDateStr($_REQUEST['dpStart']));
      break;
  }

  function getPerformanceSummary($api_user) {
    $date_add = (isset($_REQUEST['date_add'])) ? $_REQUEST['date_add'] : 0;
    $join_type = (isset($_REQUEST['data']) && $_REQUEST['data'] == 'deposits') ? 'INNER' : 'LEFT'; 
    $TradingPlatformDB = new spotDB_TradingPlatform();
    
    $sql = 'SELECT customers.id, a_bid as track_param, 
              date_add(customers.regTime, INTERVAL '.$date_add.' HOUR) as regDate, 
              date_add(confirmTime, INTERVAL '.$date_add.' HOUR) as depositDate
            FROM `customers` ';
    $sql.=  $join_type .' JOIN customer_deposits on (customers.id=customer_deposits.customerId)
            WHERE customers.campaignId IN ('.implode(',', $api_user['api_campaigns']).')
            AND customers.isDemo=0 ';
    if(isset($_REQUEST['dpStart']) && validateDateStr($_REQUEST['dpStart'])) {
      $sql.= 'AND date_add(customers.regTime, INTERVAL '.$date_add.' HOUR) >= \''.$_REQUEST['dpStart'].' 00:00:00\' ';
    }
    if(isset($_REQUEST['dpEnd']) && validateDateStr($_REQUEST['dpEnd'])) {
      $sql.= 'AND date_add(customers.regTime, INTERVAL '.$date_add.' HOUR) <= \''.$_REQUEST['dpEnd'].' 23:59:59\' ';
    }
    $sql.= 'GROUP BY customers.id ';
    
    if(isset($_REQUEST['order']) && validateOrderStr($_REQUEST['order'])) {
      $sql.= 'ORDER BY ';
      if(isset($_REQUEST['data']) && $_REQUEST['data'] == 'deposits') {
        $sql.= 'customer_deposits.confirmTime ';
      } else {
        $sql.= 'customers.regTime ';
      }
      $sql.= $_REQUEST['order']. ' ';
    }
    
    if(isset($_REQUEST['limit']) && is_numeric($_REQUEST['limit'])) {
      $sql.= 'LIMIT '.$_REQUEST['limit'];
    }
            
    $performanceSummary = $TradingPlatformDB->fetchAll($sql);
    return $performanceSummary;
  }
?>