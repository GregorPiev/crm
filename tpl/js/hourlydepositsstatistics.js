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

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};


function selectRange(range) {
  if (!isNaN(range)) {
  
    var endDate = new Date();
    var startDate = new Date();
     
    startDate.setDate(startDate.getDate() - range);
  
    $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
    $('#dpStart').val(startDate.format("yyyy-MM-dd"));
  
  } else {
  
  range = range.split('-');
  var endDate = new Date(range[1],range[0]-1,1);
  var startDate = new Date(range[1],range[0]-1,1);
  console.log(endDate);
  
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  $('#dpEnd').val(endDate.format("yyyy-MM-dd"));
  $('#dpStart').val(startDate.format("yyyy-MM-dd"));
    
  }
  
  getTraficHourlyDepositsStatistics();
  
}

$(document).ready(function(){
	
	$('#hourlyDepositsStatistics_table_length').hide();	
	
	$('#dpStart, #dpEnd').val(new Date().format("yyyy-MM-dd"));
    $('#dpStart, #dpEnd').datepicker();
    getTraficHourlyDepositsStatistics();   

    $('#dpStart, #dpEnd, #onlyFTD').change(function() 
    {
       getTraficHourlyDepositsStatistics();
    });
    
    
	
});

function getTraficHourlyDepositsStatistics() {
	var newDate = new Date();
	for(j = -1; j<2 ; j++){
	    var tempDate = new Date(), tempHourArr = [];
	    tempDate.setDate(tempDate.getDate() - j);
	    for(i=0; i<24; i++){
	     var hour = tempDate.setHours(i),
	         minutes = tempDate.setMinutes(0),
	         stringHour = (tempDate.getHours()<10?'0':'') + tempDate.getHours() + ":" + (tempDate.getMinutes()<10?'0':'') + tempDate.getMinutes();
	        tempHourArr.push(stringHour);   
	    }
   	}
	apiRequest('getTraficHourlyDepositsStatistics',$('#range-form').serialize(),'#hourlyDepositsStatistics_table_holder',function(data){


        // var chart = AmCharts.makeChart( "chartdiv", {
			  // "type": "pie",
			  // "theme": "light",
			  // "dataProvider": data,
			  // "valueField": "amount",
			  // "titleField": "theHour",  
			   // "balloon":{
			   // "fixedPosition":true
			  // },
			  // "export": {
			    // "enabled": true
			  // }
		 // } );

		 $('#canvas').remove();
		 $('#canvasContainer').html('<canvas id="canvas"></canvas>');
		 var ctx = document.getElementById("canvas").getContext("2d");
	 	 var dataD = [];
	 	for (var i=0,j=0; i < data.length; j++) {
	 		if(data[i].theHour == j)
		   		dataD[j] = data[i++].amount;		   		
	   		else 
	   			dataD[j] = 0;
		 };
		
		 lineChartData = {			
				labels : tempHourArr ,
				datasets : [
					{
						fillColor : "rgba(229, 65, 45, 0.64)",
						strokeColor : "rgb(229, 65, 45)",
						pointColor : "rgb(229, 65, 45)",
						pointStrokeColor : "#fff",
						pointHighlightFill : "#fff",
						pointHighlightStroke : "rgba(151,187,205,1)",
						data :dataD
					}
				]
		};
		 window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true
		});
				

   		for(var i=0,j=data.length; i<j; i++){  
         	data[i].amount = parseFloat(data[i].amount*1000).toLocaleString();
        };	
  
        $('#hourlyDepositsStatistics_table').dataTable({
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
	       "aLengthMenu": [
	       		 [-1],         
		         ["All"]
		   ],
		   "iDisplayLength": -1,             
	       "aaData": data,	                        
	       "aoColumns": [
	        { "mData": "theHour", "sTitle": "Hour"},
	        { "mData": "deposits", "sTitle": "Deposits", "sType": "float"},
	        { "mData": "amount", "sTitle": "Amount USD", "sType": "float"}                                                      
	       ],
	       "fnFooterCallback": function ( nRow, aaData, iStart, iEnd, aiDisplay ) {
	       		// $('#chartdiv a').hide();
	       }
	       
		});		
    });	
   
}

function ColorLuminance(hex, lum) {
			// validate hex string
			hex = String(hex).replace(/[^0-9a-f]/gi, '');
			if (hex.length < 6) {
				hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
			}
			lum = lum || 0;		
			// convert to decimal and change luminosity
			var rgb = "#", c, i;
			for (i = 0; i < 3; i++) {
				c = parseInt(hex.substr(i*2,2), 16);
				c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
				rgb += ("00"+c).substr(c.length);
			}		
			return rgb;
		}

