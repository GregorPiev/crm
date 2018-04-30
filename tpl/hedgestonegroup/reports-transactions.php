<style>
	#clearings {
		margin-top: 10px !important;
		margin-bottom: 20px !important;
		margin-left: 10px !important;
		margin-right: 10px !important;
	}
</style>

<div id="content">		

	<div id="content-header">
		<h1>Reports</h1>
	</div> <!-- #content-header -->	


	<div id="content-container">







		<div class="row">

				<div class="wid col-md-10">
	
					<div class="row">
						<form id="range-form">
	
							<div class="portlet">
								<div class="col-md-2">
									<h4>Start Date</h4>    
									<input class="form-control" type="text" placeholder="Start date" name="dpStart" id="dpStart" data-date-format="yyyy-mm-dd" data-date-autoclose="true">
	
								</div>
	
								<div class="col-md-2">
									<h4>End Date</h4>
									<input class="form-control" type="text" placeholder="End date" name="dpEnd" id="dpEnd" data-date-format="yyyy-mm-dd" data-date-autoclose="true">
								</div>
								<div class="col-md-2">
									<h4>Range</h4>
									<div class="btn-group">
										<button type="button" class="btn btn-default dropdown-toggle range" data-toggle="dropdown">
											Select Range <span class="caret"></span>
										</button>
										<ul class="dropdown-menu" role="menu">
											<li><a href="javascript:selectRange(7);">Last 7 days</a></li>
											<li><a href="javascript:selectRange(30);">Last 30 days</a></li>
											<li><a href="javascript:selectRange(90);">Last 90 days</a></li>
											<li class="divider"></li>							    
											{loop="ranges"}
											<li>
												<a href="javascript:selectRange('{$value.value}');">
													{$value.text}
												</a>
											</li>
											{/loop}
	
										</ul>
									</div>
	
	
	
								</div>
	                     </div>
								<div class="col-md-1">
			                        <h4>Affiliate</h4>
			                        <select id="affiliate" name="affiliate" class="form-control">
										<option value="0" >All</option>
			                            {loop="affGroups"}
				                            <option value="{$value.id}" > {$value.gname}</option>                                                           
			                  			{/loop}
						            </select>
			                    </div >
	
								<div class="col-md-2">
								  <h4>Desk</h4>
								     <select id="currentdesk" name="currentdesk"  class="form-control">
										<option value="0" >All</option>
									</select> 
	
								</div >
	
	                            <div class="col-md-3">
	                            <!-- <h4>Transaction Employee</h4>
	                            <select id="transactionemployee" name="transactionemployee" class="form-control">
	                                               <option value="0" >All</option>
	                                     </select> -->
	                            <h4>Employee</h4>
	                            <select id="currentemployee" name="currentemployee" class="form-control">
	                                               <option value="0" >All</option>
	                                     </select>   
								
	
							</div>
							<div class="col-md-2">
								<h4>&nbsp;</h4>
								<label class="checkbox-inline">
									<input type="checkbox" name="retention" id="retention"  > Retention only
								</label>
							</div>
							
							<div class="col-md-2">
								<h4>&nbsp;</h4>
								<label class="checkbox-inline">
									<input type="checkbox" name="extendTransactions" id="extendTransactions"  > Extend transactions
								</label>
							</div>
	
	
	
						</form>
					</div>
					
					<div class="row">
						<div class="col-md-12">
							<div class="list-group col-md-2">  
				
								<a href="javascript:;" class="list-group-item "><h3 class="pull-right"><i class="fa fa-dollar"></i></h3>
									<h4 class="list-group-item-heading" id="total_deposits">-</h4>
									<p class="list-group-item-text">Total Deposits</p>
				
								</a>
				
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3>
									<h4 class="list-group-item-heading" id="total_deposits_ftd">-</h4>
									<p class="list-group-item-text">Total Deposits (FTDs Only)</p>
				
								</a>
							</div>
							<div class="list-group col-md-2">
				
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-dollar"></i></h3>
									<h4 class="list-group-item-heading" id="total_ftds">-</h4>
									<p class="list-group-item-text">Total FTD's</p>
				
								</a>
				
				
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-gift"></i></h3>
									<h4 class="list-group-item-heading" id="total_bonuses">-</h4>
									<p class="list-group-item-text">Total Deposits by Bonuses</p>
				
								</a>
							</div>
							<div class="list-group col-md-2">	
				
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-frown-o"></i></h3>
									<h4 class="list-group-item-heading" id="total_withdrawals">-</h4>
									<p class="list-group-item-text">Total Withdrawals</p>
				
								</a>
				
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-frown-o"></i></h3>
									<h4 class="list-group-item-heading" id="total_bonuses_w">-</h4>
									<p class="list-group-item-text">Total Withdrawals from Bonuses</p>
				
								</a>
							</div>
							<div class="list-group col-md-2">
								
								<a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-meh-o"></i></h3>
									<h4 class="list-group-item-heading" id="total_chargebacks">-</h4>
									<p class="list-group-item-text">Total Chargebacks</p>
				
								</a>
				        
						        <a href="javascript:;" class="list-group-item"><h3 class="pull-right"><i class="fa fa-exclamation"></i></h3>
						          <h4 class="list-group-item-heading" id="total_fees">-</h4>
						          <p class="list-group-item-text">Total Fees</p>
						
						        </a>
							</div>
							<div class="col-md-2">
								<div class="btn-group" style="width: 100%;">
									<button type="button" class="btn btn-default dropdown-toggle range" data-toggle="dropdown" style="width: 100%;" >
										Breakdown by Clearing <span class="caret"></span>
									</button>
									<ul class="dropdown-menu" role="menu">
										<h4 class="list-group-item-heading " id="clearings"></h4>
										</ul>
								</div>
							</div>
							
							<!-- <div class="list-group col-md-2">
				        <a href="javascript:;" class="list-group-item"><h3 class="pull-right"></h3>				          
				          <p class="list-group-item-text" id="breakdown">Breakdown by Clearing <span class="caret"></span></p>
				          
				        </a>
							</div> -->
						</div>
				


	</div> <!-- /.row -->

	
	
					<div class="portlet" id="transactions_table_holder">
	
						<div class="portlet-header" >
	
							<h3>
								<i class="fa fa-table"></i>
								Transactions
							</h3>
	
						</div> <!-- /.portlet-header -->
	
						<div class="portlet-content">						
	
	
	
							<div class="table-responsive">
	
								<table 
								class="table table-striped table-bordered table-hover table-highlight"  
								data-display-rows="10"
								data-info="true"
								data-search="true"
								data-length-change="true"
								data-paginate="true"
								id="transactions_table"
								>
	
							</table>
						</div> <!-- /.table-responsive -->
	
	
					</div> <!-- /.portlet-content -->
	
				</div> <!-- /.portlet -->
	
	
	
	
	
	
	
				
	
	
	
			</div> <!-- /.col-md-9 -->
		</div>
		
</div> <!-- /#content-container -->


</div> <!-- #content -->	







<script src="{$GLOBALS.theme_path}js/plugins/datepicker/bootstrap-datepicker.js"></script>
<script src="{$GLOBALS.theme_path}js/reports.js"></script>
