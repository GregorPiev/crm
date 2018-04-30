
var summary = {
	month:[],
	start:[],
	end:[],
	properties: {daily_3  : 0,
		         daily_4  : 0,
		         daily_6  : 0,
		         daily_8  : 0,
		         daily_10 : 0,
		         daily_12 : 0,
		         daily_15 : 0,
		         manager_all_daily_16 : 0,
		         manager_all_daily_36 : 0,
		         manager_all_daily_41 : 0,
		         manager_all_daily_46 : 0,
		         manager_all_daily_61 : 0,
		         target_weeks: new Float64Array(4),
		         total_days: new Float64Array(31),
		         shifts : []
		          
		        },
	summary_data : [],
	unique_employee : [],
	weeks : [],
	targets: [],
	extras: [],
	weekly_bonus: [],
	transactions: [],
	initiateVariables : function(){
		this.month = $('#dpMonth').val();
  	    this.start = $('#dpStart').val();
  	    this.end = $('#dpEnd').val();
  	    this.transactions = [];
  	    this.summary_data = [];
  	    this.unique_employee = [];
  	    this.weeks = [];
  	    this.targets = [];
  	    this.extras = [];
  	    this.weekly_bonus = [];
	},	        
	getModal: function(){
		$('body').addClass('modal-scroll');
  	    this.initiateVariables();
  	    var modal_body = '<div class="row">'+
                   '<div class="row col-md-10">'+
                   '<form id="summary-form">'+
                   '<div class="col-md-2">'+
                   '<h4>Month</h4>'+
                   '<input class="form-control" value="'+this.month+'" name="dpMonth" onfocus="this.blur();"/>'+
                   '</div>'+
                   '<input type="hidden" value="'+this.start+'" name="dpStart" onfocus="this.blur();"/>'+
                   '<input type="hidden" value="'+this.end+'" name="dpEnd" onfocus="this.blur();"/>'+
                   '<div class="col-md-2">'+
                   '<h4>Desk</h4>'+
                   '<input class="form-control" value="'+$("#desk option:selected").text()+'" onfocus="this.blur();"/>'+
                   '</div>'+
                   '<input type="hidden" value="'+$("#desk").val()+'" name="desk" onfocus="this.blur();"/>'+
				   '</form>'+
				   '<div class="col-md-12"><h4>&nbsp;</h4></div>'+
				   '<div class="col-md-12">'+
				   '<div class=" portlet" id="summary_table_holder">'+
				   '<div class="portlet-header" ><h3><i class="fa fa-table"></i>Summary</h3></div> <!-- /.portlet-header -->'+
				   '<div class="portlet-content">'+
				   '<div class="table-responsive">'+
				   '<table class="table table-striped table-bordered table-hover table-highlight" id="summary_table"></table>'+
				   '</div> <!-- table-responsive -->'+
				   '</div> <!-- portlet-content -->'+
			       '</div> <!-- portlet -->'+
                   '</div> <!-- col-md-8 -->';
				   
		 var summary_modal = bootbox.dialog({
  	           closeButton: false,
  	           title : 'Conversion Summary',
  	           message : modal_body,
  	           buttons : {
  	           success: {
  	 	          label: "OK",
                  className: "btn-success",
                  callback: function() {
                     $('body').removeClass('modal-scroll');	  		
  	              }
  	          }
         }});
         $(summary_modal[0]).attr("id","summary_modal");
         $("#summary_modal .modal-dialog").addClass("modal-xxlarge");
         this.isManager();		   
	},
	isManager: function(){
		 var that = this;
		 apiRequest('getConversionShiftManagers',$('#summary-form').serialize(),'#summary_table_holder',function(data){
		 	  $.each(data, function(key,row){
		 	     that.summary_data.push({ employeeId      : row.employeeId, 
		 	     	                      employeeName    : row.employee,
		 	     	                      inventivaId     : 0,
		 	     	                      sales_variables : JSON.parse(JSON.stringify(that.properties)),
		 	     	                      position        : 'Manager'
		 	     	                      });
		 	     that.unique_employee[row.employeeId]=1;
		 	                           	
		 	  });
		 	  that.getShiftFTDsForConversion();
		 	  
		 	  
		 });
	},
	getShiftFTDsForConversion: function(){
		var that = this;
		var manager_all_daily_16_bonus;
        var manager_all_daily_36_bonus;
        var manager_all_daily_41_bonus;
        var manager_all_daily_46_bonus;
        var manager_all_daily_61_bonus;
        
		apiRequest('getShiftFTDsForConversion',$('#summary-form').serialize(),'#summary_table_holder',function(shift_data){
			$.each(shift_data , function(key,shift){
			   $.each(that.summary_data, function(summary_key,employee){
			       if(employee.employeeId == shift.employeeId){
			       	   (that.summary_data[summary_key].sales_variables.shifts).push(shift);
			       	   return false; 
			       }	
			   });
			   	
			});
			$.each(that.summary_data, function(summary_key,employee){
				
				$.each(employee.sales_variables.shifts, function(shift_key,shift){
					
					if(shift.ftds>=61)
					   that.summary_data[summary_key].sales_variables.manager_all_daily_61++;
					else if(shift.ftds>=46)
					   that.summary_data[summary_key].sales_variables.manager_all_daily_46++;   
					else if(shift.ftds>=41)
					   that.summary_data[summary_key].sales_variables.manager_all_daily_41++;
					else if(shift.ftds>=36)
					   that.summary_data[summary_key].sales_variables.manager_all_daily_36++;
				    else if(shift.ftds>=16)
					   that.summary_data[summary_key].sales_variables.manager_all_daily_16++;     
				});

            manager_all_daily_16_bonus = that.summary_data[summary_key].sales_variables.manager_all_daily_16 * 300;
            manager_all_daily_36_bonus = that.summary_data[summary_key].sales_variables.manager_all_daily_36 * 600;
            manager_all_daily_41_bonus = that.summary_data[summary_key].sales_variables.manager_all_daily_41 * 900;
            manager_all_daily_46_bonus = that.summary_data[summary_key].sales_variables.manager_all_daily_46 * 1500;
            manager_all_daily_61_bonus = that.summary_data[summary_key].sales_variables.manager_all_daily_61 * 3000;
            
            that.summary_data[summary_key].manager_all_daily_total = manager_all_daily_16_bonus + manager_all_daily_36_bonus + manager_all_daily_41_bonus + manager_all_daily_46_bonus + manager_all_daily_61_bonus;
			});
           
			that.getConversionWeeks();
		});
	},
	getConversionWeeks: function(){
		var that = this;
		apiRequest('getConversionWeeks',$('#summary-form').serialize(),'#summary_table_holder',function(data){
	    if(data.length!=4){
	    	bootbox.alert('<h4>Please set the weeks</h4>');
	    }else{
	    	that.weeks =  JSON.parse(JSON.stringify(data));
	    	that.getTransactions();
	    }
	    
	  });
	},
	getTransactions: function(){
		var that = this;
		var unique = [];
		var transactions_wd = [];
		apiRequest('getTransactionsForConversion',$('#summary-form').serialize(),'#summary_table_holder',function(data){
			$.each(data,function(key,row){
      	       for(var j=0;j<4;j++){
      		      if(new Date(row.confirmTime).format('yyyy-MM-dd')<=that.weeks[j].lastDayofWeek){
      			      data[key].week=that.weeks[j].week;
      			      break;
      		       }
      	       }
      	    /*   if(unique[row.customerId]==1 && row.type!="Duplicated"){
       	 	       return true;
       	       }
       	       transactions_wd.push(row);
       	       unique[row.customerId]=1; */
       	       if(typeof that.unique_employee[row.employeeId]== 'undefined'){
               	   that.summary_data.push({ employeeId              : row.employeeId, 
		 	     	                        employeeName            : row.employee,
		 	     	                        inventivaId             : 0,
		 	     	                        sales_variables         : JSON.parse(JSON.stringify(that.properties)),
		 	     	                        position                : 'Regular',
		 	     	                        manager_all_daily_total : 0
		 	     	                      });
		 	     
               }
               that.unique_employee[row.employeeId]=1;	 
            });
            that.transactions = JSON.parse(JSON.stringify(data));
            that.getInventivaIds();
		});
	},
	getInventivaIds: function(){
		var that = this;
		var employeeIds = [];
		$.each(that.summary_data,function(key,employee){
		   employeeIds.push(employee.employeeId); 	
		});
		post_data = {employeeIds : JSON.stringify(employeeIds)};
		
		apiRequest('getInventivaIds',post_data,'#summary_table_holder',function(data){
			$.each(that.summary_data,function(key,employee){
				$.each(data,function(in_key,in_value){
					if(employee.employeeId == in_value.real_spotId){
					   that.summary_data[key].inventivaId = in_value.inventivaId;
					   return false;
					}   
				});
			});
			that.getTargets();
		}); 
	},
	getTargets: function(){
	    var that = this;
	    apiRequest('getTargetsForConversion',$('#summary-form').serialize(),'#summary_table_holder',function(data){
	    	
	    	that.targets = JSON.parse(JSON.stringify(data));
	    	that.getExtraBonus();
	    }); 	
	},
	getExtraBonus: function(){
		var that = this;
		apiRequest('getExtraForConversion',$('#summary-form').serialize(),'#summary_table_holder',function(data){
			that.extras = JSON.parse(JSON.stringify(data));
			that.getWeeklyBonus();
		});
	},
	getWeeklyBonus: function(){
		var that = this;
		apiRequest('getWeeklyBonusForConversion',$('#summary-form').serialize(),'#summary_table_holder',function(data){
			that.weekly_bonus = JSON.parse(JSON.stringify(data));
			that.bonusCalculations();
	    	
		});
	},
	bonusCalculations: function(){
		var that = this;
		var unique =[];
		var today=new Date().format('yyyy-MM')== that.month ? new Date().format('yyyy-MM-dd') : that.end;
		var flat_bonus;
        var daily_3_bonus;
        var daily_4_bonus;
        var daily_6_bonus;
        var daily_8_bonus;
        var daily_10_bonus;
        var daily_12_bonus;
        var daily_15_bonus;
        
		$.each(that.summary_data, function(key,employee){
	    		
	    		for(var i=0;i<4;i++){
  	       	        $.each(that.targets,function(target_key,target_row){
  	       		       if(target_row.week==i+1 && target_row.employeeId==employee.employeeId){
  	       			      that.summary_data[key].sales_variables.target_weeks[i]=parseFloat(target_row.target);
  	       			      
  	       		       }
  	       	        });
  	             }
  	             
  	             that.summary_data[key].weekly_bonus = 0;
  	             $.each(that.weekly_bonus, function(bonus_key,bonus_row){
  	             	if(employee.employeeId == bonus_row.employeeId)
  	             	  that.summary_data[key].weekly_bonus += parseFloat(bonus_row.amount);
  	             });
  	             
  	             that.summary_data[key].extra_bonus = 0;
  	             $.each(that.extras, function(extra_key,extra_row){
  	             	if(employee.employeeId == extra_row.employeeId)
  	             	  that.summary_data[key].extra_bonus += parseFloat(extra_row.amount);
  	             });
  	             
  	             for(var i=0;i<4;i++){
  	             	that.summary_data[key]['week_'+(i+1)] = 0;
  	             }
  	             
  	             that.summary_data[key].today_ftds = 0;
  	             that.summary_data[key].today_deposits = 0;
  	             that.summary_data[key].total_ftds = 0;
  	             that.summary_data[key].total_deposits = 0;
  	             unique = [];
  	             $.each(that.transactions,function(tr_key,transaction){
  	                if(employee.employeeId == transaction.employeeId){
  	             		that.summary_data[key].total_deposits += parseFloat(transaction.amountUSD);
       	                that.summary_data[key].today_deposits += new Date(transaction.confirmTime).format("yyyy-MM-dd") == today ? parseFloat(transaction.amountUSD) : 0;
  	             	}
  	             	if(typeof unique[transaction.customerId] == 'undefined') unique[transaction.customerId]=[];
  	             	if(unique[transaction.customerId][transaction.employeeId]==1 && transaction.type!="Duplicated"){ //checking the duplication of customer; since deposit calculation require non-duplicate, the calculation done before elimination of duplication 
       	 	           return true;
       	            }
       	            
       	            unique[transaction.customerId][transaction.employeeId]=1;
       	             
  	             	if(employee.employeeId == transaction.employeeId){
  	             		that.summary_data[key].today_ftds += (new Date(transaction.confirmTime).format("yyyy-MM-dd") == today && transaction.assign!='Deleted') ? 1 : 0;
      	                that.summary_data[key].total_ftds += transaction.assign!='Deleted' ? 1 : 0;
      	                
      	                for(var i=0;i<4;i++){
      		                 that.summary_data[key]['week_'+(i+1)] += transaction.week==i+1 && transaction.assign!='Deleted' ? 1 : 0;
      	                }
      	                for(var i=0;i<31;i++){	
      		                 that.summary_data[key].sales_variables.total_days[i] += new Date(transaction.confirmTime).format('d')==i+1 && transaction.assign!='Deleted' ? 1 :0;
      	                }   
      	                
  	             	}
  	             });
  	             
  	             for(var i=0;i<31;i++){
      	            if(that.month>='2016-05'){ 
      		           if(that.summary_data[key].sales_variables.total_days[i]>=15)
      			           that.summary_data[key].sales_variables.daily_15++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=12)
      			           that.summary_data[key].sales_variables.daily_12++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=10)
      			           that.summary_data[key].sales_variables.daily_10++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=8)
      			           that.summary_data[key].sales_variables.daily_8++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=6)
      			           that.summary_data[key].sales_variables.daily_6++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=4)
      			           that.summary_data[key].sales_variables.daily_4++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]==3)
      			           that.summary_data[key].sales_variables.daily_3++;
      		      
      	            }else{
      		           if(that.summary_data[key].sales_variables.total_days[i]>=10)
      			          that.summary_data[key].sales_variables.daily_10++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=8)
      			          that.summary_data[key].sales_variables.daily_8++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=6)
      			          that.summary_data[key].sales_variables.daily_6++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]>=4)
      			          that.summary_data[key].sales_variables.daily_4++;
      		           else if(that.summary_data[key].sales_variables.total_days[i]==3)
      			          that.summary_data[key].sales_variables.daily_3++;
      		        }
      	   
                }
                
                flat_bonus = that.summary_data[key].total_ftds*79;
                daily_3_bonus = that.summary_data[key].sales_variables.daily_3*100;
                daily_4_bonus = that.summary_data[key].sales_variables.daily_4*200;
                daily_6_bonus = that.summary_data[key].sales_variables.daily_6*500;
                daily_8_bonus = that.summary_data[key].sales_variables.daily_8*1000;
                daily_10_bonus = that.summary_data[key].sales_variables.daily_10*2000;
                daily_12_bonus = that.summary_data[key].sales_variables.daily_12*3000;
                daily_15_bonus = that.summary_data[key].sales_variables.daily_15*4000; 
                that.summary_data[key].daily_total = flat_bonus+daily_3_bonus+daily_4_bonus+daily_6_bonus+daily_8_bonus+daily_10_bonus+daily_12_bonus+daily_15_bonus;
  	             
  	            that.summary_data[key].goal_bonus = 0;
  	            
  	            for(var i=0;i<4;i++){
  	            	if(that.summary_data[key].sales_variables.target_weeks[i]!=0 && that.summary_data[key]['week_'+(i+1)]>=that.summary_data[key].sales_variables.target_weeks[i])
  	            	   that.summary_data[key].goal_bonus += 300;
  	            	  
  	            }
  	            
  	            that.summary_data[key].total_bonus = that.summary_data[key].daily_total +  that.summary_data[key].manager_all_daily_total + that.summary_data[key].weekly_bonus + that.summary_data[key].goal_bonus + that.summary_data[key].extra_bonus; 
  	             
  	              
  	    that.summary_data[key].total_deposits = parseFloat(that.summary_data[key].total_deposits).toFixed(2);
	    that.summary_data[key].today_deposits = parseFloat(that.summary_data[key].today_deposits).toFixed(2);
	            
	    });
	    console.log(that.summary_data);
	    
	    
	    $('#summary_table').dataTable( {
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
           'iDisplayLength': 100,
           "scrollCollapse": false,
           "aaData": that.summary_data,
           "dom": '<"toolbar">frtip',
           "aaSorting": [[ 1, "asc" ]],                    
           "aoColumns": [
            { "mData": "inventivaId", "sTitle": "InventivaId"},
            { "mData": "employeeId", "sTitle": "EmployeeId"},            
            { "mData": "employeeName", "sTitle": "Employee Name"},
            { "mData": "position", "sTitle": "Position"},
            { "mData": "week_1", "sTitle": "Week 1"},
            { "mData": "week_2", "sTitle": "Week 2"},
            { "mData": "week_3", "sTitle": "Week 3"},
            { "mData": "week_4", "sTitle": "Week 4"},
            { "mData": "today_deposits", "sTitle": "Today Deposits"},
            { "mData": "today_ftds", "sTitle": "Today FTDs"},
            { "mData": "total_deposits", "sTitle": "Total Deposits"},
            { "mData": "total_ftds", "sTitle": "Total FTDs"},
            { "mData": "daily_total", "sTitle": "Daily Bonus","sType": "numeric"},
            { "mData": "manager_all_daily_total", "sTitle": "Manager Bonus","sType": "numeric"},
            { "mData": "weekly_bonus", "sTitle": "Weekly Bonus","sType": "numeric"},
            { "mData": "goal_bonus", "sTitle": "Goal Bonus","sType": "numeric"},
            { "mData": "extra_bonus", "sTitle": "Extra Bonus","sType": "numeric"},
            { "mData": "total_bonus", "sTitle": "Total Bonus","sType": "numeric"}
            ]
           });
            
		
	}  
	
};
 
