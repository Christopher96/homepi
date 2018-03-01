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

var isWaking = false;
var isAwake = false;

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

function disableOperateBtns() {
    var btns = $(".operateBtns .btn");
    for(i=0; i<btns.length; i++) {
        btns[i].setAttribute("disabled", true);
    }
}

function enableOperateBtns() {
    var btns = $(".operateBtns .btn");
    for(i=0; i<btns.length; i++) {
        btns[i].removeAttribute("disabled");
    }
}
function ping() {
    apiCall("ping", function(res){
        if(res.success) {
            stopPinging();
            isAwake = true;
            wakeBtn.setAttribute("disabled", true);
            sts(res.body, "green");
            getOS();
        } else {
            if(!isWaking) {
                sts(res.body, "red");
                wakeBtn.removeAttribute("disabled");
            }
        }
    });
}

function getOS() {
    $("#os_status").innerHTML = "Fetching current OS...", "yellow";
    apiCall("getOS", function(res) {
        if(res.success) {
            sts("Waiting for operations", "green");
            $("#os_status").innerHTML = "Current OS: " + res.body;
            enableOperateBtns();
        } else {
            $("#os_status").innerHTML = "";
            sts(res.body, "red");
            startPinging();
        }
    });
}

$("#restartBtn").addEventListener("click", function() {
    disableOperateBtns();
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
    disableOperateBtns();
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
    disableOperateBtns();
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
    isWaking = true;
    wakeBtn.setAttribute("disabled", "true");
    sts("Computer is waking...", "yellow");
    apiCall("wol", function() {
        if(res.success) {
            sts(res.body, "green");
            setTimeout(function()  {
                if(!isAwake) {
                    isWaking = false;
                    sts("WOL did not wake computer", "red");
                    wakeBtn.removeAttribute("disabled");
                }
            }, 30000);
        } else {
            startPinging();
            sts(res.body, "red");
        }
        $("#compButton").removeAttribute("disabled");
    });
});

startPinging();
ping();

