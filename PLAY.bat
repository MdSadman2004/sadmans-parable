@echo off
setlocal
set "GAME=%~dp0Sadman's Parable.html"
set "GAME=%GAME:\=/%"
set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if exist "%CHROME%" (
  start "" "%CHROME%" --app="file:///%GAME%" --window-size=1600,900 --new-window
) else (
  start "" "%~dp0Sadman's Parable.html"
)
endlocal
