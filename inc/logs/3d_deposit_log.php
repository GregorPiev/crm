<?php
 require_once $_SERVER['DOCUMENT_ROOT']."/inc/db.php";

    class Deposit3dLog{
    	
        private $dbh;
		
        public function __construct(){
        	
            $this->dbh = new MySqlDriver();
					
        }

        public function createEntry(
                $customer_id,
                $cc_processor,
                $currency,
                $deposit_amount,
                $credit_card_digits,
                $credit_card_year,
                $credit_card_month,
                $country,
                $city,
                $call_type,
                $status = 'NULL',
                $reason = 'NULL' 
            ){
			
                ;
            $sql = "INSERT INTO 3D_deposit_log (
                customer_id, 
                cc_processor, 
                currency, 
                deposit_amount, 
                credit_card_digits,
                credit_card_year, 
                credit_card_month,
                country,
                city,
                call_type,
                status,
                reason,
                time_stemp
            ) VALUES(
                '$customer_id',
                '$cc_processor',
                '$currency',
                '$deposit_amount',
                '$credit_card_digits',
                '$credit_card_year',
                '$credit_card_month',
                '$country',
                '$city',
                '$call_type',
                '$status',
                '$reason',
                 NOW()
            )";       

            if ($this->dbh->exec($sql)) {
                return true;
            }
            return false;
        }

	public function createLuhnLogEntry($customer_id, $cc_number , $message){                 	
    	$sql = "INSERT INTO 3D_deposit_luhn_log (customer_id, cc_number, msg) VALUES($customer_id, $cc_number, '{$message}')";
        if ($this->dbh->exec($sql)) {
            return true;
        }
        return false;
    }
    
	 public function createlBinLogEntry($customer_id, $cc_number , $message){
	                 	
	     
         $sql = "INSERT INTO 3D_deposit_bin_log (customer_id , cc_number , error ) VALUES(
                $customer_id,
                $cc_number,
                '{$message}'
                 
         )";
			 					
            if ($this->dbh->exec($sql)) {
                return true;
            }
            return false;
         }
	
	
	  }

?>