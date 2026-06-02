#Requires -Version 5.1
<#
.SYNOPSIS
    SecPanel Agent — Windows arka plan ajanı
    Node.js gerekmez. Test makinesine kopyalayıp çalıştırın.

.PARAMETER Server
    SecPanel sunucu adresi (varsayılan: http://localhost:3030)

.PARAMETER Fullscreen
    Tam ekran WPF penceresi göster (varsayılan: Windows Toast bildirimi)

.PARAMETER Interval
    Sunucu kontrol sıklığı saniye cinsinden (varsayılan: 2)

.EXAMPLE
    powershell -WindowStyle Hidden -ExecutionPolicy Bypass -File agent.ps1 -Server http://192.168.1.100:3030 -Fullscreen
#>

param(
    [string]$Server    = "http://localhost:3030",
    [switch]$Fullscreen,
    [int]$Interval     = 2
)

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName System.Windows.Forms

$lastTimestamp = ""

function Show-FullscreenAlert {
    param([string]$Level, [string]$Message)

    $bgColor = switch ($Level) {
        "critical" { "#0d0005" }
        "warning"  { "#0d0900" }
        default    { "#000d14" }
    }
    $accent = switch ($Level) {
        "critical" { "#E53935" }
        "warning"  { "#FFB300" }
        default    { "#0288D1" }
    }
    $icon = switch ($Level) {
        "critical" { [char]0x26D4 }   # ⛔
        "warning"  { [char]0x26A0 }   # ⚠
        default    { [char]0x2139 }   # ℹ
    }
    $title = switch ($Level) {
        "critical" { "Kritik Güvenlik Uyarısı" }
        "warning"  { "Güvenlik Uyarısı" }
        default    { "Sistem Bildirimi" }
    }

    $accentBrush = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString($accent))
    $bgBrush     = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.ColorConverter]::ConvertFromString($bgColor))
    $whiteBrush  = [System.Windows.Media.Brushes]::White
    $dimBrush    = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.Color]::FromArgb(180,255,255,255))

    # Ana pencere
    $win = New-Object System.Windows.Window
    $win.Title            = $title
    $win.WindowStyle      = "None"
    $win.WindowState      = "Maximized"
    $win.Topmost          = $true
    $win.Background       = $bgBrush
    $win.AllowsTransparency = $false

    # Izgara düzeni
    $grid = New-Object System.Windows.Controls.Grid
    $win.Content = $grid

    # Orta panel
    $stack = New-Object System.Windows.Controls.StackPanel
    $stack.VerticalAlignment   = "Center"
    $stack.HorizontalAlignment = "Center"
    $stack.Orientation         = "Vertical"
    $stack.Width               = 660

    # İkon
    $iconLabel = New-Object System.Windows.Controls.TextBlock
    $iconLabel.Text              = $icon
    $iconLabel.FontSize          = 76
    $iconLabel.Foreground        = $accentBrush
    $iconLabel.HorizontalAlignment = "Center"
    $iconLabel.Margin            = "0,0,0,18"
    $iconLabel.Effect            = New-Object System.Windows.Media.Effects.DropShadowEffect
    $iconLabel.Effect.Color      = [System.Windows.Media.ColorConverter]::ConvertFromString($accent)
    $iconLabel.Effect.BlurRadius = 30
    $iconLabel.Effect.ShadowDepth = 0

    # Kaynak etiketi
    $sourceLabel = New-Object System.Windows.Controls.TextBlock
    $sourceLabel.Text              = "SECPANEL · GÜVENLİK SİSTEMİ"
    $sourceLabel.FontSize          = 11
    $sourceLabel.Foreground        = $dimBrush
    $sourceLabel.HorizontalAlignment = "Center"
    $sourceLabel.Margin            = "0,0,0,10"
    $sourceLabel.FontFamily        = "Consolas"

    # Başlık
    $titleLabel = New-Object System.Windows.Controls.TextBlock
    $titleLabel.Text              = $title
    $titleLabel.FontSize          = 30
    $titleLabel.FontWeight        = "Light"
    $titleLabel.Foreground        = $whiteBrush
    $titleLabel.HorizontalAlignment = "Center"
    $titleLabel.Margin            = "0,0,0,24"
    $titleLabel.TextAlignment     = "Center"

    # Mesaj kutusu
    $border = New-Object System.Windows.Controls.Border
    $border.CornerRadius     = "6"
    $border.Padding          = "28,18,28,18"
    $border.Margin           = "0,0,0,36"
    $border.BorderThickness  = "1"
    $border.BorderBrush      = $accentBrush

    $accentColor = [System.Windows.Media.ColorConverter]::ConvertFromString($accent)
    $dimAccent   = [System.Windows.Media.Color]::FromArgb(30, $accentColor.R, $accentColor.G, $accentColor.B)
    $border.Background = [System.Windows.Media.SolidColorBrush]($dimAccent)

    $msgText = New-Object System.Windows.Controls.TextBlock
    $msgText.Text          = $Message
    $msgText.FontSize      = 16
    $msgText.Foreground    = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.Color]::FromArgb(220,255,255,255))
    $msgText.TextWrapping  = "Wrap"
    $msgText.TextAlignment = "Center"
    $msgText.LineHeight    = 26
    $border.Child = $msgText

    # Zaman
    $timeLabel = New-Object System.Windows.Controls.TextBlock
    $timeLabel.Text              = (Get-Date -Format "dd.MM.yyyy HH:mm:ss")
    $timeLabel.FontSize          = 12
    $timeLabel.Foreground        = $dimBrush
    $timeLabel.HorizontalAlignment = "Center"
    $timeLabel.Margin            = "0,0,0,28"
    $timeLabel.FontFamily        = "Consolas"

    # Buton
    $btn = New-Object System.Windows.Controls.Button
    $btn.Content         = "Anladım"
    $btn.Width           = 160
    $btn.Height          = 46
    $btn.FontSize        = 14
    $btn.FontWeight      = "SemiBold"
    $btn.Foreground      = $whiteBrush
    $btn.Background      = $accentBrush
    $btn.BorderThickness = "0"
    $btn.Cursor          = "Hand"
    $btn.Add_Click({ $win.Close() })

    # Elemanları ekle
    $stack.Children.Add($iconLabel)  | Out-Null
    $stack.Children.Add($sourceLabel)| Out-Null
    $stack.Children.Add($titleLabel) | Out-Null
    $stack.Children.Add($border)     | Out-Null
    $stack.Children.Add($timeLabel)  | Out-Null
    $stack.Children.Add($btn)        | Out-Null
    $grid.Children.Add($stack)       | Out-Null

    # ESC ile kapat
    $win.Add_KeyDown({
        param($sender, $e)
        if ($e.Key -eq "Escape") { $sender.Close() }
    })

    # Alt bilgi
    $footer = New-Object System.Windows.Controls.TextBlock
    $footer.Text              = "SecPanel Agent  |  ID: SP-$(Get-Random -Max 99999)"
    $footer.FontSize          = 11
    $footer.Foreground        = [System.Windows.Media.SolidColorBrush]([System.Windows.Media.Color]::FromArgb(60,255,255,255))
    $footer.HorizontalAlignment = "Center"
    $footer.VerticalAlignment   = "Bottom"
    $footer.Margin            = "0,0,0,16"
    $footer.FontFamily        = "Consolas"
    $grid.Children.Add($footer) | Out-Null

    [void]$win.ShowDialog()
}

function Show-ToastAlert {
    param([string]$Level, [string]$Message)

    $title = switch ($Level) {
        "critical" { "Kritik Güvenlik Uyarısı" }
        "warning"  { "Güvenlik Uyarısı" }
        default    { "Sistem Bildirimi" }
    }

    try {
        [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType=WindowsRuntime] | Out-Null
        [Windows.Data.Xml.Dom.XmlDocument, Windows.Data.Xml.Dom.XmlDocument, ContentType=WindowsRuntime]         | Out-Null

        $xml = New-Object Windows.Data.Xml.Dom.XmlDocument
        $xml.LoadXml(@"
<toast duration='long'>
  <visual>
    <binding template='ToastGeneric'>
      <text>$title</text>
      <text>$Message</text>
    </binding>
  </visual>
  <audio src='ms-winsoundevent:Notification.Looping.Alarm' loop='false'/>
</toast>
"@)
        $toast = New-Object Windows.UI.Notifications.ToastNotification $xml
        $notifier = [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier("SecPanel")
        $notifier.Show($toast)
    } catch {
        # Fallback: MessageBox
        [System.Windows.MessageBox]::Show($Message, $title, "OK", "Warning") | Out-Null
    }
}

# ── Ana döngü ──
Write-Host "SecPanel Agent baslatildi — $Server" -ForegroundColor Cyan
Write-Host "Mod: $(if ($Fullscreen) { 'Tam Ekran' } else { 'Toast Bildirim' })" -ForegroundColor Gray
Write-Host "ESC veya pencereyi kapatarak uyariyi gecirebilirsiniz.`n" -ForegroundColor Gray

while ($true) {
    try {
        $resp = Invoke-RestMethod -Uri "$Server/api/latest-alert" -Method GET -TimeoutSec 4 -ErrorAction Stop

        if ($resp.timestamp -and $resp.timestamp -ne $lastTimestamp -and $resp.message) {
            $lastTimestamp = $resp.timestamp
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Uyari alindi: [$($resp.level.ToUpper())] $($resp.message)" -ForegroundColor Yellow

            if ($Fullscreen) {
                Show-FullscreenAlert -Level $resp.level -Message $resp.message
            } else {
                Show-ToastAlert -Level $resp.level -Message $resp.message
            }
        }
    } catch {
        Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Sunucuya ulasilamiyor, bekleniyor..." -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds $Interval
}
