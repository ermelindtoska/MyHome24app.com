@echo off
cd /d %~dp0
echo =============================
echo  Deployim ne MyHome24App...
echo =============================

git add .
git commit -m "Auto deploy"
git pull --rebase origin main
git push origin main

echo.
echo -------------------------------------
echo ✅ Deployimi u krye me sukses!
echo -------------------------------------
pause
