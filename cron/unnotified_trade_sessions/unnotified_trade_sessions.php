<?php
    require_once '/opt/ott/sites/northstar/inc/db.php';
	
	function getUnnotifiedTradeSessions(){
	   $northStarDB = new MySqlDriver();
       $sql = "SELECT northStar.retention_trade_sessions.id,
                    OneTwoTrade_platform.customers.id AS customerId,
                    CONCAT(OneTwoTrade_platform.customers.FirstName,' ',OneTwoTrade_platform.customers.LastName) AS customerName,
                    northStar.users.username AS trader,
                    northStar.retention_trade_sessions.startTime,
                    northStar.retention_trade_sessions.endTime,
                    northStar.retention_trade_sessions.status,
                    OneTwoTrade_platform.users.id AS employeeId
                    FROM northStar.retention_trade_sessions
                    LEFT JOIN OneTwoTrade_platform.customers ON OneTwoTrade_platform.customers.id=northStar.retention_trade_sessions.customerId
                    LEFT JOIN northStar.users ON northStar.users.id=northStar.retention_trade_sessions.userId
                    LEFT JOIN OneTwoTrade_platform.users ON OneTwoTrade_platform.users.id=OneTwoTrade_platform.customers.employeeInChargeId
                    WHERE northStar.retention_trade_sessions.isNotified=0
                          AND DATEDIFF(current_timestamp(),startTime)<=7
                    ORDER BY id ASC";
       $result = $northStarDB->fetchAll($sql);	
	   
	   return $result;	
		
	}
?>