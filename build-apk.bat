@echo off
echo ===================================================
echo   Building Standalone Offline AgendaX Release APK
echo ===================================================
REM Detect standard Java Development Kit (JDK 17+) if not already set
if not defined JAVA_HOME (
    if exist "%ProgramFiles%\Android\Android Studio\jbr" (
        set "JAVA_HOME=%ProgramFiles%\Android\Android Studio\jbr"
    ) else if exist "%ProgramFiles%\Java\jdk-17" (
        set "JAVA_HOME=%ProgramFiles%\Java\jdk-17"
    ) else if exist "%LOCALAPPDATA%\Programs\Common\jdk-17" (
        set "JAVA_HOME=%LOCALAPPDATA%\Programs\Common\jdk-17"
    )
)
if defined JAVA_HOME set "PATH=%JAVA_HOME%\bin;%PATH%"

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
