@echo off
title CBSM Requerimentos - Modo Producao Limpo (Porta 5000)
cls
echo ======================================================================
echo    CBSM CONSTRUTORA - MODO PRODUCAO LIMPO (PORTA 5000)
echo ======================================================================
echo.
echo Abrindo navegador em http://localhost:5000 ...
start http://localhost:5000
node server/cleanServer.js
pause
