<?php




class ThreeDS_Processing_Client{

    private $api_3ds_url = "https://3ds.processing.com/";
    //private $api_processing_url = "https://integration.processing.com/secure/htrem_post.php";
    private $api_processing_url = "https://secure.processing.com/secure/htrem_post.php";
    public $acs_response;
    public $pares_response;
    public $request_arr;
    public $return_url;
    public $md;


    public function process_api($params){
        $query = http_build_query($params);
        $url = $this->api_processing_url . '?' . $query;
        $res_raw = $this->api($url);
        parse_str($res_raw,$res);

        return $res;
    }

    public function parse_pares(){
        $url = $this->api_3ds_url . 'pares.php';

        $res_raw = $this->api($url, $this->request_arr);

        try{
            $this->pares_response = json_decode($res_raw,true);

            if($this->pares_response['status']['code'] == 200){
                $res = true;
            }else{
                error_log('ThreeDSecure: Unable to authenticate user');
                error_log( print_r($this->pares_response,true) );
                $res = false;
            }
        }catch(Exception $e){
            error_log("Invalid json response from API SERVER");
            $res = false;
        }

        return $res;
    }

    public function redirect_to_acs_url(){
    	
        //$action = str_replace("http","https",$this->acs_response['result']['acs_url']);
        $action = $this->acs_response['result']['acs_url'];
        $content = <<<EOT
<SCRIPT LANGUAGE="Javascript" >
   <!--
   function OnLoadEvent() { document.downloadForm.submit(); }
   //-->
   </SCRIPT>
	
	<body OnLoad="OnLoadEvent();">

		<div id="content">
			
		<form name="downloadForm" action="{$action}" method="POST" >
			<INPUT type="hidden" name="PaReq"   value="{$this->acs_response['result']['PaReq']}"    >
			<input type="hidden" name="TermUrl" value="$this->return_url"  >
			<input type="hidden" name="MD"      value="{$this->acs_response['result']['MD']}"       >
		</form>
		   </div>
	 </div>

EOT;
        echo $content;exit;
    }

    public function redirect_to_acs_header(){
        echo $this->acs_response['result']['acs_url'] . ' ||| ';
        echo $this->acs_response['result']['PaReq'];
        $PaReq = urlencode($this->acs_response['result']['PaReq']);
        $redir_url = $this->acs_response['result']['acs_url'] . '?PaReq=' . $PaReq . '&TermUrl='. urlencode($this->return_url) . '&MD=' . urlencode($this->acs_response['result']['MD']);
        error_log($redir_url);
        header("LOCATION: $redir_url");
    }

    public function request_acs(){
        if($this->request_arr){
            $url = $this->api_3ds_url . 'acs_url.php';

            //parse out 20 from 20xx in EXP YEAR. PIT has isseus with it
            $request_arr = $this->request_arr;
            //$request_arr['cc_exp_yr'] = substr($request_arr['cc_exp_yr'],-2);


            $request_payload = http_build_query($request_arr);
				
            $res_raw = $this->api($url,$request_payload);

            try{
                $this->acs_response = json_decode($res_raw,true);

                if($this->acs_response['status']['code'] == 200){
                    $res = true;
                }else{
                    error_log("ThreeDS: invalid enrollment response: " . $this->acs_response['status']['message']);
                    $res = false;
                }
            }catch(Exception $e){
                error_log("ThreeDS: invalid json result from API");
                $res = false;
            }
        }else{
            error_log("ThreeDS: request data not set. use set_request_data()");
            $res = false;
        }

        return $res;
    }

    public function set_return_url($return_url){
        $this->return_url = $return_url;
    }

    public function set_request_data(array $request_arr){
        $this->request_arr = $request_arr;
    }

    private function api($url,$data=array(),$timeout=60){
        // verify that the URL uses a supported protocol.
        if( (strpos($url, "http://")=== 0) || (strpos($url, "https://")=== 0) ) {
            // create a new cURL resource
            $ch = curl_init($url);

            curl_setopt($ch, CURLOPT_POST,1);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST,  2);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER,1);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
            curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);  // CURLOPT_TIMEOUT_MS can also be used
            //curl_setopt($ch, CURLOPT_SSLVERSION, CURL_SSLVERSION_SSLv3);

            // Curl Debugging options
            // curl_setopt($ch, CURLOPT_VERBOSE,  TRUE);
            // curl_setopt($ch, CURLOPT_STDERR, fopen("/tmp/curl.err", "w"));

            // Execute the request.
            $result = curl_exec($ch);
			
            $http_result_code = curl_getinfo($ch,CURLINFO_HTTP_CODE);
            if($http_result_code != 200){
                error_log('ThreeDS: http result code, ' . $http_result_code . '|' . $url );
                $result = false;
            }

            $succeeded  = curl_errno($ch) == 0 ? true : false;

            // close cURL resource, and free up system resources
            curl_close($ch);

            if(!$succeeded) {
                error_log('ThreeDS: connection error');
                $result = false;
            }
        } else {
            $result = false;
        }

        return $result;
    }
}