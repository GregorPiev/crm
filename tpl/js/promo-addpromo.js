
function getDataFields(){

  apiRequest('getPromoCodesData',$('#range-form').serialize(),'#promoCodesData_table_holder',function(data){
	  	// convert from bool to string
         for(var row in data){
        	 data[row].reusable = ( data[row].reusable == 1) ? "yes": "no";	 
        	 data[row].enabled = ( data[row].enabled == 1) ? "yes": "no";	 
        	 data[row].ftd = ( data[row].ftd == 1) ? "yes": "no";	 
         }
         // promo code table fields names
         var fields = Object.keys(data[row]);
         
         addForm(fields);

});

}

function addForm(fields){
	for(var field in fields){
		console.log(fields[field]);
	}
}

$(document).ready(function() {
	
	getDataFields();
	
});
