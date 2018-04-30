


$(document).ready(function() {



    //var d1=new Date();
    //$('#dpStart, #dpEnd').val(d1.toString('yyyy'));
    

    


    $('#dpStart, #dpEnd, #desk').change(function() 
    {
      //var n=$(this).attr('value').split(",");
      //getAccountStatementArgs.startDate = n[0];
      //getAccountStatementArgs.endDate = n[1];

    });
    
    $("#idform").submit(function(){
      moveClients();
      return false;
    });








    

  });

function moveClients(){

  apiRequest('moveClients',$('#idform').serialize(),'#idform',function(data){

    alert("done");

  });

}
