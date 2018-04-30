<?php
 require_once $_SERVER['DOCUMENT_ROOT']."/inc/db.php";

    class DepositLog{
    	
        private $dbh;

        public function __construct(){
        	
            $this->dbh = new MySqlDriver();
					
        }

        public function createEntry(
            $customer_id,
            $cc_processor,
            $currency,
            $first_attempt,
            $deposit_amount,
            $credit_card_digits,
            $credit_card_year,
            $credit_card_month,
            $country,
            $city,
            $response,
            $call_type,
            $status = 'NULL',
            $reason = 'NULL'
            ){

            $sql = "INSERT INTO deposit_log (
                customer_id,
                cc_processor,
                currency,
                first_attempt,
                deposit_amount,
                credit_card_digits,
                credit_card_year,
                credit_card_month,
                country,
                city,
                response,
                call_type,
                status,
                reason
            ) VALUES(
                '$customer_id',
                '$cc_processor',
                '$currency',
                '$first_attempt',
                '$deposit_amount',
                '$credit_card_digits',
                '$credit_card_year',
                '$credit_card_month',
                '$country',
                '$city',
                '$response',
                '$call_type',
                '$status',
                '$reason'
            )";

            if ($this->dbh->exec($sql)) {
                return true;
                die('{"success":"true","message":" 1"}');
            }
            return false;
            die('{"success":"true","message":" 2"}');
        }

    }

?>