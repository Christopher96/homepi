function $(selector) {
    var el = document.querySelectorAll(selector);
    if(el.length == 1) {
        return el[0];
    }
    return el;
}
function apiCall(action, callback){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            var json = JSON.parse(this.response);
            callback(json);
        }
    }
    xhr.open("POST", "php/api.php");
    var data = new FormData();
    data.append("action", action);
    xhr.send(data);
}

var timeout = 30;
var wolSent = false;

function checkAwake() {
    apiCall("checkAwake", function(response){
        if(response.success) {
            $("#compCircle").style.backgroundColor = (response.body) ? "green" : "red";
            if(response.body) {
                $("#compButton").innerHTML = "Computer is awake";
                $("#compButton").setAttribute("disabled", true);
            } else {
                $("#compButton").innerHTML = (wolSent) ? "Computer is waking..." : "Wake computer";
                if(wolSent) {
                    $("#compButton").setAttribute("disabled", true);
                } else {
                    $("#compButton").removeAttribute("disabled");
                }
            }
        }
        // setTimeout(checkAwake, 1000);
    });
}

$("#compButton").addEventListener("click", function() {
    apiCall("wol", function() {
        setTimeout(function()  {
            wolSent = false;
        }, timeout);
        wolSent = true;
    });
});

checkAwake();
