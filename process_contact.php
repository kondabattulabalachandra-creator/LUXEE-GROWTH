<?php
header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $name    = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
    $email   = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
    $phone   = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $service = filter_input(INPUT_POST, 'service', FILTER_SANITIZE_STRING);
    $message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_STRING);

    if (!$name || !$email || !$phone || !$message) {
        http_response_code(400);
        echo "Please complete all required fields.";
        exit;
    }

    $to = "Luxeegrowth@gmail.com";
    $subject = "New Inquiry - LUXEE GROWTH: $name";
    
    $body = "Inquiry Details:\n\n";
    $body .= "Name: " . $name . "\n";
    $body .= "Email: " . $email . "\n";
    $body .= "Phone: " . $phone . "\n";
    $body .= "Service Requested: " . $service . "\n\n";
    $body .= "Message:\n" . $message . "\n";

    $headers = "From: noreply@luxeegrowth.com\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";

    if (@mail($to, $subject, $body, $headers)) {
        http_response_code(200);
        echo "Success";
    } else {
        // Backup logger into CSV format
        $logFile = 'contact_submissions.csv';
        $entry = array($name, $email, $phone, $service, date('Y-m-d H:i:s'));
        $fp = fopen($logFile, 'a');
        fputcsv($fp, $entry);
        fclose($fp);

        http_response_code(200);
        echo "Success";
    }
} else {
    http_response_code(405);
    echo "Method Not Allowed";
}
?>