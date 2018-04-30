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

  function selectRange(range) {

    if (!isNaN(range)) {

      var endDate = new Date();
      var startDate = new Date();

      startDate.setDate(startDate.getDate() - range);

      $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
      $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    } else {

      range = range.split('-');
      var endDate = new Date(range[1],range[0]-1,1);
      var startDate = new Date(range[1],range[0]-1,1);
      console.log(endDate);

      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(endDate.getDate() - 1);
      $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
      $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    }
    
    getBonusesUsage();

}

$(document).ready(function() {				  
    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    $('#dpStart, #dpEnd').change(function(){
    	getBonusesUsage();
	});
    
	getBonusesUsage();
    $("#addCallBack").css('color', '#f00');
  });


function getBonusesUsage(){
  apiRequest('getBonusesUsage',$('#range-form').serialize(),'#promoCodesData_table_holder',function(data){
	  for(var row in data){
	      data[row].approve_button = '';
          data[row].reject_button = '';
          
		  if(data[row].status == 'Pending' && data[row].precentage!=-1) {
			  data[row].approve_button = '<i id="'+data[row].id+'" class="fa fa-check-circle-o edit" onclick=\'approveFTDBonus('+JSON.stringify(data[row].id)+')\'></i>';
			  data[row].reject_button = '<i id="'+data[row].id+'" class="fa fa-ban edit" onclick=\'rejectFTDBonus('+JSON.stringify(data[row].id)+')\'></i>';
		  }else if(data[row].status == 'Pending' && data[row].precentage==-1){
              data[row].precentage = "unset bonus";
          }
	  }
	  
    $('#promoCodesData_table').dataTable( {
       "sDom": 'T<"clear">lfrtip',
       "oTableTools": {
        "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
        "aButtons": []
      },
      "bDestroy": true,
      "bLengthChange": true,
      "aaData": data,
      "aaSorting": [[ 0, "asc" ]],                    
      "aoColumns": [
      { "mData": "user_id", "sTitle": "Customer"},
      { "mData": "deposit_amount", "sTitle": "Deposit Amount"},
      { "mData": "deposit_currency", "sTitle": "Deposit Currency"},
      { "mData": "precentage", "sTitle": "Bonus Precentage"},
      { "mData": "deposit_time", "sTitle": "Deposit Time", "sType": "date"},
      { "mData": "status", "sTitle": "Status"},
      { "mData": "approve_button", "sTitle": "Approve"},
      { "mData": "reject_button", "sTitle": "Reject"},
      ],
      "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
        $(".show").removeClass("show");
        $(".clear").addClass("show");
      }
    } );
  });
}


Obj = function arrayToObj(id) {
	   this.id = id;
	}

function approveFTDBonus(id){
	  var id_json = new Obj(id);
	  apiRequest('approveFTDBonus',id_json,'#addCallBack',function(data){
	    if (!data.error) {
	    	getBonusesUsage();
	    };
	  }); 
}

function rejectFTDBonus(id){
	  var id_json = new Obj(id);
	  apiRequest('rejectFTDBonus',id_json,'#addCallBack',function(data){
	    if (!data.error) {
	    	getBonusesUsage();
	    };
	  }); 
}

function callbackMassage(text , success){
	$("#addCallBack").show();
	$("#addCallBack").css({
		'font-size': '16px',
		'padding': '6px',
	});
	if (success=="true") {
			$("#addCallBack").css('color', '#009500');
			$("#addCallBack").text(text);
			$('#addForm')[0].reset();
			$("#addForm").hide();
	}else{
		$("#addCallBack").css('color', '#0f0 !important');
		$("#addCallBack").text(text);
	}
}