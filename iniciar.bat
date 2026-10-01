@echo off
title CBSM Requerimentos - Construtora BSM
cls
echo ======================================================================
echo             CBSM CONSTRUTORA - SISTEMA DE REQUERIMENTOS
echo                      CANTEIRO E ENGENHARIA
echo ======================================================================
echo.
echo Selecione a versao que deseja executar:
echo.
echo  [1] Versao Demonstracao (Porta 4000 - com dados e produtos de teste)
echo  [2] Versao Limpa de Producao (Porta 5000 - sem mock data / banco zerado)
echo.
set /p opt="Digite o numero da opcao (1 ou 2) e pressione ENTER: "

if "%opt%"=="2" (
    echo.
    echo Iniciando Versao Limpa de Producao em http://localhost:5000 ...
    start http://localhost:5000
    node server/cleanServer.js
) else (
    echo.
    echo Iniciando Versao de Demonstracao em http://localhost:4000 ...
    start http://localhost:4000
    node server/server.js
)
pause
