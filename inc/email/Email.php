<?php
require_once 'sendgrid-php/sendgrid-php.php';
require_once 'sendgrid-php/vendor/sendgrid/smtpapi/lib/Smtpapi/Header.php';
require_once 'sendgrid-php/vendor/sendgrid/smtpapi/lib/Smtpapi.php';

//error_reporting(E_ALL);
//    ini_set('display_errors', 1);
class Email {
    	
    private $sendgrid;
	private $email;
	private $subject;
	private $content;
		
	public function __construct(){                                
		$this->sendgrid = new SendGrid("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");
                               $this->email = new SendGrid\Email();
	}
	
	/**
	 * @param  string $email
	 * @return bool
     */
	public function sendEmail($email){
		$config = new config();
		$theme_full_path = $config::THEME_PATH;	
		//$email_signature = new RainTPL;
                                 //$signature_html = $email_signature->draw( 'email_footer', $return_string = true );
		//$body = "<p>".$this->content."</p><br>".$signature_html;
                
                                $body = "<p>".$this->content."</p><br>";
		$this->email->addTo($email)
			        ->setFrom("no-reply@fm-system.com")
		   	        ->setSubject($this->subject)
			        ->setHtml($body);	
	               $response = $this->sendgrid->send($this->email);
		return $response->body['message'] == "success" ? true : false;  	
	}
	
	/**
	 * @param  array $user
	 * @param  string $key
	 * @return void
     */
	public function resetPassword($user,$key){
        $config = new config();
		$link  = $config::SYSTEM_URL . "/resetpassword/";
		$link .= "?userId={$user['id']}&secretKey=$key"; 
		$this->subject = 'Reset Password Link';
                
		$this->content = "Hi {$user['username']}, <br><br>". 
		                 "Please go to the following link to reset your password: $link .  <br><br>".
		                 "FM System Tech Team.";
	}
	
}
   
?>