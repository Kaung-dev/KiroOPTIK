param(
  [int]$Port = 4173,
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
)

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add("http://127.0.0.1:$Port/")
$listener.Start()
Write-Host "WellCheck demo server running at http://127.0.0.1:$Port/"
Write-Host "Serving $Root"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".css" = "text/css; charset=utf-8"
  ".js" = "application/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".md" = "text/markdown; charset=utf-8"
}

function Send-Json {
  param(
    [Parameter(Mandatory = $true)] $Context,
    [Parameter(Mandatory = $true)] [int] $StatusCode,
    [Parameter(Mandatory = $true)] $Payload
  )

  $json = $Payload | ConvertTo-Json -Depth 12
  $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
  $Context.Response.StatusCode = $StatusCode
  $Context.Response.ContentType = "application/json; charset=utf-8"
  $Context.Response.ContentLength64 = $bytes.Length
  $Context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
}

function Read-RequestJson {
  param([Parameter(Mandatory = $true)] $Request)

  $reader = [System.IO.StreamReader]::new($Request.InputStream, $Request.ContentEncoding)
  try {
    $body = $reader.ReadToEnd()
    if ([string]::IsNullOrWhiteSpace($body)) {
      return $null
    }
    return $body | ConvertFrom-Json
  }
  finally {
    $reader.Dispose()
  }
}

function Invoke-KimiAgent {
  param([Parameter(Mandatory = $true)] $Payload)

  if ([string]::IsNullOrWhiteSpace($env:KIMI_API_KEY)) {
    throw "KIMI_API_KEY is not set on the server process."
  }

  $scenario = $Payload.scenario
  $patient = if ($Payload.activePatient) { $Payload.activePatient } else { $Payload.patient }
  $alert = $Payload.alert

  $prompt = @"
You are WellCheck, a non-clinical hospital discharge support assistant.

Create a concise coordinator note for the selected post-discharge check-in.
Do not diagnose or prescribe. Escalate safety concerns to the care team.

Patient:
$($patient | ConvertTo-Json -Depth 8)

Scenario transcript:
$($scenario | ConvertTo-Json -Depth 8)

Deterministic alert:
$($alert | ConvertTo-Json -Depth 8)

Return:
1. One-line status
2. Evidence bullets
3. Recommended coordinator action
4. Patient-friendly closing message
"@

  $request = @{
    model = "kimi-k2.6"
    temperature = 0.2
    messages = @(
      @{
        role = "system"
        content = "You are a careful healthcare operations assistant. You are not a clinician and must not provide diagnosis, prescriptions, or emergency medical instructions beyond escalation to the care team."
      },
      @{
        role = "user"
        content = $prompt
      }
    )
  } | ConvertTo-Json -Depth 12

  $headers = @{
    "Authorization" = "Bearer $env:KIMI_API_KEY"
    "Content-Type" = "application/json"
  }

  $response = Invoke-RestMethod `
    -Method Post `
    -Uri "https://api.moonshot.ai/v1/chat/completions" `
    -Headers $headers `
    -Body $request

  return $response.choices[0].message.content
}

try {
  while ($listener.IsListening) {
    $context = $listener.GetContext()
    $relative = [Uri]::UnescapeDataString($context.Request.Url.AbsolutePath.TrimStart('/'))
    if ([string]::IsNullOrWhiteSpace($relative)) {
      $relative = "index.html"
    }

    if ($context.Request.HttpMethod -eq "POST" -and $relative -eq "api/agent") {
      try {
        $payload = Read-RequestJson -Request $context.Request
        $note = Invoke-KimiAgent -Payload $payload
        Send-Json -Context $context -StatusCode 200 -Payload @{ note = $note }
      }
      catch {
        $message = $_.Exception.Message
        if ([string]::IsNullOrWhiteSpace($message)) {
          $message = "Kimi request failed. Confirm KIMI_API_KEY is set and the API is reachable."
        }
        Send-Json -Context $context -StatusCode 500 -Payload @{ error = $message }
      }
    }
    else {
      $target = Join-Path $Root $relative
      $resolved = $null
      if (Test-Path -LiteralPath $target -PathType Leaf) {
        $resolved = (Resolve-Path -LiteralPath $target).Path
      }

      if ($resolved -and $resolved.StartsWith($Root, [StringComparison]::OrdinalIgnoreCase)) {
        $bytes = [System.IO.File]::ReadAllBytes($resolved)
        $extension = [System.IO.Path]::GetExtension($resolved).ToLowerInvariant()
        if ($mime.ContainsKey($extension)) {
          $context.Response.ContentType = $mime[$extension]
        } else {
          $context.Response.ContentType = "application/octet-stream"
        }
        $context.Response.ContentLength64 = $bytes.Length
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      } else {
        $context.Response.StatusCode = 404
        $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not found")
        $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
      }
    }

    $context.Response.OutputStream.Close()
  }
}
finally {
  $listener.Stop()
}
