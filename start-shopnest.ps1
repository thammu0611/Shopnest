<#
    ShopNest launcher
    -----------------
    Builds (if needed) and starts the Spring Boot API and the React dev
    server, waits until each is actually serving, then opens the browser.

        .\start-shopnest.ps1              # MySQL  (default)
        .\start-shopnest.ps1 -Db h2       # in-memory H2, no MySQL needed
        .\start-shopnest.ps1 -Rebuild     # force a fresh backend build
#>
param(
    [ValidateSet('mysql', 'h2')] [string] $Db = 'mysql',
    [switch] $Rebuild
)

$ErrorActionPreference = 'Stop'
$root      = $PSScriptRoot
$backend   = Join-Path $root 'backend'
$frontend  = Join-Path $root 'frontend'
$jar       = Join-Path $backend 'target\ecommerce-backend-1.0.0.jar'
$mavenBin  = Join-Path $env:USERPROFILE 'tools\apache-maven-3.9.9\bin'
$apiPort   = 8080
$uiPort    = 5180
$uiUrl     = "http://localhost:$uiPort"

if (Test-Path $mavenBin) { $env:Path = "$mavenBin;$env:Path" }

function Say($msg, $colour = 'Cyan') { Write-Host "  $msg" -ForegroundColor $colour }

function Test-Port($port) {
    $null -ne (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue)
}

function Wait-Port($port, $label, $timeoutSec = 120) {
    $sw = [Diagnostics.Stopwatch]::StartNew()
    while ($sw.Elapsed.TotalSeconds -lt $timeoutSec) {
        if (Test-Port $port) { Say "$label is up on port $port" 'Green'; return $true }
        Start-Sleep -Milliseconds 700
    }
    Say "$label did not come up within $timeoutSec s - check its window" 'Red'
    return $false
}

Write-Host ''
Write-Host '  ShopNest' -ForegroundColor Magenta
Write-Host '  ========' -ForegroundColor Magenta
Write-Host ''

# ---- prerequisites -------------------------------------------------------
if (-not (Get-Command java -ErrorAction SilentlyContinue)) { throw 'Java not found on PATH. Install JDK 17+.' }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js not found on PATH. Install Node 18+.' }

# ---- database ------------------------------------------------------------
if ($Db -eq 'mysql') {
    $svc = Get-Service -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -like '*MySQL*' -and $_.Status -eq 'Running' } |
           Select-Object -First 1
    if (-not $svc) {
        Say 'No running MySQL service found.' 'Yellow'
        Say 'Start MySQL, or run:  .\start-shopnest.ps1 -Db h2' 'Yellow'
        throw 'MySQL is not running.'
    }
    Say "MySQL service '$($svc.Name)' is running"
    if (-not $env:DB_PASSWORD) {
        Say 'DB_PASSWORD is not set - falling back to the default in application.properties.' 'Yellow'
        Say 'If the backend reports "Access denied", run set-db-password.ps1 once.' 'Yellow'
    }
} else {
    Say 'Using in-memory H2 - no MySQL required (data resets on restart).' 'Yellow'
}

# ---- backend -------------------------------------------------------------
if (Test-Port $apiPort) {
    Say "Port $apiPort already in use - assuming the API is already running" 'Yellow'
} else {
    if ($Rebuild -or -not (Test-Path $jar)) {
        if (-not (Get-Command mvn -ErrorAction SilentlyContinue)) { throw "Maven not found and $jar is missing." }
        Say 'Building the backend (first run takes a few minutes)...'
        Push-Location $backend
        try {
            mvn -q clean package -DskipTests
            if ($LASTEXITCODE -ne 0) { throw 'Backend build failed.' }
        } finally { Pop-Location }
        Say 'Build finished' 'Green'
    }

    $profileArg = if ($Db -eq 'h2') { '-Dspring.profiles.active=h2' } else { '' }
    Say 'Starting the API...'
    Start-Process -FilePath 'cmd.exe' `
        -ArgumentList '/c', "title ShopNest API && java $profileArg -jar `"$jar`" & pause" `
        -WorkingDirectory $backend
    if (-not (Wait-Port $apiPort 'API')) { throw 'Backend failed to start.' }
}

# ---- frontend ------------------------------------------------------------
if (Test-Port $uiPort) {
    Say "Port $uiPort already in use - assuming the UI is already running" 'Yellow'
} else {
    if (-not (Test-Path (Join-Path $frontend 'node_modules'))) {
        Say 'Installing frontend dependencies...'
        Push-Location $frontend
        try { cmd /c 'npm install' } finally { Pop-Location }
    }
    Say 'Starting the React dev server...'
    Start-Process -FilePath 'cmd.exe' `
        -ArgumentList '/c', 'title ShopNest UI && npm run dev & pause' `
        -WorkingDirectory $frontend
    if (-not (Wait-Port $uiPort 'UI')) { throw 'Frontend failed to start.' }
}

# ---- done ----------------------------------------------------------------
Write-Host ''
Say "ShopNest is running -> $uiUrl" 'Green'
Write-Host ''
Write-Host '    Customer   user@shopnest.com  / User@123'  -ForegroundColor Gray
Write-Host '    Admin      admin@shopnest.com / Admin@123' -ForegroundColor Gray
Write-Host ''
Write-Host "    API        http://localhost:$apiPort/api"  -ForegroundColor Gray
Write-Host '    Stop       close the two ShopNest windows, or run stop-shopnest.ps1' -ForegroundColor Gray
Write-Host ''
Start-Process $uiUrl
