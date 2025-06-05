@echo off
cd /d %~dp0
echo ================================
echo  ⚙️  FORCE REDEPLOY VERS. f85a650
echo ================================

:: Kalimi te commit-i i sigurt
git checkout f85a650

:: Krijimi i branch-it të përkohshëm
git checkout -b final-deploy-f85

:: Commit bosh për ta detyruar Vercel-in të redeploy
git commit --allow-empty -m "🔁 Trigger redeploy of stable version f85a650"

:: Push me force drejt branch-it 'main'
git push origin final-deploy-f85:main --force

echo.
echo -----------------------------------------------
echo ✅ Deployimi u shty me sukses nga versioni f85a650!
echo -----------------------------------------------
pause
