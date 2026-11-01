# Opens DeployFlow and the sample app on this laptop.
# Each connection runs in its own window and reconnects when a pod restarts.
# Close those windows to stop. Both listen on 127.0.0.1 only.
#
#   powershell -ExecutionPolicy Bypass -File \\wsl.localhost\Ubuntu\home\murali\deployflow\deploy\local\start-deployflow.ps1

$connections = @(
    @{ Title = 'DeployFlow connection (8080)'; Target = 'svc/deployflow-ui -n argocd 8080:80' },
    @{ Title = 'Student Portal connection (8090)'; Target = 'svc/student-portal -n student-portal 8090:80' }
)

foreach ($c in $connections) {
    $loop = "`$Host.UI.RawUI.WindowTitle = '$($c.Title)'; " +
        "while (`$true) { kubectl --context docker-desktop port-forward --address 127.0.0.1 $($c.Target); " +
        "Write-Host 'Reconnecting...'; Start-Sleep -Seconds 2 }"
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $loop
}

Start-Sleep -Seconds 4
Start-Process 'http://localhost:8080'
Start-Process 'http://localhost:8090'
