param(
  [int]$Port = 4173,
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
Write-Host "WellCheck Command Center running at http://127.0.0.1:$Port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".md" = "text/markdown; charset=utf-8"
}

function Send-Json($Context, [int]$StatusCode, $Payload) {
  $json = $Payload | ConvertTo-Json -Depth 12
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = "application/json; charset=utf-8"
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Read-Json($Request) {
  $reader = [System.IO.StreamReader]::new($Request.InputStream, $Request.ContentEncoding)
  try { return ($reader.ReadToEnd() | ConvertFrom-Json) }
  finally { $reader.Dispose() }
}

function Invoke-Kimi($Payload) {
  if ([string]::IsNullOrWhiteSpace($env:KIMI_API_KEY)) {
    throw "KIMI_API_KEY is not set on the server process."
  }

  $prompt = @"
Draft a concise hospital discharge coordinator note.
Do not diagnose or prescribe. Keep the deterministic alert severity unchanged.

Payload:
$($Payload | ConvertTo-Json -Depth 12)
"@

  $body = @{
    model = "kimi-k2.6"
    temperature = 0.2
    messages = @(
      @{ role = "system"; content = "You are a careful healthcare operations assistant, not a clinician." },
      @{ role = "user"; content = $prompt }
    )
  } | ConvertTo-Json -Depth 12

  $response = Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.moonshot.ai/v1/chat/completions" `
    -Headers @{ Authorization = "Bearer $env:KIMI_API_KEY"; "Content-Type" = "application/json" } `
    -Body $body

  return $response.choices[0].message.content
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relative)) { $relative = "index.html" }

    if ($context.Request.HttpMethod -eq "POST" -and $relative -eq "api/agent") {
      try {
        Send-Json $context 200 @{ note = (Invoke-Kimi (Read-Json $context.Request)) }
      } catch {
        Send-Json $context 500 @{ error = $_.Exception.Message }
      }
    } else {
      $target = Join-Path $Root $relative
      if (Test-Path -LiteralPath $target -PathType Leaf) {
        $resolved = (Resolve-Path -LiteralPath $target).Path
        if (-not $resolved.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) { throw "Invalid path." }
        $bytes = [System.IO.File]::ReadAllBytes($resolved)
        $extension = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
        $context.Response.ContentType = if ($mime.ContainsKey($extension)) { $mime[$extension] } else { "application/octet-stream" }
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $context.Response.StatusCode = 404
      }
    }

    $context.Response.OutputStream.Close()
  }
} finally {
  $listener.Stop()
}
