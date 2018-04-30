window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.info('%cScript Error: See Browser Console for Detail','font-size:18px;color:darkred');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log("%c Error JS:" + message,"font-size:18px;color:darkpink");
    }

    return true;
};

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
   $("#employee").select2( {
   	  placeholder: "Select employees or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   $("#excEmployee").select2( {
   	  placeholder: "Select employees or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   $("#assignEmployee").select2({width: "100%"});
   
   $("#leadstatus").select2( {
   	  placeholder: "Select Lead Status or leave blank for all",
      allowClear: true,
      width: "100%"
   });
   
   getUserData();
   getCountries();
   getLeadStatus();
   getLeverateDesk();
   getEmployeesForRetention();
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
                 '</div></div>', 
                
        buttons: {
          success: {
          label: "OK",
          className: "btn-success"
      }
    }}); 
   	getNotesForShuffle(customerId); 
   });
   $(document).on("click","a.delete",function(){
   	  event.preventDefault();
   	  var id= $(this).attr('data-id');
   	  apiRequestBrand('deletePreExcludeEmployee', 'id='+id, '',true, capitalBrandName, function (data) {
   	  	 getPreExcludeEmployeesForTable();
   	  });
   });	
});

function getNotesForShuffle(customerId){
	var post_data={customerId: customerId};
	apiRequestBrand('getCustomerCommunications', post_data, '#notes_table_holder',true, capitalBrandName, function (data) {
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
            { "mData": "AccountId", "sTitle": "Customer ID"},
            { "mData": "customerName", "sTitle": "Customer Name"},  
            { "mData": "subject", "sTitle": "Subject"},
            { "mData": "noteText", "sTitle": "Body"},
            { "mData": "createDate", "sTitle": "Date","sType":"date"},
            { "mData": "userName", "sTitle": "Employee"}
           ]
            });	
	});
}

function assign(){
  var rows = customers_table.$('tr',{'filter':'applied'});
  var selected_customers = $('input.check1:checked', rows).map(function(){ 
  	                                                            return $(this).attr('data-customerId');}).get();

  if($('#assignEmployee').val()==null){
  	bootbox.alert('<h4>Please choose an employee.</h4>');
  	return false;
  }
  if(selected_customers.length == 0){
    bootbox.alert('<h4>Please choose a customer.</h4>');
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
      
      	    assignCustomersForShuffle(selected_customers);
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }
    }});  
  }; 

function assignCustomersForShuffle(customers) {
  var post_data = {"customers": JSON.stringify(customers),
                   "employee": $('#assignEmployee').val(),
                   "leadStatus": JSON.stringify({"Value":"1","Name":"New"})
                  };
  apiRequestBrand('changeOwnerForCustomers', post_data, '#customers_table_holder',true, capitalBrandName, function (data) {
         if(data.leverateApiError != undefined){
             displayToolTip('danger','Customers','assigned');
         }else if(customers.length != parseInt(data.successfulRequests)){
             var totalCustomers = customers.length;
             var unsuccessful = totalCustomers - parseInt(data.successfulRequests);
             bootbox.alert('<h4>'+unsuccessful+' customers out of '+totalCustomers+' could not be assigned</h4>',function(){
                 getRetentionCustomers();
             });	
         }else {
             displayToolTip('success','Customers','assigned',getRetentionCustomers);
         }
                           
  });
  
}

function getLeverateDesk(){
	 apiRequestBrand('getLeverateDesk', '', '#desk',true,capitalBrandName,function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
			});
	}); 
}

function getEmployeesForRetention () {

    $('#employee, #excEmployee, #assignEmployee').find('option')
                                                 .remove();
    $('#employee, #excEmployee').select2('data',null);                                             
    $('#assignEmployee').append('<option value="0" disabled>Choose Employee</option>')
                        .select2('val',0);
    
    apiRequestBrand('getLeverateEmployeesForRetention',$('#parameters-form').serialize(),'#customers_table_holder',true,capitalBrandName,function(data){ 
      $.each(data, function() {
        $('#employee, #excEmployee, #assignEmployee')
        .append($('<option>', { value : this.userId }).text(this.employeeName)); 
      });
      
    });
    
}

function getEmployeesForExclude(){
	 $('#pre_excludeEmployee').find('option').remove();
	 
	 apiRequestBrand('getLeverateEmployeesForRetention',$('#desk').serialize(),'',true,capitalBrandName,function(data){ 
      var first = 1;
      $.each(data, function() {
        $('#pre_excludeEmployee')
        .append($('<option>', { value : this.userId }).text(this.employeeName));
        if(first){
        	$('#pre_excludeEmployee').select2('val',this.userId);
        	first = 0;
        } 
      });
      $('a.exclude').removeClass('disabled');
      
    });	
}  

function getCountries(){	
	apiRequestBrand('getCountries','','',true,capitalBrandName,function(data){
		$.each(data, function() {
           $('#countries').append($('<option>', { value : this.countryName , text : this.countryName + ' - ' + this.ISO}));
        });
    });
}

function getLeadStatus(){    
   var post = {'table':'AccountBase','field':'lv_leadstatus'};
   apiRequestBrand('getStringData',post,'',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#leadstatus').append($('<option>',{value: value.id, text: value.value}));
		});		
   });
}

function getPreExcludeEmployees(){
	var modal_body = '<div class="row">';
	modal_body += userData.per_shuffleexclude==1 ?
	              
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
    	addPreExcludeEmployee();
    });           	
	
}

function addPreExcludeEmployee(){
	$('a.exclude').addClass('disabled');
	var exclude_employee = $('#pre_excludeEmployee option:selected').text();
    apiRequestBrand('addPreExcludeEmployee',$('#exclude-form').serialize(),'#excluded_table_holder',true,capitalBrandName,function(data){
    	
    		if(data == 'Employee is already excluded'){
    			bootbox.alert('<h4>'+exclude_employee+' is already excluded</h4>');
    		}else if(data){
    			displayToolTip('success',exclude_employee,'excluded');
    			getPreExcludeEmployeesForTable();
    		}else {
    			displayToolTip('danger',exclude_employee,'excluded');
    		}
    		$('a.exclude').removeClass('disabled');
    		
    });
}
function getPreExcludeEmployeesForTable(){
	
	apiRequestBrand('getExcludeEmployees',$('#desk').serialize(),'#excluded_table_holder',true,capitalBrandName,function(data){
		var columns =  [
            { "mData": "EmployeeId", "sTitle": "Employee ID"},
            { "mData": "FullName", "sTitle": "Employee"}
           ];
        if(userData.per_shuffleexclude==1)
           columns.push(
           	{ "mData": null, "sTitle": "Delete", 
           	  "fnRender": function(o){
           	     return '<a href="" data-id="'+o.aData.ExcludeEmployeeId+'" class="btn btn-secondary btn-xs delete">Delete</a>'; 	
           	  }
           	});   
		$('#excluded_table').dataTable( {
           "bDestroy": true,
           "bFilter": true,
           "bLengthChange": true,
           "bAutoWidth": false,
           "aaData": data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": columns
        });
        
	});
}       

function getRetentionCustomers(){
	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';      
    var href = '';
    
	$('#assignCustomers').val('');
	apiRequestBrand('getRetentionCustomers',$('#parameters-form').serialize(),'#customers_table_holder',true,capitalBrandName,function(data){
	   
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
            { "mData": "customerId", "sTitle": "Customer Id", "bUseRendered":false,
              "fnRender": function(oObj){
	              href = url + '/?id='+oObj.aData.customerId;
		          return '<a href="'+href+'" target="_blank">'+oObj.aData.customerId+'</a>' ;
	           }
            },
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "Country", "sTitle": "Country"},
            { "mData": "totalDepositUSD", "sTitle": "Deposit USD", "sType": "numeric"},
            { "mData": "Lv_UtmCampaign", "sTitle": "Campaign"},
            { "mData": "leadStatus", "sTitle": "Lead Status"},
            { "mData": "lastNote", "sTitle": "Last Note",  "sType": "date"},
            { "mData": "firstDepositDate", "sTitle": "First Deposit", "sType": "date"},  
            { "mData": "lastDepositDate", "sTitle": "Last Deposit", "sType": "date"},
            { "mData": "lastLogin", "sTitle": "Last Login", "sType": "date"},                
            { "mData": "registrationDate", "sTitle": "Registration", "sType": "date"},
            { "mData": "assignDate", "sTitle": "Assign Date", "sType": "date"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "Subject", "sTitle": "Subject"},
            { "mData": "Note", "sTitle": "Note"},
            { "mData": null, "sTitle": "All Notes",
              "fnRender": function(oObj){
              	return '<a href="#" data-customerId="'+oObj.aData.customerId+'" class="btn btn-secondary btn-xs btn-block getNotes">Note</a>';
              } 
            }
            ]
            
            });
            var rows = customers_table.$('tr',{'filter':'applied'});
            
             $('#check_all').on('click', function(){
             	//   event.preventDefault();
             	   var that = this;
             	   
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
          
             $('input[type="checkbox"]', rows).click(function(){
              	event.stopPropagation();
             });
             $(rows).find('td:first-child').click(function(){
             	
             	$(this).find('input[type="checkbox"]').trigger('click');
             }).css('cursor','pointer');
       });
	
	
}

function displayToolTip(type,text,action,cbFunction){
	setTimeout(function(){
		         
		         $('.tooltip').stop( true, true )
		         .attr('class','tooltip')
                 .addClass('tooltip-'+type)
                 .html('<i class="fa fa-'+(type=="success" ? 'check' : 'times')+'" aria-hidden="true"></i>&nbsp; '+(text+(type=="success" ? ' ': ' NOT '))+action)
                 .css({opacity:1})
                 .animate({opacity:0},5000);
                 if(cbFunction) cbFunction();  
                },300);
    
}


function getUserData(){
	apiRequest('getUserData','','',function(data){
		userData = data;
	});
}
