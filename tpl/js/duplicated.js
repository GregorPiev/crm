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


$(document).ready(function () {

    $('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();

    getCustomersWithDuplications();
    getAffiliates();


    $(document).on("click", "a.getFraudUsers", function () {
        getDuplications($(this));
        return false;
    });

});

function selectRange(range) {
    if (!isNaN(range)) {

        var endDate = new Date();
        var startDate = new Date();

        startDate.setDate(startDate.getDate() - range);

        $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
        $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    } else {

        range = range.split('-');
        var endDate = new Date(range[1], range[0] - 1, 1);
        var startDate = new Date(range[1], range[0] - 1, 1);
        console.log(endDate);

        endDate.setMonth(endDate.getMonth() + 1);
        endDate.setDate(endDate.getDate() - 1);
        $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
        $('#dpStart').val(startDate.format("yyyy-MM-dd"));

    }

    getCustomersWithDuplications();

}

$("#deposited, #affiliate, #dpStart, #dpEnd").change(function () {
    clearData();
    getCustomersWithDuplications();
});

function clearData() {
    var oTable = $('#fraud_customers_table').dataTable();
    oTable.fnClearTable();
}


function getAffiliates() {

    $('#affiliate')
        .find('option')
        .remove()
        .end()
        .append('<option value="0">All</option>')
        .val('0');

    apiRequest('getAffiliates', $('#range-form').serialize(), '#transactions_table_holder', function (data) {

        jQuery.each(data, function () {
            $('#affiliate')
                .append($('<option>', {value: this.affID})
                    .text(this.affID));
        });

    });

}


function getCustomersWithDuplications() {

    apiRequest('getCustomersWithDuplications', $('#range-form').serialize(), '#fraud_customers_table_holder', function (data) {
        //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime

        $('#fraud_customers_table').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                "aButtons": [{
                    "sExtends": "pdf",
                    "sButtonText": "Save as PDF"
                }, {
                    "sExtends": "xls",
                    "sButtonText": "Save for Excel"
                }]
            },
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [
                [3, "desc"]
            ],
            "aoColumns": [{
                "mData": "customerName",
                "sTitle": "Customer Name",
                "sType": "numeric"
            }, {
                "mData": "aff_id",
                "sTitle": "Affiliate"
            }, {
                "mData": "birthday",
                "sTitle": "Birthday"
            }, {
                "mData": "lastRegistration",
                "sTitle": "Last Registration"
            }, {
                "mData": "count",
                "sTitle": "Duplications"
            }, {
                "mData": "nothing",
                "sTitle": "Views",
                "fnRender": function (oObj) {
                    return '<a href="#" data-firstname="' + oObj.aData.FirstName + '" data-lastname="' + oObj.aData.LastName + '" data-birthday="' + oObj.aData.birthday + '" class="btn btn-xs btn-tertiary getFraudUsers">Show &nbsp;&nbsp;<i class="fa fa-chevron-right"></i></a>';
                }
            }],
            "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {

            }
        });
    });

// {
//  "mData": "deposited",
//  "sTitle": "Deposited"
// }, 

}

function getDuplications(object) {

    apiRequest('getFraudUsers', object.data(), '#fraud_table_holder', function (data) {
        //"id":"30931","customerId":"28469","amountUSD":"810.09","confirmTime

        $('#fraud_table').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "sSwfPath": "/tpl/js/plugins/tabletools/swf/copy_csv_xls_pdf.swf",
                "aButtons": [{
                    "sExtends": "pdf",
                    "sButtonText": "Save as PDF"
                }, {
                    "sExtends": "xls",
                    "sButtonText": "Save for Excel"
                }]
            },
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [
                [1, "asc"]
            ],
            "aoColumns": [{
                "mData": "id",
                "sTitle": "Customer ID",
                "sType": "numeric"
            }, {
                "mData": "customerName",
                "sTitle": "Customer Name"
            }, {
                "mData": "birthday",
                "sTitle": "Birthday"
            }, {
                "mData": "regTime",
                "sTitle": "Registration Date"
            }, {
                "mData": "amount",
                "sTitle": "Deposited"
            }],
            "fnFooterCallback": function (nRow, aaData, iStart, iEnd, aiDisplay) {

            }
        });
    });

}