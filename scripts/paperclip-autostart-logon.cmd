@echo off
REM Auto-start Paperclip dev server after logon if nothing is listening on port 3100.
REM Scheduled task: PaperclipDevAutoStart. Edit PAPERCLIP_ROOT if your clone differs.
setlocal EnableExtensions
set "PAPERCLIP_ROOT=D:\Paperclip\paperclip"

if not exist "%PAPERCLIP_ROOT%\package.json" (
  echo [%date% %time%] paperclip-autostart: missing repo at "%PAPERCLIP_ROOT%"
  goto :eof
)

where pnpm >nul 2>&1 || (
  echo [%date% %time%] paperclip-autostart: pnpm not on PATH. Add Node.js / pnpm to PATH for this user.
  goto :eof
)

REM Exit 1 = port busy; exit 0 = free to start.
powershell.exe -NoProfile -Command ^
  "if (Get-NetTCPConnection -LocalPort 3100 -State Listen -ErrorAction SilentlyContinue) { exit 1 } else { exit 0 }"
if errorlevel 1 goto :eof

cd /d "%PAPERCLIP_ROOT%"
start "Paperclip pnpm dev" /min cmd /k "pnpm dev"

endlocal & goto :eof
