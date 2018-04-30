<?php
require_once 'vendor/autoload.php';
include_once 'online_customers.php';

// Parameters passed using a named array:
$client = new \Predis\Client();
$arr = getonlineCustomers();
$client->set('onlineUsers',json_encode($arr));
