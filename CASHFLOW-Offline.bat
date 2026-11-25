@echo off
setlocal EnableExtensions
cd /d "%~dp0"
title CASHFLOW - Offline

set "BAT_SELF=%~f0"
set "BAT_DIR=%~dp0"

call :try_launch
if "%ERRORLEVEL%"=="0" exit /b 0
if not "%ERRORLEVEL%"=="2" (
  echo.
  echo [ERROR] Failed to launch CASHFLOW Offline window.
  pause
  exit /b 1
)

if not exist "%~dp0package.json" (
  echo [ERROR] CASHFLOW offline app was not found in this folder!
  echo.
  echo Please download a fresh CASHFLOW-Offline.bat from Settings inside the app,
  echo or move this file into your extracted CASHFLOW project folder.
  echo.
  pause
  exit /b 1
)

echo ====================================================
echo   CASHFLOW - First-Time Offline Package Build
echo ====================================================
echo.

where npm >nul 2>&1
if errorlevel 1 (
  echo [ERROR] Offline bundle is missing and Node.js is not installed.
  echo.
  echo Either download CASHFLOW-Offline.bat directly from Settings,
  echo or install Node.js LTS from https://nodejs.org once and run this again.
  echo.
  pause
  exit /b 1
)

if not exist "%~dp0node_modules" (
  echo [1/2] Installing dependencies...
  call npm install
  if errorlevel 1 (
    echo.
    echo [ERROR] Dependency installation failed.
    pause
    exit /b 1
  )
  echo.
)

echo [2/2] Building standalone offline app...
call npm run build
if errorlevel 1 (
  echo.
  echo [ERROR] Build failed.
  pause
  exit /b 1
)

call :try_launch
if "%ERRORLEVEL%"=="0" exit /b 0
echo.
echo [ERROR] Could not launch dist\CASHFLOW-Offline.html.
pause
exit /b 1

:try_launch
where powershell >nul 2>&1
if errorlevel 1 (
  if exist "%~dp0CASHFLOW-Offline.html" (
    start "" "%~dp0CASHFLOW-Offline.html"
    exit /b 0
  )
  if exist "%~dp0dist\CASHFLOW-Offline.html" (
    start "" "%~dp0dist\CASHFLOW-Offline.html"
    exit /b 0
  )
  exit /b 2
)

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $raw=[IO.File]::ReadAllText($env:BAT_SELF); $mGzip='###CASHFLOW_PAYLOAD_'+'GZIP###'; $mRaw='###CASHFLOW_PAYLOAD_'+'RAW###'; $html=''; $iG=$raw.IndexOf($mGzip); $iR=$raw.IndexOf($mRaw); if($iG -ge 0){ $b64=$raw.Substring($iG+$mGzip.Length).Trim(); $gzBytes=[Convert]::FromBase64String($b64); $ms=New-Object IO.MemoryStream(,$gzBytes); $gz=New-Object IO.Compression.GZipStream($ms,[IO.Compression.CompressionMode]::Decompress); $out=New-Object IO.MemoryStream; $gz.CopyTo($out); $gz.Dispose(); $ms.Dispose(); $outDir=Join-Path $env:LocalAppData 'CASHFLOW-Offline'; if(-not (Test-Path -LiteralPath $outDir)){ [void](New-Item -ItemType Directory -Path $outDir -Force) }; $html=Join-Path $outDir 'CASHFLOW-Offline.html'; [IO.File]::WriteAllBytes($html,$out.ToArray()); $out.Dispose() } elseif($iR -ge 0){ $b64=$raw.Substring($iR+$mRaw.Length).Trim(); $bytes=[Convert]::FromBase64String($b64); $outDir=Join-Path $env:LocalAppData 'CASHFLOW-Offline'; if(-not (Test-Path -LiteralPath $outDir)){ [void](New-Item -ItemType Directory -Path $outDir -Force) }; $html=Join-Path $outDir 'CASHFLOW-Offline.html'; [IO.File]::WriteAllBytes($html,$bytes) }; if(-not $html){ $c1=Join-Path $env:BAT_DIR 'CASHFLOW-Offline.html'; $c2=Join-Path $env:BAT_DIR 'dist\CASHFLOW-Offline.html'; if(Test-Path -LiteralPath $c1 -PathType Leaf){ $html=$c1 } elseif(Test-Path -LiteralPath $c2 -PathType Leaf){ $html=$c2 } }; if(-not $html){ exit 2 }; $uri=(New-Object System.Uri([IO.Path]::GetFullPath($html))).AbsoluteUri; $prof=Join-Path $env:LocalAppData 'CASHFLOW-Offline\Profile'; $cands=@(); if(${env:ProgramFiles(x86)}){ $cands+=(Join-Path ${env:ProgramFiles(x86)} 'Microsoft\Edge\Application\msedge.exe') }; if($env:ProgramFiles){ $cands+=(Join-Path $env:ProgramFiles 'Microsoft\Edge\Application\msedge.exe') }; if($env:LocalAppData){ $cands+=(Join-Path $env:LocalAppData 'Microsoft\Edge\Application\msedge.exe') }; if($env:ProgramFiles){ $cands+=(Join-Path $env:ProgramFiles 'Google\Chrome\Application\chrome.exe') }; if(${env:ProgramFiles(x86)}){ $cands+=(Join-Path ${env:ProgramFiles(x86)} 'Google\Chrome\Application\chrome.exe') }; if($env:LocalAppData){ $cands+=(Join-Path $env:LocalAppData 'Google\Chrome\Application\chrome.exe') }; if($env:ProgramFiles){ $cands+=(Join-Path $env:ProgramFiles 'BraveSoftware\Brave-Browser\Application\brave.exe') }; if($env:LocalAppData){ $cands+=(Join-Path $env:LocalAppData 'BraveSoftware\Brave-Browser\Application\brave.exe') }; $app=$cands | Where-Object { $_ -and (Test-Path -LiteralPath $_ -PathType Leaf) } | Select-Object -First 1; $q=[char]34; if($app){ Start-Process -FilePath $app -ArgumentList @('--app='+$uri,'--user-data-dir='+$q+$prof+$q,'--no-first-run','--no-default-browser-check','--window-size=1280,840') } else { Start-Process -FilePath $html }"
exit /b %ERRORLEVEL%
