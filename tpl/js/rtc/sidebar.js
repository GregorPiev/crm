window.onerror = function (msg, url, lineNo, columnNo, error) {
    var string = msg.toLowerCase();
    var substring = "script error";
    if (string.indexOf(substring) > -1){
        console.info('%cScript Error: See Browser Console for Detail','font-size:18px;color:darkred');
    } else {
        var message = [
            'Message: ' + msg,
            'URL: ' + url,
            'Line: ' + lineNo,
            'Column: ' + columnNo,
            'Error object: ' + JSON.stringify(error)
        ].join(' - ');

        console.log("%c Error JS:" + message,"font-size:18px;color:darkpink");
    }

    return true;
};

$(document).ready(function(){     

    $("#userSearch" ).debounce('keyup paste cut',function(event){ 
        
        var rowHTML='';
        var iter=0;
        var iterDec=1;
        var rowMax = 5;
        var showRowsClass='style="display:block;"';
        var searchVal = $(this).val();        
      
        if(searchVal!==''){
          var post_data = {'search': searchVal};	
          apiRequestBrand('customerSearch', post_data, '', false, capitalBrandName,function (result) { 
            
            if(result.length==0){
                rowHTML = "<div class='rowSearch'><div class='fname'>No Results</div>";
                $("#userSearch-description").empty().append(rowHTML);
                
                return false;
            }
           
            $.each(result,function(ind,item){                     
                 rowHTML += "<div class='rowSearch rowGroup"+iterDec+"' "+showRowsClass+" data-customer='"+item.customerId+"'>"+                      
                            "<div class='fname' style='white-space:pre-wrap;'>"+exeSearch('name',item.firstName,item.lastName)+"</div>"+
                            "<div class='email' style='white-space:pre-wrap;'><i class='fa fa-envelope'></i>&nbsp;"+exeSearch('email',item.email,false)+ "</div>";
                 var tpAccounts = item.tpAccounts.length > 0 ? item.tpAccounts.split(',') : [];           
                 if(tpAccounts.length>0){
                     var iter = 0;
                     rowHTML += "<div class='tpAccount'>";
                     $.each(tpAccounts,function(indK,itemVal){ 
                         rowHTML += "<i class='fa fa-area-chart' style='display:inline;'>&nbsp;"+exeSearch('tpAccount' ,itemVal,false)+"</i>&nbsp;&nbsp;";
                         if(iter===2){
                              rowHTML += "<br>";
                              iter = 0;
                         }else{
                              iter++;                        }  
                         });                               
                         rowHTML += "</div>";        
                  }       
                  rowHTML += "</div>";
                  
            });
            if(rowHTML!==''){                
                $("#userSearch-description").empty().append(rowHTML);
                
            }  
             function exeSearch(type,item1,item2){
                var item = type=='name' ? item1+' '+item2 : item1;
                var compString = item.toLowerCase();
                var strPos = compString.indexOf(searchVal.toLowerCase());
                if(strPos==0){
                	return '<strong style="background-color:red;">'+item.substr(0,searchVal.length)+'</strong>'+item.substr(searchVal.length);
                }else if(type=='phone' && item1[0]=='+'){
                	item = item.substr(1);
                	compString = item.toLowerCase();
                	strPos = compString.indexOf(searchVal.toLowerCase());
                	if(strPos==0)
                	    return '+<strong style="background-color:red;">'+item.substr(0,searchVal.length)+'</strong>'+item.substr(searchVal.length);
                	else
                	    return item1;    
                	
                }else if(item2!==false){
                    compString = item2.toLowerCase();
                    strPos = compString.indexOf(searchVal.toLowerCase());
                    
                    if(strPos==0)
                       return item1+' <strong style="background-color:red;">'+item2.substr(0,searchVal.length)+'</strong>'+item2.substr(searchVal.length);
                    else
                       return item;    	
                }else{
                	return item;
                }
             }
      /*       function exeSearch(item){
                
                var isertedStringPart1='<strong style="background-color:red;">';
                var isertedStringPart2='</strong>';
                var compreString = item.toLowerCase();
                var strPos = compreString.indexOf(searchVal.toLowerCase());                
                if(strPos>-1){
                    return item.substr(0, strPos) + isertedStringPart1+item.substr(strPos, searchVal.length)+isertedStringPart2 + item.substr(strPos + searchVal.length);
                }else{
                    var strPosIns1 = compreString.indexOf(isertedStringPart1);
                    if(strPosIns1>-1){
                        var strPosIns2 = compreString.indexOf(isertedStringPart2);
                        return  item.substr(0, strPosIns1) + item.substr(strPosIns1, isertedStringPart1.length)+ item.substr(strPosIns2 + isertedStringPart2.length);
                    }else{
                        return item;
                    }
                    
                }  
             } */
             
             $(".rowSearch").on('click',function(){
                var dataCustomer = $(this).attr("data-customer");
                
                self.location.href="/"+globalBrandName+"/agenttools/customer_card?id=" + dataCustomer;
             }); 
             
             });
        }else{
        	$("#userSearch-description").empty();
        } 
        
    },500);
    
  
    
    $('#userSearch').on('blur',function(){
      $("#userSearch-description").slideUp("slow");
    }).on('focus',function(){
      $("#userSearch-description").slideDown("slow");
    });
    $("#searchForm").bind('click submit',function(e){
       e.preventDefault();
       return false;
    });
 
});
