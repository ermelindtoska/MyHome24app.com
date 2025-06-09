@echo off
cd /d %~dp0
echo =============================
echo  🚀 Deployim në MyHome24App...
echo =============================

REM Kontrollo që gjithçka është e ruajtur
git add .
git commit -m "💡 Deploy i ri automatik"
git push origin main

echo.
echo -------------------------------------
echo ✅ Deployimi u krye me sukses!
echo -------------------------------------
pause
