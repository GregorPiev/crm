function  getUserSpotId(){
  	apiRequest('getUserSpotId',$('#range-form').serialize(),'#transactions_table_holder',function(spotId){
  		if (spotId==0) {
			$("#employee").parent().show();
  			$("#desk").parent().show();
  			getEmployees();
  		}
  		
  	});	
}
  
function getEmployees () {

    $('#employee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getEmployeesShort',$('#range-form').serialize(),'#transactions_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
}

function assignCustomersToEmployee() {
  var url = window.location.href;
  var post_data = $('#range-form').serialize()+'&url='+url;
  
  apiRequest('assignCustomersToEmployee',post_data,'#callBack',function(data){
  	  var invalid = parseFloat(data['invalid']);
  	  var message = invalid ? invalid+' customer'+(invalid!=1 ? 's are' : ' is')+' invalid<br><br>' : '';
      message += data['editCustomer']==true ? "Valid customers are assigned" : data+' customers could not be assigned'; 
      bootbox.alert("<h4>"+message+"</h4>");
    });
}

function isIdsValid(ids){
	var re = new RegExp("^[0-9\r\n]+$");
	if (re.test(ids)) 
	    assignCustomersToEmployee();
	else 
	    msgbox('<i class="icon-warning-sign"></i> Oops!',"Please check customer ids field,<br /> an invalid charachter was used","Close");
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

$(document).ready(function() {    
		getDesk();
        getUserSpotId();

        $('#desk').change(function(){
          getEmployees();
        });
        
        $("#submit").click(function(e){
			e.preventDefault();
			
			ids = $('#customersIds').val();
			employee = $('#employee').val();

			if(ids=='' && employee==0)			
				msgbox('<i class="icon-warning-sign"></i> Oops!',"please fill all fields","Close");
			else 
				isIdsValid(ids);
	});

  });


