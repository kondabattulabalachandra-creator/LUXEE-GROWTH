<?php
header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo "Method Not Allowed";
    exit;
}

function clean_field($key, $maxLength, $singleLine = true)
{
    $value = trim(strip_tags((string) ($_POST[$key] ?? '')));
    if ($singleLine) {
        $value = preg_replace('/[\r\n]+/', ' ', $value);
    }
    return function_exists('mb_substr') ? mb_substr($value, 0, $maxLength) : substr($value, 0, $maxLength);
}

$name    = clean_field('name', 100);
$email   = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$phone   = clean_field('phone', 20);
$service = clean_field('service', 100);
$message = clean_field('message', 2000, false);

if ($name === '' || !$email || $phone === '' || $message === '') {
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

$mailed = @mail($to, $subject, $body, $headers);

// Keep a backup copy of every enquiry. Direct web access to this file is blocked by .htaccess.
$logged = false;
$fp = @fopen(__DIR__ . '/contact_submissions.csv', 'a');
if ($fp) {
    $logged = fputcsv($fp, [date('Y-m-d H:i:s'), $name, $email, $phone, $service, $message, $mailed ? 'emailed' : 'email failed']) !== false;
    fclose($fp);
}

if ($mailed || $logged) {
    http_response_code(200);
    echo "Success";
} else {
    http_response_code(500);
    echo "Sorry, we could not save your enquiry. Please contact us on WhatsApp.";
}
