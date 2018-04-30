<?php
session_start();

$_SESSION["pre_post"] = $_POST;
$_SESSION['GlobaCountryIso'] = $_SESSION['GlobaCountryIso'] || $_SESSION['GlobaCountryIso']!='' ? $_SESSION['GlobaCountryIso'] : "UK";

require_once 'lib/AV_helper.php';
$getLocationInfoByIp = getLocationInfoByIp();

// API Setup parameters
	$orderid = sprintf(uniqid(true));
	$amount = $_POST["amount"];
    // Initiate Step One: Now that we've collected the non-sensitive payment information, we can combine other order information and build the XML format.
    $xmlRequest = new DOMDocument('1.0','UTF-8');

    $xmlRequest->formatOutput = true;
    $xmlSale = $xmlRequest->createElement('sale');

    // Amount, authentication, and Redirect-URL are typically the bare minimum.
    appendXmlNode($xmlRequest, $xmlSale,'api-key',$APIKey);
    appendXmlNode($xmlRequest, $xmlSale,'redirect-url','http://'.$_SERVER['HTTP_HOST'].'/agenttools/american_volume_step3');
    appendXmlNode($xmlRequest, $xmlSale, 'amount', $amount);
    appendXmlNode($xmlRequest, $xmlSale, 'ip-address', $_POST["customerip"]);
    //appendXmlNode($xmlRequest, $xmlSale, 'processor-id' , '3169308118');
    appendXmlNode($xmlRequest, $xmlSale, 'currency', $_POST['Currency']);

    // Some additonal fields may have been previously decided by user
    appendXmlNode($xmlRequest, $xmlSale, 'order-id', $orderid);
    appendXmlNode($xmlRequest, $xmlSale, 'order-description', 'Deposit');
    appendXmlNode($xmlRequest, $xmlSale, 'tax-amount' , '0.00');
    appendXmlNode($xmlRequest, $xmlSale, 'shipping-amount' , '0.00');

    /*if(!empty($_POST['customer-vault-id'])) {
        appendXmlNode($xmlRequest, $xmlSale, 'customer-vault-id' , $_POST['customer-vault-id']);
    }else {
         $xmlAdd = $xmlRequest->createElement('add-customer');
         appendXmlNode($xmlRequest, $xmlAdd, 'customer-vault-id' ,411);
         $xmlSale->appendChild($xmlAdd);
    }*/


    // Set the Billing and Shipping from what was collected on initial shopping cart form
    $xmlBillingAddress = $xmlRequest->createElement('billing');
    appendXmlNode($xmlRequest, $xmlBillingAddress,'first-name', $_POST["First_Name"]);
    appendXmlNode($xmlRequest, $xmlBillingAddress,'last-name', $_POST["Last_Name"]);
    //billing-address-email
    appendXmlNode($xmlRequest, $xmlBillingAddress,'country', $_SESSION['GlobaCountryIso']);
    appendXmlNode($xmlRequest, $xmlBillingAddress,'email', $_POST["email"]);
    $xmlSale->appendChild($xmlBillingAddress);

    $xmlRequest->appendChild($xmlSale);

    // Process Step One: Submit all transaction details to the Payment Gateway except the customer's sensitive payment information.
    // The Payment Gateway will return a variable form-url.
    $data = sendXMLviaCurl($xmlRequest,$gatewayURL);

    // Parse Step One's XML response
    $gwResponse = @new SimpleXMLElement($data);
    if ((string)$gwResponse->result ==1 ) {
        // The form url for used in Step Two below
        $formURL = $gwResponse->{'form-url'};
    } else {
        throw New Exception(print " Error, received " . $data);
    }

    // Initiate Step Two: Create an HTML form that collects the customer's sensitive payment information
    // and use the form-url that the Payment Gateway returns as the submit action in that form.
	require_once("lib/style.html");

    print '
	<div id="content">
	<div id="content-header">
		<h1>3D deposit</h1> 
	</div>
	<div class="form_container">
		<form action="" METHOD="POST" id="gotodef">
		<input type="hidden" name="Email" value="'. $_POST['Email'].'" />
		<input type="hidden" name="First_Name" value="'.$_POST['First_Name'] .'" />
		<input type="hidden" name="Last_Name" value="'. $_POST['Last_Name'].'" />
		<input type="hidden" name="Currency" value="'. $_POST['Currency'] .'" />
		<input type="hidden" name="cc_number" value="'. $_POST['cc_number'] .'" />
		<input type="hidden" name="amount" value="'. $_POST['amount'] .'" />
		<input type="hidden" name="user_id" id="user_id" value="'. $_SESSION["pre_post"]['user_id'] .'" />
		<select class="defrayment_select" id="defrayment_select" name="defrayment_type">
				<option value="">current processor : '.  $_POST["processor"] . '</option>
			</select>
		</form>	
	</div>
<div class="form_container">
<form action="american_volume_step2" METHOD="POST">
	
	
	<input type="hidden" name="action" value="'.$formURL .'" />
	<input type="hidden" name="street" value="'.($_POST['Street'] ? $_POST['Street'] : "NA") .'" />
	<input type="hidden" name="zip" value="'. ($_POST['Postal_Code'] ? $_POST['Postal_Code'] : "NA") .'" />
	<input type="hidden" name="city" value="'. ($_POST['City'] ? $_POST['City'] : 'NA' ) .'" />
	<input type="hidden" name="country" value="'.  $_SESSION['GlobaCountryIso']  .'" />
	<input type="hidden" name="state" value="'. $_POST['state'] .'  " />
	<input type="hidden" name="customerip" value="'. $_SERVER['REMOTE_ADDR'] .'" />
	<input type="hidden" name="email" value="'. $_POST['Email'].'" />
	<input type="hidden" name="currency" value="'. $_POST['Currency'] .'" />
	<input type="hidden" name="firstname" value="'. $_POST['First_Name'].'" />
	<input type="hidden" name="lastname" value="'. $_POST['Last_Name'].'" />
	<input type="hidden" name="user_id" value="'. $_SESSION["pre_post"]['user_id'].'" />
	<input type="hidden" name="processor" value="american volume" />
   
   <div class="span6"> <label class="control-label">Amount: </label><div class="input-prepend input-append "><input type="text" name="amount" value="'. $_POST['amount'] .'" readonly></div></div>
    <div class="span6"><label class="control-label">Credit Card number: </label><div class="input-prepend input-append "><input type="text" name="ccn" value=" '.$_POST['cc_number'].'" readonly></div></div>
    <div class="span6"><label class="control-label">Exp Year: </label><div class="input-prepend input-append ">
    					<select  name="exp_year" value="">
    						<option value="2015">2015</option>
    						<option value="2016">2016</option>
    						<option value="2017">2017</option>
    						<option value="2018">2018</option>
    						<option value="2019">2019</option>
    						<option value="2020">2020</option>
    						<option value="2021">2021</option>
    						<option value="2022">2022</option>
    						<option value="2023">2023</option>
    						<option value="2024">2024</option>
    						<option value="2025">2025</option>
    						<option value="2026">2026</option>
                          <option value="2027">2027</option>
                          <option value="2028">2028</option>
                          <option value="2029">2029</option>
                          <option value="2030">2030</option>
                          <option value="2031">2031</option>
                          <option value="2032">2032</option>
                          <option value="2033">2033</option>
                          <option value="2034">2034</option>
                          <option value="2035">2035</option>
                          <option value="2036">2036</option>
                          <option value="2037">2037</option>
    					</select>
    </div></div>
    <div class="span6"><label class="control-label">Exp Month: </label><div class="input-prepend input-append ">
    					<select name="exp_month" value="">
    						<option value="01">01</option>
    						<option value="02">02</option>
    						<option value="03">03</option>
    						<option value="04">04</option>
    						<option value="05">05</option>
    						<option value="06">06</option>
    						<option value="07">07</option>
    						<option value="08">08</option>
    						<option value="09">09</option>
    						<option value="10">10</option>
    						<option value="11">11</option>
    						<option value="12">12</option>
    					</select>
    </div></div>
    <div class="span6"><label class="control-label">CVC: </label><div class="input-prepend input-append "><input type="text" name="cvc_code" value=""></div></div>
    <div class="span6"><input class="Checkout" type="submit" value="Checkout" id="submit" onclick="process()"></div>
    <div class="span6"><div  id="process">please wait</div>
    
</form>
</div>
</div>
<script src="../tpl/js/3dsecure/defrayment_select.js"></script>
<script>
	
	function process(){
		
		document.getElementById("submit").style.display = "none";
		document.getElementById("process").style.display = "block";
	}
	
</script>';

   
   