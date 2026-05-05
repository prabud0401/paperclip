#Requires -Version 5.1
<#
.SYNOPSIS
  Register (or replace) user log-on task PaperclipDevAutoStart to run scripts/paperclip-autostart-logon.cmd
#>
$ErrorActionPreference = "Stop"
$cmdPath = Join-Path $PSScriptRoot "paperclip-autostart-logon.cmd"
if (-not (Test-Path $cmdPath)) {
    Write-Error "Missing $cmdPath"
    exit 1
}
$cmdPath = (Resolve-Path $cmdPath).Path

$taskName = "PaperclipDevAutoStart"
$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument "/c `"$cmdPath`""
$trigger = New-ScheduledTaskTrigger -AtLogOn -User $env:USERNAME
$settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable
$principal = New-ScheduledTaskPrincipal -UserId $env:USERNAME -LogonType Interactive -RunLevel Limited

Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Principal $principal -Force | Out-Null
Write-Host "Registered scheduled task '$taskName' -> $cmdPath"
