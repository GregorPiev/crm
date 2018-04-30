<?php 

class iso {
	
	public $geo_data ;
	
	function __construct() {
  		$xml = simplexml_load_file('http://www.geoplugin.net/xml.gp?ip='.$_SERVER["REMOTE_ADDR"]);
		
		foreach ($xml as $key => $value)
		{
			$value = $xml->$key;
			$key = str_replace('geoplugin_', '', $key);	
	    	$this->geo_data [$key] = $value ;
	
		}	
	}
	
	public function get_iso3_by_country_name()
	{	require_once 'country_iso3.php';
		$country_name = (string)$this->geo_data['countryName'][0];
		$country_iso3 = $country_iso3[$country_name];
		return 	$country_iso3;
	}
	
	public function get_iso3_by_iso_2($iso_2)
	{	require_once 'country_iso3.php';
		$country_iso2 = $iso2_iso3[$iso_2];
		return 	$country_iso2;
	}
	
	public function get_iso3_by_post($country_name)
	{	require_once 'country_iso3.php';
		$country_iso3 = $country_iso3[$country_name];
		return 	$country_iso3;
	}
	
	public function get_city()
	{
		$city = (string)$this->geo_data['city'][0];
		return 	$city;
	}
}

	

	
	
	
?>
