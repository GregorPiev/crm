<?php

class fibonatixHelper {
	private $args;
	// private $end_point = '711';
	//private $merchant_control = "CCCC0376-7321-4ECE-9F1B-E4A8D0246899";
	private $login_username = 'TomO';
	private $end_point_non_3d = '76';
	private $end_point_3d = '77';
	private $merchant_control = "99E6FCFB-7E56-462C-9947-49CB4DE2D81B";
	private $url = "https://gate.fibonatix.com/paynet/api/v2/sale/group/";
	private $status = "https://gate.fibonatix.com/paynet/api/v2/status/group/";
	private $validation = true;
	private $validationMessage = '';
	function __construct($post , $session ) {

		$address = (isset($session['address']) && !empty($session['address']) ? $session['address'] : $post['street']);
		$user_email = (isset($session['user_email']) && !empty($session['user_email']) ? $session['user_email'] : $post['email']);
		$user_currency = (isset($session['user_currency']) && !empty($session['user_currency']) ? $session['user_currency'] :  $post['currency']);
		

		$this->args = array(
	  		 "client_orderid" => sprintf(uniqid(true)),
             "order_desc" => "OneTwoTrade sale tranaction",
             "card_printed_name" => $post['firstname'] .' '.$post['lastname'],
             "amount" => $post['depositAmount'],
             "first_name" => $post['firstname'],
             "last_name" => $post['lastname'],
             "credit_card_number" => $post['cc_number'],
             "expire_month" => $post['expire_month'],
             "expire_year" => $post['expire_year'],
             "address1" => $address,
             "city" => $post['city'],
             "zip_code" => $post['postcode'],
             "email" => $user_email,
             "currency" => $user_currency,
             "cvv2" => $post['cvv'],
             "country" => $post['country_iso'],
			"state" => $post['state'],
           // "country" => $post['country'],
             "ipaddress" => $post['ip_address'],           
             "redirect_url" => "https://ns.onetwotrade.com/agenttools/cc_deposits",
			//"redirect_url" =>'http://'.$_SERVER["HTTP_HOST"].'/agenttools/fibonatixsuccess?email='.$post['email']
            );


		foreach ($this->args as $key => $value) {
			if(empty($value) || !$value) {
				$this->validation = false;
				$this->validationMessage =  http_build_query(array("success"=>false,"error-message"=>$key." is missing"));
				break;
			}
		}
    
	}

	public function checkOrderStatus($merchant_order_id, $paynet_order_id, $by_request_sn) {

		if($this->validation == false) {
			return $this->validationMessage;
		}

		$control = sha1($this->login_username.$merchant_order_id.$paynet_order_id.$this->merchant_control);

        $args = array(
            "login" => $this->login_username,
            "client_orderid" => $merchant_order_id,
            "orderid" => $paynet_order_id,
            "by-request-sn" => $by_request_sn,
            "control" => $control
        );

		//return $control;

        $args['control'] = $control;

        foreach($args as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
        $fields_string = rtrim($fields_string, '&');

        $ch = curl_init();
        curl_setopt($ch,CURLOPT_URL, $this->status.$this->end_point_non_3d);
	//	curl_setopt($ch,CURLOPT_URL, $this->status.$this->end_point);
        curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);         
        $result = curl_exec($ch);               
        curl_close($ch);
        
        return $result ;
            
    }


	
	public function addDepositWithNewCreditcard()
	{	
		if($this->validation == false) {
			return $this->validationMessage;
		}

		$request_string = $this->end_point_non_3d.$this->args["client_orderid"].($this->args["amount"]*100).$this->args["email"].$this->merchant_control;
		//$request_string = $this->end_point.$this->args["client_orderid"].($this->args["amount"]*100).$this->args["email"].$this->merchant_control;
		$this->args["control"] = sha1( $request_string);	
		
		$fields_string = '';

		foreach($this->args as $key=>$value) { $fields_string .= $key.'='.$value.'&'; }
		$fields_string = rtrim($fields_string, '&');
		$this->url = $this->url.$this->end_point_non_3d;
		//$this->url = $this->url.$this->end_point;
		$ch = curl_init();

		curl_setopt($ch,CURLOPT_URL, $this->url);
		curl_setopt($ch,CURLOPT_POSTFIELDS, $fields_string);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);		
		$result = curl_exec($ch);		
		curl_close($ch);
		return $result ;
	}
}