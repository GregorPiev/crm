<?php

class Engage
{

	protected $apiHost = null;
	protected $username = null;
	protected $password = null;
	protected $sessionId = null;
	protected $lastRequest = null;
	protected $lastResponse = null;
	protected $lastFault = null;

	public function __construct($apiHost)
	{
		$this->apiHost = $apiHost;
	}

	public function execute($request)
	{
		if ($request instanceof SimpleXMLElement) {
			$requestXml = $request->asXML();
		} else {
			$requestXml = "<Envelope><Body>{$request}</Body></Envelope>";
		}

		// NOTE: Make sure that your request string uses UTF-8 encoding
		$this->lastRequest = $requestXml;
		$this->lastResponse = null;
		$this->lastFault = null;
		$curl = curl_init();
				
		curl_setopt($curl, CURLOPT_URL, $this->getApiUrl());
		curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
		curl_setopt($curl, CURLOPT_POST, true);
		curl_setopt($curl, CURLOPT_POSTFIELDS, $requestXml);
		curl_setopt($curl, CURLINFO_HEADER_OUT, true);
		curl_setopt($curl, CURLOPT_HTTPHEADER, array('Content-Type: text/xml; charset=UTF-8', 'Content-Length: ' . strlen($requestXml)));
		curl_setopt($curl, CURLOPT_CONNECTTIMEOUT, 60);
		curl_setopt($curl, CURLOPT_TIMEOUT, 180);
		
		$responseXml = @curl_exec($curl);

		if ($responseXml === false) {
			$errno = curl_errno($curl);
    		$error_message = curl_strerror($errno);
			
			throw new Exception('CURL error: ' . curl_error($curl) . "<br> cURL error ({$errno}):\n {$error_message}");
		}
	
		curl_close($curl);
	
		if ($responseXml === true || !trim($responseXml)) {
			throw new Exception('Empty response from Engage');
		}
	
		$this->lastResponse = $responseXml;
	
		// NOTE: You may want to check that the Engage response is in valid UTF-8 encoding before parsing the XML
		$response = @simplexml_load_string('<?xml version="1.0"?>' . $responseXml);
		
		if ($response === false) {
			throw new Exception('Invalid XML response from Engage');
		}
	
		if (!isset($response->Body)) {
			throw new Exception('Engage response contains no Body');
		}
	
		$response = $response->Body;
		$this->checkResult($response);
		return $response;
	}

	public function getApiUrl(){
		
		$url = "https://{$this->apiHost}/XMLAPI";

		if ($this->sessionId!== null) {
			$url .= ';jsessionid=' . urlencode($this->sessionId);
		}
		return $url;
	}

	public function checkResult($xml){

		if (!isset($xml->RESULT)) {
			throw new Exception('Engage XML response body does not contain RESULT');
		}

		if (!isset($xml->RESULT->SUCCESS)) {
			throw new Exception('Engage XML response body does not contain RESULT/SUCCESS');

		}

		$success = strtoupper($xml->RESULT->SUCCESS);

		if (in_array($success, array('TRUE', 'SUCCESS'))) {
			return true;
		}

		if ($xml->Fault) {
			$this->lastFault = $xml->Fault;
			$code = (string)$xml->Fault->FaultCode;
			$error = (string)$xml->Fault->FaultString;
			throw new Exception("Engage fault '{$error}'" . ($code ? "(code: {$code})" : ''));
		}

		throw new Exception('Unrecognized Engage API response');
	}

	public function getLastRequest()
	{
		return $this->lastRequest;
	}
	
	public function getLastResponse()
	{
		return $this->lastResponse;
	}
	
	public function getLastFault()
	{
		return $this->lastFault;
	}

	public function login($username, $password)
	{
		$this->username = $username;
		$this->password = $password;
		$this->sessionId = null;
		$request = '<Login><USERNAME>'.$username.'</USERNAME><PASSWORD>'.$password.'</PASSWORD></Login>';
			
		try {
			$response = $this->execute($request);
		} catch (Exception $e) {
			throw new Exception('Login failed: ' . $e->getMessage());
		}

		if (!isset($response->RESULT->SESSIONID)) {
			throw new Exception('Login response did not include SESSIONID');
		}
		echo "login success <br><pre>";

		$this->sessionId = $response->RESULT->SESSIONID;
	}
	
	public function logout()
	{
		$request = "<Logout/>";
		
		try {
			$response = $this->execute($request);
		} catch (Exception $e) {
			throw new Exception('Logout failed: ' . $e->getMessage());
		}
	}
	
	public function connectToFTPServer(){
		
	}
	
	public function uploadFile($csv_filename, $map_filename){
		set_time_limit(300);
		$ftp_server = "transfer2.silverpop.com";
		$ftp_conn = ftp_connect($ftp_server) or die("Could not connect to $ftp_server");
		$login = ftp_login($ftp_conn, $this->username, $this->password);
		
		ftp_pasv($ftp_conn, true);
		
		if(file_exists($map_filename))
		{
			echo "The map file $map_filename exists<br>";
		}
		else 
		{
			echo "The map file $map_filename does not exist<br>";
		}
		
		if(file_exists($csv_filename))
		{
			echo "The csv file $csv_filename exists<br>";
		}
		else 
		{
			echo "The csv file $csv_filename does not exist<br>";
		}
		
		if (ftp_put($ftp_conn, "/upload/".$map_filename, $map_filename, FTP_ASCII))
	  	{
	  		echo "Successfully uploaded map $map_filename <br>";
	  	}
		else
		{
			print_r(error_get_last());
			echo "<br>";
			echo "Error uploading map $map_filename <br>";
		}
		
		// upload file
		if (ftp_put($ftp_conn, "/upload/".$csv_filename, $csv_filename, FTP_ASCII))
	  	{
	  		echo "Successfully uploaded csv $csv_filename.";
	  	}
		else
		{
			echo "Error uploading csv $csv_filename.";
		}
		
		// close connection
		ftp_close($ftp_conn);
	}
}
?>