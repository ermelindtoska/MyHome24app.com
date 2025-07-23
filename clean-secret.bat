@echo off
echo === 1. Shkarkim i git-filter-repo ===
curl -o "%USERPROFILE%\Scripts\git-filter-repo.py" https://raw.githubusercontent.com/newren/git-filter-repo/main/git-filter-repo

echo === 2. Krijim i git-filter-repo.cmd ===
mkdir "%USERPROFILE%\Scripts" >nul 2>&1
echo @echo off > "%USERPROFILE%\Scripts\git-filter-repo.cmd"
echo python "%%USERPROFILE%%\Scripts\git-filter-repo.py" %%* >> "%USERPROFILE%\Scripts\git-filter-repo.cmd"

echo === 3. Shtim i Scripts ne PATH (nese s'eshte aty) ===
setx PATH "%PATH%;%USERPROFILE%\Scripts"

echo === 4. Navigim ne folderin e projektit ===
cd /d %~dp0

echo === 5. Ekzekutim i git-filter-repo per fshirje te file-it sekret ===
"%USERPROFILE%\Scripts\git-filter-repo.cmd" --path admin-scripts/serviceAccountKey.json --invert-paths

echo === 6. Heqje e lidhjes me remote te vjeter ===
git remote remove origin

echo === 7. Shtim i remote te ri ===
git remote add origin https://github.com/ermelindtoska/MyHome24app.com.git

echo === 8. Push me force (duhet vetem nje here) ===
git push origin main --force

echo === ✅ E kryer me sukses! ===
pause
