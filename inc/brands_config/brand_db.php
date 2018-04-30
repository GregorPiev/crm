<?php
  require __DIR__ . '/brand_config.php';
   
  class BrandConnection {
  		
  	private $db_link;
	private $databases;
	
	public function __construct($brand,$db="platform") {
   	  $config = new BrandConfig();
	  
	  $this->databases = $config->getDB_Name($brand);
	  
      $this->db_link = mysql_connect($config->getHost_Name($brand), $config->getHost_User($brand), $config->getHost_Pass($brand),true);
      if($db) mysql_select_db($this->databases[$db], $this->db_link);
      mysql_set_charset("utf8", $this->db_link);
	  
	  
   }
  
   public function __destruct() {
      mysql_close( $this->db_link );
   }
   
   public function database($db){
   	  return $this->databases[$db];
   }
  
   public function fetchAll($sql) {
      $result = mysql_query($sql, $this->db_link) or die(mysql_error());
      for ($array = array(); $row = mysql_fetch_assoc($result); $array[] = $row); 
      return $array; 
   }
   
   public function query($sql) {
   	 $result = mysql_query($sql, $this->db_link) or die(mysql_error());
	 return $result;
   }
   
   public function fetch($result_set) {
   	 $row = mysql_fetch_assoc($result_set);
	 return $row;  
   } 
    
  }
?>