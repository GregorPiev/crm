var tinymceHolder;

function hideTranslation(key) {
    $('#row_' + key).animate({
        height: 0,
        opacity : 0
    }, 1000,  function() {           
      $(this).remove();
        viewContent($(".trows:first").attr('id').substring(4));      
    });  
}


function submitTranslation(key) {

  if ($("textarea#editor_" + key).length)         // use this if you are using id to check
    $("textarea#editor_" + key).val(tinyMCE.get('editor_' + key).getContent());
  
  //hideTranslation(key);
  apiRequest('submitTranslation',$('#form-'+key).serialize(),'#form-'+key, function(){
  $.howl ({
			type: 'success'
			, title: 'System Notice'
			, content: 'Translation has been successfully saved.'
			, sticky: false
			, lifetime: 2000
			, iconCls: 'fa fa-check-square-o'
		});
    hideTranslation(key);
    
  });
  
}

function viewContent(key) {

  $('.mce-tinymce').remove();
  $('.btnview').show();

  
  $('.btn_' + key).hide();
  $('.editor_' + key).show(); 
  /*
  tinymce.init({selector:'.editor_'+key,  menubar : false, plugins: [
						"advlist autolink lists link image charmap print preview anchor",
						"searchreplace visualblocks code fullscreen",
						"insertdatetime media table contextmenu paste moxiemanager"
					], toolbar: "insertfile undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image"});
          
    */      
  if (typeof tinymce !== 'undefined')
    tinymce.init({
    selector: '.editor_'+key,
    menubar : false,
    height : 300,
    plugins: [
         "link image preview hr",
         "wordcount code",
         "table directionality paste textcolor"
   ],
   toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview code | forecolor backcolor emoticons" 

 });
 
 
     $('html, body').animate({
        scrollTop: $('#row_' + key).offset().top - 50
    }, 1000);
    
 
}

$(document).ready(function() {
  //tinymce.init({selector:'textarea'});
})