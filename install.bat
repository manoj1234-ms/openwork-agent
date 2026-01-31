@echo off
REM OpenWork Agent Installation Script for Windows

echo 🚀 Installing OpenWork Agent...

REM Check if Node.js is installed
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo Visit: https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js detected

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

REM Ask for global installation
set /p "global_install=🌍 Install globally? (y/N): "
if /i "%global_install%"=="y" (
    echo 🔗 Creating global symlink...
    npm link
    if %ERRORLEVEL% EQU 0 (
        echo ✅ OpenWork Agent installed globally!
        echo You can now use 'openwork-agent' from anywhere.
    ) else (
        echo ⚠️  Global installation failed, but local installation succeeded.
    )
) else (
    echo ✅ OpenWork Agent installed locally!
    echo Run with: node src/main.js or npm start
)

echo.
echo 🎉 Installation complete!
echo.
echo 📚 Quick start:
echo   openwork-agent create my-api
echo   openwork-agent --help
echo.
echo 📖 Documentation: https://github.com/your-repo/openwork-agent

pause