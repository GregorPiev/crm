<?php
session_start();
$_SESSION["pre_post"] = $_POST;
$_SESSION['userId'] = $_POST["user_id"];

	// Include the WPF request handler
	// It will populate $wpf_iframe_src which we use here to embed the WPF as an IFRAME
	require_once('wpf_handlers/wpf_request.php');
?>
<style type="text/css">
	iframe {
		height: 450px;
		width: 100%;
		border: 0;
	}
	

 .form_container,.form_container_top{
 	display: block;
 	clear: both;
 	float: left;
 	margin-left: 20px;
 }
 
 .form_container_top{
 	margin-left: 320px;
 	margin-bottom: 20px;
 }
</style>
<div id="content">
	<div id="content-header">
		<h1>3D deposit</h1> 
	</div>
	<div class="form_container_top">
		<form action="" METHOD="POST" id="gotodef">
		<input type="hidden" name="Email" value="<?php echo $_POST['Email']?>" />
		<input type="hidden" name="First_Name" value="<?php echo $_POST['First_Name']?>" />
		<input type="hidden" name="Last_Name" value="<?php echo $_POST['Last_Name']?>" />
		<input type="hidden" name="Phone_Number" value="<?php echo $_POST['Phone_Number']?>" />
		<input type="hidden" name="Currency" value="<?php echo $_POST['Currency']?>" />
		<input type="hidden" name="user_id" id="user_id" value="<?php echo $_SESSION['userId']?>" />
		<input type="hidden" name="amount" value="<?php echo $_POST['amount'] ?>" />
		<select class="defrayment_select" id="defrayment_select" name="defrayment_type">
				<option value="">current processor : <?php echo $_POST['processor'] ?></option>
			</select>
		</form>	
	</div>
	<div class="col-md-offset-3 col-md-6 form_container"><iframe id="secondSecureDepositIframe" src="<?php echo $wpf_iframe_src ?>"></iframe></div>
</div>
<script src="../tpl/js/3dsecure/defrayment_select.js"></script>
