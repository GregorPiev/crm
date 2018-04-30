    
$(document).ready(function(){
	 
    $("#employee").select2({width: "100%"});
	$("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
      width: "100%"
     });
    $("#countries").select2( {
   	  placeholder: "Select countries or leave blank for all",
      allowClear: true,
      width: "100%"
   }); 
    getCampaigns(); 
	getDesk();
	getCountry();
	getEmployeesForConversion();
	$('#desk').change(function(){
		getEmployeesForConversion();
	});
});	

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

function getEmployeesForConversion(){
	
	$('#employee').find('option').not('option[value="0"]').remove();
    
    apiRequest('getEmployeesForConversion',$('#range-form').serialize(),'',function(data){
    	    $.each(data, function() {
                 $('#employee').append($('<option>', {value : this.userId , text : this.userId+' - '+ this.employeeName}));
            });
    });
    $('#s2id_employee .select2-chosen').text($('#employee option:first').text()); // display first chosen employee;
}

function getCampaigns(){
  $('#campaign')
    .find('option')
    .remove()
    .end();	
  apiRequest('getCampaigns','','',function(data){
  	
  	 $.each(data,function(){
  	 	  $('#campaign')
  	 	  .append($('<option>', { value : this.id })
          .text(this.name));
  	 });
  });  
}

function getCountry(){
	$('#countries')
	   .find('option')
	   .remove();
    
	apiRequest('getCountry',$('#range-form').serialize(),'',function(data){
		
		jQuery.each(data, function() {
          $('#countries')
           .append($('<option>', { value : this.name })
           .text(this.iso + ' - ' + this.name));
	    });	
	});
}


