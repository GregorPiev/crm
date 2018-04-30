<?php
//set_error_handler("customError");
//error_reporting(E_ALL);
//ini_set('display_errors', 1);
require_once __DIR__ . '/config.php';

class MySqlDriver {
 
   private $_Link;

   public function __construct() {
   	  $config = new config();
      $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);
      mysql_select_db($config::get_db_name('main'), $this->_Link);
      mysql_set_charset("utf8", $this->_Link);
   }

   public function __destruct() {
      mysql_close( $this->_Link );
   }
   
   public function exec($sql){
    $result = mysql_query($sql) or die(mysql_error());
    return $result;
   }
   
   public function execID($sql){
    mysql_query($sql,$this->_Link);
    return mysql_insert_id();
   }
   
   public function fetchAll($sql, $key_column = null) {
      $result = mysql_query($sql, $this->_Link) or die(mysql_error());
      for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
	  mysql_free_result($result); 
      return $array; 
     } 
   
     public function AffectedRows($sql) {
      $result = mysql_query($sql, $this->_Link);
      return mysql_affected_rows($this->_Link); 
     } 
    public function fetchAllByColumn($sql, $column) {
      $result = mysql_query($sql, $this->_Link) or die(mysql_error());
      for ($array = array(); $row = mysql_fetch_assoc($result); $array[] = $row[$column]);
	  mysql_free_result($result); 
      return $array; 
     }
   
 }

class DEPOSITDB {
 
   private $_Link;

   public function __construct() {
   	  $config = new config();
      $this->_Link = mysql_connect($config::get_host_name('deposit'), $config::get_user_name('deposit'), $config::get_pass('deposit'),true);
      //$this->_Link = mysql_connect('134.213.138.63', $config::get_user_name('deposit'), $config::get_pass('deposit'),true);
	  if (!$this->_Link) die (' error=>  '. mysql_error());
      mysql_select_db($config::get_db_name('deposit'), $this->_Link);
      mysql_set_charset("utf8", $this->_Link);
   }

   public function __destruct() {
      mysql_close( $this->_Link );
   }
   
   public function exec($sql){
    $result = mysql_query($sql) or die(mysql_error());
    return $result;
   }
   
   public function execID($sql){
    mysql_query($sql,$this->_Link);
    return mysql_insert_id();
   }
   
   public function fetchAll($sql, $key_column = null) {
   	echo "/n in fetch sql = ".$sql."/n";
      $result = mysql_query($sql, $this->_Link) or die(mysql_error());
	  echo "/n result => <br>/n";
	  var_dump($result);
      for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row); 
      return $array; 
     } 
   
     public function AffectedRows($sql) {
      $result = mysql_query($sql, $this->_Link);
      return mysql_affected_rows($this->_Link); 
     } 
    
   
 }

class SITEDB {

   private $_Link;

   public function __construct() {
   	  $config = new config();
      $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);
      mysql_select_db($config::get_db_name('site'), $this->_Link);
      mysql_set_charset("utf8", $this->_Link);
   }

   public function __destruct() {
      mysql_close( $this->_Link );
   }
   
   public function exec($sql){
    $result = mysql_query($sql) or die(mysql_error());
    return $result;
   }
   
   public function execID($sql){
    mysql_query($sql);
    return mysql_insert_id();
   }
   
   
   
   public function fetchAll($sql, $key_column = null) {
    $result = mysql_query($sql); 
    for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row); 
    return $array; 
   } 
   
 }

class NEW_SITEDB {

    private $_Link;

    public function __construct() {
        $config = new config();
        $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);
        mysql_select_db($config::get_db_name('new_site'), $this->_Link);
        mysql_set_charset("utf8", $this->_Link);
    }

    public function __destruct() {
        mysql_close( $this->_Link );
    }

    public function exec($sql){
        $result = mysql_query($sql) or die(mysql_error());
        return $result;
    }

    public function execID($sql){
        mysql_query($sql);
        return mysql_insert_id();
    }



    public function fetchAll($sql, $key_column = null) {
        $result = mysql_query($sql);
        for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
        return $array;
    }

}
 
class spotDB_IBSystem   {

   private $_Link;

   public function __construct($dbname) {
   	
	  $config = new config();
      $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);
      mysql_select_db($config::get_db_name('platform'), $this->_Link);
	  mysql_set_charset("utf8", $this->_Link);
	  
   }

   public function __destruct() {
      mysql_close( $this->_Link );
   }
   
   public function exec($sql){
     mysql_query($sql);
   }
   
   public function execID($sql){
    mysql_query($sql);
    return mysql_insert_id();
   }
   
   
   
   public function fetchAll($sql, $key_column = null) {
    $result = mysql_query($sql); 
    for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row); 
    return $array; 
   } 
   
 }

class elitSignlsDB  {

   private $_Link;

   public function __construct() {
      $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);
      mysql_select_db($config::get_db_name('elitesignals'), $this->_Link);
      mysql_set_charset("utf8", $this->_Link);
   }

   public function __destruct() {
      mysql_close( $this->_Link );
   }
   
   public function exec($sql){
    mysql_query($sql,$this->_Link);
   }
   
   public function execID($sql){
    mysql_query($sql,$this->_Link);
    return mysql_insert_id();
   }
   
   public function saveToFile($sql) {
    $result = mysql_query($sql,$this->_Link) or die ( "Sql error : " . mysql_error( ) ); 
    
   

   }
   
   public function fetchAll($sql, $key_column = null) {
    $result = mysql_query($sql,$this->_Link) or die(mysql_error());
    for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row); 
    return $array; 
   } 
   
 }

class DB_TradingPlatform   {

    private $_Link;

    public function __construct() {
        $config = new config();

        $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);

        //$this->_Link = mysql_connect("172.31.3.158", "root", "civilian13catpetbag37cauterize");
        // $this->_Link = mysql_connect("ott-instance.cojo0rxznldz.eu-west-1.rds.amazonaws.com", "rpt_onetwotrade", "3sRE3iQoMEC6xrj");
        //$this->_Link = mysql_connect("db-master.p8.ie.spotoption.com", "root", "3sRE3iQoMEC6xrj");

        mysql_select_db($config::get_db_name('platform'), $this->_Link);
        mysql_set_charset("utf8", $this->_Link);
    }

    public function __destruct() {
        mysql_close( $this->_Link );
    }

    public function exec($sql){
        mysql_query($sql,$this->_Link);
    }

    public function execID($sql){
        mysql_query($sql,$this->_Link);
        return mysql_insert_id();
    }

    public function saveToFile($sql) {
        $result = mysql_query($sql,$this->_Link) or die ( "Sql error : " . mysql_error( ) );
    }

    public function fetchAll($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link) or die(mysql_error());
        for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
        return $array;
    }

    public function fetchRow($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link);

        $isError = mysql_error();
        if(isset($isError) && $isError)
            return $isError;

        $row = mysql_fetch_assoc($result);
        return $row;
    }

    public function spotAPIExec($parms){
        $api = new config();

        $apiData = array_merge(array( 'api_username' => $api::get_spot_api('username'), 'api_password' => $api::get_spot_api('password')),$parms);
        $URL = $api::get_spot_api('url');
        $ch = curl_init($URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS,
            http_build_query($apiData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
        if (strstr($result, '<operation_status>successful</operation_status>'))
            return true;
        return false;

    }

}

class spotDB_TradingPlatform   {

    private $_Link;

    public function __construct() {
        $config = new config();

        $this->_Link = mysql_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'),true);

        //$this->_Link = mysql_connect("172.31.3.158", "root", "civilian13catpetbag37cauterize");
        // $this->_Link = mysql_connect("ott-instance.cojo0rxznldz.eu-west-1.rds.amazonaws.com", "rpt_onetwotrade", "3sRE3iQoMEC6xrj");
        //$this->_Link = mysql_connect("db-master.p8.ie.spotoption.com", "root", "3sRE3iQoMEC6xrj");

        mysql_select_db($config::get_db_name('platform'), $this->_Link);
        mysql_set_charset("utf8", $this->_Link);
    }

    public function __destruct() {
        mysql_close( $this->_Link );
    }

    public function exec($sql){
        mysql_query($sql,$this->_Link);
    }

    public function execID($sql){
        mysql_query($sql,$this->_Link);
        return mysql_insert_id();
    }

    public function saveToFile($sql) {
        $result = mysql_query($sql,$this->_Link) or die ( "Sql error : " . mysql_error( ) );



    }

    public function fetchAll($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link) or die(mysql_error());
        for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
        mysql_free_result($result);
        return $array;
    }

    public function fetchRow($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link);

        $isError = mysql_error();
        if(isset($isError) && $isError)
            return $isError;

        $row = mysql_fetch_assoc($result);
        return $row;
    }

    public function spotAPIExec($parms){
        $api = new config();

        $apiData = array_merge(array( 'api_username' => $api::get_spot_api('username'), 'api_password' => $api::get_spot_api('password')),$parms);
        $URL = $api::get_spot_api('url');
        $ch = curl_init($URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS,
            http_build_query($apiData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
        if (strstr($result, '<operation_status>successful</operation_status>'))
            return true;
        return false;

    }

}

class DB_Connect   {

    private $_Link;

    public function __construct($connection = 'amazon', $user = 'amazon', $db = false) {
        $config = new config();

        $this->_Link = mysql_connect($config::get_host_name($connection), $config::get_user_name($user), $config::get_pass($user),true);
        if($db){
        	mysql_select_db($config::get_db_name($db), $this->_Link);
        }
        mysql_set_charset("utf8", $this->_Link);
    }

    public function __destruct() {
        mysql_close( $this->_Link );
    }

    public function exec($sql){
        mysql_query($sql,$this->_Link) or die(mysql_error());
    }

    public function execID($sql){
        mysql_query($sql,$this->_Link);
        return mysql_insert_id();
    }

    public function saveToFile($sql) {
        $result = mysql_query($sql,$this->_Link) or die ( "Sql error : " . mysql_error( ) );
    }

    public function fetchAll($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link) or die(mysql_error());
        for ($array = array(); $row = mysql_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
        return $array;
    }

    public function fetchRow($sql, $key_column = null) {
        $result = mysql_query($sql,$this->_Link);

        $isError = mysql_error();
        if(isset($isError) && $isError)
            return $isError;

        $row = mysql_fetch_assoc($result);
        return $row;
    }

    public function spotAPIExec($parms){
        $api = new config();

        $apiData = array_merge(array( 'api_username' => $api::get_spot_api('username'), 'api_password' => $api::get_spot_api('password')),$parms);
        $URL = $api::get_spot_api('url');
        $ch = curl_init($URL);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS,
            http_build_query($apiData));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $result = curl_exec($ch);
        curl_close($ch);
        return $result;
        if (strstr($result, '<operation_status>successful</operation_status>'))
            return true;
        return false;

    }

}

Class leverateDB_Connection{
  		
  	private $db_link;
	
	public function __construct($connection = 'vinci', $database = 'vinci') {
   	  $config = new config();
	  
      $this->db_link = mssql_connect($config::get_host_name($connection), $config::get_user_name($connection), $config::get_pass($connection),true);
      mssql_select_db($config::get_db_name($database), $this->db_link);
	  
   }
   
  public function __destruct() {
      mssql_close( $this->db_link );
   }
  
   public function fetchAll($sql,$uidfield_array = array()) {
      $result = mssql_query($sql, $this->db_link) or die(mssql_get_last_message());
      $array = array();
      while($row = mssql_fetch_assoc($result)){
      	foreach(array_keys($row) as $key=>$value){	
		  if(in_array($value, $uidfield_array)){
		  	 
			 $row[$value] = mssql_guid_string($row[$value]);
		  }else{
		  	$encoding_list = array('Windows-1252','UTF-8');
			$encoding = mb_detect_encoding($row[$value], $encoding_list, true);						
			$row[$value] = ( $encoding === 'UTF-8') ? $row[$value]: iconv('Windows-1252', 'UTF-8', $row[$value]);
		  }
	    }
		$array[] = $row; 
	  } 
      return $array; 
   }
   
   public function exec($sql){
        $result = mssql_query($sql, $this->db_link) or die(mssql_get_last_message());
		return $result;
    }
   
   public function execID($sql){
   	    mssql_query($sql, $this->db_link);
        $result = mssql_fetch_assoc(mssql_query("select @@IDENTITY as id"));
        return $result['id'];
   }
   
   public function affectedRows($sql){
   	    mssql_query($sql, $this->db_link) or die(mssql_get_last_message());
		return mssql_rows_affected($this->db_link);
   }
    
}

function getUserIpAddr() {
    if (!empty($_SERVER['HTTP_CLIENT_IP'])) { 
      return $_SERVER['HTTP_CLIENT_IP'];
    } 
    else if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
      $tmpaddress = $_SERVER['HTTP_X_FORWARDED_FOR'];
      $pos = strrpos($tmpaddress, ",");
      if ($pos !== false) {
        $tmpaddress = substr($tmpaddress,0,$pos); 
      }
      return $tmpaddress;
    }
    else
    {
      return $_SERVER['REMOTE_ADDR'];
    }
}

function is_authorized_by_open_ip($user_ip, $connection) {
  
  $sql = "SELECT * FROM open_ips where ip = '$user_ip'";
  $user = $connection->fetchAll($sql);
  if(!$user) {
    return false;
  }
  return true;

}

function validate_ips($splitted_user_ip, $ips) {
  $validate_ips = array();

  foreach ($ips as $ip) {
    $ip = isset($ip['ip']) ? $ip['ip'] : false;

    //fail if not ip found
    if(!$ip) {
      array_push($validate_ips,0);
    }
    else {
      $splitted_authorized_ip = preg_split("/\./",$ip);
      $is_ip_valid = 1;

      foreach ( $splitted_authorized_ip as $index => $cell) {

        //if wildcard, skip validation
        if($cell == "*") {
          continue;
        }

        //fail if one of the cells is not athorized
        elseif($cell != $splitted_user_ip[$index]) {
          $is_ip_valid = 0;
        }

      }
        array_push($validate_ips,$is_ip_valid);
    }
  }

  return $validate_ips;

}

function is_user_authorized($user_id, $user_ip, $connection) {
  
  $splitted_user_ip = preg_split("/\./",$user_ip);

  //fail if ip given is not array and less than 4 cells
  if(!is_array($splitted_user_ip) && count($splitted_user_ip) < 4) {
    return false;
  }
  else {
    $sql = "SELECT ip FROM users_ips where user_id = '$user_id' group by id";
    $ips = $connection->fetchAll($sql);

    //fail if no ip range attached to user
    if(!$ips) {
      return false;
    }
    else {
      $validated_ips = validate_ips($splitted_user_ip, $ips);
      if(!in_array(1,$validated_ips)) {
        return false;
      }
    }
  }
  return true;

}

function authorized_brands($userId, $connection){
	$sql = "SELECT brands.id, brands.name FROM brands
	        INNER JOIN brand_access ON brand_access.brandId = brands.id  
	        WHERE brand_access.userId = $userId 
	        ORDER BY id";
			
	return $connection->fetchAll($sql);		
}

function login($username, $password, $connection) {

  $user_ip =  getUserIpAddr();
  $result['status'] = false;
  $result['changePassword'] = false;
  
  $username = stripslashes($username);
  $username = mysql_real_escape_string($username);
  $password = stripslashes($password);  
  $password = mysql_real_escape_string($password);
  
  $sql = "SELECT * FROM users WHERE username='".$username."' AND password='".$password."'";

  $user = $connection->fetchAll($sql);

  if (count($user)!=0) {

    $ip_address = $user_ip; // Get the IP address of the user. 
    $user_browser = $_SERVER['HTTP_USER_AGENT']; // Get the user-agent string of the user.

    $userid = preg_replace("/[^0-9]+/", "", $user[0]['id']); // XSS protection as we might print this value
    $user_status = $user[0]['userStatus'];
		      
	if($user_status=='inactive'){
		$result['msg'] = "The account is inactive.";  
        return $result;
	}

    //is user's ip is authorized
    if(!is_authorized_by_open_ip($user_ip, $connection)) {

      //is user's ip in the authotorized ip range
      if(!is_user_authorized($userid, $user_ip, $connection)) {

        $result['msg'] = "Your IP is not authorized.";  
        return $result;
        
      }
    }
	
	$authorized_brands = authorized_brands($user[0]['id'], $connection);
	if(empty($authorized_brands)){
	    $result['msg'] = "Your user is not authorized to any brand.";  
        return $result;
	}
	
	$result["authorized_brands"] = $authorized_brands;
//	$_SESSION["resetPassword"] = false;
//    $_SESSION['timestamp'] = time();

//    $_SESSION['userid'] = $userid;

//    $_SESSION['fullname'] = $user[0]['fullname'];

//    $_SESSION['userdata'] = $user[0];
//    $_SESSION['user_is_loggedin'] = 1;

//    $cookiehash = md5(sha1($password.$userid));
//    $_SESSION['cookie'] = $cookiehash;
//    setcookie("uname",$cookiehash,time()+3600*24*365,"/");
//    $connection->exec("UPDATE users SET session = '".$cookiehash."' WHERE id=".$userid);

    //Check if user is an affiliate group
/*    $_SESSION['afgid'] = 0;
    $_SESSION['afgdata'] = array();
    $sql = "SELECT * FROM aff_groups WHERE userId=".$userid;
    $affGroup = $connection->fetchAll($sql);
    if(count($affGroup)!=0) {
     $_SESSION['afgid'] = $affGroup[0]['id'];
     $sql = "SELECT aff_id FROM aff_group_members WHERE aff_team=".$affGroup[0]['id'];
     $affIds = $connection->fetchAll($sql);
     if(count($affIds)!=0) {
       foreach ($affIds as $affId) {
         $_SESSION['afgdata'][] = $affId['aff_id'];
       }
     }
    } */
    
    unset($user[0]['password']);
    $result['userdata'] = $user[0];
    $result['status'] = true;
	if(sizeof($result['authorized_brands'])==1){
	   $result['chosen_brand'] = $result['authorized_brands'][0]; 	
	   setSession($result,$connection);
	   $result['changePassword'] = checkChangePassword($username,$connection);
	   
	}  
/*	// is 3 Months passed last password change
	$sql= "SELECT * from users WHERE username='".$username."' AND password='".$password."' and updatePasswordDate < NOW() - INTERVAL 3 MONTH ";
	$User = $connection->fetchAll($sql);
	if (count($User)!=0) {
		//$result['msg'] = "Please Change your password.";
		$connection->exec("UPDATE users SET password_valid=0 WHERE username='".$email."' AND password='".$password."'");
		$result['changePassword'] = true;
		return $result;
        die;  
	} */
    return $result;
              
  } else {
    return $result;
  }
}

function setSession($result,$connection){
	$_SESSION["resetPassword"] = false;
    $_SESSION['timestamp'] = time();
    $_SESSION['userid'] = $result['userdata']['id'];
    $_SESSION['fullname'] = $result['userdata']['fullname'];
    $_SESSION['userdata'] = $result['userdata'];
    $_SESSION['user_is_loggedin'] = 1;
    $_SESSION['authorized_brands'] = $result['authorized_brands'];
	$_SESSION['chosen_brand'] = $result['chosen_brand'];
	
    $cookiehash = md5(sha1($result['userdata']['username'].$result['userdata']['id']));
    $_SESSION['cookie'] = $cookiehash;
    setcookie("uname",$cookiehash,time()+3600*24*365,"/");
    $connection->exec("UPDATE users SET session = '".$cookiehash."' WHERE id=".$result['userdata']['id']);
}

function checkChangePassword($username,$connection){
	// is 3 Months passed last password change
	$sql= "SELECT * from users WHERE username='".$username."' AND updatePasswordDate < NOW() - INTERVAL 3 MONTH ";
	$user = $connection->fetchAll($sql);
	if (count($user)!=0) {
		$connection->exec("UPDATE users SET password_valid=0 WHERE username='$userName'");
		return true;
	}
	return false;	
}

function login_check($connection) {

if(time() - $_SESSION['timestamp'] > 36000) { 
   return false;
}else{
	$_SESSION['timestamp'] = time();
}
	

if(!isset($_SESSION['cookie']) && empty($_SESSION['user_is_loggedin'])) {
    
    $uname = $_COOKIE['uname'];
     
    if (!empty($uname)) {   
        $sql = "SELECT * FROM users WHERE session='".$uname."'";
        $user = $connection->fetchAll($sql);
        
        if (count($user)!=0) {

          $userid = preg_replace("/[^0-9]+/", "", $user[0]['id']); // XSS protection as we might print this value
          $_SESSION['userid'] = $userid; 
          $_SESSION['fullname'] = $user[0]['fullname'];
          $_SESSION['userdata'] = $user[0];
          $_SESSION['user_is_loggedin'] = 1;
          $_SESSION['cookie'] = $uname;
          setcookie("uname",$uname,time()+3600*24*365,"/");
          return true;
        } else {
        return false;
        }
    } else {
    return false;
    }
    
} else {
return true;
}
       
}

function PasswordValid_check($connection , $userName) {
     $sql= "SELECT password_valid from users WHERE username='".$userName."' ";
	 $password_valid = $connection->fetchAll($sql);
	 if ($password_valid[0]["password_valid"] == 1) {
	 	return true;
	 }else {	
	 	return false;
	 }

}

function checkResetPasswordParams($userId,$secret_key,$isLoggedIn){
	$dbConnection = new MySqlDriver();	
	
	$sql = "SELECT secret_keys.*, users.username, users.password 
	        FROM secret_keys
	        LEFT JOIN users ON users.id=secret_keys.userId 
            WHERE secret_keys.userId= $userId  
                  AND secret_keys.secret_key = '$secret_key'
                  AND NOW()<= DATE_ADD(secret_keys.generateTime,INTERVAL 1 HOUR)
                  AND isActivated = 0
            LIMIT 1";		
	$reset_key = $dbConnection->fetchAll($sql);
	if(empty($reset_key)){
	   return false;
	}   
	if(!$isLoggedIn){
	   $username = $reset_key[0]['username'];
	   $password = $reset_key[0]['password'];			
	   $login_result = login($username,$password,$dbConnection);
	   if(isset($login_result['status']) && $login_result['status'] == true){
	     
		  if(!isset($login_result['chosen_brand'])){
	           setSession($login_result,$dbConnection);
			   $_SESSION['chosen_brand'] = $_SESSION['authorized_brands'][0]; 
	      }
		  $sql = "UPDATE secret_keys SET isActivated = 1 WHERE id = {$reset_key[0]['id']}";
		  $dbConnection->exec($sql);
		  $dbConnection->exec("UPDATE users SET password_valid=0 WHERE username='$username'");
		  $date = date('Y-m-d H:i:s');
          $ip = getUserIpAddr();
		  $sql = "INSERT INTO users_login (userId, name, dateLogin, ip) VALUES ('{$userId}', '{$username}', '{$date}', '{$ip}')";
          $dbConnection->exec($sql); 	   	
	      return true;
	   }
       else{
          return false;
	   }       
	}
	if(!isset($_SESSION['chosen_brand']))
		$_SESSION['chosen_brand'] = $_SESSION['authorized_brands'][0];
	return true;		
			
}

class SITEDBi {

    private $_Link;

    public function __construct() {
        $config = new config();
        $this->_Link = mysqli_connect($config::get_host_name('amazon'), $config::get_user_name('amazon'), $config::get_pass('amazon'));
        mysqli_select_db($this->_Link, $config::get_db_name('site'));
        mysqli_set_charset($this->_Link, "utf8");
    }

    public function __destruct() {
        mysqli_close( $this->_Link );
    }

    public function exec($sql){
        $result = mysqli_query($this->_Link, $sql) or die(mysqli_error());
        return $result;
    }

    public function execID($sql){
        mysqli_query($this->_Link, $sql);
        return mysqli_insert_id($this->_Link);
    }

    public function escape($value)
    {
        return mysqli_escape_string($this->_Link, $value);
    }

    public function fetchAll($sql, $key_column = null) {
        $result = mysqli_query($this->_Link, $sql);
        for ($array = array(); $row = mysqli_fetch_assoc($result); isset($row[$key_column]) ? $array[$row[$key_column]] = $row : $array[] = $row);
        return $array;
    }

}
//var_dump(checkResetPasswordParams(279,'2oh9NKHG81YIzlcalwKHSxNUqDu5jY6l',false));