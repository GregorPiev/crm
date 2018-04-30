<?php
    
    define('ROOT',dirname(dirname(__DIR__)));
	 
    require_once ROOT."/inc/db.php";
	require_once ROOT."/inc/config.php";
	require_once ROOT."/vendor/autoload.php";
	
	$config = new config();
	
	$site_name = $config::SITE_NAME;
	$site = $config::get_db_name('new_site');
	$platform = $config::get_db_name('platform');
	
	$db_connection = new DB_Connect();
	
	
	$url =  "https://oracle.porky.optimalq.net/v1/organizations/$site_name/employees";
	$http_header = array('Content-Type:application/json','X-API-KEY:Njc3NzgxMTkxZGIwNTdhMmZmYmM3ZD');
	$certificate = __DIR__.'/StartSSL.ca-bundle.crt'; 
	$options = array(
	    CURLOPT_HTTPHEADER     => $http_header,
	    CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => false,
	 //   CURLOPT_CAINFO         => $certificate,
        CURLOPT_RETURNTRANSFER => true
    ); 
	
	$curl = curl_init($url);
    curl_setopt_array($curl, $options);
    $data = json_decode(curl_exec($curl));
	$errors = curl_error($curl);
    $response = curl_getinfo($curl, CURLINFO_HTTP_CODE);
    curl_close($curl);
	
	if($errors!=null){
		die('{"error": '.$errors.'}');
	}else if($response!=200){
		die('{"response": '.$response.'}');
	}
	
	$employee_data = $data->response;
	$optimalQ_employees=array(); 
	
	
	foreach($employee_data as $key=>$value){
			
		if(!$employee_data[$key]->status) continue;	
			
		$leads = array();
		$employee_username = $employee_data[$key]->name;
		$optimalQ_employees[] = $employee_username;
		
		$sql = " SELECT spotCustomers.id,
		                spotCustomers.firstName,
		                spotCustomers.lastName,
		                IFNULL(newSiteCustomers.phone,spotCustomers.Phone) AS phone,
		                IFNULL(newSiteCustomers.mobile,spotCustomers.cellphone) AS cellphone,
		                country.iso AS country,
		                spotCustomers.city,
		                spotCustomers.saleStatus,
		                spotCustomers.regTime,
		                spotCustomers.lastLoginDate,
		                IF(spotCustomers.lastLoginDate>= DATE_SUB(NOW(), INTERVAL 15 MINUTE) 
		                   OR spotCustomers.lastTimeActive >= DATE_SUB(NOW(), INTERVAL 15 MINUTE),'True','False') AS online 
		        FROM $platform.customers AS spotCustomers
		        LEFT JOIN $site.customers AS newSiteCustomers ON newSiteCustomers.spot_id=spotCustomers.id 
		        LEFT JOIN $platform.country AS country ON country.id=spotCustomers.country
		        LEFT JOIN $platform.users AS users ON users.id=spotCustomers.employeeInChargeId
		        WHERE users.username='$employee_username'
                AND spotCustomers.isDemo=0
                AND spotCustomers.regTime >= DATE_SUB(NOW(), INTERVAL 2 MONTH)
                ";
		        
	    $leads= $db_connection->fetchAll($sql);
	    
        foreach($leads as $lead_key=>$value){
        	$phone = $leads[$lead_key]['phone'];
        	$phone = preg_replace("/[^0-9]/", "", $phone);
        	$phone = ltrim($phone,'0');
        	$phone = $phone!='' ? '+'.$phone : $phone;
        	$leads[$lead_key]['phone'] = $phone;
			
			$cellphone = $leads[$lead_key]['cellphone'];
        	$cellphone = preg_replace("/[^0-9]/", "", $cellphone);
        	$cellphone = ltrim($cellphone,'0');
        	$cellphone = $cellphone!='' ? '+'.$cellphone : $cellphone;
        	$leads[$lead_key]['cellphone'] = $cellphone;
        }
        $leads = json_encode($leads, JSON_UNESCAPED_UNICODE);
        if (json_last_error() !== JSON_ERROR_NONE) {
              echo '{"employee": "'.$employee_username.'", "json_error": '.json_last_error().'}';
              continue;
        }
       
        
        $post_url = "https://oracle.porky.optimalq.net/v1/organizations/$site_name/employees/".$employee_username."/setLeads";
        $post_options = array( CURLOPT_HTTPHEADER     => $http_header,
                               CURLOPT_SSL_VERIFYPEER => false,
                               CURLOPT_SSL_VERIFYHOST => false, 
	                        //   CURLOPT_CAINFO         => $certificate,
                               CURLOPT_RETURNTRANSFER => true,
                               CURLOPT_POST           => true,
                               CURLOPT_POSTFIELDS     => $leads
                             );
        $post_curl = curl_init($post_url);
        curl_setopt_array($post_curl, $post_options);
        $post_data = json_decode(curl_exec($post_curl));
	    $post_errors = curl_error($post_curl);
        $post_response = curl_getinfo($post_curl, CURLINFO_HTTP_CODE);
		$request_size = curl_getinfo($post_curl, CURLINFO_REQUEST_SIZE);
		$upload_size = curl_getinfo($post_curl, CURLINFO_SIZE_UPLOAD);
		curl_close($post_curl);
		
		
        if($post_errors!=null){
	    	echo '{"employee": "'.$employee_username.'", "post_error": '.$post_errors.'}';
			continue;
	    }else if($post_response!=200){
		    echo '{"employee": "'.$employee_username.'", "post_response": '.$post_response.'}';
			continue;
	    }                      
        echo '{"employee": "'.$employee_username.'", "post_response": '.$post_response.'}'; 
	    
	}

    $redis = new Predis\Client();
	
	$redis->set('optimalQ_employees',json_encode($optimalQ_employees)); 
	
 /*   $file = fopen('optimalQ_employees.json','wa+');
    fwrite($file,json_encode($optimalQ_employees));
	fclose($file); */  
	
//	mysql_close($db_link);
?>
