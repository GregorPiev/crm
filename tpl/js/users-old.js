$(document).ready(function () {
    getUser();
    $("#callBack").css('color', '#f00');
});

function getUser() {
    $('#users').html('');
    apiRequest('getUser', $('#range-form').serialize(), '#users', function (data) {
        var fields = Object.keys(data[0]);
        for (var row in data) {
            data[row].edit = '<i id="' + data[row].id + '" class="fa fa-pencil-square-o edit" onclick=\'editForm(' + JSON.stringify(data[row]) + ')\';></i>';
            data[row].Delete = '<i id="' + data[row].id + '" class="fa fa-trash-o" onclick=\'deleteUser(' + JSON.stringify(data[row].id) + ')\';></i>';
        }
        //if(document.getElementById("addForm")instanceof Object==false)
        addForm(fields);


        $('#users').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "aButtons": [
                    {
                        "sExtends": "select", "sButtonText": "Add User",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            $("#addForm").css('display', 'inline');
                            $("#addForm").show();
                            $("#ToolTables_users_0").hide();
                            $("#ToolTables_users_1").show();
                            $("#ToolTables_users_2").show();
                            $("#callBack").hide();


                        }
                    },
                    {
                        "sExtends": "select", "sButtonText": "Cancel",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            $("#ToolTables_users_0").show();
                            $("#ToolTables_users_1").hide();
                            $("#ToolTables_users_2").hide();
                            $("#ToolTables_users_3").hide();
                            $("#addForm").hide();
                            DeleteContent();
                            $("h6").hide();
                            $(".error").remove();


                        }
                    },
                    {
                        "sExtends": "select", "sButtonText": "Add",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            if (!$("#error1").hasClass('error') && !$("#error2").hasClass('error')) {
                                if (formSubmit()) {
                                    insertNewUser();

                                }
                            }
                        }


                    },

                    {
                        "sExtends": "select", "sButtonText": "Update",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            if (formSubmit()) {
                                UpdateUser();
                            }
                        }
                    }
                ]
            },
            "bDestroy": true,
            "bLengthChange": true,
            "aaData": data,
            "aaSorting": [[0, "desc"]],
            "aoColumns": [
                {"mData": "id", "sTitle": "ID", "sType": "numeric"},
                {"mData": "username", "sTitle": "USERNAME"},
                {"mData": "fullname", "sTitle": "FULLNAME"},
                {"mData": "email", "sTitle": "EMAIL"},
                {"mData": "spotId", "sTitle": "SPOTID"},
                {"mData": "per_dashboard", "sTitle": "DASHBOARD"},
                {"mData": "per_agenttools", "sTitle": "AGENTTOOLS"},
                {"mData": "per_agentreports", "sTitle": "AGENTREPORTS"},
                {"mData": "per_agent", "sTitle": "AGENT"},
                {"mData": "per_card", "sTitle": "CARD"},
                {"mData": "per_editcustomer", "sTitle": "EDITCUSTOMER"},
                {"mData": "edit", "sTitle": "EDIT"},
                {"mData": "Delete", "sTitle": "DELETE"}

            ]
        });
    });
}


function addForm(fields){
	$('div.portlet-content').prepend('<form id="addForm"><h6>* all fields are required</h6></form>');
	var ignoreArr=['id','session'];
	var	boolFieldsArr=['per_reports','per_administrative','per_customers','per_ibsystem','per_dashboard','per_traffic','per_secret','per_promo','per_affiliates','per_agent','per_card','per_admin','per_agenttools','per_agentreports','per_editcustomer','per_ccdeposits','per_spotapiconnectivity','per_analytics','per_retentionperformance', 'per_pnl', 'per_suport','per_retention','per_conversion','per_conversionperformance','per_editbonus','per_approach','per_shuffleexclude','per_vinci'];
	var	textFieldsArr=['password','email','username','fullname','spotId','real_spotId','inventivaId'];
	var optionDefrayment=['per_defrayment'];
	var optionDesk=['per_desk'];
	for(var field in fields)
	{
		ignore=ignoreArr.indexOf(fields[field])==-1;
		bool=boolFieldsArr.indexOf(fields[field])!=-1;
		text=textFieldsArr.indexOf(fields[field])!=-1;
		fieldsLable=fields[field].replace(/_/g , " ");
		if(ignore && bool && !text){
			$('#addForm').append('<div class="form_row"><span>'+fieldsLable+'</span><select name="'+fields[field].replace(" ","")+'"id="'+fields[field].replace(" ","")+'" class="form-control mini"><option value="1">yes</option><option value="0">no</option></select></div>');

        }
        if (ignore && text) {
            if (fields[field] != 'password') {
                $('#addForm').append('<div class="form_row "><span>' + fieldsLable + '</span><input type="text" name="' + fields[field] + '"id="' + fields[field].replace(" ", "") + '" class="form-control mini" onblur="check(this.id , this.value);" onfocus="resetBorder(this.id);"/></div>');
            }
            else {
                $('#addForm').append('<div class="form_row "><span>password</span><input type="text" name="password" id="password" class="form-control mini" onblur="check(this.id , this.value);" onfocus="resetBorder(this.id);"/></div>');
            }
        }
    }

    $('#addForm').append('<div class="form_row "><span>per defrayment</span><select name="per_defrayment" id="per_defrayment" class="form-control mini"><option value="0">read</option><option value="1">write</option></select></div>');
    $('#addForm').append('<div class="form_row "><span>per desk</span><select name="per_desk" id="per_desk" class="form-control mini"><option value="0">All</option><option value="1">Tel Aviv</option><option value="9">Cyprus</option><option value="13">Elite Profit Center</option><option value="17">South Africa</option></select></div>');
    $("#addForm").append('<input type="hidden" id="id"  name="id" value="0" />');
    //$("#addForm").append('<form action="/file-upload" class="dropzone"><div class="fallback"><input name="file" type="file" multiple /></div></form>');

}

function insertNewUser() {

    apiRequest('addNewUser', $('#addForm').serialize(), '#callBack', function (data) {

        if (data.addUser != ' ' && data.addUser != 'undefined') {

            data.success = "true"
            getUser();
            $('#callBack').show();
            $("#callBack").css({
                'font-size': '16px',
                'padding': '6px',
            });
            $('#callBack').text(data.addUser + ' was successfully added !');
            $('#callBack').css('color', '#009500');
            $('#addForm')[0].reset();
            $("#addForm").remove();
        }
        else {
            $('#callBack').show();
            $('#callBack').text('* there was a problem adding user !');
            $("#callBack").css('color', '#0f0 !important');
        }
    });
}

function editForm(user_data) {
    $("#ToolTables_users_3").show();
    $("#ToolTables_users_1").show();
    $('#callBack').hide();

    $("#addForm").show(function () {
        $("#ToolTables_users_0").hide();
        $("#ToolTables_users_2").hide();
        $.each(user_data, function (index, value) {
            value = value.replace("yes", "1");
            value = value.replace("no", "0");
            value = value.replace("write", "1");
            value = value.replace("read", "0");
            value = value.replace("All", "0");
            value = value.replace("Tel Aviv", "1");
            value = value.replace("Cyprus", "9");
            value = value.replace("Elite Profit Center", "13");
            value = value.replace("South Africa", "17"); 
            $("#" + index).val(value);
           

        });
    });
    $("#addForm").css('display', 'inline');
}

Obj = function arrayToObj(id) {
    this.id = id;
}


function deleteUser(id) {
    var id_json = new Obj(id);
    confirm("Delete User", "Do you want to delete your user?", "cancel", "delete", function (data) {
        apiRequest('deleteUser', id_json, '#callBack', function (data) {
            if (data) {
                $('#callBack').show();
                $('#callBack').text('Your user successfully removed !');
                $('#callBack').css('color', '#009500');
                $("#callBack").css({
                    'font-size': '16px',
                    'padding': '6px',
                });
                $('#addForm').remove();
                getUser();
            }

        });
        return true;
    });
}

function UpdateUser() {

    formData = new FormData();

   /*
    $.each($('#file')[0].files, function(i, file) {
           formData.append('file', file);
       });*/
   
    formData.append('agent_id', 10);

    $.ajax({
        url: "/api.php?cmd=UploadAgentImage",
        type: 'POST',
        data: formData,
        async: false,
        success: function (data) {
            console.log(data);
        },
        cache: false,
        contentType: false,
        processData: false
    });


    //apiRequest('UploadAgentImage', formData, '#callBack', function (data) {
    //    if (data.updateUser != ' ' && data.updateUser != 'undefined') {
    //        data.success = "true"
    //        getUser();
    //        $('#callBack').show();
    //        $("#callBack").css({
    //            'font-size': '16px',
    //            'padding': '6px',
    //        });
    //        $('#callBack').text('Image was successfully update !');
    //        $('#callBack').css('color', '#009500');
    //        $('#addForm')[0].reset();
    //        $("#addForm").remove();
    //    }
    //});

    apiRequest('UpdateUser', $("#addForm").serialize(), '#callBack', function (data) {
        if (data.updateUser != ' ' && data.updateUser != 'undefined') {
            data.success = "true";
            getUser();
            $('#callBack').show();
            $("#callBack").css({
                'font-size': '16px',
                'padding': '6px',
            });
            $('#callBack').text(data.updateUser + ' was successfully update !');
            $('#callBack').css('color', '#009500');
            $('#addForm')[0].reset();
            $("#addForm").remove();
        }
        else {
            $('#callBack').show();
            $('#callBack').text('* there was a problem updateing user !');
            $("#callBack").css('color', '#0f0 !important');
        }
    });
}


	
