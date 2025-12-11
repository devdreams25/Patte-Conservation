<?php
// Robust STK callback handler: maps CallbackMetadata by Name, logs safely, and returns 200 quickly.

header('Content-Type: application/json');

// Read raw body
$raw = file_get_contents('php://input');

// Basic logging (append, atomic)
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) @mkdir($logDir, 0755, true);
file_put_contents($logDir . '/stk_raw.log', date('c') . " " . ($raw ?: '[empty]') . PHP_EOL, FILE_APPEND | LOCK_EX);

// Decode
$data = json_decode($raw, true);
if (!$data) {
    // Malformed payload: log and return 400
    file_put_contents($logDir . '/stk_errors.log', date('c') . " - Invalid JSON: " . ($raw ?: '') . PHP_EOL, FILE_APPEND | LOCK_EX);
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'invalid json']);
    exit;
}

$stk = $data['Body']['stkCallback'] ?? null;
if (!$stk) {
    file_put_contents($logDir . '/stk_errors.log', date('c') . " - Missing stkCallback: " . json_encode($data) . PHP_EOL, FILE_APPEND | LOCK_EX);
    // respond 200 to avoid retries, but note the issue in logs
    http_response_code(200);
    echo json_encode(['status' => 'received', 'note' => 'no stkCallback']);
    exit;
}

// Extract top-level fields
$merchantRequestID = $stk['MerchantRequestID'] ?? null;
$checkoutRequestID = $stk['CheckoutRequestID'] ?? null;
$resultCode = $stk['ResultCode'] ?? null;
$resultDesc = $stk['ResultDesc'] ?? null;

// Map CallbackMetadata items by Name (order is not guaranteed)
$items = $stk['CallbackMetadata']['Item'] ?? [];
$meta = [];
foreach ($items as $it) {
    if (isset($it['Name'])) {
        $meta[$it['Name']] = $it['Value'] ?? null;
    }
}

// Common metadata keys
$amount = $meta['Amount'] ?? null;
$mpesaReceipt = $meta['MpesaReceiptNumber'] ?? $meta['ReceiptNumber'] ?? null;
$transactionDate = $meta['TransactionDate'] ?? null;
$userPhone = $meta['PhoneNumber'] ?? null;

// Prepare log entry
$entry = [
    'received_at' => date('c'),
    'MerchantRequestID' => $merchantRequestID,
    'CheckoutRequestID' => $checkoutRequestID,
    'ResultCode' => $resultCode,
    'ResultDesc' => $resultDesc,
    'Amount' => $amount,
    'MpesaReceiptNumber' => $mpesaReceipt,
    'TransactionDate' => $transactionDate,
    'PhoneNumber' => $userPhone,
    'raw' => $data
];

// Persist success/failure into separate files (append JSON line)
if ((int)$resultCode === 0) {
    // Success: store/record transaction (replace with DB operations as needed)
    file_put_contents($logDir . '/SuccessfulTransactions.json', json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);

    // TODO: update your DB here using $checkoutRequestID to mark transaction paid
} else {
    // Failure/cancel
    file_put_contents($logDir . '/FailedTransactions.json', json_encode($entry) . PHP_EOL, FILE_APPEND | LOCK_EX);

    // TODO: update DB/notify user if needed
}

// Respond quickly with 200 OK (Daraja expects a fast 200)
http_response_code(200);
echo json_encode(['status' => 'received']);
exit;
?>