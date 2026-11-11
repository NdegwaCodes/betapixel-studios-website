<?php
declare(strict_types=1);

const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
const ALLOWED_EXT = '/\.(ai|pdf|eps|svg|psd|png|jpe?g|tiff?|zip)$/i';
const MIN_FILL_MS = 3000;
const MAX_FILL_MS = 6 * 60 * 60 * 1000;
const RATE_LIMIT = 5;
const RATE_WINDOW = 3600;
const MAX_LINKS = 2;
const RISKY_IN_ZIP = '/\.(exe|scr|com|bat|cmd|msi|msp|dll|cpl|jar|js|jse|vbs|vbe|wsf|wsh|ps1|psm1|hta|lnk|reg|iso|img|vhdx?|apk|docm|xlsm|pptm|html?|svg|zip|rar|7z)$/i';
const MAX_FIELDS = 150;
const FIELD_KEY = '/^[a-z][a-z0-9_]{0,39}$/';
const SKIP = ['form_type', 'company-website', 'started', 'consent', 'files'];
const WHATSAPP = '+254 746 873 985';

$configFile = dirname(__DIR__, 2) . '/betapixels-config.php';
$config = is_file($configFile) ? (require $configFile) : [];
$TO = $config['enquiry_to'] ?? 'hello@betapixels.studio';
$FROM = $config['enquiry_from'] ?? 'website@betapixels.studio';
$FROM_NAME = $config['enquiry_from_name'] ?? 'Betapixel Website';
$RESEND_KEY = $config['resend_api_key'] ?? '';
$SMTP = ($config['smtp_pass'] ?? '') !== '' ? [
    'host' => $config['smtp_host'] ?? 'localhost',
    'port' => (int) ($config['smtp_port'] ?? 465),
    'user' => $config['smtp_user'] ?? $FROM,
    'pass' => $config['smtp_pass'],
] : null;
$SECTIONS = json_decode((string) file_get_contents(__DIR__ . '/sections.json'), true) ?: [];

header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');

$accept = $_SERVER['HTTP_ACCEPT'] ?? '';
$wantsHtml = strpos($accept, 'text/html') !== false && empty($_SERVER['HTTP_X_REQUESTED_WITH']);

function esc(string $s): string { return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8'); }

function respond(array $body, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($body, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function fail(string $error, int $status = 400): void {
    global $wantsHtml;
    if ($wantsHtml) {
        http_response_code($status);
        header('Content-Type: text/html; charset=utf-8');
        echo '<p>' . esc($error) . '</p><p><a href="/request-a-quote/">Go back</a></p>';
        exit;
    }
    respond(['ok' => false, 'error' => $error], $status);
}

function success(string $ref): void {
    global $wantsHtml;
    if ($wantsHtml) {
        header('Location: /thank-you/?ref=' . rawurlencode($ref), true, 303);
        exit;
    }
    respond(['ok' => true, 'ref' => $ref]);
}

function make_ref(string $prefix): string {
    $chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    $r = '';
    for ($i = 0; $i < 4; $i++) $r .= $chars[random_int(0, strlen($chars) - 1)];
    return $prefix . '-' . gmdate('ymd') . '-' . $r;
}

function same_site(string $origin): bool {
    $host = parse_url($origin, PHP_URL_HOST);
    if (!$host) return false;
    $port = parse_url($origin, PHP_URL_PORT);
    $originHost = $port ? "$host:$port" : $host;
    $own = array_filter([$_SERVER['HTTP_HOST'] ?? '', $_SERVER['SERVER_NAME'] ?? '']);
    foreach ($own as $h) if (strcasecmp(trim(explode(',', $h)[0]), $originHost) === 0 || strcasecmp($h, $host) === 0) return true;
    return false;
}

function collect(array $post): array {
    $out = [];
    $n = 0;
    foreach ($post as $k => $v) {
        $values = is_array($v) ? $v : [$v];
        foreach ($values as $item) {
            if (++$n > MAX_FIELDS) break 2;
            if (!is_string($item) || in_array($k, SKIP, true) || !preg_match(FIELD_KEY, (string) $k)) continue;
            $val = function_exists('mb_substr') ? mb_substr(trim($item), 0, 4000) : substr(trim($item), 0, 4000);
            if ($val === '') continue;
            $out[$k] = isset($out[$k]) ? $out[$k] . ', ' . $val : $val;
        }
    }
    return $out;
}

function render_email(string $kind, string $ref, array $data, array $files, array $sections): array {
    $used = [];
    $blocks = [];
    foreach ($sections as $s) {
        $rows = [];
        foreach ($s['fields'] as [$k, $label]) if (isset($data[$k])) { $used[$k] = true; $rows[] = [$label, $data[$k]]; }
        if ($rows) $blocks[] = ['title' => $s['title'], 'rows' => $rows];
    }
    $other = [];
    foreach ($data as $k => $v) if (!isset($used[$k])) $other[] = [$k, $v];
    if ($other) $blocks[] = ['title' => 'Other details', 'rows' => $other];
    if ($files) $blocks[] = ['title' => 'Attached files', 'rows' => array_map(fn($f, $i) => ['File ' . ($i + 1), $f], $files, array_keys($files))];

    $heading = $kind === 'quote' ? 'New quote request' : 'New website message';
    $text = "$heading — $ref\n\n";
    foreach ($blocks as $b) {
        $text .= "== {$b['title']} ==\n";
        foreach ($b['rows'] as [$l, $v]) $text .= "$l: $v\n";
        $text .= "\n";
    }
    $html = '<!doctype html><html><body style="margin:0;background:#F7F9FC;font-family:Arial,Helvetica,sans-serif;color:#1C274C">'
        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#F7F9FC;padding:24px 12px"><tr><td align="center">'
        . '<table role="presentation" width="640" cellpadding="0" cellspacing="0" style="max-width:640px;width:100%;background:#fff;border:1px solid #E7ECF4;border-radius:16px;overflow:hidden">'
        . '<tr><td style="background:#10297D;padding:22px 28px;color:#fff">'
        . '<div style="font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.8">Betapixel Studios · ' . esc($heading) . '</div>'
        . '<div style="font-size:26px;font-weight:bold;margin-top:6px">' . esc($ref) . '</div></td></tr>';
    foreach ($blocks as $b) {
        $html .= '<tr><td style="padding:20px 28px 4px"><div style="font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#B04A12;margin-bottom:8px">' . esc($b['title']) . '</div>'
            . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse">';
        foreach ($b['rows'] as [$l, $v]) {
            $html .= '<tr><td style="padding:8px 0;border-bottom:1px solid #E7ECF4;width:38%;vertical-align:top;font-weight:bold;font-size:14px">' . esc((string) $l) . '</td>'
                . '<td style="padding:8px 0;border-bottom:1px solid #E7ECF4;font-size:14px;white-space:pre-line">' . esc((string) $v) . '</td></tr>';
        }
        $html .= '</table></td></tr>';
    }
    $html .= '<tr><td style="padding:20px 28px 26px;font-size:13px;color:#505a7a">Reply to this email to answer the customer directly.</td></tr></table></td></tr></table></body></html>';
    $subject = ($kind === 'quote' ? 'Quote request' : 'Website message') . " $ref — " . ($data['name'] ?? 'Customer') . (isset($data['services']) ? ' · ' . $data['services'] : '');
    return ['subject' => $subject, 'text' => $text, 'html' => $html];
}

function confirmation(string $ref, string $name, string $kind): array {
    $what = $kind === 'quote' ? 'quote request' : 'message';
    $text = "Hello $name,\n\nThank you — your $what has reached Betapixel Studios. Your reference is $ref.\n\nWe will review the details and get back to you on WhatsApp or by email. If it is urgent, message us on WhatsApp at " . WHATSAPP . " and mention your reference.\n\nBetapixel Studios\nThe print hub building, Mezzanine Floor Room M02 Kweria Rd, Nairobi\nhttps://betapixels.studio";
    $html = '<div style="font-family:Arial,Helvetica,sans-serif;color:#1C274C;font-size:15px;line-height:1.6">' . nl2br(esc($text)) . '</div>';
    return ['subject' => "We received your $what — $ref", 'text' => $text, 'html' => $html];
}

function header_safe(string $s): string { return trim((string) preg_replace('/[\r\n]+/', ' ', $s)); }

function encode_header(string $s): string {
    $s = header_safe($s);
    return function_exists('mb_encode_mimeheader') ? mb_encode_mimeheader($s, 'UTF-8', 'B', "\r\n") : '=?UTF-8?B?' . base64_encode($s) . '?=';
}

function send_mail(array $m, string $to, ?string $replyTo, array $attachments): bool {
    global $FROM, $FROM_NAME, $RESEND_KEY;
    if ($RESEND_KEY !== '') return send_resend($m, $to, $replyTo, $attachments);
    $boundary = 'bp_' . bin2hex(random_bytes(12));
    $alt = 'alt_' . bin2hex(random_bytes(12));
    $headers = [
        'From: ' . encode_header($FROM_NAME) . " <$FROM>",
        'MIME-Version: 1.0',
        "Content-Type: multipart/mixed; boundary=\"$boundary\"",
    ];
    if ($replyTo) $headers[] = 'Reply-To: ' . header_safe($replyTo);
    $body = "--$boundary\r\nContent-Type: multipart/alternative; boundary=\"$alt\"\r\n\r\n"
        . "--$alt\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($m['text'])) . "\r\n"
        . "--$alt\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($m['html'])) . "\r\n"
        . "--$alt--\r\n";
    foreach ($attachments as $a) {
        $body .= "--$boundary\r\nContent-Type: application/octet-stream; name=\"{$a['filename']}\"\r\nContent-Transfer-Encoding: base64\r\n"
            . "Content-Disposition: attachment; filename=\"{$a['filename']}\"\r\n\r\n" . chunk_split($a['content']) . "\r\n";
    }
    $body .= "--$boundary--";
    global $SMTP;
    if ($SMTP) {
        $domain = substr((string) strrchr($FROM, '@'), 1) ?: 'localhost';
        array_unshift($headers, 'Date: ' . date('r'), 'Message-ID: <' . bin2hex(random_bytes(16)) . "@$domain>", 'To: ' . header_safe($to), 'Subject: ' . encode_header($m['subject']));
        smtp_send($SMTP, $FROM, header_safe($to), implode("\r\n", $headers) . "\r\n\r\n" . $body);
        return true;
    }
    if (!function_exists('mail')) throw new RuntimeException('mail() is disabled on this host; add SMTP settings to betapixels-config.php');
    return mail(header_safe($to), encode_header($m['subject']), $body, implode("\r\n", $headers), '-f' . $FROM);
}

function smtp_send(array $cfg, string $from, string $to, string $message): void {
    $ctx = stream_context_create(['ssl' => ['peer_name' => $cfg['host'], 'verify_peer' => true, 'verify_peer_name' => true]]);
    $secure = $cfg['port'] === 465;
    $s = @stream_socket_client(($secure ? 'ssl://' : 'tcp://') . $cfg['host'] . ':' . $cfg['port'], $errno, $errstr, 10, STREAM_CLIENT_CONNECT, $ctx);
    if (!$s) throw new RuntimeException("SMTP connection to {$cfg['host']}:{$cfg['port']} failed: $errstr");
    stream_set_timeout($s, 20);
    $step = function (?string $line, array $ok, string $label) use ($s): void {
        if ($line !== null) fwrite($s, $line . "\r\n");
        $reply = '';
        while (($l = fgets($s, 1024)) !== false) {
            $reply .= $l;
            if (strlen($l) < 4 || $l[3] === ' ') break;
        }
        if (!in_array((int) substr($reply, 0, 3), $ok, true)) throw new RuntimeException("SMTP $label failed: " . trim($reply));
    };
    try {
        $ehlo = 'EHLO ' . header_safe((string) ($_SERVER['SERVER_NAME'] ?? 'localhost'));
        $step(null, [220], 'greeting');
        $step($ehlo, [250], 'EHLO');
        if (!$secure) {
            $step('STARTTLS', [220], 'STARTTLS');
            if (!stream_socket_enable_crypto($s, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) throw new RuntimeException('SMTP TLS negotiation failed');
            $step($ehlo, [250], 'EHLO');
        }
        $step('AUTH LOGIN', [334], 'AUTH');
        $step(base64_encode($cfg['user']), [334], 'username');
        $step(base64_encode($cfg['pass']), [235], 'login (check smtp_user and smtp_pass)');
        $step("MAIL FROM:<$from>", [250], 'MAIL FROM');
        $step("RCPT TO:<$to>", [250, 251], 'RCPT TO');
        $step('DATA', [354], 'DATA');
        $step(preg_replace('/^\./m', '..', str_replace(["\r\n", "\n"], ["\n", "\r\n"], $message)) . "\r\n.", [250], 'message');
        fwrite($s, "QUIT\r\n");
    } finally {
        fclose($s);
    }
}

function send_resend(array $m, string $to, ?string $replyTo, array $attachments): bool {
    global $FROM, $FROM_NAME, $RESEND_KEY;
    $payload = ['from' => "$FROM_NAME <$FROM>", 'to' => [$to], 'subject' => $m['subject'], 'text' => $m['text'], 'html' => $m['html']];
    if ($replyTo) $payload['reply_to'] = $replyTo;
    if ($attachments) $payload['attachments'] = $attachments;
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt_array($ch, [
        CURLOPT_POST => true, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => ["Authorization: Bearer $RESEND_KEY", 'Content-Type: application/json'],
        CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
    ]);
    $res = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);
    if ($code < 200 || $code >= 300) error_log('Resend error ' . $code . ' ' . (is_string($res) ? $res : ''));
    return $code >= 200 && $code < 300;
}

function client_ip(): string { return (string) ($_SERVER['REMOTE_ADDR'] ?? 'unknown'); }

function rate_ok(string $ip): bool {
    $dir = dirname(__DIR__, 2) . '/.betapixels-rate';
    if (!is_dir($dir) && !@mkdir($dir, 0700)) return true;
    $now = time();
    if (random_int(1, 50) === 1) foreach (glob("$dir/*") ?: [] as $old) if (@filemtime($old) < $now - RATE_WINDOW) @unlink($old);
    $fh = @fopen($dir . '/' . hash('sha256', $ip . __DIR__), 'c+');
    if (!$fh) return true;
    flock($fh, LOCK_EX);
    $hits = array_filter(json_decode((string) stream_get_contents($fh), true) ?: [], fn($t) => is_int($t) && $t > $now - RATE_WINDOW);
    $ok = count($hits) < RATE_LIMIT;
    if ($ok) $hits[] = $now;
    ftruncate($fh, 0);
    rewind($fh);
    fwrite($fh, json_encode(array_values($hits)));
    flock($fh, LOCK_UN);
    fclose($fh);
    return $ok;
}

function looks_like_spam(array $data): bool {
    $all = implode("\n", $data);
    if (preg_match('~\[url=|<a\s+href|\[link=~i', $all)) return true;
    if (preg_match_all('~https?://|www\.~i', $all) > MAX_LINKS) return true;
    foreach (['name', 'company', 'phone'] as $k) if (isset($data[$k]) && preg_match('~https?://|www\.|\.(com|net|ru|xyz|top)\b~i', $data[$k])) return true;
    return false;
}

function starts(string $bytes, string ...$sigs): bool {
    foreach ($sigs as $s) if (strncmp($bytes, $s, strlen($s)) === 0) return true;
    return false;
}

function zip_is_safe(string $zip): bool {
    $len = strlen($zip);
    $eocd = strrpos(substr($zip, max(0, $len - 65557)), "PK\x05\x06");
    if ($eocd === false) return false;
    $eocd += max(0, $len - 65557);
    $info = unpack('vdisk/vcdDisk/ventriesHere/ventries/VcdSize/VcdOffset', substr($zip, $eocd + 4, 16));
    if (!$info || $info['entries'] > 500) return false;
    $p = $info['cdOffset'];
    for ($i = 0; $i < $info['entries']; $i++) {
        if (substr($zip, $p, 4) !== "PK\x01\x02") return false;
        $h = unpack('vflags', substr($zip, $p + 8, 2));
        $n = unpack('vname/vextra/vcomment', substr($zip, $p + 28, 6));
        if (!$h || !$n || ($h['flags'] & 1)) return false;
        if (preg_match(RISKY_IN_ZIP, substr($zip, $p + 46, $n['name']))) return false;
        $p += 46 + $n['name'] + $n['extra'] + $n['comment'];
    }
    return true;
}

function file_is_safe(string $ext, string $bytes): bool {
    switch ($ext) {
        case 'pdf': return starts($bytes, '%PDF') && !preg_match('~/(JavaScript|Launch)\b~', $bytes);
        case 'ai': return starts($bytes, '%PDF', '%!PS') && !preg_match('~/(JavaScript|Launch)\b~', $bytes);
        case 'eps': return starts($bytes, '%!PS', "\xC5\xD0\xD3\xC6");
        case 'png': return starts($bytes, "\x89PNG\r\n\x1a\n");
        case 'jpg': case 'jpeg': return starts($bytes, "\xFF\xD8\xFF");
        case 'tif': case 'tiff': return starts($bytes, "II*\0", "MM\0*");
        case 'psd': return starts($bytes, '8BPS');
        case 'svg': return stripos(substr($bytes, 0, 4096), '<svg') !== false && !preg_match('~<script|<foreignObject|<iframe|<embed|<object|<!ENTITY|javascript:|\son[a-z]+\s*=~i', $bytes);
        case 'zip': return starts($bytes, "PK\x03\x04") && zip_is_safe($bytes);
    }
    return false;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') respond(['ok' => false, 'error' => 'Method not allowed'], 405);

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origin !== '' && !same_site($origin)) fail('This form can only be sent from the Betapixel website.', 403);

$kind = ($_POST['form_type'] ?? '') === 'contact' ? 'contact' : 'quote';
$ref = make_ref($kind === 'quote' ? 'BPQ' : 'BPC');

$started = (int) ($_POST['started'] ?? 0);
$elapsed = (int) floor(microtime(true) * 1000) - $started;
if ((string) ($_POST['company-website'] ?? '') !== '' || !$started || $elapsed < MIN_FILL_MS || $elapsed > MAX_FILL_MS) success($ref);
if (!rate_ok(client_ip())) {
    error_log("Enquiry $ref: rate limit reached");
    fail('Too many requests from your connection. Please wait an hour or message us on WhatsApp: ' . WHATSAPP . '.', 429);
}

$data = collect($_POST);
if (looks_like_spam($data)) {
    error_log("Enquiry $ref: dropped as link spam");
    success($ref);
}
$name = $data['name'] ?? '';
$phone = $data['phone'] ?? '';
$email = $data['email'] ?? '';
if ($name === '' || ($phone === '' && $email === '')) fail('Please give your name and a phone number or email.');
if ($email !== '' && !preg_match('/^[^\s@]+@[^\s@]+\.[^\s@]+$/', $email)) fail('Please check the email address.');
if (isset($data['kra_pin'])) {
    $kra = strtoupper(preg_replace('/\s+/', '', $data['kra_pin']));
    if (!preg_match('/^[AP]\d{9}[A-Z]$/', $kra)) fail('Please check the KRA PIN (e.g. A123456789B), or leave it blank.');
    $data['kra_pin'] = $kra;
}

$attachments = [];
$names = [];
$total = 0;
$files = $_FILES['files'] ?? null;
if ($files && is_array($files['name'])) {
    foreach ($files['name'] as $i => $fname) {
        if (($files['error'][$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE || !($files['size'][$i] ?? 0)) continue;
        if ($files['error'][$i] !== UPLOAD_ERR_OK) fail('A file could not be uploaded. Please try again or share it as a link.');
        if (!preg_match(ALLOWED_EXT, (string) $fname, $ext)) fail("$fname: file type not accepted.");
        $total += (int) $files['size'][$i];
        if ($total > MAX_TOTAL_BYTES) fail('Attachments are over 4 MB in total — please share large artwork as a link instead.');
        $tmp = (string) $files['tmp_name'][$i];
        if (!is_uploaded_file($tmp)) fail('A file could not be uploaded. Please try again or share it as a link.');
        $bytes = (string) file_get_contents($tmp);
        if (!file_is_safe(strtolower($ext[1]), $bytes)) {
            error_log("Enquiry $ref: rejected attachment that did not match its type");
            fail("$fname: this file could not be accepted. Please send it as a PDF or image, or share it as a link.");
        }
        $attachments[] = ['filename' => preg_replace('/[^\w.\- ]+/', '_', (string) $fname), 'content' => base64_encode($bytes)];
        $names[] = $fname . ' (' . round($files['size'][$i] / 1024) . ' KB)';
    }
}

function try_send(array $m, string $to, ?string $replyTo, array $attachments, string $ref): bool {
    try {
        return send_mail($m, $to, $replyTo, $attachments);
    } catch (Throwable $e) {
        error_log("Enquiry $ref: " . get_class($e) . ': ' . $e->getMessage());
        return false;
    }
}

function mail_log(string $ref, string $what, string $to, int $files): void {
    $log = dirname(__DIR__, 2) . '/betapixels-mail.log';
    if (@filesize($log) > 1048576) @rename($log, "$log.1");
    $domain = substr((string) strrchr($to, '@'), 1);
    @file_put_contents($log, gmdate('c') . " $ref $what to=*@$domain files=$files\n", FILE_APPEND | LOCK_EX);
}

$mail = render_email($kind, $ref, $data, $names, $SECTIONS);
if (!try_send($mail, $TO, $email !== '' ? $email : null, $attachments, $ref)) {
    error_log("Enquiry $ref could not be sent");
    fail('We could not send your enquiry just now. Please try again or use WhatsApp: ' . WHATSAPP . '.', 502);
}
mail_log($ref, $kind, $TO, count($attachments));
if ($email !== '' && try_send(confirmation($ref, $name, $kind), $email, $TO, [], $ref)) mail_log($ref, 'confirmation', $email, 0);
success($ref);
