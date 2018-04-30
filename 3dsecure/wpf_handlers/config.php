<?php
	// The payment gateway URL (HTTPS access only!)
	$wpf_gateway="https://solidpayments.net/frontend/payment.prc";
	//$wpf_gateway="https://test.solidpayments.net/frontend/payment.prc";
	
	// WPF request / response handlers
	//$wpf_handlers_base = "http://wpf.solidpayments.com/test/wpf/3ds/wpf_handlers";
	$wpf_handlers_base = "https://www.onetwotrade.com/3dsecure/wpf_handlers";
	//$wpf_handlers_base = "https://sandbox.onetwotrade.com/3dsecure/wpf_handlers";
	
	// Customization, should be located on a secured site (SSL-HTTPS) otherwise IE will complain about unsecured content
	//$wpf_customizations_base="http://wpf.solidpayments.com/test/wpf/3ds/wpf_custom";

	$wpf_customizations_base="https://www.onetwotrade.com/3dsecure/wpf_custom";

	//$wpf_customizations_base="https://sandbox.onetwotrade.com/3dsecure/wpf_custom";
	
	// Client redirected from WPF back after a successful or failed transaction
	//$wpf_redirection_base = "http://wpf.solidpayments.com/test/wpf/3ds/wpf_redirect";
	$wpf_redirection_base = "https://ns.onetwotrade.com/3dsecure/wpf_redirect";
	//$wpf_redirection_base = "https://sandbox.onetwotrade.com/3dsecure/wpf_redirect";
?>	
