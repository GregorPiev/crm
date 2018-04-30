function apiRequest(cmd, data, element, callback) {
    var doCB = (arguments.length == 4) ? 1 : 0;

    var ajaxID = showLoad(element);

    $.ajax({

        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    $('#' + ajaxID).html(parseInt(percentComplete * 100) + ' %');
                }
            }, false);
            return xhr;
        },
        url: "/api.php?cmd=" + cmd,
        type: "POST",
        data: data,
        dataType: "json",
        timeout: 60000000,
        success: function (e) {
            console.log("success");

            if (e.error) {
                hideLoad(ajaxID);
                if (e.element) {

                    $element = $('[name="' + e.element + '"]');
                    var errorDiv = $('<ul class="parsley-error-list" style="display: block;"><li class="type" style="display: list-item;">' + e.error + '</li></ul>');

                    if ($element.parent().hasClass('input-group')) {
                        $element.parent().after(errorDiv);
                    } else {
                        $element.after(errorDiv);
                    }

                } else {

                    msgbox('<i class="icon-warning-sign"></i> Oops!', e.error, "Close");


                }
                //console.log(e.error);
            } else if (e.navigate) {

                try {
                    window.location.assign(e.navigate);
                } catch (t) {
                    window.location.href = e.navigate;
                }


            } else if (e.msgbox) {
                hideLoad(ajaxID);
                msgbox('System message', e.msgbox, "Close");
                if (doCB)
                    callback(e);
            } else {
                hideLoad(ajaxID);
                if (doCB)
                    callback(e);
            }
        }
    });
}

function apiRequestSync(cmd, data, element, callback) {
    var doCB = (arguments.length == 4) ? 1 : 0;

    var ajaxID = showLoad(element);


    $.ajax({

        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    $('#' + ajaxID).html(parseInt(percentComplete * 100) + ' %');
                }
            }, false);
            return xhr;
        },
        url: "/api.php?cmd=" + cmd,
        type: "POST",
        data: data,
        async: false,
        dataType: "json",
        timeout: 60000000,
        success: function (e) {
            console.log("success cmd => "+cmd);

            if (e.error) {
                hideLoad(ajaxID);
                if (e.element) {

                    $element = $('[name="' + e.element + '"]');
                    var errorDiv = $('<ul class="parsley-error-list" style="display: block;"><li class="type" style="display: list-item;">' + e.error + '</li></ul>');

                    if ($element.parent().hasClass('input-group')) {
                        $element.parent().after(errorDiv);
                    } else {
                        $element.after(errorDiv);
                    }

                } else {

                    msgbox('<i class="icon-warning-sign"></i> Oops!', e.error, "Close");


                }
                //console.log(e.error);
            } else if (e.navigate) {

                try {
                    window.location.assign(e.navigate);
                } catch (t) {
                    window.location.href = e.navigate;
                }


            } else if (e.msgbox) {
                hideLoad(ajaxID);
                msgbox('System message', e.msgbox, "Close");
                if (doCB)
                    callback(e);
            } else {
                hideLoad(ajaxID);
                if (doCB)
                    callback(e);
            }
        }
    });

}


function apiRequestBrand(cmd, data, element, async, brand, callback) {
    var doCB = (arguments.length == 6) ? 1 : 0;

    var ajaxID = showLoad(element);

    $.ajax({

        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    $('#' + ajaxID).html(parseInt(percentComplete * 100) + ' %');
                }
            }, false);
            return xhr;
        },
        url: "/api"+brand+".php?cmd=" + cmd,
        type: "POST",
        data: data,
        async: async,
        dataType: "json",
        timeout: 60000000,
        success: function (e) {
            console.log("success");

            if (e.error) {
                hideLoad(ajaxID);
                if (e.element) {

                    $element = $('[name="' + e.element + '"]');
                    var errorDiv = $('<ul class="parsley-error-list" style="display: block;"><li class="type" style="display: list-item;">' + e.error + '</li></ul>');

                    if ($element.parent().hasClass('input-group')) {
                        $element.parent().after(errorDiv);
                    } else {
                        $element.after(errorDiv);
                    }

                } else {

                    msgbox('<i class="icon-warning-sign"></i> Oops!', e.error, "Close");


                }
                //console.log(e.error);
            } else if (e.navigate) {

                try {
                    window.location.assign(e.navigate);
                } catch (t) {
                    window.location.href = e.navigate;
                }


            } else if (e.msgbox) {
                hideLoad(ajaxID);
                msgbox('System message', e.msgbox, "Close");
                if (doCB)
                    callback(e);
            } else {
                hideLoad(ajaxID);
                if (doCB)
                    callback(e);
            }
        },
        error:function(jqXHR, textStatus, errorThrown){
            console.log("%cError Query:" + cmd,"color:fuchsia");
            console.log("%cError Status:" + textStatus,"color:fuchsia");
            console.log("%cError Description:" + errorThrown,"color:fuchsia"); 
             
        }
    });
}

function apiRequestRTCGreg(cmd, data, element, async, callback) {
    var doCB = (arguments.length == 5) ? 1 : 0;

    var ajaxID = showLoad(element);

    $.ajax({

        xhr: function () {
            var xhr = new window.XMLHttpRequest();
            xhr.addEventListener("progress", function (evt) {
                if (evt.lengthComputable) {
                    var percentComplete = evt.loaded / evt.total;
                    $('#' + ajaxID).html(parseInt(percentComplete * 100) + ' %');
                }
            }, false);
            return xhr;
        },
        url: "/apiRTCGreg.php?cmd=" + cmd,
        type: "POST",
        data: data,
        async: async,
        dataType: "json",
        timeout: 60000000,
        success: function (e) {
            console.log("success");

            if (e.error) {
                hideLoad(ajaxID);
                if (e.element) {

                    $element = $('[name="' + e.element + '"]');
                    var errorDiv = $('<ul class="parsley-error-list" style="display: block;"><li class="type" style="display: list-item;">' + e.error + '</li></ul>');

                    if ($element.parent().hasClass('input-group')) {
                        $element.parent().after(errorDiv);
                    } else {
                        $element.after(errorDiv);
                    }

                } else {

                    msgbox('<i class="icon-warning-sign"></i> Oops!', e.error, "Close");


                }
                //console.log(e.error);
            } else if (e.navigate) {

                try {
                    window.location.assign(e.navigate);
                } catch (t) {
                    window.location.href = e.navigate;
                }


            } else if (e.msgbox) {
                hideLoad(ajaxID);
                msgbox('System message', e.msgbox, "Close");
                if (doCB)
                    callback(e);
            } else {
                hideLoad(ajaxID);
                if (doCB)
                    callback(e);
            }
        },
        error:function(jqXHR, textStatus, errorThrown){
            console.log("%cError Query:" + cmd,"color:fuchsia");
            console.log("%cError Status:" + textStatus,"color:fuchsia");
            console.log("%cError Description:" + errorThrown,"color:fuchsia"); 
             
        }
    });
}

function showLoad(element) {
    var ajaxID = 'ajaxProcess' + Math.floor(Math.random() * 11);
    var loadingDiv = $('<div class="ajax-mask"><div class="loading" id="' + ajaxID + '"></div></div>')
        .css({
            'position': 'absolute',
            'top': 0,
            'left': 0,
            'width': '100%',
            'height': '100%'
        });

    $(element).css({'position': 'relative'}).append(loadingDiv);
    $('#' + ajaxID).html('Loading...');

    return ajaxID;
}
function hideLoad(ajaxID) {
    $('#'+ajaxID).parent('.ajax-mask').remove();
}


function msgbox(heading, message, okButtonTxt) {

    var confirmModal =
        $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
            '<h4 class="modal-title">' + heading + '</h4>' +
            '</div>' +

            '<div class="modal-body ">' +
            '<h4>' + message + '</h4>' +
            '</div>' +

            '<div class="modal-footer">' +
            '<button type="button"  data-dismiss="modal" class="btn btn-primary">' +
            okButtonTxt +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');

    confirmModal.modal('show');
};

function confirm(heading, question, cancelButtonTxt, okButtonTxt, callback) {

    var confirmModal =
        $('<div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true" style="display: none;">' +
            '<div class="modal-dialog">' +
            '<div class="modal-content">' +
            '<div class="modal-header">' +
            '<button type="button" class="close" data-dismiss="modal" aria-hidden="true">×</button>' +
            '<h4 class="modal-title">' + heading + '</h4>' +
            '</div>' +

            '<div class="modal-body">' +
            '<h4>' + question + '</h4>' +
            '</div>' +

            '<div class="modal-footer">' +
            '<button type="button" class="btn btn-default" data-dismiss="modal">' +
            cancelButtonTxt +
            '</button> ' +
            '<button type="button" id="okButton" class="btn btn-primary">' +
            okButtonTxt +
            '</button>' +
            '</div>' +
            '</div>' +
            '</div>' +
            '</div>');

    confirmModal.modal('show');
    confirmModal.find('#okButton').click(function (event) {
        callback() ? confirmModal.modal('hide') : false;
    });
};
  
  
     
