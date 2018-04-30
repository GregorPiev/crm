<?php

define('ROOT',dirname(dirname(__DIR__)));
	 
require_once ROOT."/inc/db.php";
require_once ROOT."/inc/config.php";
require_once ROOT.'/inc/leverate/leverateApi.php';

class DormantHelper {
	
	private $brandName;
    private $leverate_CRM;
    private $inventiva_CRM;
    private $db_host;
    private $leverate_CRM_DB;
    private $inventiva_CRM_DB;
    private $brand_tp;
	private $leverateConnect;
	private $tpConnect;
	private $leverateApi;
	private $dormantData;
	private $balance;
	private $equity;
	private $credit;
	private $tpAccountChange;
	private $totalInactivityFee;
	private $balanceFee;
	private $creditFee;
	
	public function setBrandName($param){
		$this->brandName = $param;
	}
	
	public function setLeverateCRM($param){
		$this->leverate_CRM = $param;
	}
	
	public function setInventivaCRM($param){
		$this->inventiva_CRM = $param;
	}
	
	public function setDbHost($param){
		$this->db_host = $param;
	}
	
	public function setLeverateCRMDB($param){
		$this->leverate_CRM_DB = $param;
	}
	
	public function setInventivaCRMDB($param){
		$this->inventiva_CRM_DB = $param;
	}
	
	public function setBrandTp($param){
		$this->brand_tp = $param;
	}
	
	public function setLeverateConnection(){
		$this->leverateConnect = new leverateDB_Connection($this->db_host,$this->leverate_CRM);
	}
	
	public function setTpConnection(){
		$this->tpConnect = new DB_Connect('leverate_tp',$this->brand_tp,'social');
	}
	
	public function setLeverateApi(){
		$this->leverateApi = new leverateAPI($this->brandName);
	}
	
	public function getDormantData(){
		$sql = "SELECT * FROM {$this->inventiva_CRM_DB}.dbo.DormantData";
        $result = $this->leverateConnect->fetchAll($sql);

        $dormantData = array();

        foreach($result as $key=>$value){
	       $dormantData[$value['DataKey']] = $value['DataValue'];
        }
		
		$this->dormantData = $dormantData;
		
		return $dormantData;
	}
	
	public function getInactiveAccounts(){
		$sql = "SELECT accounts.AccountId accountGUID,
                       tpAccounts.Lv_tpaccountId tpAccountGUID,
	                   tpAccounts.lv_name tpAccount,
	                   accounts.Lv_FirstName firstName,
	                   accounts.Name accountName
                FROM AccountBase accounts
                RIGHT JOIN lv_tpaccountBase tpAccounts ON tpAccounts.lv_accountid = accounts.AccountId
                LEFT JOIN Lv_tradingplatformBase tplatforms ON tPlatforms.Lv_tradingplatformId = tpAccounts.lv_tradingplatformid
                LEFT JOIN (SELECT lv_accountid accountId, 
                                  MAX(Lv_ApprovedOn) maxTransactionTime  
                           FROM Lv_monetarytransactionBase transactions
		                   WHERE Lv_Type IN ({$this->dormantData['ActivityTypes']})
				                 AND Lv_MethodofPayment NOT IN ({$this->dormantData['InactivityMethodOfPayments']})
		                         AND Lv_ApprovedOn IS NOT NULL
                           GROUP BY lv_accountid
		                  ) AS lastTransactions ON lastTransactions.accountId = accounts.AccountId
                LEFT JOIN (SELECT AccountId, 
                                  MAX(CreatedOn) maxLog  
                           FROM {$this->inventiva_CRM_DB}.dbo.DormantTransactionLog dLog
		                   WHERE Status = 'Success'
                           GROUP BY AccountId
		                  ) AS lastLogs ON lastLogs.AccountId = accounts.AccountId
                WHERE accounts.lv_accountstatus <> 2
                      AND accounts.Lv_FirstName NOT LIKE '%DORMANT%'
                      AND accounts.Lv_FirstName NOT LIKE '%test%'
                      AND accounts.Lv_FirstName NOT LIKE '%firstname%'  
				      AND accounts.Lv_LastName NOT LIKE '%test%'
				      AND accounts.Lv_LastName NOT LIKE '%lastname%'
				      AND tPlatforms.Lv_TradingType <> 1
                      AND lastTransactions.maxTransactionTime IS NOT NULL 
                      AND lastTransactions.maxTransactionTime < DATEADD(day, -{$this->dormantData['InactivityDays']}, CONVERT(varchar(10),GETDATE(),120))
	                  AND (lastLogs.maxLog IS NULL OR CONVERT(varchar(10),lastLogs.maxLog,120) <= DATEADD(day, -{$this->dormantData['LogDays']}, CONVERT(varchar(10),GETDATE(),120)))	            
	            ORDER BY accounts.AccountId";

         return $this->leverateConnect->fetchAll($sql,array('accountGUID','tpAccountGUID'));
	}
	
	public function getInactiveTpAccounts($tpAccounts){
		$sql = "SELECT tpAccounts.platform_user_id AS tpAccount,
                       tpAccounts.balance,
                       tpAccounts.equity,
                       IFNULL(trades.lastTrade,'0000-00-00 00:00:00') AS lastTrade,
                       IF(trades.openTrades IS NULL OR trades.openTrades = 0,0,1) AS openTrades
                FROM {$this->brandName}_users AS tpAccounts
                LEFT JOIN (SELECT platform_user_id, 
                                  MAX(time_opened) AS lastTrade,
                                  SUM(is_open) AS openTrades
                           FROM {$this->brandName}_trades       
		                   WHERE action_type NOT IN (6,7)
                                 AND state<> 6
                                 AND platform_user_id IN (".implode(',',$tpAccounts).") 
                           GROUP BY platform_user_id      
                          ) AS trades ON trades.platform_user_id = tpAccounts.platform_user_id
                WHERE (trades.lastTrade IS NULL OR (DATE(trades.lastTrade) < DATE_SUB(CURDATE(), INTERVAL {$this->dormantData['InactivityDays']} DAY) 
                                           AND trades.openTrades = 0)
			          )
                      AND tpAccounts.platform_user_id IN (".implode(',',$tpAccounts).")";
        return $this->tpConnect->fetchAll($sql);            
	 }
	 
	 public function getAccountBalance($tpAccount){
	     $tpAccountDetails = $this->leverateApi->tpAccountDetails($tpAccount);
	     if(get_class($tpAccountDetails) == 'TradingPlatformAccountBalanceResponse' && $tpAccountDetails->Result->Code == 'Success'){
		    return array('balance' => $tpAccountDetails->TradingPlatformAccountBalance->Balance,
		                 'equity' => $tpAccountDetails->TradingPlatformAccountBalance->Equity,
		                 'credit' => $tpAccountDetails->TradingPlatformAccountBalance->Credit
					    );
	     }
	     return false;				 
    
     }
     
     public function inactivityFee($tpAccountGUID,$amount,$type){
     	
     	$dynamicAttributes = json_decode($this->dormantData[$type.'DynamicAttributes'],true);
			
     	return $this->leverateApi->InactivityFee($tpAccountGUID,$amount,$dynamicAttributes);
     }
     
     public function inactivityFeeSuccess($result){
     	
		if(isset($result['response']) && $result['response']->Result->Code == 'Success'){
			return true;
		}
		return false; 
     }
	 
	 public function dormantTransactionLog($result,$type){
	 	$inactivityFeeSuccess = $this->inactivityFeeSuccess($result);
		
		$dLogArray = array('AccountId' => $this->tpAccountChange['accountGUID'],
			               'TpAccount' => $this->tpAccountChange['tpAccount'],
			               'Balance'   => $this->balance,
			               'Equity'    => $this->equity,
			               'Credit'    => $this->credit,
			               'TotalFee'  => $this->totalInactivityFee,
			               'BalanceFee'=> ($type == 'balanceFee' ? $this->balanceFee : 0),
			               'CreditFee' => ($type == 'creditFee' ? $this->creditFee : 0),
			               'Status'    => ($inactivityFeeSuccess ? 'Success' : 'Error'),
			               'Request'   => json_encode($result['request']),
			               'Response'  => (isset($result['response']) ? json_encode($result['response']) : json_encode($result['leverateApiError']))
						 );
		$this->log('dormantTransactionLog',$dLogArray);					  
		
	 }
	 
	 public function log($table,$params){
	 	$keys = array_keys($params);
		$values = array_values($params);
	 	$sql = "INSERT INTO {$this->inventiva_CRM_DB}.dbo.{$table} (".implode(",",$keys).") VALUES ('".implode("','",$values)."')";
		$this->leverateConnect->exec($sql);
		 
	 }
	 
     
     public function dormantCustomer($customerId,$customerFirstName){
     	
	    $params = array(array('name'=>'FirstName','fieldName'=>'Lv_FirstName','value'=>'DORMANT - '.$customerFirstName),
	                    array('name'=>'IsDormant','fieldName'=>'new_isdormant','value'=>1,'additionalAttributeType'=>'Bit'));
	    $result = $this->leverateApi->UpdateAccountDetails($customerId,$params);   
	         
	    $success = $this->dormantCustomerSuccess($result);
		$this->dormantCustomerLog($customerId,$result,$success);
		
		return $success;   
     }
	 
	 public function dormantCustomerSuccess($result){
	    
		if(get_class($result) == 'ResultInfo' && $result->Code == 'Success')   
	       return true;  	   
        	
	    return false;	
	 }
	 
	 public function dormantCustomerLog($customerId,$result,$success){
	 	$dLog = array("AccountId" => $customerId,
	 	              "Response"  => ($success ? json_encode($result) : $result['leverateApiError']),
	 	              "Status"    => ($success ? 'success' : 'error')
		             );
		$this->log('DormantCustomerLog',$dLog);			 
	 }

	 public function zeroingTpAccounts($tpAccounts){
	 	$dataArray = array('balance'=>array('in'=>'Deposit','out'=>'Withdrawal'),'credit'=>array('in'=>'Credit','out'=>'Debit'));	
	 	foreach($tpAccounts as $key=>$tpAccount){
	 		foreach($dataArray as $dataKey=>$data){
	 			
	 			if($tpAccount[$dataKey] != 0 ){
	 			  	
	 			  $type = $tpAccount[$dataKey] < 0 ? $data['in'] : $data['out'];
				  $amount = $tpAccount[$dataKey] < 0 ? -$tpAccount[$dataKey] : $tpAccount[$dataKey];	
				  $zeroing = $this->leverateApi->internalTransaction($tpAccount['tpAccountGUID'], $amount, $type);
				  var_dump($zeroing)."\n";
				  $this->dormantZeroingLog($tpAccount,$type,$amount,$zeroing);
				  if(!$this->zeroingSuccess($zeroing))
				    return false;
	 		    }
	 		}
			$accountDetails = $this->getAccountBalance($tpAccount['tpAccount']);
			if(!isset($accountDetails['equity']) || $accountDetails['balance'] != 0 || $accountDetails['credit'] != 0)
			   return false;
					
	 	}
		return true;
	 }
	 
	 public function zeroingSuccess($result){
	 	if(isset($result['response']) && $result['response']->Result->Code == "Success")
		   return true;
		return false;
	 }
	 
	 public function dormantZeroingLog($tpAccount,$type,$amount,$result){
	 	$success = $this->zeroingSuccess($result);
	 	$dLog = array('AccountId' => $tpAccount['accountGUID'],
			          'TpAccount' => $tpAccount['tpAccount'],
			          'Balance'   => $tpAccount['balance'],
			          'Credit'    => $tpAccount['credit'],
			          'Type'      => $type,
			          'Amount'    => $amount,
			          'Request'   => json_encode($result['request']),
	 	              'Response'  => (isset($result['response']) ? json_encode($result['response']) : json_encode($result['leverateApiError'])),
	 	              "Status"    => ($success ? 'Success' : 'Error')
		             );
		$this->log('DormantZeroingLog',$dLog);
	 }

     public function tpAccountInactivityFees($tpAccountChanges){
     	foreach($tpAccountChanges as $key=>$tpAccountChange){
    		$tpDetails = $this->getAccountBalance($tpAccountChange['tpAccount']);	
    		if(!$tpDetails)
				continue;
			$this->balance = $tpDetails['balance'];
			$this->equity = $tpDetails['equity'];
			$this->credit = $tpDetails['credit'];					
			if($this->equity > 0){
				$this->totalInactivityFee = number_format($this->equity > $this->dormantData['Limit'] ? $this->equity*$this->dormantData['Percent'] : ($this->equity >= $this->dormantData['DefaultFee'] ? $this->dormantData['DefaultFee'] : $this->equity), 2, '.', '');
				$this->balanceFee = $this->balance <= 0 ? 0 : min($this->balance,$this->totalInactivityFee);
				$this->creditFee = $this->balance <=0 ? $this->totalInactivityFee : $this->totalInactivityFee - $this->balanceFee;
				echo json_encode(array("accountName"=>$tpAccountChange['accountName'],"tpAccount"=>$tpAccountChange['tpAccount'],"balance"=>$this->balance,"equity"=>$this->equity,"balanceFee"=>$this->balanceFee,"creditFee"=>$this->creditFee))."\n";
				$this->tpAccountChange = $tpAccountChange;
				
				if($this->balanceFee != 0)
					$this->dormantTransactionLog($this->inactivityFee($tpAccountChange['tpAccountGUID'], $this->balanceFee, 'Withdrawal'),'balanceFee');
				if($this->creditFee != 0)
					$this->dormantTransactionLog($this->inactivityFee($tpAccountChange['tpAccountGUID'], $this->creditFee, 'Debit'),'creditFee');
			}
				 
    	}
        $positiveEquity = 0;
        foreach($tpAccountChanges as $key=>$tpAccountChange){
            $tpDetails = $this->getAccountBalance($tpAccountChange['tpAccount']);
			if(!$tpDetails || $tpDetails['equity'] > 0){
				$positiveEquity = 1;
				break;
			}
			echo "last_equity\n";
			var_dump($tpDetails)."\n";   
			$tpAccountChanges[$key]['balance'] = $tpDetails['balance'];
			$tpAccountChanges[$key]['credit'] = $tpDetails['credit'];
        }
		if(!$positiveEquity){
			$zeroing = $this->zeroingTpAccounts($tpAccountChanges);
			if($zeroing)
				var_dump($this->dormantCustomer($tpAccountChanges[0]['accountGUID'],$tpAccountChanges[0]['firstName']));
		} 
     } 
	 
	
}

?>