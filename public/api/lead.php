<?php
/**
 * Receives a lead from the site's contact form and e-mails it to the studio.
 * Validates everything here: the browser is not trusted.
 */
declare(strict_types=1);

const LEAD_TO = 'chernikov.buro@mail.ru';
const LEAD_FROM = 'noreply@xn----btbblpmtkdmh8e2e.xn--p1ai';
const LEAD_SUBJECT = 'Заявка с сайта Черников Бюро';
const ALLOWED_HOSTS = ['xn----btbblpmtkdmh8e2e.xn--p1ai', 'www.xn----btbblpmtkdmh8e2e.xn--p1ai', 'localhost', '127.0.0.1'];

const MAX_BODY_BYTES = 20000;
const MAX_NAME_BYTES = 200;
const MAX_COMMENT_BYTES = 4000;
const MAX_ITEMS = 50;
const RATE_LIMIT = 5;
const RATE_WINDOW_SECONDS = 600;

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

function respond(int $status, ?string $error = null): void
{
    http_response_code($status);
    echo json_encode(['success' => $error === null, 'error' => $error], JSON_UNESCAPED_UNICODE);
    exit;
}

/** Trims a single line and removes control characters, so it cannot break the e-mail layout. */
function cleanLine($value, int $maxBytes): string
{
    if (!is_string($value) || preg_match('//u', $value) !== 1) {
        return '';
    }
    $line = trim((string) preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value));
    return strlen($line) > $maxBytes ? '' : $line;
}

function cleanText($value, int $maxBytes): string
{
    if (!is_string($value) || preg_match('//u', $value) !== 1 || strlen($value) > $maxBytes) {
        return '';
    }
    return trim((string) preg_replace('/[\x00-\x09\x0B-\x1F\x7F]+/u', ' ', str_replace("\r\n", "\n", $value)));
}

function isValidPhone(string $phone): bool
{
    $digits = (string) preg_replace('/\D/', '', $phone);
    $length = strlen($digits);
    return $length === 10 || ($length === 11 && ($digits[0] === '7' || $digits[0] === '8'));
}

function formatRub(int $value): string
{
    return number_format($value, 0, '', ' ') . ' ₽';
}

/** @return string[]|null lines for the e-mail, or null when an item is malformed */
function itemLines($items): ?array
{
    if ($items === null) {
        return [];
    }
    if (!is_array($items) || count($items) > MAX_ITEMS) {
        return null;
    }
    $lines = [];
    $total = 0;
    foreach ($items as $item) {
        if (!is_array($item)) {
            return null;
        }
        $title = cleanLine($item['title'] ?? null, 300);
        $edition = isset($item['edition']) ? cleanLine($item['edition'], 300) : '';
        $qty = $item['qty'] ?? null;
        $price = $item['price'] ?? null;
        if ($title === '' || !is_int($qty) || $qty < 1 || $qty > 99 || !is_int($price) || $price < 0 || $price > 100000000) {
            return null;
        }
        $total += $price * $qty;
        $what = $edition === '' ? $title : "{$title} ({$edition})";
        $lines[] = "• {$what} × {$qty} — " . formatRub($price * $qty);
    }
    if ($lines) {
        $lines[] = 'Итого по каталогу: ' . formatRub($total);
    }
    return $lines;
}

/** Fixed-window limit per visitor, kept in the host's temp folder. */
function isRateLimited(string $ip): bool
{
    $file = sys_get_temp_dir() . '/chernikov-lead-' . hash('sha256', $ip);
    $now = time();
    $handle = @fopen($file, 'c+');
    if ($handle === false) {
        return false;
    }
    flock($handle, LOCK_EX);
    $state = json_decode((string) stream_get_contents($handle), true);
    $inWindow = is_array($state) && ($now - (int) ($state['start'] ?? 0)) < RATE_WINDOW_SECONDS;
    $count = $inWindow ? (int) ($state['count'] ?? 0) + 1 : 1;
    $start = $inWindow ? (int) $state['start'] : $now;
    ftruncate($handle, 0);
    rewind($handle);
    fwrite($handle, (string) json_encode(['start' => $start, 'count' => $count]));
    flock($handle, LOCK_UN);
    fclose($handle);
    return $count > RATE_LIMIT;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST');
    respond(405, 'method_not_allowed');
}

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !in_array(parse_url($origin, PHP_URL_HOST), ALLOWED_HOSTS, true)) {
    respond(403, 'forbidden_origin');
}

if (stripos($_SERVER['CONTENT_TYPE'] ?? '', 'application/json') !== 0) {
    respond(415, 'unsupported_media_type');
}

$raw = (string) file_get_contents('php://input', false, null, 0, MAX_BODY_BYTES + 1);
if (strlen($raw) > MAX_BODY_BYTES) {
    respond(413, 'too_large');
}

$data = json_decode($raw, true);
if (!is_array($data)) {
    respond(400, 'invalid_json');
}

// bots fill the hidden field: answer as if it worked and send nothing
if (($data['website'] ?? '') !== '') {
    respond(200);
}

if (isRateLimited($_SERVER['REMOTE_ADDR'] ?? 'unknown')) {
    respond(429, 'too_many_requests');
}

$name = cleanLine($data['name'] ?? null, MAX_NAME_BYTES);
$phone = cleanLine($data['phone'] ?? null, 40);
$comment = cleanText($data['comment'] ?? '', MAX_COMMENT_BYTES);
$items = itemLines($data['items'] ?? null);

if (preg_match('/^.{2,}$/su', $name) !== 1 || !isValidPhone($phone) || $items === null || ($data['consent'] ?? false) !== true) {
    respond(422, 'invalid_lead');
}

$lines = ['Заявка с сайта Черников Бюро', '', "Имя: {$name}", "Телефон: {$phone}"];
if ($items) {
    array_push($lines, '', 'Интересует:', ...$items);
}
if ($comment !== '') {
    array_push($lines, '', "Комментарий: {$comment}");
}
array_push($lines, '', 'Клиент согласился на обработку персональных данных.');

$subject = '=?UTF-8?B?' . base64_encode(LEAD_SUBJECT) . '?=';
$headers = implode("\r\n", [
    'From: =?UTF-8?B?' . base64_encode('Сайт Черников Бюро') . '?= <' . LEAD_FROM . '>',
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
]);
$body = chunk_split(base64_encode(implode("\n", $lines)));

if (!mail(LEAD_TO, $subject, $body, $headers, '-f' . LEAD_FROM)) {
    error_log('lead.php: mail() failed');
    respond(502, 'mail_failed');
}

respond(200);
