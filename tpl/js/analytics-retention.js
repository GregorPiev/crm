Date.prototype.format = function(format) //author: meizz
{
  
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  }
  


  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
}


var userData = [];
var customers_table;

$("#assign-form").append('<textarea class="form-control" type="text" style=" display:none" name="assignCustomers" id="assignCustomers"></textarea>');

$(document).ready(function() {
    $('#drEnd, #fdEnd, #ldEnd, #llEnd, #lnEnd,#aEnd').val(new Date().format('yyyy-MM-dd'));
    $('#drStart,#fdStart, #ldStart, #llStart,#lnStart,#aStart').datepicker();    
    $('#drEnd, #fdEnd, #ldEnd, #llEnd,#lnEnd,#aEnd').datepicker();
    
   $("#countries").select2( {
   	  placeholder: "Select countries or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   $("#excEmployee").select2( {
   	  placeholder: "Select employees or leave blank for all",
      allowClear: true,
      width: "100%"
   });
    $("#status").select2( {
   	  placeholder: "Select Sale Status or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   $("#riskstatus").select2( {
   	  placeholder: "Select Risk Status or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   getUserData();
   getCountry();
   getDesk();
   getRiskStatus();
   init_option();
   $('#desk').change(function(){
   	getEmployeesForRetention();	
   });
   
   $(document).on("click","a.getNotes",function(){
   	 event.preventDefault();
   	 var customerId=$(this).attr("data-customerId");
   	  bootbox.dialog({
        title: "Notes ",
        message:
                 '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<div id="notes_table_holder"></div>'+
                 '<div class="table-responsive">' +
				 '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="notes_table">' +
			     '</table>'+
			     '</div>'+		
                 '</div></div>'+
                 '<script>getNotesForShuffle('+customerId+');</script>',   
                
        buttons: {
          success: {
          label: "OK",
          className: "btn-success"
      }
    }}); 
   	 
   });
   $(document).on("click","a.delete",function(){
   	  event.preventDefault();
   	  var id= $(this).attr('data-id');
   	  apiRequest('deletePreExcludeEmployees','id='+id,'',function(data){
   	  	 getPreExcludeEmployeesForTable();
   	  });
   });	
});

function getRiskStatus () {
    
    apiRequest('getRiskStatus','','',function(data){
        
      $.each(data, function() {
      	
	      $('#riskstatus').append($('<option>', { value : this.id , text:this.riskStatus}));
      	
      });

    });
}

function getNotesForShuffle(customerId){
	var post_data={customerId: customerId, type: ['Sales','retention']};
	apiRequest('getNotes',post_data,$('#notes_table_holder'),function(data){
		$('#notes_table').dataTable( {
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
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 4, "desc" ]],                    
           "aoColumns": [
            { "mData": "customerId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "body", "sTitle": "Body"},
            { "mData": "createDate", "sTitle": "Date","sType":"date"},
            { "mData": "employee", "sTitle": "Employee"}
           ]
            });	
	});
}

function assign(){
  var rows = customers_table.$('tr',{'filter':'applied'});
  var selected_customers = $('input.check1:checked', rows).map(function(){ 
  	                                                            return {customerId:         $(this).attr('data-customerId'),
  	                                                                    employeeInChargeId: $(this).attr('data-currentemployee'),
  	                                                                    saleStatus:         $(this).attr('data-saleStatus')
  	                                                                     
  	                                                                    };}).get();

  
  if($('#assignEmployee').val()==0){
  	bootbox.alert('<h4>Please choose an employee.</h4>');
  	return false;
  }
  bootbox.dialog({
        title: "Customer Assigning",
        message:'<div class="row">  ' +
                  '<h5>&nbsp;</h5><h4 style="margin-left:3em">Are you sure to change the employee of '+selected_customers.length+' customers?</h4>' +
                    '</div>'
        	
        ,      
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      //	isIdsValid($('#assignCustomers').val());
      	    assignCustomersForShuffle(selected_customers);
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
        bootbox.alert("<h4>The customers are NOT assigned</h4>");
      }
    }
    }});  
  }; 
  
/*function isIdsValid(ids){
	var re = new RegExp("^[0-9\r\n]+$");
	if (re.test(ids)) 
	    assignCustomersForShuffle();
	else 
	    msgbox('<i class="icon-warning-sign"></i> Oops!',"Please check customer ids field,<br /> an invalid charachter was used","Close");
} */

function assignCustomersForShuffle(customers) {
  var change_fields = { "employeeInChargeId": $('#assignEmployee').val(), "saleStatus": "new"};	
  var post_data = {"customers": JSON.stringify(customers) , "change_fields": JSON.stringify(change_fields), "url": window.location.href};

  apiRequest('editCustomer',post_data,'#callback',function(data){
      var message = data==true ? "The customers are assigned" : data+' customers out of '+customers.length+' could not be assigned'; 
      bootbox.alert("<h4>"+message+"</h4>");       
      getRetentionCustomers();
    });
}


function getEmployeesForRetention () {

    $('#employee, #excEmployee, #assignEmployee')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    

    apiRequest('getEmployeesForRetention',$('#parameters-form').serialize(),'#customers_table_holder',function(data){
      console.log("succesful"); 
      jQuery.each(data, function() {
        $('#employee, #excEmployee, #assignEmployee')
        .append($('<option>', { value : this.userId })
           .text(this.userId + ' - ' + this.employeeName)); 
      });
      
      if($('#desk').val()==4)
         $('#employee option[value="2290"]').attr('selected',true);
    });
    
}

function getEmployeesForExclude(){
	 $('#pre_excludeEmployee').find('option').remove();
	 
	 apiRequest('getEmployeesForRetention',$('#desk').serialize(),'',function(data){
	    jQuery.each(data, function() {
          $('#pre_excludeEmployee')
            .append($('<option>', { value : this.userId })
            .text(this.userId + ' - ' + this.employeeName)); 
        });
        var first_employee = $('#pre_excludeEmployee option:first-child').text();
        data.length != 0 ? $('#s2id_pre_excludeEmployee .select2-chosen').text(first_employee) : $('#s2id_pre_excludeEmployee .select2-chosen').text(''); // display first chosen employee; 
	 });	
}  

function getCountry(){
	$('#countries')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');
    
	apiRequest('getCountry',$('#range-form').serialize(),'',function(data){
		
		jQuery.each(data, function() {
        $('#countries')
        .append($('<option>', { value : this.name })
           .text(this.iso + ' - ' + this.name)); 
          
		});
		
	});
}

function init_option(){
	$("#status").find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0'); 
    $('#status').append('<option value="new">New</option>',
              	        '<option value="callAgain">Call Again</option>',
              	        '<option value="inTheMoney">In The Money</option>',
              	        '<option value="noAnswer">No Answer</option>',
              	        '<option value="checkNumber">Check Number</option>',
              	        '<option value="noCall">No Call</option>',
              	        '<option value="notInterested">Not Interested</option>',
                     	'<option value="reassign">Reassign</option>');
} 

function getPreExcludeEmployees(){
	var modal_body = '<div class="row">';
	modal_body += userData.per_shuffleexclude==1 ?
	              '<div class="col-md-12">'+
	              '<form id="exclude-form">'+ 
	                '<div class="col-md-6">'+
	                '<h4>Employee</h4>'+
	                '<select class="js-example-tokenizer" id="pre_excludeEmployee" name="employee"></select>'+
	                '</div>'+
	              '</form>'+
	              '<div class="col-md-1">'+
	                '<h4>&nbsp;</h4>'+
	                '<a href="" class="btn btn-secondary exclude disabled">Add Employee</a>'+
	              '</div>'+
	              '</div>'+
	              '<div class="col-md-12"><h4></h4></div>' :
	               '';
	                
	modal_body +='<div class="col-md-12">'+  
                 '<div id="excluded_table_holder"></div>'+
                 '<div class="table-responsive">' +
				 '<table class=" table table-striped table-bordered table-hover table-highlight " id="excluded_table">' +
			     '</table>'+
			     '</div>'+		
                 '</div></div>';
	var exclude_modal= bootbox.dialog({
	   title: 'Excluded Employees',
	   message: modal_body,
       buttons: {
          success: {
           label: "OK",
           className: "btn-success"
          }
       }
    });
    
    $(exclude_modal[0]).removeAttr('tabindex'); // @Eli : necessary for focus to the search field of $("#pre_excludeEmployee") select2;
    $("#pre_excludeEmployee").select2({width: "100%"});
    getEmployeesForExclude();
    getPreExcludeEmployeesForTable();
    $('a.exclude').click(function(){
    	event.preventDefault();
    	var exclude_employee = $('#pre_excludeEmployee option:selected').text();
    	apiRequest('addPreExcludeEmployees',$('#exclude-form').serialize(),'#excluded_table_holder',function(data){
    		if(data == 'Employee is already excluded'){
    			bootbox.alert('<h4>'+exclude_employee+' is already excluded</h4>');
    		}else if(data){
    			bootbox.alert('<h4>'+exclude_employee+' is excluded</h4>');
    			getPreExcludeEmployeesForTable();
    		}else {
    			bootbox.alert('<h4>'+exclude_employee+' could not be excluded</h4>');
    		}
    		
    	});
    });           	
	
}

function getPreExcludeEmployeesForTable(){
	$('a.exclude').addClass('disabled');
	apiRequest('getPreExcludeEmployees',$('#desk').serialize(),'#excluded_table_holder',function(data){
		var columns =  [
            { "mData": "id", "sTitle": "Id", "bVisible": false},
            { "mData": "employeeId", "sTitle": "Employee ID"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "addUser", "sTitle": "Add User"}
           ];
        if(userData.per_shuffleexclude==1)
           columns.push(
           	{ "mData": null, "sTitle": "Delete", 
           	  "fnRender": function(o){
           	     return '<a href="" data-id="'+o.aData.id+'" class="btn btn-secondary btn-xs delete">Delete</a>'; 	
           	  }
           	});   
		$('#excluded_table').dataTable( {
           "bDestroy": true,
           "bFilter": true,
           "bLengthChange": true,
        
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": columns
        });
        $('a.exclude').removeClass('disabled');    
	});
}       

function getRetentionCustomers(){
	
	$('#assignCustomers').val('');
	
	apiRequest('getRetentionCustomers',$('#parameters-form').serialize(),'#customers_table_holder',function(data){
	   
	   for(var i in data){
	      data[i].allNotes='';
	   }
	   
	   customers_table = $('#customers_table').dataTable( {
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
           "bFilter": true,
           "bLengthChange": true,
           "aaData": data,
           "aaSorting": [[ 0, "asc" ]],                    
           "aoColumns": [
            { "mData": null, 
              "sTitle": "<input class='check' type='checkbox' id = 'check_all'></input>",
              "bSortable": false, 
              "bSearchable": false, 
              "aTargets": [ 0 ],
              "mRender": function (data,type,row) {
                     return '<input class="check1" type="checkbox" data-customerId="'+row.customerId+'" data-saleStatus="'+row.saleStatus+'" data-currentemployee="'+row.employeeId+'"></input>';
                  }
           
            },  
            { "mData": "customerId", "sTitle": "Customer Id", "sType": "numeric"},
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "totalDepositUSD", "sTitle": "Deposit USD", "sType": "numeric"},
            { "mData": "realAccountBalanceUSD", "sTitle": "RAB USD", "sType": "numeric"},
            { "mData": "campaign", "sTitle": "Campaign"},
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "riskStatus", "sTitle": "Risk Status"},
            { "mData": "lastNote", "sTitle": "Last Note",  "sType": "date"},
            { "mData": "firstDepositDate", "sTitle": "First Deposit", "sType": "date"},  
            { "mData": "lastDepositDate", "sTitle": "Last Deposit", "sType": "date"},
            { "mData": "lastLogin", "sTitle": "Last Login", "sType": "date"},                
            { "mData": "regTime", "sTitle": "Registration", "sType": "date"},
            { "mData": "assignDate", "sTitle": "Assign Date", "sType": "date"},
            { "mData": "employeeId", "sTitle": "Employee ID", "bVisible":false},
            { "mData": "employee", "sTitle": "Employee"},
     //     { "mData": "desk", "sTitle": "Desk"},
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "note", "sTitle": "Note"},
            { "mData": "allNotes", "sTitle": "All Notes",
              "fnRender": function(oObj){
              	return '<a href="#" data-customerId="'+oObj.aData.customerId+'" class="btn btn-secondary btn-xs btn-block getNotes">Note</a>';
              } 
            }
            ]
      /*      ,
            "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
             /   k=aiDisplay.length;
                 $('#assignCustomers').val('');
                 for (var i=0;i<aiDisplay.length;i++)
                 {
                 	
                 	$('#assignCustomers').val($('#assignCustomers').val() + aaData[aiDisplay[i]]['customerId']+"\n");
                 	
                 	
                 } 
                
           } */
            
           
            
            });
            
             $('#check_all').on('click', function(){
             	//   event.preventDefault();
             	   var that = this;
             	   var rows = customers_table.$('tr',{'filter':'applied'});
             	   if(this.checked){
             	   	bootbox.dialog({
             	   		title:"Check All",
             	   		message:"Check all customers or only in current page",
             	   		buttons: {
                       		all: {
                         	label: "All",
                         	className: "btn-success",
                         	callback: function(){
                           		$('input[type="checkbox"]', rows).prop('checked', true);
                           	//	$(that).prop('checked',true);
                        	 }
                       	},
                       		current: {
                         	label: "Current Page",
                         	className: "btn-success",
                         	callback: function(){
                         		$('input[type="checkbox"]', rows).prop('checked', false);
                       	   		$('#customers_table input[type="checkbox"]').prop('checked', true);
                       	   		$(that).prop('checked',false);     
                         	}	
                       		}
                   		}
             	   });
                }else{ 
                 	$('input[type="checkbox"]', rows).prop('checked', this.checked);
                }
             });
             
             $('#customers_table tbody').on('change', 'input[type="checkbox"]', function(){
                     // If checkbox is not checked
                     if(!this.checked){
                         var el = $('#check_all').get(0);
                         // If "Select all" control is checked and has 'indeterminate' property
                         if(el && el.checked && ('indeterminate' in el)){
                         // Set visual state of "Select all" control 
                         // as 'indeterminate'
                         el.indeterminate = true;
                         }
                     }
             });	
          
 
       });
	
	
}


function getUserData(){
	apiRequest('getUserData','','',function(data){
		userData = data;
	});
}

function getDesk(){
	
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
			$('#desk option[value="4"]').attr('selected',true);
			getEmployeesForRetention();
	});
}
