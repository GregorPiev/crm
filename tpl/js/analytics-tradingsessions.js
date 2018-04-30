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
  
    $('#fdEnd').val(endDate.format("yyyy-MM-dd"));
    $('#fdStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#fdEnd').val(endDate.format("yyyy-MM-dd"));
  $('#fdStart').val(startDate.format("yyyy-MM-dd"));
    
  }
}


$(document).ready(function(){
  $('#fdStart,#fdEnd').val(new Date().format('yyyy-MM-dd'));
  $('#fdStart,#fdEnd').datepicker();
  $("#employee").select2( {
   	  placeholder: "Select Employees or leave blank for all",
      allowClear: true,
      width: "100%"
  });
 /* $("#country").select2( {
   	  placeholder: "Select Conutries  or leave blank for all",
      allowClear: true,
      width: "100%"
  });*/
  getEmployeesForTradingSessions();
  //getCountries ();
  //getTradeSessions();
}); 

function getEmployeesForTradingSessions () { 
    
    apiRequest('getTradeEmployees',null,'#employee',function(dataEmplyee){
       
       $.each(dataEmplyee, function() {
           $('#employee').append($('<option>', { value : this.mcUserId }).text(this.spotEmployeeId + ' - ' + this.spotEmployeeName)); 
      });
    });
    
}

/*function getCountries () {
    $('#country').find('option').remove().end().append('<option value="0">All</option>').val('0');
    apiRequest('getCountries',0,null,function(data){
        //console.log("%cCountries List:"+JSON.stringify(data),"color:green;");
      jQuery.each(data, function() {
      	if (this.iso!='') {
	        $('#country').append($('<option>', { value : this.name }).text(this.iso  + ' - ' + this.name)); 
      	}
      });
    });
} */
function getTradeSessions(){
  var employee= $("#employee").select2('val'); 
  //var country= $("#country").select2('val'); 
  //var post_data = {'sStart':$("#fdStart").val(),'sEnd':$("#fdEnd").val(),'employee':employee,'country':country};
  var post_data = {'sStart':$("#fdStart").val(),'sEnd':$("#fdEnd").val(),'employee':employee};
  
  apiRequest('getTradeSessions',post_data,$('#loader'),function(data){                
                
                 $('#session_table').dataTable( {
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
                   "bPaginate":true,
                   "bFilter": true,
                   "bLengthChange": true,
                   "bAutoWidth": false,
                   "iDisplayLength": 10,
                   "bStateSave": true,
                    "fnStateSave": function(oSettings, oData) { save_dt_view(oSettings, oData,"tradesession"); },
                    "fnStateLoad": function(oSettings) { return load_dt_view(oSettings,"tradesession"); },           
                   "aaData": data,
                   "dom": '<"toolbar">frtip',
                   "bStateSave": true,
                   "aaSorting": [[ 3, "desc" ]],                    
                   "aoColumns": [                    
                    {"mData": "customerId", "sTitle": "Customer ID","bUseRendered":false,
                     "fnRender": function(oObj){                         
                        return '<a href="https://spotcrm.hedgestonegroup.com/crm/customers/page/'+oObj.aData.customerId+'" target="_blank">'+oObj.aData.customerId+'</a>';
                     }
                    },
                    { "mData": "customerName", "sTitle": "Customer Name"},
                    { "mData": "countryName", "sTitle": "Country"},                      
                    { "mData": "startTime", "sTitle": "Session Opened On", "sType": "date"},
                    { "mData": "endTime", "sTitle": "Session Closed On","sType": "date"},                    
                    { "mData": "tradeEmployee", "sTitle": "Trading Employee"},
                    { "mData": "currentEmployee", "sTitle": "Current Employee"},
                    { "mData": "status", "sTitle": "Session Status"},
                    { "mData": "duration", "sTitle": "Duration"},
                    { "mData": "countPositions", "sTitle": "Number of Positions"},
                    { "mData": null, "sTitle": "Positions",
                        "fnRender":function(oObj){                           
                            return '<a href="#" data-customerId="'+oObj.aData.customerId+'" data-customerName="'+oObj.aData.customerName+'" data-sessionId="'+oObj.aData.sessionId+'" class="btn btn-secondary btn-xs btn-block getSessionPositions">View</a>';
                        }
                    }
                    ],
                    "fnFooterCallback":function(nRow,aaData,iStart,iEnd,aiDisplay){
                        
                        var total_sessions= aiDisplay.length;        
                         var total_duration = 0;
                         var total_positions = 0;
                         var hour =0;
                         var minute =0;
                         var sec =0; 


                         for(var i=0;i<aiDisplay.length;i++){
                             var timeParts = aaData[aiDisplay[i]]['duration'].split(":");
                             sec += (parseInt(timeParts[0])) * 60 * 60 + (parseInt(timeParts[1])) * 60 + (parseInt(timeParts[2]));
                             total_positions+=parseInt(aaData[aiDisplay[i]]['countPositions']);
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
                         $('#total_duration').html(total_duration);
                         $('#total_position').html(total_positions);
                    }
                    
            });
	});
}

$(document).on("click","a.getSessionPositions",function(){
	event.preventDefault();
	var sessionId=$(this).attr('data-sessionId');
    var customerId=$(this).attr('data-customerId');
    var customerName=$(this).attr('data-customerName');
	var post_data_session={sessionId:sessionId};
	getTradeSessionPositions(post_data_session,customerId,customerName);
}); 

function getTradeSessionPositions(post_data,customerId,customerName){
    $('body').addClass('modal-scroll');	
	 var session_bootbox=
	    bootbox.dialog({
         title: "Trading Sessions",
         message:  
                    
                    '<div class="row">  ' +
                                       
                    '<div class="col-md-2"> ' +
                    '<h5>Customer ID</h5>'+
                    '<p><input id="customerId" name="customerId"  value=" ' + customerId+ ' "   class="form-control input-md" onfocus="this.blur()"></p>' +
                    '</div>  ' +
                    '<div class="col-md-3"> ' +
                    '<h5>Customer Name</h5>'+
                    '<p><input id="customerName" name="customerName"  value=" ' + customerName + ' "   class="form-control input-md" onfocus="this.blur()"></p>' +
                    '</div>  ' +
                    
                    '<div class="col-md-12">'+
                    '<div class="portlet" id="sessionPositions_table_holder">'+
                    '<div class="portlet-header"><h3><i class="fa fa-table"></i>Session Positions</h3></div>'+
                    '<div class="portlet-content">'+
                    '<div class="table-responsive">' +
				     '<table class=" table table-striped table-bordered table-hover table-highlight " data-display-rows="10"  data-info="true" data-search="true" data-length-change="true" data-paginate="true" id="sessionPositions_table">' +
					 '</table>'+
					 '</div>'+	
                    '</div> <!-- portlet-content -->'+
                    '</div> <!-- portlet -->'+
                    '</div> <!-- col-md-12 -->'+
                    '</div>',                    
      closeButton:false,           
      buttons: {
      success: {
      label: "OK",
      className: "btn-success",
      callback: function(){
      	$('body').removeClass('modal-scroll');	
      	getTradeSessions();
      }
    }
    
    }});
    $(session_bootbox[0]).attr("id","session_bootbox");
    $('#session_bootbox .modal-dialog').addClass("modal-xlarge");
	  
	apiRequest('getTradeSessionPositions',post_data,$('#sessionPositions_table_holder'),function(dataSession){
		for(var i=0;i<dataSession.length;i++){
			dataSession[i].rate=parseFloat(dataSession[i].rate);
		}
		$('#sessionPositions_table').dataTable( {
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
           "aaData": dataSession,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 3, "desc" ]],                    
           "aoColumns": [
            { "mData": "id", "sTitle": "Position ID"},           
            { "mData": "assetName", "sTitle": "Asset Name"}, 
            { "mData": "date", "sTitle": "Date","sType":"date"},
            { "mData": "endDate", "sTitle": "Expiry Date","sType":"date"},
            { "mData": "rate", "sTitle": "Entry Rate"},
            { "mData": "amount", "sTitle": "Investment"},
            { "mData": "status", "sTitle": "Status"},
            { "mData": "amount", "sTitle": "Amount"},
            { "mData": "payout", "sTitle": "Payout"},            
            { "mData": "product", "sTitle": "Product"}
            ]
         });
	});
}

function save_dt_view (oSettings, oData,type) {
  localStorage.setItem( 'DataTables_'+type+window.location.pathname, JSON.stringify(oData) );
}
function load_dt_view (oSettings,type) {
  return JSON.parse( localStorage.getItem('DataTables_'+type+window.location.pathname) );
}
function reset_dt_view() {
  localStorage.removeItem('DataTables_'+window.location.pathname);
}