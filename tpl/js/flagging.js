$(document).ready(function() {
	getAffiliates();
	getPrioritizedAffiliates();

	$("ul#sortable").sortable({ 
        opacity: 0.6, 
        cursor: 'move',
        update: function(){
        	var sortedArr = [];
	        $.each($("#sortable li"),function(k,v){
	        	sortedArr.push($(v).data('id'))
	        });
	        setAffiliateSort(sortedArr);
    	}
    });

    $('#affiliate').change(function() {
        getAffiliate($(this).val(), 'normal');
    });

    $( document ).on("click","#save",function() {
    	setAffiliateNS($(this).data('id'),0,$('#text').val(),$('#payment').val(),$('#cost').val(), 'text');
    });

	$( document ).on("click","#intop",function() {
    	setAffiliateNS($('#affiliate option:selected').val(),1,$('#text').val(),$('#payment').val(),$('#cost').val(), 'intop');
    });

    


    $( "#sortable" ).on("click",".show, .message",function() {
    	var item = $(this).parent('li');

    	getAffiliate(item.data('id'), 'normal');

    	return false;
    });

    $( "#sortable" ).on("click",".remove",function() {
    	var item = $(this).parent('li');

    	item.css({height:0,margin:0,padding:0});
    	setAffiliateNS(item.data('id'),0,'','', 'intop');
    	
    	return false;
    });

});



Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
}


function getAffiliate(affid, type) {
	//get affiliate by ID, insert or update
	//sorted or not

	var containerId = '#transactions_table_holder';

	apiRequest('getAffiliateNS', {affid:affid, type:type}, containerId, function(data) {

		var containerText = $(containerId).children(".portlet-content");
		var text = (data.length > 0)?data[0].aff_text:'';
        var payment = (data.length > 0)?data[0].aff_payment:'';
        var cost = (data.length > 0)?data[0].aff_cost:'';

        var selectBuild = '<select class="form-control" id="cost"><option value="CPA">CPA</option><option value="CPL">CPL</option></select>';

		containerText.empty().append($('<div class="col-md-12"><h3>'+affid+'</h3></div>'))
			.append('<p><div class="col-md-12"><textarea class="form-control" id="text">'+text+'</textarea></p></div>')
            .append('<p><div class="col-md-2"><div class="cost">Cost: </div></div><div class="col-md-4">'+selectBuild+'</div><div class="col-md-6"><input type="text" class="form-control" id="payment" value="'+payment+'"></input></div></p><br />')
            .append('<div class="col-md-12"><p class="m-t-10"><button id="save" data-id="'+affid+'" class="btn btn-success" style="">Save</button>&nbsp;<button id="intop" class="btn btn-success" style="">Move to Top</button></div>')

        if(cost) {
            $('#cost').val(cost);
        }

	});
}

function setAffiliateNS(affid, affintop, afftext, affpayment, affcost, afftype) {

	apiRequest('setAffiliateNS', {affid:affid, intop:affintop, text:afftext, type:afftype, payment:affpayment, cost:affcost}, '', function(data) {
		
		showMessage("Done");

		if(afftype == "intop") {
			getPrioritizedAffiliates();
		}
    });
}

function setAffiliateSort(affarray) {
	apiRequest('setAffiliateSort', {array:affarray}, '#sortable', function(data) {
		if(data=="false")
			showMessage("Priority Saved");
		else
			showMessage("Failed");
	});
}

function getPrioritizedAffiliates() {
	apiRequest('getPrioritizedAffiliates', '', '#sortable', function(data) {
		$("#sortable").empty();

		var buttons = "<a href='#' class='remove'><i class='fa fa-times'></i></a><a href='#' class='show'><i class='fa fa-cog'></i></a>";
		var envolope = "<a href='#' class='message'><i class='fa fa-envelope'></i></a>";

		$.each(data,function(k,v) {
			$("#sortable").append("<li class='btn btn-default btn-lg btn-block' data-id='"+v.aff_id+"'>"+buttons+(v.aff_text?envolope:'')+v.aff_id+"</li>");
		});
    });
}



function getAffiliates() {

    apiRequest('getAffiliates', '', '#transactions_table_holder', function(data) {

        jQuery.each(data, function() {
            $('#affiliate')
                .append($('<option>', {
                        value: this.affID
                    })
                    .text(this.affID));
        });

    });

}

function showMessage(msg) {
	$(".results").text(msg).fadeIn().delay(2000).fadeOut();
}