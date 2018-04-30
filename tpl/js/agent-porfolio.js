var global_userdata = [];

$(document).ready(function() {
	$("#riskstatus").select2( {
          placeholder: "Select Risk Status",
          allowClear: true,         
          width: "100%"
        });
	getUserSpotId();
	getDesk();
	getCountries();
	getRiskStatus();
	
	$("#summery-form").hide();
    $('#desk').change(function(){
              getEmployees();
         });
         
	$('#summery_month').change(function(){
	          portfolioSummery();
	     });
	 
     $("#getPortfolio").click(function(e){
     	e.preventDefault();
     	agentId = $("#agentId").val();
     	employee = $('#employee').val();
     	if(employee==0)
			msgbox('<i class="icon-warning-sign"></i> Oops!',"please select employee","Close");
		else 
			getAgentPortfolio();
			$("#summery_month").val('0');
			

     });

});
function  getUserSpotId(){
  	apiRequestSync('getUserData',$('#range-form').serialize(),'#portfolio_table_holder',function(userdata){	
  		global_userdata = userdata;
  		if (userdata.spotId==0) {
  			getEmployees();
			$(".employee").show();
  			$(".desk").show();
  			$("#employee").change(function(){
  				if($("#spotId")){
  					$("#spotId").remove();
  				}
		         $("#summery-form").append('<input id="spotId" type="hidden" name="employee" value="'+this.value+'"/>');
		     });
  		}else{
  			$(".employee").remove();
  			$(".desk").remove();
  			$("#range-form").append('<input type="hidden" name="employee" value="'+userdata.spotId+'"/>');
  			$("#summery-form").append('<input type="hidden" name="employee" value="'+userdata.spotId+'"/>');
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

    apiRequest('getEmployeesShort',$('#range-form').serialize(),'#portfolio_table_holder',function(data){

      jQuery.each(data, function() {
        $('#employee')
        .append($('<option>', { value : this.userId })
          .text(this.userId + ' - ' + this.employeeName)); 
      });

    });
}

function getCountries () {

    $('#country')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getCountries',$('#range-form').serialize(),'#portfolio_table_holder',function(data){

      jQuery.each(data, function() {
      	if (this.iso!='') {
	        $('#country')
	        .append($('<option>', { value : this.iso })
	          .text(this.name + ' - ' + this.iso)); 
      	}
      });

    });
}

function getRiskStatus () {
    
    apiRequest('getRiskStatus','','',function(data){
        
      $.each(data, function() {
      	
	      $('#riskstatus').append($('<option>', { value : this.id , text:this.riskStatus}));
      	
      });

    });
}

function getAgentPortfolio(){
	
    apiRequest('getAgentPortfolio',$('#range-form').serialize(),'#portfolio_table_holder',function(data){    	
    	if(data){
    		portfolioSummery();
    	}
        var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
      	var href = '';
      for(var i=0,j=data.length; i<j; i++){
      		href = url + '/?id='+data[i].customerId;
		 	data[i].customerId = '<a href="'+href+'" target="_blank">'+data[i].customerId+'</a>' ;
		 	data[i].customerName = '<a href="'+href+'" target="_blank">'+data[i].customerName+'</a>' ;
		 	
		};

	   $('#portfolio_table').dataTable( {
		    "sDom": 'T<"clear">lfrtip',
	        "oTableTools": {
	            "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
	            "aButtons": [        
                {
                   "sExtends": "pdf",
                   "sButtonText": "Save as PDF"
                },
                {
                   "sExtends": "xls",
                   "sButtonText": "Save for Excel"
                }                
              ]
	        },
	           "bDestroy": true,
	           "bLengthChange": true,
	           "aaData": data,
	           "aaSorting": [[ 0, "desc" ]],                    
	           "aoColumns": [
	            { "mData": "customerId", "sTitle": "Customer Id"},
	            { "mData": "customerName", "sTitle": "Customer Name"},
	            { "mData": "email", "sTitle": "Email"},
	           	{ "mData": "fdd", "sTitle": "FDD"},
	            { "mData": "lastLogin_date", "sTitle": "LastLogin Date"},
	            { "mData": "country", "sTitle": "Country"},
	            { "mData": "total_deposits", "sTitle": "Total Deposits"},
	            { "mData": "currency", "sTitle": "Currency"},
	            { "mData": "last_note", "sTitle": "Last Note"},
	            { "mData": "last_note_employee", "sTitle": "Last Note Employee"},
	            { "mData": "last_note_department", "sTitle": "Last Note Department"},
	            { "mData": "risk_status", "sTitle": "Risk Status"},
	            { "mData": "open_positions", "sTitle": "Open Positions"},
	            { "mData": "winnings", "sTitle": "Winnings"},
	            { "mData": "turn_over", "sTitle": "Turn Over"},
	            { "mData": "last_balance", "sTitle": "Customer Balance"},
	            { "mData": "pnl", "sTitle": "PNL"},
	            { "mData": "real_account_balance", "sTitle": "RAB"},
	             
	           ],
        } );
        if(global_userdata.per_export == 0)
            $('#portfolio_table_holder .DTTT_container').css('display','none');
	});
}


function portfolioSummery(){
	apiRequest('portfolioSummery',$('#summery-form').serialize(),'#summery',function(data){
		if(data)
			$("#summery-form").show();
			
		$.each(data[0], function( index, value ) {
			if(value==null){
				value = '-';

			}
	
			$("#"+index).text(format("#,###.##", value));
		});
	});
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}

