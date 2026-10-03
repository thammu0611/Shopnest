<#
    Stops whatever ShopNest has listening on the API and UI ports.
#>
foreach ($p in 8080, 5180) {
    $conns = Get-NetTCPConnection -LocalPort $p -State Listen -ErrorAction SilentlyContinue
    if (-not $conns) { Write-Host "  nothing listening on $p" -ForegroundColor Gray; continue }
    foreach ($c in $conns) {
        $proc = Get-Process -Id $c.OwningProcess -ErrorAction SilentlyContinue
        if ($proc) {
            Stop-Process -Id $proc.Id -Force
            Write-Host "  stopped $($proc.ProcessName) (pid $($proc.Id)) on port $p" -ForegroundColor Yellow
        }
    }
}
