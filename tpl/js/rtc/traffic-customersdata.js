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

        console.log("%c Error JS:" + message,"font-size:12px;color:indigo");
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
  };
  


  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};


var customers_table = [];
$(document).ready(function(){
	$('#regEnd,#loginEnd').val(new Date().format('yyyy-MM-dd'));
	$('#regStart,#regEnd,#loginStart,#loginEnd').datepicker();
	$("#campaign").select2( {
   	  placeholder: "Select Campaign or leave blank for all",
      allowClear: true,
     // closeOnSelect: false,
      width: "100%"
    });
    $("#exclude_campaign").select2( {
   	  placeholder: "Select Excluded Campaign",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    $("#employee").select2( {
   	  placeholder: "Select Employees or leave blank for all",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    $("#countries").select2( {
   	  placeholder: "Select Countries or leave blank for all",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    $("#leadStatus").select2( {
   	  placeholder: "Select Lead Status or leave blank for all",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    $("#accountStatus").select2( {
   	  placeholder: "Select Account Status or leave blank for all",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    $("#exclude_accountStatus").select2( {
   	  placeholder: "Select Exclude Account Status",
      allowClear: true,
    //  closeOnSelect: false,
      width: "100%"
    });
    getAccountTypes();
    getLeverateCampaigns();
    getCountries();
    getLeadStatus();
    getAccountStatus();
    getDesk(); 
    getEmployees();
	
	$('#desk').change(function(){
		getEmployees();
	});
    $(document).keypress(function(event) {
        var keycode = (event.keyCode ? event.keyCode : event.which); 
        if(keycode == '13') {
            if($('#assign_modal').length==0)
              assignModal();
            else{
              $('#assignEmployee').select2('open');
            }    
        }
    });
  
});

function getAccountTypes(){ 
        
    apiRequestBrand('getAccountTypes','','',true,capitalBrandName,function(data){
		$.each(data,function(){
			$('#accountType').append($('<option>',{value: this.name, text: this.name}));
		});
		$('#accountType option:eq(1)').attr('selected',true);
	});
}

function getLeverateCampaigns(){
  
  apiRequestBrand('getLeverateCampaigns','','',true,capitalBrandName,function(data){
  	 $.each(data,function(){
  	 	  $('#campaign,#exclude_campaign').append($('<option>', { value : this.name, text : this.name }));
  	 });
  });  
}

function getDesk(){
	apiRequestBrand('getLeverateDesk', '', '',true,capitalBrandName,function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["Name"] })); 
			});
	});
}

function getEmployees(){
    $('#employee').find('option').remove();
    $('#employee').select2('data',null);
    var post = {'desk':$('#desk').val(),'short':1};
    apiRequestBrand('getLeverateEmployees',post,'#employee',true,capitalBrandName,function(data){
    	    $.each(data, function() {
                 $('#employee').append($('<option>', {value : this.userId , text : this.employeeName}));
            });      
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
			$('#leadStatus').append($('<option>',{value: value.id, text: value.value}));
		});		
   });
}

function getAccountStatus(){
    var post = {'table':'AccountBase','field':'lv_accountstatus'};
	apiRequestBrand('getStringData',post,'',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#accountStatus,#exclude_accountStatus').append($('<option>',{value: value.id, text: value.value}));
		});
		$('#exclude_accountStatus').select2('val',['2']);
	});	
}

function assignModal(){
  var rows = customers_table.$('tr',{'filter':'applied'});
  var selected_customers = $('input.check1:checked', rows).map(function(){ 
  	                                                            return $(this).attr('data-customerId');}).get();

  if(selected_customers.length==0)
     return ;
  var assign_modal = bootbox.dialog({
  	title: 'Edit Customers',
  	message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="edit-form"> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="assignEmployee">Chose Employee</label> ' +
                    '<div class="col-md-6"> ' +
                    '<select type="text" id="assignEmployee" name="employee" class="form-control"> ' +
                    '</select>'+
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="assignleadStatus">Chose Lead Status</label> ' +
                    '<div class="col-md-6"> ' +
                    '<select id="assignLeadStatus" name="leadStatus" class="form-control"></select>'+
                    '</div> ' +
                    '</div> ' +
                    '</form>'+
                    '</div></div>',
    buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var leadStatus = {"Value": $('#assignLeadStatus').val(), "Name": $('#assignLeadStatus option:selected').text()};	
                    var post_data = {"customers": JSON.stringify(selected_customers) , "employee" : $('#assignEmployee').val(), "leadStatus": JSON.stringify(leadStatus)};
                    
                    apiRequestBrand('changeOwnerForCustomers', post_data, '#customers_table_holder',true, capitalBrandName, function (data) {
                    	   if(data.leverateApiError != undefined){
                    	   	  displayToolTip('danger','Customers','assigned');
                    	   	  console.log('leverateApiError');
                    	   }else if(selected_customers.length != parseInt(data.successfulRequests)){
                    	      var totalCustomers = selected_customers.length;
                    	      var unsuccessful = totalCustomers - parseInt(data.successfulRequests);
                    	      bootbox.alert('<h4>'+unsuccessful+' customers out of '+totalCustomers+' could not be assigned</h4>',function(){
                           	     getCustomersData();
                              });	
                    	   }else {
                    	   	  displayToolTip('success','Customers','assigned',getCustomersData);
                    	   }
                           
                    });
                }
            },
            danger: {
                label: "Cancel",
                className: "btn-danger"
                
            }
    }            
                    
  });
  
   $(assign_modal[0]).attr('id','assign_modal').removeAttr('tabindex'); // @Eli: necessary for focus to the search field of $("#assignEmployee") select2;
   $("#assignEmployee").select2({width: "100%"});
   
   var post = {'desk':$('#desk').val(),'short':true};
   apiRequestBrand('getLeverateEmployees',post,'',true,capitalBrandName,function(employeeData){
           $.each(employeeData, function() {
                 $('#assignEmployee').append($('<option>', {value : this.userId , text : this.employeeName}));
            });
        
          $('#s2id_assignEmployee .select2-chosen').text($('#assignEmployee option:first').text()); // display first chosen employee;
   });
    
   post = {'table':'AccountBase','field':'lv_leadstatus'};
   apiRequestBrand('getStringData',post,'',true,capitalBrandName,function(data){
		$.each(data,function(key,value){
			$('#assignLeadStatus').append($('<option>',{value: value.id, text: value.value}));
		});
		$('#assignLeadStatus option[text="New"]').attr('selected',true);		
   }); 
    
}

function getCustomersData(){
	
	var url = location.protocol + '//' + location.host + '/'+globalBrandName+'/agenttools/customer_card';
    var portlet_title=(($('#portlet_title').text()).split(' '))[0];
    var selected_accountType= $('#accountType option:selected').text();
    
	if(portlet_title=='' || portlet_title!=selected_accountType){
		$('#portlet_title').animate({opacity:0},function(){
			var accountType = selected_accountType=='All' ? selected_accountType+' Account Types' : selected_accountType;
			$(this).text(accountType);
			$(this).animate({opacity:1});
		});
	}
	apiRequestBrand('getCustomersData',$('#customer-form').serialize(),'#customers_table_holder',true,capitalBrandName,function(data){
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
           "bAutoWidth": false,
           "iDisplayLength": 100,
           "aaData": data,
           "aaSorting": [[ 5, "desc" ]],                    
           "aoColumns": [
            { "mData": null, 
              "sTitle": "<input class='check' type='checkbox' id = 'check_all'></input>",
              "sClass": "center",
              "bSortable": false, 
              "bSearchable": false,
              "sWidth": "50px", 
              "aTargets": [ 0 ],
              "mRender": function (data,type,row) {
                     return '<input class="check1" type="checkbox" data-customerId="'+row.customerId+'"></input>';
                  }
           
            },  
            { "mData": "customerId", "sTitle": "Customer Id", "sType": "numeric",
              "mRender": function (data,type,row) {
              	  href = url + '/?id='+data;
              	  if(type === 'display')
               	    return '<a href="'+href+'" target="_blank">'+data+'</a>';
               	  return data;  
              } 
            },
            { "mData": "customerName", "sTitle": "Customer Name"},
            { "mData": "mainTpAccount", "sTitle": "Main Tp Account"},
            { "mData": "onlineStatus", "sTitle": "Status"},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "regTime", "sTitle": "Signup Date",  "sType": "date"},
            { "mData": "lastLogin", "sTitle": "Last Login",  "sType": "date",
              "mRender": function (data,type,row) {
              	  href = url + '/?id='+data;
              	  if(data=='')
              	    return '0000-00-00 00:00:00';
              	  return data;    
              }
            },
            { "mData": "country", "sTitle": "Country"},
            { "mData": "accountType", "sTitle": "Depositor Status"},
            { "mData": "leadStatus", "sTitle": "Lead Status"},
            { "mData": "accountStatus", "sTitle": "Account Status"},
            { "mData": "campaign", "sTitle": "Campaign"},
            { "mData": "email", "sTitle": "Email"},
            { "mData": "phone", "sTitle": "Phone"}
            ],
           
           "fnRowCallback": function( nRow, aData ) {
           	  var background_color, hover_color, color;
           	  var row_class = $(nRow).attr('class');
           	  if(aData.leadStatus == 'New'){
           	     background_color = row_class == 'odd' ? '#32cd32' : '#62d962';
           	     hover_color = "#2cb52c";
           	     color = "black";
           	  }   
           	  else if(aData.leadStatus == 'No Answer'){
           	  	 background_color = row_class == 'odd' ? '#ff0f0f' : '#ff2d2d';
           	  	 hover_color = "#e10000";
           	     color = "white";  
           	  }else{
           	  	return;
           	  }
           	  $(nRow).css({"background-color": background_color, "color": color})
           	            .hover(function(){
           	            	$(this).css({"background-color":hover_color});
           	            },
           	            function(){
           	            	$(this).css({"background-color": background_color});
           	            });   
           }
           });
           
           var rows = customers_table.$('tr',{'filter':'applied'});
           
           $('#check_all').on('click', function(){
             	   event.stopPropagation();
             	   var that = this;
             	   
             	   if(this.checked){
             	   	var check_modal = bootbox.dialog({
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
                       	   		$('input[type="checkbox"]').prop('checked', true);
                       	   		$(that).prop('checked',false);     
                         	}	
                       		}
                   		}
             	   });
             	   $(check_modal[0]).find('.close').click(function(){
             	   	  that.checked = false;
             	   });
                }else{ 
                 	$('input[type="checkbox"]', rows).prop('checked', this.checked);
                }
             }).parent().click(function(){
             	$(this).find('input[type="checkbox"]').trigger('click');
             }).css('cursor','pointer');;
             
        
             
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

