<?php
class config{
	
  const THEME_PATH                = "http://dev-gregori-crm.fm-system.com/tpl/";
  const SYSTEM_URL                = "http://dev-gregori-crm.fm-system.com"; 
  const SITE_NAME                 = "hedgestonegroup";
  const SYSTEM_NAME               = "MainCoon";
  const MULTI_BRAND_SYSTEM        = "FullMoon";
  const SITE_INITIALS             = "hdgs";
  const DEPOSIT_SYSTEM_PATH       = 'https://dev-staging-deposit.globalapisystems.com/layer/';
  const PROCESSOR_URL_PART        = 'read_processor_by_brand';
  const PROCESSOR_LIST_URL        = 'read_processors';
  const UPDATE_PROCESSOR_URL_PART = 'update_processor_by_currency';
  const BRAND_ID=2;

  private static $DB_NAMES =  array(
      'main'                  => 'MainCoon',
      'site'                  => 'hedgestonegroup_site',
      'new_site'   			  => 'hedgestonegroup_site',
      'platform'              => 'hedgestonegroup_platform',
      'deposit'				  => 'deposit',
      'vinci'                 => 'VinciCM_MSCRM',
      'vinci_rds'             => 'Vincicm_InventivaCRM',
      'rtc_leverate'          => 'RTC_MSCRM',
      'rtc_inventiva'         => 'RTC_InventivaCRM',
      'social'                => 'social',
      'structure'             => 'structure',
      'sirix_reports'          => 'platform1'
      //'elitesignals'  => 'elitesignals'
      );
  private static $HOSTS_NAMES =  array(
     'amazon'     => 'prod_hdgs_db1',
//    	'amazon' => 'sandbox_hdgs_db1',
//      'deposit'    => 'prod_deposit_uk1',
      'deposit'     => '52.48.176.165',
      'vinci'       => 'ec2-54-74-113-221.eu-west-1.compute.amazonaws.com',
      'mssql_rds'   => 'rtcreplica.czsweqwp3c1d.eu-west-1.rds.amazonaws.com',
      'leverate_tp' => 'sirixreports.leveratetech.com',
      'sirix_reports' => 'reports.leveratetech.com'
      //'spot'   => 'ott-instance.cojo0rxznldz.eu-west-1.rds.amazonaws.com' ,
      );
  private static $HOSTS_USERS =  array(
      'amazon'    => 'root',
      'deposit'   => 'root',
      'vinci'     => 'vincicm',
      'mssql_rds' => 'crm',
      'rtc_tp'    => 'rtc',
      'vinci_tp'  => 'vinci'
      //'spot'   => 'rpt_onetwotrade' ,
      );
  private static $HOSTS_PASS =  array(
      'amazon'    => 'S6zWT07QgNlYV2WFdO',
      'deposit'   => 'S6zWT07QgNlYV2WFdO',
      'vinci'     => 'pPb9ZkV8dx',
      'mssql_rds' => 'ybUA9d*aPnSga6hLRb',
      'rtc_tp'    => 'JK4CrQcc',
      'vinci_tp'  => 'Qs7xgSJa' 
      //'spot'   => '3sRE3iQoMEC6xrj' ,
      );
  private static $spotAPIExec = array(
      'username' =>'hsg_website_rnd',
      'password' => '0K4stcFuK6',
      'url'      => 'http://api-spotplatform.hedgestonegroup.com/api'
      );
  public static $spotPayment = array(
      'endpoint' => 'https://api.spotpaymentech.com/v1/pagetokens',
      'api_key' => 'rGZOkhFH8V7Fecg3ZVd9Uvozz'
      );

  public static function get_db_name($key){
    return self::$DB_NAMES[$key];
  }

  public static function get_host_name($key){
    return self::$HOSTS_NAMES[$key];
  }

  public static function get_user_name($key){
    return self::$HOSTS_USERS[$key];
  }
  public static function get_pass($key){
    return self::$HOSTS_PASS[$key];
  }

  public static function get_spot_api($key){
    return self::$spotAPIExec[$key];
  }

  public static function get_hasoption_api($key){
    return self::$hasOptionsAPI[$key];
  }
}
