@echo off

:begin
echo e  : exit
echo p  : parse
echo t  : test
set /p sel=select:
cls

if %sel%==e (
  exit
) else if %sel%==p (
  call coffee ./parseMain.coffee
) else if %sel%==t (
  call coffee ./test.coffee
)
goto begin
