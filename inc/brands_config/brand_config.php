<?php
class BrandConfig{
	
	private $DB_NAMES =  array(
								'OTT' 	=> array('platform' => 'OneTwoTrade_platform',
								                 'bi'       => 'northStar',
								                 'site'     => 'OneTwoTrade_site',
								                 'new_site' => 'OneTwoTrade_new_site'  
								                 ),
								'HSG' 	=> array('platform' => 'hedgestonegroup_platform',
								                 'bi'       => 'MainCoon',
								                 'site'     => 'hedgestonegroup_site',
								                 'new_site' => 'hedgestonegroup_site'  
								                 )
							  );
    								
	private  $HOSTS_NAMES =  array(
								   'OTT' => 'prod_ottdb1' ,
								   'HSG' => 'prod_hdgs_db1'
								   );
	private $HOSTS_USERS =  array(
                                   'OTT' => 'root',
                                   'HSG' => 'root'
                                   );
    private $HOSTS_PASS =  array(
                                  'OTT' => 'S6zWT07QgNlYV2WFdO',
                                  'HSG' => 'S6zWT07QgNlYV2WFdO'
      	    				      );
	private $spotApi = array( 'OTT' => array('username' =>'hsg_website_rnd',
                                             'password' => '0K4stcFuK6',
      										 'url'      => 'http://api-spotplatform.hedgestonegroup.com/api'),
							  'HSG' => array(
										'username' =>'Onetwotrade', 
										'password' => '55e42ea162412',
										'url'	   => 'http://api-spotplatform.onetwotrade.com/Api'
									   ));
								  
    public function getDB_Name($brand){
		return $this->DB_NAMES[$brand];
	}
	
	public function getHost_Name($brand){
		return $this->HOSTS_NAMES[$brand];
	}
	
	public function getHost_User($brand){
		return $this->HOSTS_USERS[$brand];
	}
	
	public function getHost_Pass($brand){
		return $this->HOSTS_PASS[$brand];
	}
	
	public function getSpotCredentials($brand){
		return $this->spotAPI[$brand];
	}
											  
}
?>