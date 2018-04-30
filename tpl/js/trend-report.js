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
    };

    if (/(y+)/.test(format)) format = format.replace(RegExp.$1,
        (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)if (new RegExp("(" + k + ")").test(format))
        format = format.replace(RegExp.$1,
            RegExp.$1.length == 1 ? o[k] :
                ("00" + o[k]).substr(("" + o[k]).length));
    return format;
};

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};


function loadDates() {
    var date = new Date();
    var month = date.getMonth()+1;
    var year = date.getFullYear();

    var endDate = new Date(year, month - 1, 1);
    var startDate = new Date(year, month - 1, 1);
    var endDate1 = new Date(year, month - 1, 1);
    var startDate1 = new Date(year, month - 1, 1);
    var endDate2 = new Date(year, month - 1, 1);
    var startDate2 = new Date(year, month - 1, 1);

        console.log(endDate);

         endDate.setMonth(endDate.getMonth() + 1);
         endDate.setDate(endDate.getDate() - 1);

         endDate1.setDate(startDate1.getDate()-1);
         startDate1.setMonth(startDate1.getMonth()-1);

          endDate2.setMonth(endDate2.getMonth()-1);
          endDate2.setDate(endDate2.getDate() - 1);
          startDate2.setMonth(startDate2.getMonth()-2);

        $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
         $('#dpStart').val(startDate.format("yyyy-MM-dd"));

        $('#dpEnd_1').val(endDate1.format("yyyy-MM-dd"));
        $('#dpStart_1').val(startDate1.format("yyyy-MM-dd"));

        $('#dpEnd_2').val(endDate2.format("yyyy-MM-dd"));
        $('#dpStart_2').val(startDate2.format("yyyy-MM-dd"));

}
function getLeadsByAffiliates() {
    apiRequest('getLeadsStatisticsByAffiliates', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

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
            "aaSorting": [[8, "desc"]],
            "aoColumns": [
                {"mData": "aff_id", "sTitle": "Affiliate"},
                {"mData": "customers_2", "sTitle": "Customers 2 months ago", "sType": "numeric"},
                {"mData": "ftd_deposits_pay_2", "sTitle": "FTDs 2 months ago", "sType": "numeric"},
                {"mData": "conversion_rate_2", "sTitle": "Conversion (%) 2 months ago", "sType": "numeric"},
                {"mData": "customers_1", "sTitle": "Customers 1 month ago", "sType": "numeric"},
                {"mData": "ftd_deposits_pay_1", "sTitle": "FTDs 1 month ago", "sType": "numeric"},
                {"mData": "conversion_rate_1", "sTitle": "Conversion (%) 1 month ago", "sType": "numeric"},
                {"mData": "customers", "sTitle": "Customers this month", "sType": "numeric"},
                {"mData": "ftd_deposits_pay", "sTitle": "FTDs this month", "sType": "numeric"},
                {"mData": "conversion_rate", "sTitle": "Conversion (%) this month", "sType": "numeric"},
            ],
            "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {

                var total_customers = 0;
                var ftd_deposits_pay = 0;

                var total_customers_1 = 0;
                var ftd_deposits_pay_1 = 0;

                var total_customers_2 = 0;
                var ftd_deposits_pay_2 = 0;

                for ( var i=0 ; i<aiDisplay.length ; i++ )
                {

                    total_customers += parseFloat(aaData[ aiDisplay[i] ]['customers']);
                    ftd_deposits_pay += parseFloat(aaData[ aiDisplay[i] ]['ftd_deposits_pay']);

                    total_customers_1 += parseFloat(aaData[ aiDisplay[i] ]['customers_1']);
                    ftd_deposits_pay_1 += parseFloat(aaData[ aiDisplay[i] ]['ftd_deposits_pay_1']);

                    total_customers_2 += parseFloat(aaData[ aiDisplay[i] ]['customers_2']);
                    ftd_deposits_pay_2 += parseFloat(aaData[ aiDisplay[i] ]['ftd_deposits_pay_2']);

                }

                $('#total_customers').html(total_customers);
                $('#total_deposits_number').html(ftd_deposits_pay);

                $('#total_customers_1').html(total_customers_1);
                $('#total_deposits_number_1').html(ftd_deposits_pay_1);

                $('#total_customers_2').html(total_customers_2);
                $('#total_deposits_number_2').html(ftd_deposits_pay_2);

            }


        });


    });
}

function getAffiliatesGroups() {

    $('#affiliate')
        .find('option')
        .remove()
        .end()
        .append('<option value="0">All</option>')
        .val('0');

    apiRequest('getAffiliatesGroups', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

        jQuery.each(data, function () {
            $('#affiliate')
                .append($('<option>', {value: this.affID})
                    .text(this.affID));
        });

    });

}

function getAffiliates() {

    apiRequest('getAffiliates', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

        jQuery.each(data, function () {
            $('#affiliate')
                .append($('<option>', {value: this.affID})
                    .text(this.affID));
        });

    });

}

function geoPlugin(data) {

    total_usd_all = total_usd_all + parseFloat(data.to.amount.replace(",", ""));
    $('#total_usd_all').html('$' + total_usd_all.toLocaleString());

}