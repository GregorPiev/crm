
$(document).ready(function () {
    getUser(true);
    $("#callBack").css('color', '#f00');
});

function getUser(flagProcess) {
    if(flagProcess){
       $('#users').html('');
    }else{
       $('#users').dataTable().fnDestroy();
    }   
    apiRequest('getUsers', '', '#users', function (data_user) {
        
        $('#users').dataTable({
            "sDom": 'T<"clear">lfrtip',
            "oTableTools": {
                "aButtons": [
                    {
                        "sExtends": "select", "sButtonText": "Add User",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            $("#changeForm").show(function(){ removeErrorMarks();});
                            $("#changeForm #id").val(0);
                            $("h6").show();
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
                            removeErrorMarks();
                            $("#changeForm").hide(function(){ });
                            $('#changeForm')[0].reset();
                            $("h6").hide();
                            $(".error").remove();


                        }
                    },
                    {
                        "sExtends": "select", "sButtonText": "Add",
                        "fnClick": function (nButton, oConfig, oFlash) {
                            insertNewUser();
                        }
                    },

                    {
                        "sExtends": "select", "sButtonText": "Update",
                        "fnClick": function (nButton, oConfig, oFlash) {
                                UpdateUser();
                        }
                    }
                ]
            },            
            "bDestroy": true,
            "bRetrieve":true,
            "bAutoWidth": false,
            "bLengthChange": true,
            "aaData": data_user,
            "aaSorting": [[0, "desc"]],
            "aoColumns": [
                {"mData": "id", "sTitle": "ID", "sType": "numeric"},
                {"mData": "username", "sTitle": "USERNAME"},
                {"mData": "fullname", "sTitle": "FULL NAME"},               
                {"mData": "email", "sTitle": "EMAIL"},
                {"mData": "brandNames", "sTitle": "Brands", "sClass": "columnX2",
                 "fnRender":function(oObj){
                    var strBrands='';                    
                    if(oObj.aData.brandNames!=null){
                        var arrBrands =  oObj.aData.brandNames.split(",");     
                        $.each(arrBrands,function(itr, item){
                             if(itr===0){
                                strBrands +=doCapital(item);
                             }else{
                                strBrands +=", " + doCapital(item);
                             }
                        });
                    }
                    return strBrands;
                 }
                },
                {"mData": "userStatus", "sTitle": "User Status"},                
                {"mData": null, "sTitle": "EDIT", "bUseRendered":false, 
                 "fnRender": function(oObj){                		
                		    return  '<i id="' + oObj.aData.id + '" class="fa fa-pencil-square-o edit cursor-custom" onclick=\'editForm(' + JSON.stringify(oObj.aData) + ')\';></i>';
                 }  	
                }
                ]
        });
        changeForm();
        
    });
}


function changeForm(){
    apiRequest('getEditableUserColumns', '', '',function (data_fields) {
        
        $('div.portlet-content').prepend('<form id="changeForm"><h6>* all fields are required</h6></form>');
        $('#changeForm').append("<div id='upperLine'></div>");
        $('#changeForm').append("<div id='bottomLine'></div>");        
        var total_fields = 1;
        $('#upperLine').append('<input type="hidden" name="type" id="type"/><input type="hidden" name="id" id="id"/>' );
          
          var input_array=[];
          var select_array=[];
          var merge_fields = [];
          
          $.each(data_fields,function(){   
              if(this.TYPE==='INPUT' && this.COLUMN_NAME!=='id'){
                  input_array.push(this);
              }else{
                  select_array.push(this);
              }              
          });
          merge_fields = input_array.concat(select_array);

           $.each(merge_fields,function(){                
                var text= (this.TYPE==='INPUT' && this.COLUMN_NAME!=='id') ? true : false;
                var select= (this.TYPE==='SELECT') ? true : false;
                var select2= (this.TYPE==='SELECT2') ? true : false;
                  
                var fieldsLable = this.TITLE;
                if(total_fields == 1)
                    $('#upperLine').append('<div class="row">');
                if (text) {                    
                    $('#upperLine').append('<div class="col-md-3"><label name="'+fieldsLable+'" for="'+fieldsLable+'">' + fieldsLable + '</label>'+
                                           '<input type="text" placeholder="'+fieldsLable+'" name="' + this.COLUMN_NAME + '" data-label="'+fieldsLable+'" autocomplete="off" id="' + this.COLUMN_NAME.replace(" ", "") + '"'+
                                           ' class="form-control middle input_check" onblur="this.value =this.value.trim()" />'+
                                           '<div class="errorField" id="error_' + this.COLUMN_NAME.replace(" ", "") + '"></div>');
                    total_fields++;                       
                                           
                }else if(select){
                    var htmlSelect ='<div class="col-md-3"><label name="'+fieldsLable+'" for="'+fieldsLable+'">'+fieldsLable+'</label>'+
                                    '<select name="'+this.COLUMN_NAME.replace(" ","")+'"  id="'+this.COLUMN_NAME.replace(" ","")+'" class="form-control middle">';
                    $.each(this.OPTIONS,function(ind,item){
                        htmlSelect +='<option value="'+item.value+'">'+item.text+'</option>';
                    });
                    htmlSelect +='</select></div>';                        
                    $('#upperLine').append(htmlSelect);
                    total_fields++;
                    
                }else if(select2){
                    var htmlSelect ='<div class="col-md-3"><label name="'+fieldsLable+'" for="'+fieldsLable+'">'+fieldsLable+'</label>'+
                                    '<select name="'+this.COLUMN_NAME.replace(" ","")+'[]" multiple="multiple"  id="'+this.COLUMN_NAME.replace(" ","")+'" class="form-control middle">';
                   
                   $.each(this.OPTIONS,function(ind,item){
                        htmlSelect +='<option value="'+item.value+'">'+item.text+'</option>';
                    });
                    htmlSelect +='</select></div>';                        
                    $('#upperLine').append(htmlSelect);
                    
                    $("#"+this.COLUMN_NAME.replace(" ","")+"").select2( {
                            placeholder: "Select "+fieldsLable+"",
                            allowClear: true,
                            width: "100%"
                     });
                     
                     total_fields++;
                    
                }
                if((total_fields-1) == 4){
                	$('#upperLine').append('</div>');
                	total_fields = 1;
                }
        });
        
        $('#upperLine').append('<br/><br/>');
    });
}

function insertNewUser() {
    $('#action_notifications').html('');
    if(!testValues())
         return false;
    $("#ToolTables_users_3").addClass('disabled');
    removeErrorMarks();
    $('#type').val('add');
    
    apiRequest('changeUser', $("#changeForm").serialize(), '#users',function (data) {
        
        if(data.status=='success') {         
            var title = ('User "'+data.username+ '" was successfully created!');
            displayToolTip('success',title,'',function(){
                 $('#changeForm')[0].reset();
                 $("#changeForm").remove();
                 getUser();
            });
            $("#ToolTables_users_3").removeClass('disabled');
            
        }else{
            $('#action_notifications').text(data.error_message);
            $("#ToolTables_users_3").removeClass('disabled');
        }
    });
}

function editForm(user_data) {
    removeErrorMarks();
    $("#ToolTables_users_3").show();
    $("#ToolTables_users_1").show();
    $('#callBack').hide();
    $("h6").show();

    $("#changeForm").show(function () {
        $("#ToolTables_users_0").hide();
        $("#ToolTables_users_2").hide();
        $.each(user_data, function (index, value) {
            if(index == "brands"){
                if(value!=null){
                        var arrValue =value.split(','); 
                        if(arrValue.length>1){                            
                                $("#" + index).select2('val',arrValue ,true);                           
                        }else{
                            $("#" + index).select2('val',value ,true);
                        }
                    }else{                                            
                         $("#" + index).select2('data',null);
                    }        
            }else{
                  $("#" + index).val(value);
            }
        });
        $('#type').val('edit');
         
    });
}

function UpdateUser() {
	$('#action_notifications').html('');
    if(!testValues())
         return false;
    $("#ToolTables_users_3").addClass('disabled');
    removeErrorMarks();
    
    apiRequest('changeUser', $("#changeForm").serialize(), '#users',function (data) {
        if(data.status=='success') {         
            var title = ('User "'+data.username+ '" was successfully updated!');
            displayToolTip('success',title,'',function(){
                 $('#changeForm')[0].reset();
                 $("#changeForm").remove();
                 getUser();
            });
            $("#ToolTables_users_3").removeClass('disabled');
            
        }else{
            $('#action_notifications').text(data.error_message);
            $("#ToolTables_users_3").removeClass('disabled');
        }
    });
}

function displayToolTip(type,text,action,cbFunction){
	setTimeout(function(){
		         
		$('.tooltip').stop( true, true )
		             .attr('class','tooltip')
                     .addClass('tooltip-'+type)
                     .html('<i class="fa fa-'+(type=="success" ? 'check' : 'times')+'" aria-hidden="true"></i>&nbsp; '+(text+(type=="success" ? ' ': ' NOT '))+action)
                     .css({opacity:1})
                     .animate({opacity:0},5000);
        if(cbFunction) cbFunction();  
     },300);
}
function testValues(){ 
    $('#callBack').hide();
    var rePasw =new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,35}$/);
    var regCharach = new RegExp(/^[^0-9]{0,50}$/);
    var reEmail = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    var flag1=true;     
    var maxTop=0;
    var currentTop =0;
    
    if($('#username').val()=='' || !regCharach.test($('#username').val())){
       html='<h5 class="error">Insert at least 3 ,no more then 50 characters and non numeric </h5>';
       $('#error_username').html(html);
       $('#username').addClass('red-border');
       $('#error_username').focus();
       currentTop =parseInt($("#username").offset().top);             
        
       if(maxTop==0 &&  maxTop<currentTop){ 
           $('html, body').animate({scrollTop: currentTop}, 600);
            maxTop=currentTop;
       }   
       flag1 = false;
    }else{
       $('#username').removeClass('red-border');
       $('#error_username').html('');
    }

    if(($('#fullname').val()=='' || $('#fullname').val().length>50)){
       html='<h5 class="error">Insert at least 1 and no more then 50 characters</h5>';
       $('#error_fullname').html(html);
       $('#fullname').addClass('red-border');
       $('#error_fullname').focus();  
       currentTop =parseInt($("#fullname").offset().top);
        
       if(maxTop==0 &&  maxTop<currentTop){ 
            $('html, body').animate({scrollTop: currentTop}, 600);
            maxTop=currentTop;
       }        
       flag1 = false;
    }else{
       $('#fullname').removeClass('red-border');
       $('#error_fullname').html('');
    }
                            
    if(($('#password').val()=='' || !rePasw.test($('#password').val()))){
       html='<h5 class="error"> Password must be between 8 to 35 characters, and must include at least one upper case letter, one lower case letter, and one numeric digit.</h5>';
       $('#error_password').html(html);
       $('#password').addClass('red-border');
       $('#error_password').focus(); 
       currentTop =parseInt($("#password").offset().top);        
    
       if(maxTop==0 &&  maxTop<currentTop){ 
              $('html, body').animate({scrollTop: currentTop}, 600);
              maxTop=currentTop;
       }     
       flag1 = false;
    }else{
       $('#password').removeClass('red-border');
       $('#error_password').html('');
    }
                    
    if(($('#email').val()=='' || !reEmail.test($('#email').val()))){
       html='<h5 class="error">Please Type valid email</h5>';
       $('#error_email').html(html);
       $('#email').addClass('red-border');
        $('#error_email').focus();     
        currentTop =parseInt($("#email").offset().top);       
        
        if(maxTop==0 &&  maxTop<currentTop){ 
             $('html, body').animate({scrollTop: currentTop}, 600);
             maxTop=currentTop;
        }    
             
       flag1 = false;
    }else{
       $('#email').removeClass('red-border');
       $('#error_email').html('');
    }
    
    var reUID = new RegExp(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
    console.log($('#vincicmId').val());
    if($('#vincicmId').val()=='' || ($('#vincicmId').val()!=='0' && !reUID.test($('#vincicmId').val()))){
       html='<h5 class="error">Please Type valid VincicmId</h5>';
       $('#error_vincicmId').html(html);
       $('#vincicmId').addClass('red-border');
       $('#error_vincicmId').focus();     
       currentTop =parseInt($("#vincicmId").offset().top);       
        
       if(maxTop==0 &&  maxTop<currentTop){ 
            $('html, body').animate({scrollTop: currentTop}, 600);
             maxTop=currentTop;
       }   
       flag1 = false;
    }else{
       $('#vincicmId').removeClass('red-border');
       $('#error_vincicmId').html('');
    }
    
    if($('#rtcId').val()=='' || ($('#rtcId').val()!=='0' && !reUID.test($('#rtcId').val()))){
       html='<h5 class="error">Please Type valid RtcId</h5>';
       $('#error_rtcId').html(html);
       $('#rtcId').addClass('red-border');
       $('#error_rtcId').focus();
       currentTop =parseInt($("#rtcId").offset().top);       
       
       if(maxTop==0 &&  maxTop<currentTop){ 
           $('html, body').animate({scrollTop: currentTop}, 600);
           maxTop=currentTop;
       }   
       flag1 = false;
    }else{
       $('#rtcId').removeClass('red-border');
       $('#error_rtcId').html('');
    }
    var id_fields = ['spotId','real_spotId','inventivaId'];
    var regId = new RegExp(/^[0-9]{1,11}$/);
    $.each(id_fields,function(){
    	var dom = '#'+this;
    	var error_dom = '#error_'+this;
    	console.log(dom+' '+error_dom); 
    	if($(dom).val()=='' || !regId.test($(dom).val())){
    		html='<h5 class="error">Please Type valid '+$(dom).attr('data-label')+'</h5>';
            $(error_dom).html(html);
            $(dom).addClass('red-border');
            $(error_dom).focus();
            currentTop =parseInt($(dom).offset().top);       
            if(maxTop==0 &&  maxTop<currentTop){ 
                $('html, body').animate({scrollTop: currentTop}, 600);
                maxTop=currentTop;
            }
            flag1 = false;
    	}else{
            $(dom).removeClass('red-border');
            $(error_dom).html('');
        }
    	
    });
    
    return flag1;
}
$(document).on('keyup paste change','.input_check',function(){    
     var id = $(this).attr('id'); 
     $(this).removeClass('red-border');
     $('#error_'+id).html('');
});


function removeErrorMarks(){
    $('div.errorField').html('');
    $('.middle').removeClass('red-border');
    $('#action_notifications').html('');
}



	
