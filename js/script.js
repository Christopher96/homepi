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

var states = {
    RESTARTING: 1,
    WAKING: 2,
    PINGING: 3,
    AWAKE: 4,
    OFFLINE: 5,
    OS: 6
}
var wakeBtn = $("#wakeBtn");

var pingTimer;

function startPinging() {
    clearInterval(pingTimer);
    pingTimer = setInterval(ping, 1000);
}

function stopPinging() {
    clearInterval(pingTimer);
}

var stsTxt = $("#status"); 
function sts(message, color){
    stsTxt.innerHTML = message;
    $("#circle").style.backgroundColor = color;
}


var updTxt = $("#update"); 
function upd(message){
    updTxt.innerHTML = message;
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

function setState(state) {
    switch(state) {
        case states.AWAKE:
            sts("Computer is awake", "green");
            break;
        case states.OFFLINE:
            sts("Computer is offline", "green");
            break;
        case states.PINGING:
            sts("Pinging computer...", "yellow");
            break;
        case states.SHUTTING:
            sts("Shutting down computer...")
            break;
        case states.WAKING:
            sts("Waking computer...");
            break;
        case states.OS:
            sts("Fetching operating system...")
    }

    switch(state) {
        case states.AWAKE:
            wakeBtn.setAttribute("disabled", true);
            enableOperateBtns();
            break;
        case states.OFFLINE:
            wakeBtn.removeAttribute("disabled");
            disableOperateBtns();
        case states.PINGING:
        case states.WAKING:
        case states.SHUTTING:
            wakeBtn.setAttribute("disabled", true);
            disableOperateBtns();
        break;
    }

    currentState = state;
}

function ping() {
    apiCall("ping", function(res){
        if(res.success) {
            switch(currentState) {
                case states.WAKING:
                case states.OFFLINE:
                    setState(states.AWAKE);
                    getOS();
                    break;
            }
        } else {

        }
    });
}

function getOS() {
    setState(states.OS);
    apiCall("getOS", function(res) {
        if(res.success) {
            setState(states.AWAKE);
            upd("Current OS: " + res.body);
            enableOperateBtns();
        } else {
            upd()
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
    setState(states.WAKING);
    apiCall("wol", function() {
        if(!res.success)
            sts(res.body, "red");
        }
    });
});

setState(states.OFFLINE);
startPinging();
ping();

