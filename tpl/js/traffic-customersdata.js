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
      width: "100%"
    });
    $("#exclude_campaign").select2( {
   	  placeholder: "Select Excluded Campaign or leave blank for nothing",
      allowClear: true,
      width: "100%"
    });
    $("#employee").select2( {
   	  placeholder: "Select Employees or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    $("#countries").select2( {
   	  placeholder: "Select Countries or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    $("#saleStatus").select2( {
   	  placeholder: "Select Sale Status or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    $("#regStatus").select2( {
   	  placeholder: "Select Registration Status or leave blank for all",
      allowClear: true,
      width: "100%"
    });
    getAccountTypes();
    getCampaigns();
    getCountry();
    getSaleStatus();
    getRegStatus(); 
    getEmployeesForConversion();
	
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
	apiRequest('getAccountTypes','','',function(data){
		$.each(data,function(){
			$('#accountType').append($('<option>',{value: this.section, text: this.section}));
		});
		$('#accountType option:eq(1)').attr('selected',true);
	});
}

function getCampaigns(){
  $('#campaign,#exclude_campaign')
    .find('option')
    .remove()
    .end();	
  apiRequest('getCampaigns','','',function(data){
  	
  	 $.each(data,function(){
  	 	  $('#campaign,#exclude_campaign').append($('<option>', { value : this.id, text : this.name }));
  	 });
  });  
}

function getEmployeesForConversion(){
    
//    var add_select =[];
    apiRequest('getEmployeesForConversionWithSADesk','desk=0','',function(data){
    	    $.each(data, function() {
                 $('#employee').append($('<option>', {value : this.userId , text : this.userId+' - '+ this.employeeName}));
             /*    if(this.userId==63 || this.userId==419){
                 	add_select.push({id:this.userId, text:this.userId+' - '+ this.employeeName});
                } */
            });
      //      $('#employee').select2('data',add_select);
    });
    
}

function getCountry(){
	
	apiRequest('getCountry','','',function(data){
		
		$.each(data, function() {
           $('#countries').append($('<option>', { value : this.name , text : this.iso + ' - ' + this.name}));
        });
    });
}

function getSaleStatus(){
	
  apiRequest('getSaleStatusValues','','',function(data){
		$.each(data,function(key,value){
			$('#saleStatus').append($('<option>',{value: value, text: value}));
		});
		
  });

}

function getRegStatus(){
	apiRequest('getRegStatusValues','','',function(data){
		$.each(data,function(key,value){
			$('#regStatus').append($('<option>',{value: value, text: value}));
		});
	});
}

function assignModal(){
  var rows = customers_table.$('tr',{'filter':'applied'});
  var selected_customers = $('input.check1:checked', rows).map(function(){ 
  	                                                            return {customerId:         $(this).attr('data-customerId'),
  	                                                                    employeeInChargeId: $(this).attr('data-currentemployee'),
  	                                                                    saleStatus:         $(this).attr('data-saleStatus')
  	                                                                     
  	                                                                    };}).get();

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
                    '<label class="col-md-4 control-label" for="assignSaleStatus">Chose Sale Status</label> ' +
                    '<div class="col-md-6"> ' +
                    '<select id="assignSaleStatus" name="saleStatus" class="form-control"></select>'+
                    '</div> ' +
                    '</div> ' +
                    '</form>'+
                    '</div></div>',
    buttons: {
            success: {
                label: "OK",
                className: "btn-success",
                callback: function () {
                    var change_fields = { "employeeInChargeId": $('#assignEmployee').val(), "saleStatus": $('#assignSaleStatus').val()};	
                    var post_data = {"customers": JSON.stringify(selected_customers) , "change_fields": JSON.stringify(change_fields), "url": window.location.href};
                    
                    apiRequest('editCustomer', post_data, '#customers_table_holder', function (data) {
                    	   if(data==true){
                    	   	  $('.tooltip-success')
                 		      .html('<i class="fa fa-check" aria-hidden="true"></i>&nbsp; Customers Assigned')
                 		      .animate({opacity:1},function(){
                    	      $(this).animate({opacity:0},5000);
                              });
                              
                              getCustomersData();
                    	   }else{
                    	      bootbox.alert('<h4>'+data+' customers out of '+selected_customers.length+' could not be assigned</h4>',function(){
                           	     getCustomersData();
                              });	
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
   
   
   apiRequest('getEmployeesForConversionWithSADesk', 'desk=0', '', function (employeeData) {
       
           $.each(employeeData, function() {
                 $('#assignEmployee').append($('<option>', {value : this.userId , text : this.userId+' - '+ this.employeeName}));
            });
        
          $('#s2id_assignEmployee .select2-chosen').text($('#assignEmployee option:first').text()); // display first chosen employee;
   }); 
    
   apiRequest('getSaleStatusValues','','',function(saleData){
		$.each(saleData,function(key,value){
			$('#assignSaleStatus').append($('<option>',{value: value, text: value}));
		});
		$('#assignSaleStatus option[value="new"]').attr('selected',true);
  }); 
    
}

function getCustomersData(){
	
	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
    var portlet_title=(($('#portlet_title').text()).split(' '))[0];
    var selected_accountType= $('#accountType option:selected').text();
    
	if(portlet_title=='' || portlet_title!=selected_accountType){
		$('#portlet_title').animate({opacity:0},function(){
			var accountType = selected_accountType=='All' ? selected_accountType+' Account Types' : selected_accountType;
			$(this).text(accountType);
			$(this).animate({opacity:1});
		});
	}
	console.log($('#customer-form').serialize());
	apiRequest('getCustomersData',$('#customer-form').serialize(),'#customers_table_holder',function(data){
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
           "aaSorting": [[ 1, "desc" ]],                    
           "aoColumns": [
            { "mData": null, 
              "sTitle": "<input class='check' type='checkbox' id = 'check_all'></input>",
              "sClass": "center",
              "bSortable": false, 
              "bSearchable": false,
              "sWidth": "50px", 
              "aTargets": [ 0 ],
              "mRender": function (data,type,row) {
                     return '<input class="check1" type="checkbox" data-customerId="'+row.customerId+'" data-saleStatus="'+row.saleStatus+'" data-currentemployee="'+row.employeeId+'"></input>';
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
            { "mData": "onlineStatus", "sTitle": "Status"},
            { "mData": "employeeId", "sTitle": "Employee ID", "bVisible":false},
            { "mData": "employee", "sTitle": "Employee"},
            { "mData": "regTime", "sTitle": "Signup Date",  "sType": "date"},
            { "mData": "lastLoginDate", "sTitle": "Last Login",  "sType": "date"},
            { "mData": "country", "sTitle": "Country"},
            { "mData": "depositorStatus", "sTitle": "Depositor Status"},
            { "mData": "saleStatus", "sTitle": "Sale Status"},
            { "mData": "campaign", "sTitle": "Campaign"},
            //   { "mData": "firstNote", "sTitle": "First Note", "sType": "date"},
            { "mData": "email", "sTitle": "Email"},
            { "mData": "phone", "sTitle": "Phone"}
         //   { "mData": "firstDepositAmount", "sTitle": "First Deposit Amount", "sType": "numeric"},
         //   { "mData": "totalDepositAmount", "sTitle": "Total Deposit Amounts", "sType": "numeric"},
         //   { "mData": "totalDepositCount", "sTitle": "Total Deposit Count", "sType": "numeric"}
            ],
           
           "fnRowCallback": function( nRow, aData ) {
           	  var background_color, hover_color, color;
           	  var row_class = $(nRow).attr('class');
           	  if(aData.saleStatus == 'new'){
           	     background_color = row_class == 'odd' ? '#32cd32' : '#62d962';
           	     hover_color = "#2cb52c";
           	     color = "black";
           	  }   
           	  else if(aData.saleStatus == 'noAnswer'){
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



