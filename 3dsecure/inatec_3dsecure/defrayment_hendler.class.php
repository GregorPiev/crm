<?php

class defraymentHendler {
	private $post;
	private $defrayments = array();
	
	function __construct($post) {
		$this->post = $post;
	}
	
	public function get_defrayment_data(){
		return $this->post;
	}
	
	public function get_defrayments(){
		foreach($this->post as $k => $v)
		{
		  if (strpos($k, 'defrayment_') !== false)
		  {
		  	
		    $defrayments[] = $v;
		  }
		  
		  
		}
		
		return $defrayments;
	}
}
