# ============================================================
# n8n Autonomous Controller Script
# - Checks the n8n API every hour (or on demand)
# - Finds the 'Product Automation' workflow
# - If not run in 24h or last run failed → triggers it
# - Logs activity to n8n-controller.log
# ============================================================

$N8N_URL   = "http://localhost:5678"
$API_KEY   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzE2MTkwNS1iMGI0LTQ1ZGUtOTc5Yy0zN2Y3MWJiNDhhMjIiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiN2JiZTQ0ZmQtNzkxYi00ZWI2LThjOGItNjVjOTVmZDhjMTg3IiwiaWF0IjoxNzc5NjMzNTEwfQ.vdmC0R6iZ51h_QJidtW23SHGeeIntAtPsBQLsBuGNgM"
$WORKFLOW_NAME = "Product Automation"
$LOG_FILE  = "$PSScriptRoot\n8n-controller.log"
$THRESHOLD_HOURS = 24

function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $entry = "[$timestamp] [$Level] $Message"
    Add-Content -Path $LOG_FILE -Value $entry
    Write-Output $entry
}

function Invoke-N8nApi {
    param([string]$Endpoint, [string]$Method = "GET", [string]$Body = $null)
    $headers = @{
        "X-N8N-API-KEY" = $API_KEY
        "Content-Type"  = "application/json"
    }
    $uri = "$N8N_URL$Endpoint"
    try {
        if ($Method -eq "POST" -and $Body) {
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body $Body -ErrorAction Stop
        } else {
            return Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -ErrorAction Stop
        }
    } catch {
        Write-Log "API call failed to $uri - $_" "ERROR"
        return $null
    }
}

Write-Log "n8n Controller check started."

# Step 1: Get all workflows
$workflows = Invoke-N8nApi -Endpoint "/api/v1/workflows"
if (-not $workflows) {
    Write-Log "Could not reach n8n API at $N8N_URL. Is n8n running?" "ERROR"
    exit 1
}

# Step 2: Find the target workflow
$target = $workflows.data | Where-Object { $_.name -eq $WORKFLOW_NAME } | Select-Object -First 1
if (-not $target) {
    Write-Log "Workflow '$WORKFLOW_NAME' not found. Available workflows: $(($workflows.data | Select-Object -ExpandProperty name) -join ', ')" "WARN"
    exit 1
}

$workflowId = $target.id
Write-Log "Found workflow '$WORKFLOW_NAME' with ID: $workflowId"

# Step 3: Get the last execution
$executions = Invoke-N8nApi -Endpoint "/api/v1/executions?workflowId=$workflowId&limit=1"
$shouldTrigger = $false
$reason        = ""

if (-not $executions -or $executions.data.Count -eq 0) {
    $shouldTrigger = $true
    $reason = "No executions found for this workflow."
} else {
    $lastExec   = $executions.data[0]
    $lastStatus = $lastExec.status
    $lastTime   = [datetime]$lastExec.startedAt
    $hoursSince = [math]::Round(((Get-Date) - $lastTime).TotalHours, 1)

    Write-Log "Last execution: Status='$lastStatus', Started='$lastTime' ($hoursSince hours ago)"

    if ($lastStatus -eq "error" -or $lastStatus -eq "crashed") {
        $shouldTrigger = $true
        $reason = "Last execution had status '$lastStatus'."
    } elseif ($hoursSince -gt $THRESHOLD_HOURS) {
        $shouldTrigger = $true
        $reason = "Last successful run was $hoursSince hours ago (threshold: $THRESHOLD_HOURS hours)."
    }
}

# Step 4: Trigger if needed
if ($shouldTrigger) {
    Write-Log "Triggering workflow. Reason: $reason" "WARN"
    $triggerBody = '{"workflowData": {}}'
    $result = Invoke-N8nApi -Endpoint "/api/v1/workflows/$workflowId/run" -Method "POST" -Body $triggerBody
    if ($result) {
        Write-Log "Workflow triggered successfully. Execution ID: $($result.data.executionId)" "INFO"
    } else {
        Write-Log "Failed to trigger workflow via API. Manual intervention may be needed." "ERROR"
    }
} else {
    Write-Log "Workflow is healthy. No action needed."
}

Write-Log "n8n Controller check complete."
