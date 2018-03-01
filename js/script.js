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
            try {
                var json = JSON.parse(this.response);
                callback(json);
            } catch(e) {
                console.log(this.response);
            }
        }
    }
    xhr.open("POST", "php/api.php");
    var data = new FormData();
    data.append("action", action);
    xhr.send(data);
}

var timeout = 30;

var wakeBtn = $("#wakeBtn");
var stsTxt = $("#status");

var pingTimer;

function startPinging() {
    clearInterval(pingTimer);
    pingTimer = setInterval(ping, 1000);
}

function stopPinging() {
    clearInterval(pingTimer);
}

function sts(message, color){
    stsTxt.innerHTML = message;
    $("#circle").style.backgroundColor = color;
}

function ping() {
    apiCall("ping", function(res){
        if(res.success) {
            stopPinging();
            wakeBtn.setAttribute("disabled", true);
            sts(res.body, "green");
            getOS();
        } else {
            sts(res.body, "red");
        }
    });
}

function getOS() {
    sts("Fetching current OS...", "yellow");
    apiCall("getOS", function(res) {
        if(res.success) {
            sts("Waiting for operations", "green");
            $("#os_status").innerHTML = "Current OS: " + res.body;
            var btns = $(".operateBtns .btn");
            for(i=0; i<btns.length; i++) {
                btns[i].removeAttribute("disabled");
            }
        } else {
            startPinging();
            $("#os_status").innerHTML = "";
            sts(res.body, "red");
        }
    });
}

$("#restartBtn").addEventListener("click", function() {
    sts("Restarting computer...", "yellow");
    apiCall("restart", function(res) {
        if(res.success) {
            setTimeout(startPinging, 5000);
        } else {
            sts(res.body, "red");
            startPinging();
        }
    })
});
$("#shutdownBtn").addEventListener("click", function() {
    sts("Shutting down computer...", "yellow");
    apiCall("shutdown", function(res) {
        if(res.success) {
            setTimeout(startPinging, 5000);
        } else {
            sts(res.body, "red");
            startPinging();
        }
    })
});

$("#switchBtn").addEventListener("click", function() {
    sts("Switching OS...", "yellow");
    apiCall("switch", function(res) {
        if(res.success) {
            setTimeout(startPinging, 5000);
        } else {
            sts(res.body, "red");
            startPinging();
        }
    })
});

wakeBtn.addEventListener("click", function() {
    wakeBtn.setAttribute("disabled", "true");
    sts("Computer is waking...", "yellow");
    apiCall("wol", function() {
        if(res.success) {
            sts(res.body, "green");
            setTimeout(function()  {
                if(!isAwake) {
                    sts("WOL did not wake computer", "red");
                    wakeBtn.innerHTML = "Wake Computer";
                }
            }, timeout);
        } else {
            startPinging();
            sts(res.body, "red");
            wakeBtn.innerHTML = "Wake Computer";
        }
        $("#compButton").removeAttribute("disabled");
    });
});

startPinging();
ping();

