var total_usd_all = 0; 
$(document).ready(function() {

    $('#drStart, #ldStart, #lvStart').datepicker({
      dateFormat: 'yy-mm-dd'
      });
    
    $('#drEnd, #ldEnd, #lvEnd').datepicker({
      dateFormat: 'yy-mm-dd',
    });

    $('#countries').select2({ 
      placeholder: "Select countries or leave blank for all",
      allowClear: true,
      width: "100%"
    });

});

function getPNLByUser() {

  apiRequest('getUserPNL',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    console.log(data);
  });

}

function getBounceReport(){
    $(".list-group-item-heading").removeData("amount");
    apiRequest('emailBounceReport',$('#parameters-form').serialize(),'#transactions_table_holder',function(data){
    	console.log(data);
      $('#transactions_table').dataTable( {
        "sDom": 'T<"clear">lfrtip',
        "oTableTools": {
          "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
          "aButtons": [				
            {
              "sExtends": "pdf",
              "sButtonText": "Save as PDF"
            },
            {
              "sExtends": "csv",
					    "sButtonText": "Save as CSV"
            }                
          ]
        },
        "bDestroy": true,
        "bLengthChange": true,
        "aaData": data,
        "aaSorting": [[ 1, "asc" ]],                    
        "aoColumns": [
          { "mData": "customer_id", "sTitle": "Customer Id"},
          { "mData": "email", "sTitle": "Email"},
          { "mData": "first_name", "sTitle": "First Name"},
          { "mData": "last_name", "sTitle": "Last Name"},
          { "mData": "country", "sTitle": "Country"},
          { "mData": "date_registered", "sTitle": "Date Registered"},
          { "mData": "last_deposit", "sTitle": "Last Deposit"},
          { "mData": "last_visit", "sTitle": "Last Visit"},    
          { "mData": "registration_status", "sTitle": "Registration Status"},    
          { "mData": "sale_status", "sTitle": "Sale Status"},    
          { "mData": "number_of_deposits", "sTitle": "Number of Deposits", "sType": "numeric"},    
          { "mData": "total_deposit_amount", "sTitle": "Total Deposit Amount"},
          { "mData": "login_count", "sTitle": "Logins in the Past Year"},
          { "mData": "affID", "sTitle": "affiliate ID"}
        ]
           
      } );

      $('#transactions_table').on( 'click', 'tr', function () {
          if ( $(this).hasClass('selected') ) {
              $(this).removeClass('selected');
              $(this).children('td').each(function() {
                 $(this).removeClass("selected");
              });
          }
          else {
              $(this).addClass('selected');
              $(this).children('td').each(function() {
                 $(this).addClass("selected");
              });
          }
      } );
    });
}

function deleteSelectedRows(){
  var table = $('#transactions_table').DataTable();
   
  var rows = table
      .rows( '.selected' )
      .remove()
      .draw();
}


function gp_convertIt(from,to,amount, object) {
    var gp_from = from;
    var gp_to = to;
    var gp_amount = amount;

    var result = $.ajax({
      url: "http://www.geoplugin.net/currency_converter.gp?jsoncallback=?",
      type: "GET",
      data: {  from: gp_from,
            to: gp_to,
            amount: gp_amount },
      dataType: "json"
    });

    result.done(function(x) {

      addUSD(x.to.amount, object);

    });

}

function addUSD(amount,object) {
  
  var rawAmount = '';



  if(amount==0) {
    return false;
  }
  

  if(amount.toString().indexOf(',') === -1) {
    rawAmount = Number(amount.toString().replace(/[^0-9\.]+/g,""));
  }
  else {
    rawAmount = amount;
  }

  if(amount<0) {
    rawAmount = -Math.abs(rawAmount);
  }

 
  if(object.data("amount")) {
    object.data("amount", object.data("amount"))+rawAmount;
  }
  else {
    object.data("amount", rawAmount);
  }

  object.html("$"+( object.data("amount").toLocaleString() ));
}

function getAffiliates () {

    $('#affiliate')
    .find('option')
    .remove()
    .end()
    .append('<option value="0">All</option>')
    .val('0');

    apiRequest('getAffiliates',$('#range-form').serialize(),'#transactions_table_holder',function(data){
    
      jQuery.each(data, function() {
        $('#affiliate')
            .append($('<option>', { value : this.affID })
            .text(this.affID)); 
      }); 

    }); 
    
}

function removeRows () {
  var emails = new Array();
   $("table tr.selected").each(function(){
       emails.push( $(this).children(":first").text() );
       //console.log( $(this).parent().siblings(":first").text() );
   });
  var data = [];
  var data = { "emails": emails };
  if ( emails.length > 0 ) {
    apiRequest('suppressEmails',data,'',function(data){});
    apiRequest('emailBounceReport',$('#parameters-form').serialize(),'#transactions_table_holder',function(data){
      $('#transactions_table').dataTable( {
        "sDom": 'T<"clear">lfrtip',
        "oTableTools": {
          "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
          "aButtons": [				
            {
              "sExtends": "pdf",
              "sButtonText": "Save as PDF"
            },
            {
              "sExtends": "csv",
              "sButtonText": "Save as CSV"
            }                
          ]
        },
        "bDestroy": true,
        "bLengthChange": true,
        "aaData": data,
        "aaSorting": [[ 1, "asc" ]],                    
        "aoColumns": [
          { "mData": "email", "sTitle": "Email"},
          { "mData": "first_name", "sTitle": "First Name"},
          { "mData": "last_name", "sTitle": "Last Name"},
          { "mData": "country", "sTitle": "Country"},
          { "mData": "date_registered", "sTitle": "Date Registered"},
          { "mData": "last_deposit", "sTitle": "Last Deposit"},
          { "mData": "last_visit", "sTitle": "Last Visit"},    
          { "mData": "number_of_deposits", "sTitle": "Number of Deposits", "sType": "numeric"},    
          { "mData": "total_deposit_amount", "sTitle": "Total Deposit Amount"},
          { "mData": "login_count", "sTitle": "Logins in the Past Year"}
        ]
           
      } );

      $('#transactions_table').on( 'click', 'tr', function () {
          if ( $(this).hasClass('selected') ) {
              $(this).removeClass('selected');
              $(this).children('td').each(function() {
                 $(this).removeClass("selected");
              });
          }
          else {
              $(this).addClass('selected');
              $(this).children('td').each(function() {
                 $(this).addClass("selected");
              });
          }
      } );
    });
  }
}
