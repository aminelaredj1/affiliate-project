# n8n Guardian Script
# Monitors port 5678 to ensure n8n is running.
# If not, restarts it using npx n8n in a hidden process.

$Port = 5678
$CheckIntervalSeconds = 60

Write-Output "Starting n8n Guardian..."

while ($true) {
    # Check if a process is listening on the specified port
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    
    if (-not $connection) {
        Write-Output "$(Get-Date): n8n is not running on port $Port. Starting n8n..."
        
        # Start n8n using npx n8n in the background
        Start-Process -FilePath "npx.cmd" -ArgumentList "n8n" -WindowStyle Hidden
        
        Write-Output "$(Get-Date): n8n started. Waiting for initialization..."
        # Give it some time to start up
        Start-Sleep -Seconds 15
    } else {
        # n8n is running
    }
    
    Start-Sleep -Seconds $CheckIntervalSeconds
}
