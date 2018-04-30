<?php
require_once('inc/config.php');
$config = new config();
$site_name = $config::SITE_NAME;


$system_path = realpath('inc').'/';
$system_path = rtrim($system_path, '/').'/';
  
define('SELF', pathinfo(__FILE__, PATHINFO_BASENAME));
define('BASEPATH', str_replace("\\", "/", $system_path));
  
global $theme_path;
$theme_path = $config::THEME_PATH;
global $system;
$system = $config::SYSTEM_NAME;
global $multi_system;
$multi_system = $config::MULTI_BRAND_SYSTEM;
global $system_url;
$system_url = $config::SYSTEM_URL;
global $current_year;
$current_year = date("Y");
           
require_once "inc/db.php";
session_start();
  
 
$connection = new MySqlDriver();
  
    
include "inc/rain.tpl.class.php";

raintpl::configure("base_url", "/" );
raintpl::configure("tpl_dir", "tpl/" );
raintpl::configure("cache_dir", "tmp/" );
raintpl::configure( 'path_replace', false );
  
$path = preg_replace('/\?.*/', '', $_SERVER['REQUEST_URI']);
$path = ltrim($path, '/');
$path = rtrim($path, '/');
   
    
$section = "login";
$subsection = "";
$brandId = 0;
$brandName = "";
$brand_independents = array('login','logout','resetpassword');
$brand_independent_contents = array('user-change_password','admin-users');
$no_subsections = array('dashboard');  
$elements = explode('/', $path);

$isLogedIn = login_check($connection);

if($isLogedIn){
	$authorized_brands = $_SESSION['authorized_brands'];
}  
if(sizeof($elements) == 1){
    if(in_array($elements[0],$brand_independents))
      $section = $elements[0];		
	$brandName = $_SESSION['chosen_brand']['name'];
	      		
}else if((sizeof($elements) == 2 && in_array($elements[1],$no_subsections)) || sizeof($elements) == 3){
    if(!$isLogedIn){
    	$section = 'login';
    }else{
    	foreach($authorized_brands as $key=>$value){
    		if($elements[0] == $value['name']){	
    		   $brandId = $value['id'];
    		   $brandName = $value['name'];
    		   $brand = $value;
		       $_SESSION['chosen_brand'] = $value;
		    }   
    	}
		if($brandName == ''){
			$elements[0] = $_SESSION['chosen_brand']['name'];	
			$redirect = implode('/',$elements);
			header('Location: /'.$redirect);
			exit();
		}
		$section = $elements[1];
		if(sizeof($elements) == 3)
		   $subsection = '-'.$elements[2];
    }
}else 
	$brandName = $_SESSION['chosen_brand']['name'];

$month_range = array();
$months = date_create(); 
for ($i = 1; $i < 13 ; $i++) {  
    array_push($month_range, array("text" => $months->format("F, Y"), "value" => $months->format("m-Y") ));                                                 
    $months->modify('-1 month');
}

if($isLogedIn)                            
    $isPasswordValid = PasswordValid_check($connection, $_SESSION['userdata']['username']);

 
switch ($section) {
  
   case "login":
    if ($isLogedIn) {
        if(!$isPasswordValid) {
          header( 'Location: /'.$brandName.'/user/change_password' );
		  exit();
        }
        else {
          header( 'Location: /'.$brandName.'/dashboard' );
		  exit();	
        }
    } else if($subsection || $elements[0] != 'login'){
    	header('Location: /login');
		exit();
    }else{
        $login = new RainTPL;
        $login_html = $login->draw( 'login', $return_string = true );
        echo $login_html;
        exit();
    }
    
   case "logout":
      $_SESSION = array(); 
      setcookie("uname", '', time() - 42000,"/");
      header('Location: /login');
      exit();
    
	case "resetpassword":
	 	
	  if(isset($_GET["userId"]) && isset($_GET["secretKey"])){
		 	
		 $reset_status = checkResetPasswordParams($_GET["userId"],$_GET["secretKey"],$isLoggedIn);
		  
		 if($reset_status){
		 	$brandName = $_SESSION['chosen_brand']['name'];
		    header( 'Location: /'.$brandName.'/user/change_password' );
		    exit();
		 }else {
		 	header( 'Location: /login' ) ;
			exit();
		 } 		
	  }else {
	  	 header( 'Location: /login' ) ;
	  }
	  exit();
    
    default:
      if (!$isLogedIn) {
        header( 'Location: /login' ) ;
        exit();
      }
      if(!$isPasswordValid) {
        if($section != "user" && $subsection != "-change_password") {
          header( 'Location: /'.$brandName.'/user/change_password' );
		  exit();	
        }
      }
	   
	  if(!file_exists('tpl/'.(in_array($section.$subsection,$brand_independent_contents) ? '' : $brandName.'/').$section.$subsection.'.html')){
	  	  header('Location: /'.$brandName.'/dashboard');
		  exit();
	  } 
  }
  $brandlength=count($authorized_brands); 
    
  $header = new RainTPL;
  $header->assign("brand",$brand);
  $header->assign("brandName", $brandName);
  $header->draw( 'header');
  
  $topbar = new RainTPL;
  $topbar->assign("current_brand", $_SESSION['chosen_brand']);
  $topbar->assign("authorized_brands", $_SESSION['authorized_brands']);
  $topbar->assign("fullname", $_SESSION['fullname'] );  
  $topbar->assign("per_admin", $_SESSION['userdata']['per_admin'] );  
  $topbar->assign("authorized_brands",$authorized_brands);
  $topbar->assign("brandlength", $brandlength);  
  $topbar->draw('topbar');
  
  $no_sidebar = array('ui', 'page', 'table');
  if(!in_array($section, $no_sidebar)) {
    $sidebar = new RainTPL;
    $sidebar->assign("section", $section );
    $sidebar->assign("brandName", $brandName );
    $sidebar->assign("userdata", ($_SESSION['userdata']));
    $sidebar->assign("system_name", $system);
    $notAffGroup = 0;
    if($_SESSION['afgid'] == 0) {
        $notAffGroup = 1;
    }
    $sidebar->assign("notAffGroup", $notAffGroup );
    $sidebar->assign("current_brand", $_SESSION['chosen_brand']);
    $sidebar->draw( $brand['name'].'/sidebar');
  }
  
  
  $content = new RainTPL;
  $allowAccess = ($_SESSION['userdata']['per_'.$section]) ? 1 : 0;
  $allowAccess = ($section == 'user') ? 1 : $allowAccess; 
  
  $content->assign("ranges",$month_range);
  $content->assign("current_brand", $_SESSION['chosen_brand']);
  
  switch ($section.$subsection) {

case "reports-pnl3":
    $spotDB = new spotDB_TradingPlatform();  
      $sql = "SELECT id, concat(firstName,' ',lastName) as name from users
              where firstName not like '%closed%'
              and firstName <> ''
              order by name asc";
      $content->assign("employees", $spotDB->fetchAll($sql));  
    break;

   /* case "customers-documents":
      require_once BASEPATH."documents.php";
      $verificationDocuments = new verificationDocuments();
      
      //print_r($verification);
      $content->assign("docs", $verificationDocuments->getAllDocuments());
    break;
    */
    case "reports-duplicated":
      $spotDB = new spotDB_TradingPlatform();  
      $sql = "SELECT 
          CONCAT(customers.FirstName,' ', customers.LastName) as customerName,
          customers.FirstName, 
          customers.LastName, 
          customers.birthday,
          max(customers.regTime) lastRegistration,
          IF(customers.firstDepositDate = '0000-00-00 00:00:00','n','y') AS deposited,
          count(*) count
        FROM 
          ".$GLOBALS["site_name"]."_platform.customers
        WHERE
          customers.isDemo=0
            AND 
          customers.isLead=0
        group by 
          customers.FirstName, 
          customers.LastName, 
          customers.birthday
        having count > 1
      ";
      $content->assign("customers", $spotDB->fetchAll($sql));
    break;
    
    case "ibsystem-nodesk":
      $spotDB = new spotDB_TradingPlatform();  
      $sql = "select id, FirstName, LastName, LastTimeActive from customers WHERE employeeInChargeId=0 AND LastTimeActive between DATE_ADD(NOW(),INTERVAL - 60 DAY) and NOW() ORDER BY LastTimeActive DESC;";
      $content->assign("customers", $spotDB->fetchAll($sql));
    break;

    case "ibsystem-campaignassign":

          $mainDB = new MySqlDriver();
          $campaignIds = $_GET['campaign'];

          if(!empty($campaignIds)) {

              if($campaignIds == 'all') {
                  $where = "";
              } elseif(is_array($campaignIds)) {
                  $where = "where id_campaign in (".implode(',', $campaignIds).")";
              } else {
                  header('location: /ibsystem/campaignassign');
                  die('exit');
              }

              $sql = "select * from V_campaigns_by_desks " . $where;
              $campaigns = $mainDB->fetchAll($sql);

              $content->assign("campaigns", $mainDB->fetchAll($sql));

              $spotDB = new spotDB_TradingPlatform();
              $sql = "select u.id, u.firstName name, tp.open_for_binary `binary`, tp.open_for_forex forex
            from hedgestonegroup_platform.users u
            join hedgestonegroup_site.trading_platforms_by_desks tp on tp.desk_id = u.id
            where u.lastName = 'DESK'
                and u.firstName like '\_%'
            order by u.firstName";
              $content->assign("desks", $spotDB->fetchAll($sql));

              $siteDB = new SITEDB();
              // get list of available trading platforms
              $sql = "select * from trading_platforms";
              $content->assign('trading_platforms', $siteDB->fetchAll($sql));

              // get list of binary countries
              $sql = "SELECT concat('binary_', c.id) id, c.iso, c.name, 'Binary' `platform`
            FROM hedgestonegroup_site.country c
            where c.iso not in (select bc.countryCode from blocked_country_by_campaign bc where bc.campaignStatus = 0)
                and 
                c.iso COLLATE utf8_unicode_ci not in (select bc2.countryCode from blocked_country_by_config bc2 where bc2.countryStatus = 0)";
              $content->assign('countries_binary',
                  json_encode(array_merge([['id' => 'binary_0', 'name' => 'All Countries', 'platform' => 'Binary']], $siteDB->fetchAll($sql))));

              // get list of forex countries
              $sql = "SELECT concat('forex_', c.id) id, c.iso, c.name, 'Forex' `platform` 
            FROM hedgestonegroup_site.country c
            WHERE c.open_for_forex = '1' 
				and (
					c.iso not in (select bc.countryCode from blocked_country_by_campaign bc where bc.campaignStatus = 0)
					and 
					c.iso COLLATE utf8_unicode_ci not in (select bc2.countryCode from blocked_country_by_config bc2 where bc2.countryStatus = 0)
				)";
              $content->assign('countries_forex',
                  json_encode(array_merge([['id' => 'forex_0', 'name' => 'All Countries', 'platform' => 'Forex']], $siteDB->fetchAll($sql))));

              // prepare object with saved countries
              $sql = "SELECT campaign_id, binary_country_id, forex_country_id, min_deposit from campaign_settings";
              $result = $siteDB->fetchAll($sql);

              function addPrefix(&$item, $key, $prefix)
              {
                  $item = $prefix . "_" . $item;
              }

              $savedCountries = [];
              if (sizeof($result) > 0) {
                  foreach ($result as $key => $item) {
                      $barr = $farr = [];
                      if (!is_null($item['binary_country_id'])) {
                          $barr = explode(',', $item['binary_country_id']);
                          array_walk($barr, 'addPrefix', 'binary');
                      }
                      if (!is_null($item['forex_country_id'])) {
                          $farr = explode(',', $item['forex_country_id']);
                          array_walk($farr, 'addPrefix', 'forex');
                      }
                      $savedCountries[] = ['cId' => $item['campaign_id'], 'countries' => implode(',', array_merge($barr, $farr))];
                  }
                  $content->assign('saved_countries', json_encode($savedCountries));
              }

          } else {
              $content->assign("no_campaigns", "1");
          }

          $sql = "select id_campaign, name_campaign from V_campaigns_by_desks";
          $content->assign("campaignsRaw", $mainDB->fetchAll($sql));

          break;

    case "ibsystem-brokers":
      $IBSystemDB = new spotDB_IBSystem("".$GLOBALS["site_name"]."_IB");  
      $sql = "select id, FirstName, LastName from broker_account;";
      $content->assign("brokers", $IBSystemDB->fetchAll($sql));
    break;
    
    case "customers-noaddress":
      $IBSystemDB = new spotDB_TradingPlatform();  
      $sql = "SELECT id, FirstName, LastName FROM customers WHERE street='' AND City='' AND firstDepositDate!='0000-00-00 00:00:00.000000';";
      $content->assign("customers", $IBSystemDB->fetchAll($sql));
    break;
  /*  
    case "agenttools-online":
  $spotDB = new spotDB_TradingPlatform();  
  $sql = "SELECT
              OneTwoTrade_platform.customers.id,
              OneTwoTrade_platform.customers.FirstName,
              OneTwoTrade_platform.customers.LastName,
              OneTwoTrade_platform.country.name AS country,
              IF(OneTwoTrade_new_site.customers.spot_email = OneTwoTrade_platform.customers.email COLLATE utf8_unicode_ci,
                  OneTwoTrade_new_site.customers.email,
                  OneTwoTrade_platform.customers.email) AS Email,
              OneTwoTrade_platform.campaigns.name,
              OneTwoTrade_platform.sub_campaigns.param,
              OneTwoTrade_platform.customers.saleStatus,
              OneTwoTrade_platform.customers.regTime,
              CONCAT(users.firstName, ' ', users.lastName) AS employee
          FROM
              customers
                  LEFT JOIN
              OneTwoTrade_new_site.customers ON OneTwoTrade_platform.customers.id = OneTwoTrade_new_site.customers.spot_id
                  LEFT JOIN
              country ON (customers.Country = country.id)
                  LEFT JOIN
              campaigns ON (customers.campaignId = campaigns.id)
                  LEFT JOIN
              sub_campaigns ON (customers.subCampaignId = sub_campaigns.id)
                  LEFT JOIN
              users ON (customers.employeeInChargeId = users.id)
          WHERE
              (lastLoginDate >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                  OR lastTimeActive >= DATE_SUB(NOW(), INTERVAL 15 MINUTE))
                  AND isDemo = 0
                  AND firstDepositDate = 0 ";
  if($_SESSION['userdata']['spotId'] > 0) {
    $sql .= " AND customers.employeeInChargeId=".$_SESSION['userdata']['spotId'];
  }
  $result_report = $spotDB->fetchAll($sql);
  $content->assign("customers", $result_report);

//  $content->assign("customers", $spotDB->fetchAll($sql));
break;
*/
/*case "agenttools-retonline":
  $spotDB = new spotDB_TradingPlatform();  
  $sql = "SELECT
              OneTwoTrade_platform.customers.id,
              OneTwoTrade_platform.customers.FirstName,
              OneTwoTrade_platform.customers.LastName,
              country.name AS country,
              IF(OneTwoTrade_new_site.customers.spot_email = OneTwoTrade_platform.customers.email COLLATE utf8_unicode_ci,
                  OneTwoTrade_new_site.customers.email,
                  OneTwoTrade_platform.customers.email) AS Email,
              OneTwoTrade_platform.campaigns.name,
              OneTwoTrade_platform.sub_campaigns.param,
              OneTwoTrade_platform.customers.saleStatus,
              OneTwoTrade_platform.customers.regTime,
              CONCAT(users.firstName, ' ', users.lastName) AS employee,
              desks.name AS deskName
          FROM
              customers
                  LEFT JOIN
              OneTwoTrade_new_site.customers ON OneTwoTrade_platform.customers.id = OneTwoTrade_new_site.customers.spot_id
                  LEFT JOIN
              country ON (customers.Country = country.id)
                  LEFT JOIN
              campaigns ON (customers.campaignId = campaigns.id)
                  LEFT JOIN
              sub_campaigns ON (customers.subCampaignId = sub_campaigns.id)
                  LEFT JOIN
              users ON (customers.employeeInChargeId = users.id)
                  LEFT JOIN
              user_desks ON (users.id = user_desks.userId)
                  LEFT JOIN
              desks ON (user_desks.deskId = desks.id)
          WHERE
              (lastLoginDate >= DATE_SUB(NOW(), INTERVAL 15 MINUTE)
                  OR lastTimeActive >= DATE_SUB(NOW(), INTERVAL 15 MINUTE))
                  AND isDemo = 0
                  AND firstDepositDate > '0000-00-00 00:00:00' ";
  if($_SESSION['userdata']['spotId'] > 0) {
    $sql .= " AND customers.employeeInChargeId=".$_SESSION['userdata']['spotId'];
  }
    $result_report = $spotDB->fetchAll($sql);
    $content->assign("customers", $result_report);
//  $content->assign("customers", $spotDB->fetchAll($sql));
break;
*/
    case "traffic-leads":  
      $sql = "SELECT * from aff_groups";      
      $content->assign("affGroups", $connection->fetchAll($sql));           
    break;

    case "traffic-countries":  
      $sql = "SELECT * from aff_groups";      
      $content->assign("affGroups", $connection->fetchAll($sql));           
    break;

    case "traffic-flagging":  
      $sql = "SELECT * from aff_groups";      
      $content->assign("affGroups", $connection->fetchAll($sql));           
    break;

    case "reports-duplicated":  
      $sql = "SELECT * from aff_groups";      
      $content->assign("affGroups", $connection->fetchAll($sql));           
    break;

    case "administrative-bounces":  
      $sql = "SELECT name from OneTwoTrade_platform.country where name not like 'Any'";      
      $countries = $connection->fetchAll($sql);
      $i = 0;
      foreach ( $countries as $country ) {
          $countries[$i]['name'] = htmlentities( $country['name'], ENT_QUOTES );
          $i++;
      }
      $content->assign("countries", $countries);           
    break;

    case "agenttools-3dDeposits":
      include('3dsecure/customer_first_stage.php'); die;
    break;

    case "agenttools-3dDepositsStage2":
      include('3dsecure/customer_second_stage.php'); die;
    break;

    case "agenttools-processing":
       include('3dsecure/processing_3dsecure/step1.php'); die;
     break;
          
     case "agenttools-processingstep2":
       include('3dsecure/processing_3dsecure/step2.php'); die;
      break;
                
      case "agenttools-processingstep3":
        include('3dsecure/processing_3dsecure/step3.php'); die;
       break;
    case "agenttools-inatec":
            include('3dsecure/inatec_3dsecure/step1.php');
        break;

           case "agenttools-inatecstep2":
                               include('3dsecure/inatec_3dsecure/inatec_handlers/request.php');
                   break;

                           case "agenttools-inatecstep3":
                                               include('3dsecure/inatec_3dsecure/inatec_handlers/success.php');
                                   break;

case "agenttools-american_volume":
        include('3dsecure/american_volume_3d/step1.php'); die;
    break;
       case "agenttools-american_volume_step2":
               include('3dsecure/american_volume_3d/step2.php'); die;
           break;
               case "agenttools-american_volume_step3":
                       include('3dsecure/american_volume_3d/step3.php'); die;
                   break;

case "agenttools-fibonatix":    
        include('3dsecure/fibonatix_3dsecure/step1.php'); 
    break;
      case "agenttools-fibonatixrequest":   
              include('3dsecure/fibonatix_3dsecure/handlers/request.php'); 
          break;
            case "agenttools-fibonatixsuccess":   
                    include('3dsecure/fibonatix_3dsecure/handlers/success.php'); 
                break;  
                               
case "agenttools-customer_card":
      
      if($_GET['cmd'] == 'removeCC') {
          
        require_once "inc/spotoption.php";
        $api = new SpotOption();
        $api->removeCreditcardFromUser($_GET['id'], $_GET['cc']);
      }
break;

    case "promo-usage":
      $OTTDB = new SITEDB();
      $sql = "SELECT id, hash FROM promo_codes";
      $content->assign("promos", $OTTDB->fetchAll($sql));
    break;

  }
  
  
  if ($allowAccess) {
    $content_file = in_array($section.$subsection,$brand_independent_contents) ? $section.$subsection : $brand['name'].'/'.$section.$subsection;  	
    $content->draw($content_file);
  } else {
    $content->draw('nopermissions');
  }
  
  $footer = new RainTPL;  
  $footer->draw( 'footer');
