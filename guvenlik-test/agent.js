/**
 * SecPanel Agent — test makinesinde sessizce çalışır
 * Tarayıcı açık olmadan Windows/Linux/macOS bildirim gösterir
 *
 * Kullanım:
 *   node agent.js --server http://192.168.1.100:3030
 *   node agent.js --server http://192.168.1.100:3030 --fullscreen
 */

const http    = require("http");
const https   = require("https");
const { exec } = require("child_process");
const os      = require("os");

const args      = process.argv.slice(2);
const serverArg = args[args.indexOf("--server") + 1] || "http://localhost:3030";
const fullscreen = args.includes("--fullscreen");
const PLATFORM  = os.platform();

/* ── Pencereyi gizle (Windows) ── */
if (PLATFORM === "win32" && process.env.SECPANEL_HIDDEN !== "1") {
  const { spawn } = require("child_process");
  const child = spawn(process.execPath, process.argv.slice(1), {
    detached: true,
    windowsHide: true,
    stdio: "ignore",
    env: { ...process.env, SECPANEL_HIDDEN: "1" },
  });
  child.unref();
  process.exit(0);
}

console.log(`[SecPanel Agent] Sunucu: ${serverArg}`);
console.log(`[SecPanel Agent] Platform: ${PLATFORM}`);
console.log(`[SecPanel Agent] Mod: ${fullscreen ? "tam ekran" : "bildirim"}`);

/* ── Platform bildirimleri ── */

function notifyWindows(level, message) {
  const title = level === "critical" ? "Kritik Güvenlik Uyarısı"
              : level === "warning"  ? "Güvenlik Uyarısı"
              :                        "Sistem Bildirimi";

  if (fullscreen) {
    // WPF tam ekran pencere — tarayıcı sıfır ilişkisi
    const bgColor  = level === "critical" ? "#1a0005" : level === "warning" ? "#1a1000" : "#000d1a";
    const accent   = level === "critical" ? "#E53935" : level === "warning" ? "#FFB300" : "#0288D1";
    const icon     = level === "critical" ? "⛔"       : level === "warning" ? "⚠"       : "ℹ";
    const safe     = message.replace(/'/g, "''").replace(/"/g, '""');

    const ps = `
Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore

$window = New-Object System.Windows.Window
$window.Title = '${title}'
$window.WindowStyle = 'None'
$window.WindowState = 'Maximized'
$window.Topmost = $true
$window.Background = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString('${bgColor}'))

$grid = New-Object System.Windows.Controls.Grid
$window.Content = $grid

$sp = New-Object System.Windows.Controls.StackPanel
$sp.VerticalAlignment = 'Center'
$sp.HorizontalAlignment = 'Center'
$sp.Orientation = 'Vertical'

$iconLbl = New-Object System.Windows.Controls.Label
$iconLbl.Content = '${icon}'
$iconLbl.FontSize = 72
$iconLbl.HorizontalAlignment = 'Center'
$iconLbl.Foreground = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString('${accent}'))

$titleLbl = New-Object System.Windows.Controls.Label
$titleLbl.Content = '${title}'
$titleLbl.FontSize = 28
$titleLbl.FontWeight = 'Light'
$titleLbl.Foreground = [System.Windows.Media.Brushes]::White
$titleLbl.HorizontalAlignment = 'Center'
$titleLbl.Margin = '0,0,0,16'

$border = New-Object System.Windows.Controls.Border
$border.CornerRadius = '6'
$border.Padding = '24,16,24,16'
$border.Margin = '0,0,0,32'
$border.Background = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString('#22${accent.replace('#','')}'))
$border.BorderBrush = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString('${accent}'))
$border.BorderThickness = '1'
$border.MaxWidth = 640

$msgLbl = New-Object System.Windows.Controls.TextBlock
$msgLbl.Text = '${safe}'
$msgLbl.FontSize = 16
$msgLbl.Foreground = [System.Windows.Media.Brushes]::WhiteSmoke
$msgLbl.TextWrapping = 'Wrap'
$msgLbl.TextAlignment = 'Center'
$border.Child = $msgLbl

$btn = New-Object System.Windows.Controls.Button
$btn.Content = 'Anladım'
$btn.Width = 160
$btn.Height = 44
$btn.FontSize = 14
$btn.FontWeight = 'SemiBold'
$btn.Foreground = [System.Windows.Media.Brushes]::White
$btn.Background = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString('${accent}'))
$btn.BorderThickness = '0'
$btn.Cursor = 'Hand'
$btn.Add_Click({ $window.Close() })

$sp.Children.Add($iconLbl) | Out-Null
$sp.Children.Add($titleLbl) | Out-Null
$sp.Children.Add($border) | Out-Null
$sp.Children.Add($btn) | Out-Null
$grid.Children.Add($sp) | Out-Null

$window.Add_KeyDown({ param($s,$e); if ($e.Key -eq 'Escape') { $window.Close() } })
$window.ShowDialog() | Out-Null
`;
    exec(`powershell -WindowStyle Hidden -Command "${ps.replace(/\n/g,' ').replace(/"/g,'\\"')}"`,
      (err) => { if (err) notifyWindowsToast(title, message); }
    );
  } else {
    notifyWindowsToast(title, message);
  }
}

function notifyWindowsToast(title, message) {
  const safe = message.replace(/'/g, "''");
  const ps = `
[Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
[Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime] | Out-Null
$template = @"
<toast>
  <visual><binding template='ToastGeneric'>
    <text>${title}</text>
    <text>${safe}</text>
  </binding></visual>
</toast>
"@
$xml = New-Object Windows.Data.Xml.Dom.XmlDocument
$xml.LoadXml($template)
$toast = New-Object Windows.UI.Notifications.ToastNotification $xml
$notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('SecPanel')
$notifier.Show($toast)
`;
  exec(`powershell -WindowStyle Hidden -Command "${ps.replace(/\n/g,' ')}"`,
    (err) => {
      // Toast başarısız olursa MessageBox fallback
      if (err) {
        const safe2 = message.replace(/'/g,"''");
        exec(`powershell -WindowStyle Hidden -Command "Add-Type -AssemblyName PresentationFramework; [System.Windows.MessageBox]::Show('${safe2}','${title}','OK','Warning') | Out-Null"`);
      }
    }
  );
}

function notifyLinux(level, message) {
  const icon = level === "critical" ? "dialog-error" : level === "warning" ? "dialog-warning" : "dialog-information";
  const title = level === "critical" ? "Kritik Güvenlik Uyarısı" : level === "warning" ? "Güvenlik Uyarısı" : "Bildirim";
  const safe  = message.replace(/'/g, "\\'").replace(/"/g, '\\"');

  if (fullscreen) {
    // Zenity tam ekran dialog
    exec(`zenity --warning --title="${title}" --text="${safe}" --width=600 2>/dev/null || \
          xmessage -center -title "${title}" "${safe}" 2>/dev/null || \
          notify-send -u critical "${title}" "${safe}"`, () => {});
  } else {
    exec(`notify-send -u ${level === "critical" ? "critical" : "normal"} "${title}" "${safe}" 2>/dev/null || \
          xmessage -center "${safe}" 2>/dev/null`, () => {});
  }
}

function notifyMac(level, message) {
  const title = level === "critical" ? "Kritik Güvenlik Uyarısı" : level === "warning" ? "Güvenlik Uyarısı" : "Bildirim";
  const safe  = message.replace(/"/g, '\\"');
  if (fullscreen) {
    exec(`osascript -e 'display dialog "${safe}" with title "${title}" with icon caution buttons {"Anladım"} default button "Anladım"'`, () => {});
  } else {
    exec(`osascript -e 'display notification "${safe}" with title "${title}"'`, () => {});
  }
}

function showAlert(level, message) {
  console.log(`[UYARI] [${level.toUpperCase()}] ${message}`);
  if (PLATFORM === "win32")  notifyWindows(level, message);
  else if (PLATFORM === "linux") notifyLinux(level, message);
  else if (PLATFORM === "darwin") notifyMac(level, message);
}

/* ── SSE bağlantısı ── */
let lastTimestamp = "";

function connect() {
  const url    = new URL("/events", serverArg);
  const client = url.protocol === "https:" ? https : http;

  const req = client.get(url.toString(), (res) => {
    console.log(`[SecPanel Agent] Bağlandı → ${serverArg}`);
    let buf = "";
    res.on("data", (chunk) => {
      buf += chunk.toString();
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(line.slice(6));
          if (data.timestamp && data.timestamp !== lastTimestamp && data.level && data.message) {
            lastTimestamp = data.timestamp;
            showAlert(data.level, data.message);
          }
        } catch { /* ping satırı */ }
      }
    });
    res.on("end", () => { console.log("[SecPanel Agent] Bağlantı kesildi, yeniden bağlanıyor..."); setTimeout(connect, 3000); });
  });

  req.on("error", (e) => {
    console.log(`[SecPanel Agent] Hata: ${e.message} — 5 sn sonra tekrar denenecek`);
    setTimeout(connect, 5000);
  });

  req.end();
}

connect();
