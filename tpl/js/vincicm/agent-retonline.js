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
$(document).ready(function () {
        apiRequest('getRetOnlineCustomers', "", '#retOnlineCustomers_table_holder', function (data) {
            var url = location.protocol + '//' + location.host + '/agenttools/customer_card';
            var href = '';
            for (var i = 0, j = data.length; i < j; i++) {
                href = url + '/?id=' + data[i].id;
                data[i].id = '<a href="' + href + '" >' + data[i].id + '</a>';
                data[i].FirstName = '<a href="' + href + '" >' + data[i].FirstName + '</a>';
            }
            ;
            $('#retOnlineCustomers_table').dataTable({
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
                "aaData": data,
                "aaSorting": [[8, "desc"]],
                "aoColumns": [
                    {"mData": "id", "sTitle": "Id"},
                    {"mData": "FirstName", "sTitle": "FirstName"},
                    {"mData": "LastName", "sTitle": "LastName"},
                    {"mData": "country", "sTitle": "Country"},
                    {"mData": "Email", "sTitle": "Email"},
                    {"mData": "Campaigns", "sTitle": "Campaigns"},
                    {"mData": "subCampaign", "sTitle": "Sub Campaign"},
                    {"mData": "saleStatus", "sTitle": "Sale Status"},
                    {"mData": "regTime", "sTitle": "Registration", "sType": "date"},
                    {"mData": "employee", "sTitle": "Employee"},
                    {"mData": "deskName", "sTitle": "Desk"}
                ]
            });
        });
    });

    function assignDesk(userid, desk) {
        //$("#btn_" + userid).attr("disabled", "disabled");
        apiRequest('assignDesk', 'userid=' + userid + '&desk=' + desk, '#customerTBL', function (data) {
            $("#td_" + userid).html('<i class="fa fa-check"></i>');
        });
    }