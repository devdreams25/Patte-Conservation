<?php
header('Content-Type: application/json');
$response = '{
    "ResultCode": 0,
    "ResultDesc": "Confirmation received successfully"
}';
$mpesaResponse = file_get_contents('php://input');
$logFile = "c2BPesaResponse.json";
$log = fopen($logFile, "a");
fwrite($log, $mpesaResponse);
fclose($log);