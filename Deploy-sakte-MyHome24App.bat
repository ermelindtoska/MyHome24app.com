@echo off
setlocal enabledelayedexpansion
cd /d %~dp0

echo =============================
echo  🚀 Deployim në MyHome24App...
echo =============================

REM 1) verifiko që je në repo git
git rev-parse --is-inside-work-tree >nul 2>&1 || (
  echo ❌ Ky folder nuk eshte git repo.
  goto :end
)

REM 2) verifiko qe ekziston 'origin'
git remote get-url origin >nul 2>&1 || (
  echo ❌ Ska 'origin'. Shtoje me:
  echo    git remote add origin https://github.com/<user>/<repo>.git
  goto :end
)

REM 3) dega aktuale
for /f "delims=" %%b in ('git rev-parse --abbrev-ref HEAD') do set BRANCH=%%b
echo 🔀 Dega: %BRANCH%

REM 4) opsionale: merr te rejat dhe bej ff-only merge
git fetch origin %BRANCH% >nul 2>&1
git merge --ff-only origin/%BRANCH% >nul 2>&1 || (
  echo ❌ Dega lokale ka devijuar nga origin/%BRANCH%.
  echo   Bëj "git pull --rebase" manualisht dhe rifillo.
  goto :end
)

REM 5) ekzekuto testet (nëse ke husky, CI sërish vendoset)
set CI=true
echo 🧪 Duke ekzekutuar testet...
call npm test --silent -- --watchAll=false
if errorlevel 1 (
  echo ❌ Testet deshtuan. Deploy u anulua.
  goto :end
)

REM 6) stage + commit (lejo zero-changes)
git add -A
git diff --cached --quiet && (
  echo (s'ka ndryshime per commit)
) || (
  git commit -m "🚀 Deploy: %date% %time%" || goto :end
)

REM 7) push (krijo upstream nese mungon)
git rev-parse --abbrev-ref --symbolic-full-name @{u} >nul 2>&1 || (
  git push -u origin %BRANCH% || goto :end
) && (
  git push origin %BRANCH% || goto :end
)

echo -------------------------------------
echo ✅ Deployimi u krye me sukses!
echo -------------------------------------
:end
pause
endlocal
