<?php

$station_ip = "192.168.0.10";
$station_mac = "1c:6f:65:d5:ca:87"; 
$gateway = "192.168.0.255";

function WakeOnLan($addr, $mac,$socket_number) {

    $addr_byte = explode(':', $mac);
    $hw_addr = '';
    for ($a=0; $a <6; $a++) $hw_addr .= chr(hexdec($addr_byte[$a]));
    $msg = chr(255).chr(255).chr(255).chr(255).chr(255).chr(255);
    for ($a = 1; $a <= 16; $a++) $msg .= $hw_addr;
    // send it to the broadcast address using UDP
    // SQL_BROADCAST option isn't help!!
    $s = socket_create(AF_INET, SOCK_DGRAM, SOL_UDP);
    if ($s == false) {
        echo "Error creating socket!\n";
        echo "Error code is '".socket_last_error($s)."' - " . socket_strerror(socket_last_error($s));
        return FALSE;
    }
    else {
        // setting a broadcast option to socket:
        $opt_ret = socket_set_option($s, 1, 6, TRUE);
        if($opt_ret <0) {
            echo "setsockopt() failed, error: " . strerror($opt_ret) . "\n";
            return FALSE;
        }
        if(socket_sendto($s, $msg, strlen($msg), 0, $addr, $socket_number)) {
            echo "Magic Packet sent successfully!";
            socket_close($s);
            return TRUE;
        }
        else {
            echo "Magic packet failed!";
            return FALSE;
        }
    }
}

function wakeComp() {
    global $gateway, $station_mac;
    flush();
    $socket_number = "9";
    $ip_addy = gethostbyname($gateway);
    WakeOnLan($ip_addy, $station_mac, $socket_number);
}



function checkAwake() {
    global $station_ip;
    $res = shell_exec("nmap -sn {$station_ip} | grep 'Host is up'");
    return !empty($res);
}

$params = $_REQUEST;
$return = array("success" => true);

switch ($params['action']) {
    case 'wol':
        wakeComp(); 
        break;
    case 'checkAwake':
        $return['body'] = checkAwake();
    default:
        $return['succes'] = false;
        break;
}

echo json_encode($return);
?>
