<?php
// Дух Сибири — приём заявок (shared-хостинг reg.ru): MySQL + Telegram.
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'method']);
  exit;
}

$cfgPath = __DIR__ . '/config.php';
if (!is_file($cfgPath)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'noconfig']);
  exit;
}
$cfg = require $cfgPath;

$raw = file_get_contents('php://input');
$d = json_decode($raw, true);
if (!is_array($d)) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'invalid']);
  exit;
}

function field($d, $k, $max) {
  $v = isset($d[$k]) ? trim((string)$d[$k]) : '';
  return mb_substr($v, 0, $max);
}

$name    = field($d, 'name', 200);
$contact = field($d, 'contact', 200);
if ($name === '' || $contact === '') {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'required']);
  exit;
}

// honeypot — скрытое поле, заполняют только боты
if (field($d, 'website', 200) !== '') {
  echo json_encode(['ok' => true]);
  exit;
}

$serviceType   = field($d, 'serviceType', 200);
$city          = field($d, 'city', 200);
$format        = field($d, 'format', 200);
$preferredDate = field($d, 'preferredDate', 200);
$diameter      = field($d, 'diameter', 200);
$membrane      = field($d, 'membrane', 200);
$rim           = field($d, 'rim', 200);
$tuning        = field($d, 'tuning', 200);
$purpose       = field($d, 'purpose', 500);
$message       = field($d, 'message', 4000);
$ip            = $_SERVER['REMOTE_ADDR'] ?? '';
$ua            = mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 300);

// --- сохранение в MySQL ---
$id = null;
try {
  $pdo = new PDO(
    "mysql:host={$cfg['db_host']};dbname={$cfg['db_name']};charset=utf8mb4",
    $cfg['db_user'], $cfg['db_pass'],
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
  );
  $stmt = $pdo->prepare(
    'insert into leads
       (service_type,name,contact,city,format,preferred_date,diameter,membrane,rim,tuning,purpose,message,ip,user_agent)
     values (?,?,?,?,?,?,?,?,?,?,?,?,?,?)'
  );
  $stmt->execute([$serviceType,$name,$contact,$city,$format,$preferredDate,$diameter,$membrane,$rim,$tuning,$purpose,$message,$ip,$ua]);
  $id = $pdo->lastInsertId();
} catch (Throwable $e) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'storage']);
  exit;
}

// --- уведомление в Telegram (заявка уже сохранена; ответ ок даже если ТГ недоступен) ---
if (!empty($cfg['tg_token']) && !empty($cfg['tg_chat'])) {
  $lines = array_filter([
    '🔥 Новая заявка — Дух Сибири',
    'Направление: ' . ($serviceType !== '' ? $serviceType : '—'),
    'Имя: ' . $name,
    'Контакт: ' . $contact,
    $city ? 'Город: ' . $city : null,
    $purpose ? 'Что нужно: ' . $purpose : null,
    $message ? 'Комментарий: ' . $message : null,
    '№' . $id,
  ]);
  $payload = json_encode([
    'chat_id' => $cfg['tg_chat'],
    'text' => implode("\n", $lines),
    'disable_web_page_preview' => true,
  ]);
  $url = "https://api.telegram.org/bot{$cfg['tg_token']}/sendMessage";

  if (function_exists('curl_init')) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
      CURLOPT_POST => true,
      CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
      CURLOPT_POSTFIELDS => $payload,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_TIMEOUT => 10,
    ]);
    curl_exec($ch);
    curl_close($ch);
  } else {
    @file_get_contents($url, false, stream_context_create([
      'http' => ['method' => 'POST', 'header' => 'Content-Type: application/json', 'content' => $payload, 'timeout' => 10],
    ]));
  }
}

echo json_encode(['ok' => true, 'id' => $id]);
