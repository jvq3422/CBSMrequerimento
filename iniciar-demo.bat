@echo off
title CBSM Requerimentos - Modo Demonstracao (Porta 4000)
cls
echo ======================================================================
echo    CBSM CONSTRUTORA - MODO DEMONSTRACAO (PORTA 4000)
echo ======================================================================
echo.
echo Abrindo navegador em http://localhost:4000 ...
start http://localhost:4000
node server/server.js
pause
