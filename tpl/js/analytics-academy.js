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

function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#sEnd').val(endDate.format("yyyy-MM-dd"));
    $('#sStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#sEnd').val(endDate.format("yyyy-MM-dd"));
  $('#sStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  getAcademySessions();
   
}

function save_dt_view (oSettings, oData,type) {
  localStorage.setItem( 'DataTables_'+type+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings,type) {
  return JSON.parse( localStorage.getItem('DataTables_'+type+window.location.pathname) );
}
function reset_dt_view(type) {
  localStorage.removeItem('DataTables_'+type+window.location.pathname);
}

var userData=[];

$(document).ready(function(){
  reset_dt_view('academy');
  $('#sStart,#sEnd').val(new Date().format('yyyy-MM-dd')).datepicker();
  $("#employee").select2( {
   	  placeholder: "Select Employees or leave blank for all",
      allowClear: true,
      width: "100%"
  });
  
  getUserData();
  getAcademySessions();
  getEmployeesForAcademy();
  
  $('#sStart,#sEnd,#employee').change(function(){
  	getAcademySessions();
  });
  
  $(document).on("click","a.status",function(){
  	event.preventDefault();
  	var id= $(this).attr("data-id");
  	var status= $(this).attr("data-status");
  	if(status=='closed')
  	   return false;
  	bootbox.confirm('<h4>Are you sure you want to close the session?</h4>',function(result){
	 	if(result){
	 	   apiRequest('closeAcademySession','id='+id,'',function(data){
	 	   	     if(data=='Different User')
		              bootbox.alert('<h4>The Session is opened by another user. </h4>'+
		                            '<h4> Current user do NOT have access to close this session.</h4>'); 
  	             getAcademySessions();	
  	       });
  	    }    
	 });   
  	 
  });
  
  $( document ).on("click","#refresh_session",function() { 
      event.preventDefault();
      getAcademySessions();     
      
  });
  
  $(document).on("click","a.comment",function(){
  	 event.preventDefault();
  	 var id=$(this).attr("data-id");
  	 var customerId=$(this).attr("data-customerId");
  	 var customerName=$(this).attr("data-customerName");
  	 var userName=$(this).attr("data-userName");
  	 if(userName!=userData['username']){
  	 	bootbox.alert('<h4>The Session is opened by another user. </h4>'+
		               '<h4> Current user do NOT have access to comment for this session.</h4>');
		return;                
  	 }
  	 bootbox.dialog({
        title: "Add Comment",
                message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<form class="form-horizontal" id="comment-form"> ' +
                    '<input type="hidden" id="sessionId" name="sessionId" value="'+id+'" />'+
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerId">Customer ID</label> ' +
                    '<div class="col-md-4"> ' +
                    '<input id="customerId" name="customerId"  value=" ' + customerId + ' "   class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div> ' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="customerName">CustomerName</label> ' +
                    '<div class="col-md-5"> ' +
                    '<input id="customerName" name="customerName" value=" '+ customerName +   ' " class="form-control input-md" onfocus="this.blur()"> ' +
                     '</div> ' +
                    '</div>' +
                    '<div class="form-group"> ' +
                    '<label class="col-md-4 control-label" for="comment">Comment</label> ' +
                    '<div class="col-md-5"> ' +
                    '<textarea type="text"  id="comment" name="comment" placeholder="Write Comment" maxlength="300" class="form-control" onblur="this.value = this.value.trim()">' + 
                    '</textarea>'+ 
                     '</div> ' +
                    '</div>' +
                    '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                    '<span id="error_comment" style="color:red;"></span>'+
                    '</div>'+
                    '</form> </div>  </div>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
      	if($('#comment').val()==''){
      		$('#comment').addClass('red-border');
      		$('#error_comment').html('Please insert a comment');
      		return false;
      	}
      	$('#comment').removeClass('red-border');
        $('#error_comment').html('');
      	apiRequest('addAcademyComment',$('#comment-form').serialize(),'',function(data){
      		if(data)
      		  getAcademySessions(); 
      	});
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger",
      callback: function() {
       bootbox.alert("<h5>Comment is NOT changed</h5>");
      }
    }
    }});
  	$("#comment").off('change keyup paste cut').on('change keyup paste cut', function(e) {  
       $(this).removeClass('red-border');
       $("#error_comment").html('');	   
    });  
  });
});

function getUserData(){
	apiRequest('getUserData','','',function(data){
		userData=data;
        permitSessionView(data);
	});
}

function permitSessionView(data){
      
    if(data.academy_employee==='0'){
        
        $("#open-session").attr("disabled", "disabled");
        $("#open-session").attr("title", "Current user do NOT have permission to open Session.");
        $("#open-session").on('click',function(){
            //bootbox.alert('<h4> Current user do NOT have permition to open Session.</h4>');
            return false;
        });
    } else{
        $("#open-session").removeAttr("disabled");
        $("#open-session").removeAttr("title");
        $("#open-session").on('click',function(){
            openSession();
        });
       
    }   
}
function getAcademySessions(){
    var academyEmployee= $("#employee").select2('val');  
    var post_data = {'sStart':$("#sStart").val(),'sEnd':$("#sEnd").val(),'academyEmployee':academyEmployee}; 
    
  //apiRequest('getAcademySessions',$('#range-form').serialize(),'#academy_table_holder',function(data){
  apiRequest('getAcademySessions',post_data,'#academy_table_holder',function(data){    
             
  	for(var i in data){
  		data[i].commission= data[i].status=='closed' ? data[i].upsale!=0 ? 150 : 100 : 0;
  	}
  	$('#academy_table').dataTable( {
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
      "dom": '<"toolbar">frtip',
      "bStateSave": true,
      "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData,'academy'); },
      "fnStateLoad": function(oSettings) { return load_dt_view(oSettings,'academy'); },
      "aaSorting": [[ 0, "desc" ]],                    
      "aoColumns": [
    //  { "mData": "id", "sTitle": "", "sType": "numeric","bVisible": false},
      { "mData": "startTime", "sTitle": "Session Start","sWidth": "100px"},
      { "mData": "customerId", "sTitle": "Customer Id"},
      { "mData": "customerName", "sTitle": "Customer Name"},
    //  { "mData": "currency", "sTitle": "Currency", "bVisible": false},
    //  { "mData": "username", "sTitle": "Creator Name", "bVisible": false},
      { "mData": "currentEmployee", "sTitle": "Current Employee"},
      { "mData": "academyEmployee", "sTitle": "Academy Employee"},
      { "mData": "comment", "sTitle": "Comment", "sClass":"columnX"},
      { "mData": "commentTime", "sTitle": "Comment Time",  "bUseRendered": false,
        "fnRender": function(oObj){
        	return '<a href="" data-id="'+oObj.aData.id+'" data-customerId="'+oObj.aData.customerId+'" data-customerName="'+oObj.aData.customerName+'" data-userName="'+oObj.aData.username+'" class="comment">'+oObj.aData.commentTime+'</a>';
        }
      },
      { "mData": "upsale", "sTitle": "Upsale", "bUseRendered": false,
        "fnRender": function(oObj){
        	return oObj.aData.upsale+' '+oObj.aData.currency;
        }
      },
      { "mData": "upsaleEndTime", "sTitle": "Upsale End Time","sWidth": "100px"},  
      { "mData": "endTime", "sTitle": "Session End", "sWidth": "100px"},
      { "mData": "status", "sTitle": "Status", "bUseRendered": false,
        "fnRender": function(oObj){
        	color = oObj.aData.status=='open' ? 'success' : 'danger';                
        	return '<a href="" data-id="'+oObj.aData.id+'" data-status="'+oObj.aData.status+'" class="btn btn-xs btn-'+color+' btn-block status">'+oObj.aData.status+'</a>';
        }
      },
//      { "mData": "commission", "sTitle": "Commission", "bUseRendered": false, "sWidth": "100px",
//        "fnRender": function(oObj){
//            return oObj.aData.commission+' &#8362;';	
//        }
//      },
      { "mData": "duration", "sTitle": "Duration"}
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
         var total_sessions= aiDisplay.length;
         //var total_commissions= 0;
         var total_duration = 0;         
         var hour =0;
         var minute =0;
         var sec =0; 
         
//         for(var i=0;i<aiDisplay.length;i++){
//         	total_commissions += aaData[aiDisplay[i]]['commission'];
//         }
        
         for(var i=0;i<aiDisplay.length;i++){
             var timeParts = aaData[aiDisplay[i]]['duration'].split(":");
             sec += (parseInt(timeParts[0])) * 60 * 60 + (parseInt(timeParts[1])) * 60 + (parseInt(timeParts[2]));
         }
         
         var sec_num = parseInt(sec, 10); 
         hour   = Math.floor(sec_num / 3600);
         minute = Math.floor((sec_num - (hour * 3600)) / 60);
         sec = sec_num - (hour * 3600) - (minute * 60);

         if (hour   < 10) {hour   = "0"+hour;}
         if (minute < 10) {minute = "0"+minute;}
         if (sec < 10) {sec = "0"+sec;}
         
         total_duration =hour + ":" + minute + ":" + sec;
         
         $('#total_sessions').html(total_sessions);
         //$('#total_commissions').html('&#8362; '+total_commissions);
         $('#total_duration').html(total_duration);
       }
      });
  });	
}

function openSession(){    
	bootbox.dialog({
        title: "Open Session",
        message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<form class="form-horizontal" id="openSession-form"> ' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="openSessionCustomerId">Customer ID</label> ' +
                 '<div class="col-md-5"> ' +
                 '<input id="openSessionCustomerId" name="openSessionCustomerId" maxlength="11" class="form-control input-md"> ' +
                 '</div> ' +
                 '</div> ' +
                 '<div class="col-md-offset-4 col-sm-offset-4 col-xs-offset-4 col-md-5 col-sm-5 col-xs-5">' +                   
                 '<span id="error_openSessionCustomerId" style="color:red;"></span>'+
                 '</div>'+
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="openSessionCustomerName">CustomerName</label> ' +
                 '<div class="col-md-5"> ' +
                 '<input id="openSessionCustomerName" name="openSessionCustomerName" class="form-control input-md" onfocus="this.blur()"> ' +
                 '</div> ' +
                 '</div>' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="openSessionEmployee">Employee</label> ' +
                 '<div class="col-md-5"> ' +
                 '<input id="openSessionEmployee" name="openSessionEmployee" class="form-control input-md" onfocus="this.blur()"> ' +
                 '</div> ' +
                 '</div>' +
                 '<div class="form-group"> ' +
                 '<label class="col-md-4 control-label" for="userName">Academy</label> ' +
                 '<div class="col-md-5"> ' +
                 '<input id="userName" name="userName" value="'+userData["username"]+'" class="form-control" onfocus="this.blur();">' + 
                 '</div> ' +
                 '</div>' +
                 '<input type="hidden" id="userId" name="userId" value="'+userData["id"]+'">'+
                 '</form> </div></div>',
      buttons: {
      
      success: {
      label: "OK",
      className: "btn-success",
      callback: function() {
        if($('#openSessionCustomerName').val()!=''){
          openAcademySession();	
        }else{
          $('#openSessionCustomerId').addClass('red-border');
    	  $("#error_openSessionCustomerId").html('Please insert customerId and click enter');
    	  return false;	
          	
        }
      	
      }
    },
    danger: {
      label: "Cancel",
      className: "btn-danger"
    }}
    });
    $("#openSessionCustomerId").off('change keyup paste cut').on('change keyup paste cut', function(e) {
        
        $('#openSessionCustomerName,#openSessionEmployee').val('');
        if(e.which==13){
           var re = new RegExp(/^[1-9][0-9]*$/);
           $(this).val(($(this).val()).trim());
           if (!re.test($(this).val())){
           	  $(this).addClass('red-border');
    	   	  $("#error_openSessionCustomerId").html('Please insert customerId in digits only');
    	   	  return false;
           }		
    	   getCustomerName($(this).val());
    	   
    	}else{
    	   $(this).removeClass('red-border');
    	   $("#error_openSessionCustomerId").html('');	
    	}   
    	   
    });
    
}

function getCustomerName(customerId){
	
	apiRequest('getCustomerForSession','customerId='+customerId,'',function(data){
		if(data=='There is no customer with the specified id' || data=='The specified customer is demo'){
		   $('#openSessionCustomerName,#openSessionEmployee').val('');	   
		   $("#openSessionCustomerId").addClass('red-border');
    	   $("#error_openSessionCustomerId").html(data);
    	   return;
		}
		$('#openSessionCustomerName').val(data[0].customerName);
		$('#openSessionEmployee').val(data[0].employee);
		
	});
}

function openAcademySession(){
	apiRequest('openAcademySession',$('#openSession-form').serialize(),'',function(data){
		if(data=='Session is already open for this specific customer'){
			bootbox.alert('<h4>'+data+'</h4>');
		}else if(data==true)
		   getAcademySessions();
	});
}

function getEmployeesForAcademy () {   
    
    apiRequest('getAcademyEmployees','','',function(data){
      
      $.each(data, function() {
        $('#employee').append($('<option>', { value : this.mcUserId }).text(this.spotEmployeeId +" - "+this.spotEmployeeName)); 
      });
      
    });
    
}
