<?php
	
    require_once 'unnotified_trade_sessions.php';
    require_once '/opt/ott/sites/northstar/vendor/autoload.php';
	
	while (true) {
		$redis = new Predis\Client();
		
		$unnotified = getUnnotifiedTradeSessions();
		
		$redis->set('unnotified_trade_sessions',json_encode($unnotified));
			
		$json = $redis->get('unnotified_trade_sessions');
		
		echo $json;
		
		sleep(5);
		
	}	 
		
	
?>