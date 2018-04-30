<?php
   require __DIR__ . "/brand_db.php";
   
   class Thread {
  	  private $result;
	  private $brand;
	  private $brandConnection;
	
      public function __construct($brand,$db){
         $this->brand = $brand;
		 $this->brandConnection = new BrandConnection($brand,$db); 
      }
	  
	  public function database($db){
	  	 return $this->brandConnection->database($db);
	  }
	  
	  public function run($sql,$method){
	  	 $this->result = $this->brandConnection->$method($sql);  
	  }
	 
	  
   }
   $dbConnection = new Thread('OTT','platform');
?>