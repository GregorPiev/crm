Date.prototype.format = function(format) //author: meizz
{
  
  var o = {
    "M+" : this.getMonth()+1, //month
    "d+" : this.getDate(),    //day
    "h+" : this.getHours(),   //hour
    "m+" : this.getMinutes(), //minute
    "s+" : this.getSeconds(), //second
    "q+" : Math.floor((this.getMonth()+3)/3),  //quarter
    "S" : this.getMilliseconds() //millisecond
  };
  


  if(/(y+)/.test(format)) format=format.replace(RegExp.$1,
    (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  for(var k in o)if(new RegExp("("+ k +")").test(format))
    format = format.replace(RegExp.$1,
      RegExp.$1.length==1 ? o[k] :
        ("00"+ o[k]).substr((""+ o[k]).length));
  return format;
};

function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
  
    $('#fdEnd').val(endDate.format("yyyy-MM-dd"));
    $('#fdStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#fdEnd').val(endDate.format("yyyy-MM-dd"));
  $('#fdStart').val(startDate.format("yyyy-MM-dd"));
    
  }
}

var global_data=[];

$(document).ready(function(){
  $('#fdStart,#fdEnd').val(new Date().format('yyyy-MM-dd'));
  $('#fdStart,#fdEnd').datepicker();
  $("#desk").select2( {
   	  placeholder: "Select Desks or leave blank for all",
      allowClear: true,
      width: "100%"
     
   });
  getDesk(); 
   	
  $("#campaign_chart_header")[0].onclick=function(){
   	
   	if($("#campaign_table_div").css("display")=="block"){
   	  $("#campaign_table_div").hide("drop",500);	
   	  $("#campaign_chart_div").hide("drop",500,function(){
   	  	$("#campaign_chart_div").removeClass("col-md-8",300,function(){
   	  	  $("#campaign_chart_div").addClass("col-md-12",300,function(){	
   		  $("#campaign_chart_div").show("drop",500);
   		  }); 
   	     });	
   		});  	
   	}else{
   		$("#campaign_chart_div").hide("drop",500,function(){
   		$("#campaign_chart_div").addClass("col-md-8",500,function(){
   			$("#campaign_chart_div").show("drop",500);
   			$("#campaign_table_div").show("drop",500);
   		});
   		}); 	
   	}    
   };
  $("#campaign_table_header")[0].onclick=function(){
   	 if($("#campaign_chart_div").css("display")=="block"){
   	   $("#campaign_table_div").hide("drop",500);	
   	   $("#campaign_chart_div").hide("drop",500,function(){
   	  		
   		  $("#detailed_campaign_table_div").show("drop",500);
   		 
   	     });	 	
   	 }
   };
   $("#detailed_campaign_table_header")[0].onclick=function(){
   	   $("#detailed_campaign_table_div").hide("drop",500,function(){
   			$("#campaign_chart_div").show("drop",500);
   			$("#campaign_table_div").show("drop",500);
   		}); 	
   };                            	
});

function getFTDsByCampaign(){
	var campaigns=[],subcampaigns=[],unique_campaign=[],unique_subcampaign=[];
	apiRequest('getFTDsByCampaign',$('#range-form').serialize(),'',function(data){
	    global_data=data;
	    for(var i in data){
	    	if(unique_campaign[data[i].campaign]==1){
	    		if(unique_subcampaign[data[i].subCampaignId]==1)
	    			continue;
	    		campaigns[data[i].campaign].push(data[i].subCampaignId);
	    		unique_subcampaign[data[i].subCampaignId]=1;
	    		continue;	
	    		}
	    	campaigns[data[i].campaign]=[];
	    	campaigns[data[i].campaign].push(data[i].subCampaignId);
	    	unique_campaign[data[i].campaign]=1;
	    	unique_subcampaign[data[i].subCampaignId]=1;	
	    	
	    }
	    campaignSlicers(campaigns);
	});
}

function campaignSlicers(campaigns){

	$('#campaign_portlet').find('.btn').not('.btn-xs').remove();
	$('#sub_campaign_portlet').find('.btn').not('.btn-xs').remove();
	for(var campaign in campaigns){
	   $('#campaign_portlet').append('<a href="" id="'+campaign+'"class="btn btn-blue btn-block" onclick="event.preventDefault();">'+
                                    campaign+ 
                                    '</a>'
                               );
      for(var subcampaign in campaigns[campaign]){
      	 $('#sub_campaign_portlet').append('<a href="" id="'+campaigns[campaign][subcampaign]+'"class="btn btn-blue btn-block" onclick="event.preventDefault();">'+
                                    campaigns[campaign][subcampaign]+ 
                                    '</a>'
                               );
                          
      }                           	
	}
   $('#campaign_select').click(function(){
   	  event.preventDefault();
   	  $('#campaign_portlet .btn').not('.btn-xs').removeClass('btn-default').addClass('btn-blue');
   	  $('#sub_campaign_portlet .btn').removeClass('btn-default').addClass('btn-blue');
   	  drawCampaigns();  
   });
   $('#campaign_deselect').click(function(){
   	  event.preventDefault();
   	  $('#campaign_portlet .btn').not('.btn-xs').removeClass('btn-blue').addClass('btn-default');
   	  $('#sub_campaign_portlet .btn').removeClass('btn-blue').addClass('btn-default');
   	  drawCampaigns();  
   });
   for(var campaign in campaigns){
   	
     $('#'+campaign).click(function(){
        this_campaign=$(this).attr('id');  
   	    $(this).toggleClass('btn-default').toggleClass('btn-blue');
   	    for(var subcampaign in campaigns[this_campaign]){
   	     	$(this).hasClass('btn-blue') ?
   	     	  $('#'+campaigns[this_campaign][subcampaign]).removeClass('btn-default').addClass('btn-blue') :
   	     	  $('#'+campaigns[this_campaign][subcampaign]).removeClass('btn-blue').addClass('btn-default');	
   	     }
        drawCampaigns();  	  
     });
     for(var subcampaign in campaigns[campaign]){
     	$('#'+campaigns[campaign][subcampaign]).click(function(){
     	   this_subcampaign=$(this).attr('id'); 	
     	   $(this).toggleClass('btn-default').toggleClass('btn-blue');
     	   	 for(var inner_campaign in campaigns){
     	   	  if($.inArray(this_subcampaign,campaigns[inner_campaign])!=-1){
     	   	     if($(this).hasClass('btn-default')){
     	   	      var flag=0;	
     	     	  for(var inner_subcampaign in campaigns[inner_campaign]){
     	     	   if(this_subcampaign!=campaigns[inner_campaign][inner_subcampaign] && $('#'+campaigns[inner_campaign][inner_subcampaign]).hasClass('btn-blue')){
     	     	    $('#'+inner_campaign).removeClass('btn-default').addClass('btn-blue');
     	     	    flag++;
     	     	   }  
     	     	  }
     	     	  if(flag==0)
     	           $('#'+inner_campaign).removeClass('btn-blue').addClass('btn-default');
     	     	}else{
     	     	  $('#'+inner_campaign).removeClass('btn-default').addClass('btn-blue');	
     	     	} 
     	      }
     	     }
     	   drawCampaigns();		
     	});
     } 
   }
   drawCampaigns();
   ;
}

function drawCampaigns(){
   	var real_data=[];
   	for(var i in global_data){
   	  if($('#'+global_data[i]['subCampaignId']).hasClass('btn-blue'))
   	    real_data.push(global_data[i]);	
   	}
   	drawStatistics(real_data);
   	drawCampaignChart(real_data);
   	drawCampaignTable(real_data);
   	drawDetailedCampaignTable(real_data);
   	
}

function drawStatistics(data){
	$('#list_1').off().click(function(e){ e.preventDefault(); drawCampaignChart(data,'Total Deposits','totalDepositUSD'); return false;});
	$('#list_2').off().click(function(e){ e.preventDefault(); drawCampaignChart(data,'Total Customers','numberFTD'); return false;});
	$('#list_3').off().click(function(e){ e.preventDefault(); drawCampaignChart(data,'Average Deposits','averageDeposit'); return false;});
	if(!data.length){
	    $('#total_deposits').html('0');
	    $('#total_customers').html('0');
	    $('#average_deposits').html('0');
	    return;
	}    
	var total_deposits=0, total_customers=0, average_deposits=0;
	for(var i in data){
		total_deposits += parseFloat(data[i].totalDepositUSD);
		total_customers++;
	}
	average_deposits = total_deposits/total_customers;
	$('#total_deposits').html('$ '+total_deposits.toLocaleString());
	$('#total_customers').html(total_customers.toLocaleString());
	$('#average_deposits').html('$ '+average_deposits.toLocaleString());
	
}

function drawCampaignTable(data){
	var table_data=[],unique=[];
	for(var i in data){
   	  if(unique[data[i].desk]==1){
   	  	continue;
   	  }
   	  table_data.push({"desk":data[i].desk,
   	              "totalDepositUSD":0,
   	              "numberFTD":0});
   	  unique[data[i].desk]=1; 	
   	}
   	for(var i in data){
   	  for(var j in table_data){
   	  	if(table_data[j].desk==data[i].desk){
   	  	  table_data[j].totalDepositUSD += parseFloat(data[i].totalDepositUSD);
   	  	  table_data[j].numberFTD++;
   	  	}  
   	  }	
   	}
   	for(var i in table_data){
   	  table_data[i].totalDepositUSD = parseFloat(table_data[i].totalDepositUSD).toFixed(2);       	
   	}
   	$('#campaign_table').dataTable({
   	  "bDestroy":true,
      "bInfo": false,
      "bAutoWidth": false,	
      "bFilter": false,
      "bLengthChange": false,
      "bPaginate": false,
      "aaData": table_data,
      "aoColumns": [
            { "mData": "desk","sTitle":"Desk"},
            { "mData": "totalDepositUSD","sTitle":"Deposit USD", "sType": "numeric"},
            { "mData": "numberFTD","sTitle":"Number FTD"}
      ]		
   	  });
}

function drawDetailedCampaignTable(data){
    var detailed_data=[],unique=[];
    for(var i in data){
	   if(unique[data[i].desk+' '+data[i].campaign+' '+data[i].subCampaignId]==1)
	     continue;
	   detailed_data.push({"desk": data[i].desk,
	                    "campaign": data[i].campaign,
	                    "subCampaignId": data[i].subCampaignId,
	                    "totalDepositUSD":0,
	                    "numberFTD":0
	                   });
	   unique[data[i].desk+' '+data[i].campaign+' '+data[i].subCampaignId]=1;                  	
	}
	for(var i in data){
	  for(var j in detailed_data){
	  	if(detailed_data[j].desk==data[i].desk && detailed_data[j].campaign==data[i].campaign && detailed_data[j].subCampaignId==data[i].subCampaignId){
	  		detailed_data[j].totalDepositUSD += parseFloat(data[i].totalDepositUSD);
	  		detailed_data[j].numberFTD++;
	  	}
	  }	
	}
	for(var i in detailed_data){
	  detailed_data[i].totalDepositUSD = parseFloat(detailed_data[i].totalDepositUSD).toFixed(2);	
	}
    $('#detailed_campaign_table').dataTable({
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
   	  "bDestroy":true,
      "bInfo": true,
      "bAutoWidth": false,	
      "bFilter": true,
      "bLengthChange": true,
      "bPaginate": true,
      "aaData": detailed_data,
      "aoColumns": [
            { "mData": "desk","sTitle":"Desk"},
            { "mData": "campaign","sTitle":"Campaign"},
            { "mData": "subCampaignId","sTitle":"Subcampaign"},
            { "mData": "totalDepositUSD","sTitle":"Deposit USD", "sType": "numeric"},
            { "mData": "numberFTD","sTitle":"Number FTD"}
      ]		
   	  });
    	
}

function drawCampaignChart(data,chosen_title,chosen_value){
	var chart_data=[],unique=[];
	var title='Total Deposits';
	var value="totalDepositUSD";
	if(chosen_title!=undefined && chosen_value!=undefined){
		title=chosen_title;
		value=chosen_value;
	}
	for(var i in data){
	   if(unique[data[i].desk+' '+data[i].campaign+' '+data[i].subCampaignId]==1)
	     continue;
	   chart_data.push({"title_field": data[i].desk+' '+data[i].campaign+' '+data[i].subCampaignId,
	                    "desk": data[i].desk,
	                    "campaign": data[i].campaign,
	                    "subCampaignId": data[i].subCampaignId,
	                    "totalDepositUSD":0,
	                    "numberFTD":0
	                   });
	   unique[data[i].desk+' '+data[i].campaign+' '+data[i].subCampaignId]=1;                  	
	}
	for(var i in data){
	  for(var j in chart_data){
	  	if(chart_data[j].desk==data[i].desk && chart_data[j].campaign==data[i].campaign && chart_data[j].subCampaignId==data[i].subCampaignId){
	  		chart_data[j].totalDepositUSD += parseFloat(data[i].totalDepositUSD);
	  		chart_data[j].numberFTD++;
	  	}
	  }	
	}
	for(var i in chart_data){
	  chart_data[i].totalDepositUSD = parseFloat(chart_data[i].totalDepositUSD).toFixed(2);
	  chart_data[i].averageDeposit = chart_data[i].totalDepositUSD!=0 ? (chart_data[i].totalDepositUSD/chart_data[i].numberFTD).toFixed(2) : 0 ;	
	}
	console.log(chart_data);
    var chart = AmCharts.makeChart( "chart_content", {
     "type": "pie",
     "titles": [ {
     "text": title,
     "size": 16
      } ],
     "dataProvider": chart_data,
     "valueField": value,
     "titleField": "title_field",
     "startEffect": "elastic",
     "startDuration": 2,
     "labelRadius": 30,
     "innerRadius": "30%",
     "depth3D": 30,
     "autoResize": true,
     "balloonText": "[[title]]<br><span style='font-size:14px'><b>[[value]] </b> ([[percents]]%)</span>",
     "angle": 10,
     "pullOutOnlyOne":true
} ); 	
}

function getDesk(){
	apiRequest('getDesk', $('#range-form').serialize(), '#desk', function(data) {			
			$.each(data, function(key, value) { 
				 $('#desk').append($('<option>', { value : data[key]["id"] , text : data[key]["name"] })); 
			});
	});
}






