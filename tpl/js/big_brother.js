$(document).ready(function () {


  /*  setInterval(function () {
        onlineCustomers();
    }, 120000); */
    
    getGlobalUserData();

    document.ready = clickHandler;
    var actionName;
    var wait = 0;
    $('input').not('input[type=text], input[type=number],input[type=email]').click(function (e) {
        if ($(this).attr('type') == 'submit') {
            actionName = 'submit';
        } else if ($(this).attr('type') == 'checkbox') {
            actionName = 'checkbox';
        } else if ($(this).attr('type') == 'radio') {
            actionName = 'radio';
        }
        insertUserLog($(this), actionName, wait);
    });


    $('input[name=dpStart],input[name=dpEnd]').click(function (e) {
        actionName = 'datepicker';
        insertUserLog($(this), actionName, wait);
    });


    $('button,a').not('button.range').click(function (e) {
        wait = 1;
        actionName = 'button';
        insertUserLog($(this), actionName, wait);

    });

    $('select').change(function (e) {
        actionName = 'select';
        insertUserLog($(this), actionName, wait);
    });
});


var uri = window.location.href;

function clickHandler(e) {
    var elem, evt = e ? e : event;
    if (evt.srcElement)  elem = evt.srcElement;
    else if (evt.target) elem = evt.target;
    var postData = "uri=" + elem.URL;
    apiRequest('insertUserLog', postData);
}

function getFormData(element, actionName) {
    var formParameters = '';
    var forms = element.parents("form");
    formParameters += 'action=' + actionName + '&uri=' + uri;
    forms.find('input, select, textarea').not('input[type=submit]').each(function () {
        var temp = $(this);
        var name = this.name;
        if (this.tagName == 'SELECT') {
            var value = temp.find('option:selected').text();
        } else if (temp.attr('type') == 'checkbox') {
            var value = temp.prop('checked');
        } else {
            var value = this.value;

        }
        formParameters += '&' + name + '=' + value;
    });
    return formParameters;
}

function insertUserLog(element, actionName, wait) {
    if (wait) {
        setTimeout(function () {
            apiRequest('insertUserLog', getFormData(element, actionName));
        }, 2000);
    } else {

        apiRequest('insertUserLog', getFormData(element, actionName));
    }
}

var oldOnlineCustomers = [];

function onlineCustomers() {
    apiRequest('getonlineCustomers', $('#footer').serialize(), '#div', function (data) {

        if(typeof data == 'object'){
            data = $.map(data, function(el) { return el });
        }

        data = data.filter(isPreviouslyOnline);

        if (data.length > 0) {
            var elements = "",
                newOnlineCustomers = '<div id="newOnlineCustomers"><h4>New online customers:</h4><div id="dataOnline"></div>';

            $('#dataOnline').html("");

            $.each(data, function (key, value) {
                if (!isInArray(value.id, oldOnlineCustomers))
                    oldOnlineCustomers.push(value.id);

                elements += '<div><a href="/agenttools/customer_card/?id='+value.id+'">[' + value.id + ' - ' + value.email + ']</a></div>';
            });

            newOnlineCustomers += '</div>';
            $("#content-header").append(newOnlineCustomers);
            $('#dataOnline').append(elements);
            $('#newOnlineCustomers').fadeIn("slow");
            $('#newOnlineCustomers').click(function () {
                $('#newOnlineCustomers').fadeOut();
            });
        }
    });
}

//helper functions
function isPreviouslyOnline(obj) {
    var result = (isInArray(obj.id, oldOnlineCustomers)) ? false : true;
    return result;
}

function isInArray(value, array) {
    return array.indexOf(value) > -1;
}

var lastTradeSessions=[];
var global_post=[];

function getGlobalUserData(){
	apiRequest('getUserData','','',function(userdata){
		if(userdata.per_retention==1){
			//getUnnotifiedTradeSessions();
		}
	});
}

function getUnnotifiedTradeSessions(){
	
	setTimeout(function () {
	$.ajax({
  	    	 url: "/api.php?cmd=getUnnotifiedTradeSessions",
  	    	 type: "POST",
  	    	 data: global_post,
  	    	 dataType: "json",
  	    	 async: true,
  	    	 cache:false,
             timeout: 60000000,
  	    	 success:function(data){
  	    	 	global_post=[];
  	    	 	for(var i=0;i<data.length;i++){
	            	global_post += i!=data.length-1 ? 'id_'+i+'='+data[i].id+'&' : 'id_'+i+'='+data[i].id; 
	            }
  	    	 	if(data[0]!=null){
  	    	 		getNotifyModal(data);
  	    	 	}
  	    	 },
  	    	 error: function(x, t, m) {
             console.log(x);
             console.log(t);
             console.log(m);
           
  	    	 },
  	    	 	
  	      }).done(getUnnotifiedTradeSessions);
  	 },10000);     	
}

function getNotifyModal(tradeSessions){
	var count_sessions=tradeSessions.length;
	if(!$('#notify_bootbox').length){
  	 var notify_bootbox=bootbox.dialog({
  	   title: count_sessions+" New Trading Session(s)",
  	   message: '<div class="row">  ' +
                    '<div class="col-md-12"> ' +
                    '<div id="session_table_holder">'+
                    '<div class="table-responsive">' +
				    '<table class=" table table-striped table-bordered table-hover table-highlight " id="session_table">' +
					'</table>'+
					'</div>'+		
                    '</div></div></div>',
       buttons: {
        success: {
         label: "OK",
         className: "btn-success"
        }
       }                	
  	 });
  	 $(notify_bootbox[0]).attr('id','notify_bootbox');  
    }
    if(lastTradeSessions!=tradeSessions){
    	$('#notify_bootbox .modal-title').text(count_sessions+" New Trading Session(s)");
    	lastTradeSessions=tradeSessions;
    	drawSessionTable(tradeSessions);
    }
    $('#notify_bootbox .btn-success').off().click(function(){
    	event.preventDefault();
    	lastTradeSessions=[];
        changeNotifySessions();
    }); 
}

function drawSessionTable(tradeSessions){
	$("#session_table").dataTable({
      "bDestroy":true,
      "bInfo": false,
      "bAutoWidth": false,	
      "bFilter": false,
      "bLengthChange": false,
      "bPaginate": false,	
      "aaData": tradeSessions,
      "aaSorting": [[ 3, "desc" ]],
      "aoColumns": [
            { "mData": "id","sTitle":"ID", "bVisible": false},
            { "mData": "customerId","sTitle":"Customer ID"},
            { "mData": "customerName","sTitle":"Customer Name"},
            { "mData": "startTime","sTitle": "Session Start", "sType": "date"},
            { "mData": "trader", "sTitle": "Trader"},
            { "mData": "status", "sTitle": "Status"}
      ]
      });      
}

function changeNotifySessions(){
	apiRequest('changeNotifySessions',global_post,'',function(){
		global_post=[];
	});
}












	
