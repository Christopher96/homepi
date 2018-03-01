<?php

$return = array("success" => true);

$station_ip = "192.168.0.10";
$station_mac = "1c:6f:65:d5:ca:87"; 
$station_port = 1337;
$gateway = "192.168.0.255";

function sendMessage($message){
    global $return, $station_ip, $station_port;

    $s = socket_create(AF_INET, SOCK_STREAM, SOL_TCP);

    //Connect socket to remote server
    if(!@socket_connect($s ,$station_ip, $station_port)) {
        $errorcode = socket_last_error();
        $errormsg = socket_strerror($errorcode);
        $return['body'] = "Could not connect: [$errorcode] $errormsg \n";
        return false;
    }

    //Send the message to the server
    if(!@socket_send($s, $message, strlen($message), 0))
    {
        $errorcode = socket_last_error();
        $errormsg = socket_strerror($errorcode);
         
        $return['body'] = "Could not send data: [$errorcode] $errormsg \n";
        return false;
    }

    if($res = @socket_read($s, 1024)) {
        if($res == "fail"){
            $return['body'] = "Operation failed";
            return false;
        }
        $return['body'] = $res;
        return true;
    } else {
        $errorcode = socket_last_error();
        $errormsg = socket_strerror($errorcode);
         
        $return['body'] = "Could not read data: [$errorcode] $errormsg \n";
        return false;
    }
}

function wakeOnLan() {
    global $return, $gateway, $station_mac;

    flush();
    $socket_number = "9";

    $ip_addy = gethostbyname($gateway);

    $addr_byte = explode(':', $station_mac);
    $hw_addr = '';
    for ($a=0; $a <6; $a++) $hw_addr .= chr(hexdec($addr_byte[$a]));
    $msg = chr(255).chr(255).chr(255).chr(255).chr(255).chr(255);
    for ($a = 1; $a <= 16; $a++) $msg .= $hw_addr;
    // send it to the broadcast address using UDP
    // SQL_BROADCAST option isn't help!!
    $s = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
    if ($s == false) {
        $return['body'] = socket_last_error($s)."' - " . socket_strerror(socket_last_error($s));
        return FALSE;
    }
    else {
        // setting a broadcast option to socket:
        $opt_ret = socket_set_option($s, 1, 6, TRUE);
        if($opt_ret <0) {
            $return['body'] = "setsockopt() failed, error: " . strerror($opt_ret) . "\n"; 
            return FALSE;
        }

        if(socket_sendto($s, $msg, strlen($msg), 0, $gateway, $socket_number)) {
            socket_close($s);
            $return['body'] = "WOL was successfully sent";
            return TRUE;
        } else {
            $return['body'] = "Failed to send WOL";
            return FALSE;
        }
    }
}

function ping() {
    global $return, $station_ip;
    $res = shell_exec("nmap -sn {$station_ip} | grep 'Host is up'");
    if(!empty($res)) {
        $return['body'] = $res;
        return true;
    }

    $return['body'] = "Computer is offline";
    return false;
}

$params = $_REQUEST;

function apiCall($action) {
    switch ($action) {
        case 'wol':
            return wakeOnLan(); 
        case 'ping':
            return ping();
        case 'getOS':
            return sendMessage("getOS");
        case 'restart':
            return sendMessage("restart");
        case 'shutdown':
            return sendMessage("shutdown");
        case 'switch':
            return sendMessage("switch");
        default:
            return false;
    }
}

$return['success'] = apiCall($params['action']);

echo json_encode($return);
?>
