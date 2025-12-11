<?php
// Include the access token file
include 'accessToken.php';

date_default_timezone_set('Africa/Nairobi');
$processrequestUrl = 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest';
$callbackurl = 'https://cerilo-portfolio.great-site.net/mpesaapi/callback.php'; // Replace with your callback URL
$passkey = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919'; // Replace with your passkey
$BusinessShortCode = '174379'; // Replace with your Business Short Code
$Timestamp = date('YmdHis');
// Encrypt the data to get the password
$Password = base64_encode($BusinessShortCode . $passkey . $Timestamp);
$phone = '254708374149'; // The phone number sending the money
$money = '1';
$PartyA = $phone; // The phone number sending the money
$PartyB = $BusinessShortCode; // The organization receiving the money
$AccountReference = '7934331'; // Replace with your account reference
$TransactionDesc = 'KCB Deposit'; // Replace with your transaction description
$Amount = $money; // The amount to be transacted
$stkpushheader = ['Content-Type:application/json', 'Authorization:Bearer ' . $access_token];

// Inititiate Curl
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $processrequestUrl);
curl_setopt($curl, CURLOPT_HTTPHEADER, $stkpushheader); //setting custom headers
$curl_post_data = array(
    //Fill in the request parameters with valid values
    'BusinessShortCode' => $BusinessShortCode,
    'Password' => $Password,
    'Timestamp' => $Timestamp,
    'TransactionType' => 'CustomerPayBillOnline',
    'Amount' => $Amount,
    'PartyA' => $PartyA,
    'PartyB' => $BusinessShortCode,
    'PhoneNumber' => $PartyA,
    'CallBackURL' => $callbackurl,
    'AccountReference' => $AccountReference,
    'TransactionDesc' => $TransactionDesc
);

$data_string = json_encode($curl_post_data);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_POSTFIELDS, $data_string);
$curl_response = curl_exec($curl);

$data = json_decode($curl_response);
$CheckoutRequestID = $data->CheckoutRequestID;
$ResponseCode = $data->ResponseCode;

if ($ResponseCode == "0") {
    echo "The CheckoutRequestID for this transaction is : " . $CheckoutRequestID;
}