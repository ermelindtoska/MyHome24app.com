@echo off
cd /d %~dp0
echo =============================
echo  🚀 Deployim ne MyHome24App...
echo =============================

REM Kalo te versioni i sigurt
git checkout f85a650

REM Krijo branch të ri për push
git switch -c final-deploy

REM Shto një commit bosh për të forcuar push-in në Vercel
git commit --allow-empty -m "🔁 Force deploy version i saktë f85a650"

REM Push në origin/main me force
git push origin final-deploy:main --force

echo.
echo -------------------------------------
echo ✅ Deployimi u krye me sukses!
echo -------------------------------------
pause