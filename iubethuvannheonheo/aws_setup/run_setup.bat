@echo off
echo ========================================
echo AWS Setup cho Our Memory App
echo ========================================
echo.

REM Kiểm tra Python có cài đặt không
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python chua duoc cai dat!
    echo Vui long cai dat Python 3.8+ tu https://www.python.org/
    pause
    exit /b 1
)

REM Cài đặt dependencies
echo Dang cai dat dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ❌ Loi khi cai dat dependencies!
    pause
    exit /b 1
)

echo.
echo Dang chay setup script...
echo.

REM Chạy setup script
python setup_aws.py

if errorlevel 1 (
    echo.
    echo ❌ Setup that bai!
    pause
    exit /b 1
)

echo.
echo ✅ Hoan tat!
pause

