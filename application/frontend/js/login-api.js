if(!window.jQuery){
   var script = document.createElement('script');
   script.type = "text/javascript";
   script.src = "https://code.jquery.com/jquery-2.1.4.min.js";
   document.getElementsByTagName('head')[0].appendChild(script);
}

$(".login-geostore").click(function (){
    if(!$(this).data("url")){
        console.log("Verify URL is not defined.")
        return
    }

    var w= 600, h=270;
    var left = (screen.width/2)-(w/2);
    var top = (screen.height/2)-(h/2);
    var x = window.open('http://open-data-network.appspot.com/login/authorize?w=popup&r=' + $(this).data("url"), '_blank', 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width='+w+', height='+h+', top='+top+', left='+left);
});