
<div id="content">	
	<link href="../tpl/js/plugins/select2/select2.css" media="screen" rel="stylesheet" type="text/css">
	<link href="../tpl/css/dataTables.bootstrap.css" media="screen" rel="stylesheet" type="text/css">

	<div id="content-header">
		<h1>3D deposit</h1> 
	</div>

	<form action="" name="tddeposit" method="POST" class="parameters-form" id="tddeposit">
		
		
		<div id="content-container">
			
			
			<div class="row" style="margin-bottom: 0;">
				<div class="col-md-offset-3 col-md-6">
		                <span class="col-md-2 text-right">User Id:</span>
		                <div class="col-md-8"><input class="form-control" id="user_id" name="customerId" placeholder="User Id" type="number" required="" data-validation-required-message="This is required" aria-invalid="false"></div>
				</div>
				<div class="col-md-offset-3 col-md-6" style="text-align: center;">
		                OR
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-offset-3 col-md-6">
		                <span class="col-md-2 text-right">User Email:</span>
		                <div class="col-md-8"><input class="form-control" id="email" name="customerEmail" placeholder="Email" type="email"  required="" data-validation-required-message="This is required" aria-invalid="false"></div>
				</div>
			</div>
			<div class="row">
				<div class="col-md-offset-3 col-md-6">
		                <span class="col-md-2 text-right">Amount:</span>
		                <div class="col-md-8"><input class="form-control" id="depositAmount" name="amount" value="500" type="number" required="" data-validation-required-message="This is required" aria-invalid="false"></div>
				</div>
			</div>
			
			<div class="row">
				<div class="col-md-offset-3 col-md-6">
		                <span class="col-md-2 text-right">CC Number:</span>
		                <div class="col-md-8"><input class="form-control" id="cc_number" name="cc_number" value="" placeholder="CC Number Validation" type="cc_number" required="" data-validation-required-message="This is required" aria-invalid="false"></div>
				</div>
			</div>
			
			</div>

			<div class="row">
				<div class="col-md-offset-5 col-md-2 text-center"><input type="button" id="tdsubmit" value="Continue" class="btn btn-secondary"></div>
			</div>

		</div>

	</form>
</div>

	<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.3/jquery.min.js"></script>
	<script src="../tpl/js/libs/bootstrap.min.js"></script>
	<script src="../tpl/js/api.js"></script>
	<script src="../tpl/js/3dsecure/first_step.js"></script>

</body>
</html>
