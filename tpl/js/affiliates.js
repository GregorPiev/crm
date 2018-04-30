Date.prototype.format = function (format) //author: meizz
{
    var o = {
        "M+": this.getMonth() + 1, //month
        "d+": this.getDate(),    //day
        "h+": this.getHours(),   //hour
        "m+": this.getMinutes(), //minute
        "s+": this.getSeconds(), //second
        "q+": Math.floor((this.getMonth() + 3) / 3),  //quarter
        "S": this.getMilliseconds() //millisecond
    }

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
}

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}


function selectRange(range) {
    if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
    if(range==0 || range==1)
       endDate.setDate(endDate.getDate() - range);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
  
    } else {
  
    range = range.split('-');
    var endDate = new Date(range[1],range[0]-1,1);
    var startDate = new Date(range[1],range[0]-1,1);
  
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }

    getLeadsByAffiliates();

}

$(document).on('click','a.getUncalledCustomers',function(){
       var aff_id = $(this).attr('data-aff_id');
       getUncalledCustomers(aff_id);
});

function getUncalledCustomers(aff_id){
	var url = location.protocol + '//' + location.host + '/' +globalBrandName+ '/agenttools/customer_card';
	
	bootbox.dialog({
		title:   'Uncalled Customers for '+aff_id,
		message: '<div class="row">  ' +
                 '<div class="col-md-12"> ' +
                 '<div id="uncalled_table_holder">'+
                 '<div class="table-responsive">' +
				 '<table class=" table table-striped table-bordered table-hover table-highlight " id="uncalled_table">' +
				 '</table>'+
				 '</div>'+		
                 '</div></div></div>',
        buttons:{
        	success:{
        		label: "OK",
                className: "btn-success"
        	}
        }         
                    
	});
	var post_data = $('#range-form').serialize()+'&affiliate='+aff_id;
	apiRequest('getUncalledCustomers',post_data,'#uncalled_table_holder',function(data){
		$('#uncalled_table').dataTable({
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
            "aaSorting": [[0, "asc"]],
            "aoColumns": [
                {"mData": "customerId", "sTitle": "Customer ID",
                 "mRender": function( data, type, row ){
                 	 href = url + '/?id='+data;
                 	 if(type ==='display')
                 	    return '<a href="'+href+'" target="_blank">'+data+'</a>';
                 	    
                 	 return data;   
                 }
                }, 
                {"mData": "customerName", "sTitle": "Customer Name"}
	        ]
	        }); 
	});
}


function getLeadsByAffiliates() {
    apiRequest('getLeadsByAffiliates', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

        $('#transactions_table').dataTable({
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
            "aaSorting": [[7, "desc"]],
            "aoColumns": [
                {"mData": "aff_id", "sTitle": "Affiliate"},
                {"mData": "leads", "sTitle": "Leads", "sType": "numeric"},
                {"mData": "customers", "sTitle": "Customers", "sType": "numeric"},
                {"mData": "called", "sTitle": "Called", "sType": "numeric"},
                {"mData": "notcalled_cutoff", "sTitle": "NC C.OFF", "sType": "numeric"},
                {"mData": "called_rate", "sTitle": "Called (%)", "sType": "numeric",
                 "mRender" : function( data, type, row ){
                 	 if(type ==='display')
                 	    return data+' <a class="btn btn-xs btn-blue btn-block getUncalledCustomers" data-aff_id="'+row.aff_id+'">View</a>';
                 	    
                 	 return data;   
                 } 
                  },
                {"mData": "cum_not_called", "sTitle": "CU NC", "sType": "numeric"},
                {"mData": "ftd_deposits_pay", "sTitle": "FTDs", "sType": "numeric"},
             //   {"mData": "london", "sTitle": "LND", "sType": "numeric"},
                {"mData": "conversion_rate", "sTitle": "Conversion (%)", "sType": "numeric"},
                {"mData": "deposits", "sTitle": "Deposits (#)", "sType": "numeric"},
                {"mData": "self_deposits", "sTitle": "Self D (#)", "sType": "numeric"},
                {"mData": "aff_withdrawals", "sTitle": "Withdrawals ($)", "sType": "numeric"},
                {"mData": "amount", "sTitle": "Deposits ($)", "sType": "numeric"},
                {"mData": "ftd_amount", "sTitle": "FTD ($)", "sType": "numeric"},
                {"mData": "self_amount", "sTitle": "Self D ($)", "sType": "numeric"},
            ],

            "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {
                var total_leads = 0;
                var total_customers = 0;
                var total_deposits = 0;
                var total_self_deposits = 0;
                var total_amount = 0;
                var total_ftd_amount = 0;
                var total_self_amount = 0;
                var ftd_deposits_pay = 0;

                for (var i = 0; i < aiDisplay.length; i++) {
                    total_leads += parseFloat(aaData[aiDisplay[i]]['leads']);
                    total_customers += parseFloat(aaData[aiDisplay[i]]['customers']);
                    ftd_deposits_pay += parseFloat(aaData[aiDisplay[i]]['ftd_deposits_pay']);
                    total_deposits += parseFloat(aaData[aiDisplay[i]]['deposits']);
                    total_self_deposits += parseFloat(aaData[aiDisplay[i]]['self_deposits']);
                    total_amount += parseFloat(aaData[aiDisplay[i]]['amount']);
                    total_ftd_amount += parseFloat(aaData[aiDisplay[i]]['ftd_amount']);
                    total_self_amount += parseFloat(aaData[aiDisplay[i]]['self_amount']);
                }

                $('#total_leads').html(total_leads);
                $('#total_customers').html(total_customers);
                $('#total_deposits_number').html(ftd_deposits_pay);
                $('#total_deposits').html(total_deposits.toLocaleString());
                $('#total_self_deposits').html(total_self_deposits.toLocaleString());
                $('#total_amount').html(total_amount.toLocaleString());
                $('#total_ftd_amount').html(total_ftd_amount.toLocaleString());
                $('#total_self_amount').html(total_self_amount.toLocaleString());
            }
        });
    });
}

function getAffiliatesGroups() {

    $('#affiliate').find('option').remove().end().append('<option value="0">All</option>').val('0');
    apiRequest('getAffiliatesGroups', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

        $.each(data, function () {
            $('#affiliate').append($('<option>', {value: this.affID}).text(this.affID));
        });

    });
}

function getAffiliates() {
    apiRequest('getAffiliates', $('#range-form').serialize(), '#transactions_table_holder', function (data) {
        $('#alltime_leads').dataTable({
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
            "aaSorting": [[2, "desc"]],
            "aoColumns": [
                {"mData": "affID", "sTitle": "Affiliate Id"},
                {"mData": "totalDeposits", "sTitle": "Total Deposits", "sType": "numeric"},
                {"mData": "leadsNum", "sTitle": "Leads", "sType": "numeric"},
                {"mData": "customersNum", "sTitle": "Customers", "sType": "numeric"}
            ]
        });

        $.each(data, function () {
            $('#affiliate').append($('<option>', {value: this.affID}).text(this.affID));
        });

    });

}

function geoPlugin(data) {

    total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",", ""));
    $('#total_usd_all').html('$' + total_usd_all.toLocaleString());

}