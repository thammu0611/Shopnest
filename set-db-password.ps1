<#
    Stores your MySQL password as a *user* environment variable (DB_PASSWORD)
    so it never has to be written into application.properties or committed.

    The prompt is masked and the value is read directly by this script on your
    machine - run it yourself; nobody else needs to see the password.

        .\set-db-password.ps1
#>
$ErrorActionPreference = 'Stop'

Write-Host ''
Write-Host '  ShopNest - MySQL credentials' -ForegroundColor Magenta
Write-Host ''

$user = Read-Host '  MySQL username [root]'
if ([string]::IsNullOrWhiteSpace($user)) { $user = 'root' }

$secure = Read-Host '  MySQL password' -AsSecureString
$plain  = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
              [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure))

# Verify before saving, if the client is available.
$mysql = Get-Command mysql -ErrorAction SilentlyContinue
if ($mysql) {
    Write-Host ''
    Write-Host '  Testing the connection...' -ForegroundColor Cyan
    $null = & $mysql.Source "-u$user" "-p$plain" -e 'SELECT 1;' 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host '  Could not connect with those credentials. Nothing was saved.' -ForegroundColor Red
        Write-Host ''
        exit 1
    }
    Write-Host '  Connection OK' -ForegroundColor Green
}

[Environment]::SetEnvironmentVariable('DB_USERNAME', $user,  'User')
[Environment]::SetEnvironmentVariable('DB_PASSWORD', $plain, 'User')

Write-Host ''
Write-Host '  Saved as user environment variables DB_USERNAME / DB_PASSWORD.' -ForegroundColor Green
Write-Host '  Open a NEW terminal (or re-run the launcher) for them to take effect.' -ForegroundColor Gray
Write-Host ''
