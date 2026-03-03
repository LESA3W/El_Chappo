@echo off
title Installing Python modules for El-Chappo
echo ==========================================
echo      Installing required dependencies...
echo ==========================================

:: Step 1 - Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo  Python is not installed or not detected in PATH.
    pause
    exit /b
)

:: Step 2 - Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo  pip not found. Installing it now...
    python get-pip.py
)

:: Step 3 - Install required modules
echo Installing Flask...
pip install flask

echo Installing pyserial...
pip install pyserial

echo Installing requests...
pip install requests

echo.
echo All required modules have been installed!
pause

