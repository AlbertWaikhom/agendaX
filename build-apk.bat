@echo off
echo ===================================================
echo   Building Standalone Offline AgendaX Release APK
echo ===================================================
set "JAVA_HOME=D:\software\Android-Studio\jbr"
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo 1. Embedding JavaScript bundle and assets...
call npx expo export:embed --entry-file index.ts --platform android --dev false --bundle-output android\app\src\main\assets\index.android.bundle --assets-dest android\app\src\main\res

echo 2. Assembling Release APK...
cd android
call gradlew.bat app:assembleRelease
cd ..

echo ===================================================
echo   BUILD COMPLETE!
echo   Your offline standalone APK is ready at:
echo   android\app\build\outputs\apk\release\app-release.apk
echo ===================================================
pause
