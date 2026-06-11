# Бэкап сайта «Дух Сибири» в GitHub (репозиторий Shamanic-Drums, ветка main).
# Делает чистый снапшот текущего состояния ОДНИМ коммитом (без лишней истории)
# и force-push'ит в remote `shamanic`. Локальную рабочую ветку не теряет.
#
# Запуск из корня проекта:
#   powershell -ExecutionPolicy Bypass -File scripts\backup-to-github.ps1
#
# Требуется: настроенный remote `shamanic` ->
#   git remote add shamanic https://github.com/siberiangars/Shamanic-Drums.git

$ErrorActionPreference = 'Stop'
$stamp  = Get-Date -Format 'yyyy-MM-dd HH:mm'
$branch = (git rev-parse --abbrev-ref HEAD).Trim()

# 1) Сохранить текущую работу в рабочей ветке (если есть несохранённые изменения)
git add -A
if ((git status --porcelain).Length -gt 0) {
    git commit -q -m "Local save $stamp"
    Write-Host "Локальные изменения закоммичены в ветку '$branch'." -ForegroundColor DarkGray
}

# 2) Чистый снапшот одним корневым коммитом во временную orphan-ветку
git checkout --orphan _backup_tmp -q
git add -A
git commit -q -m "Сайт «Дух Сибири» — снапшот $stamp"

# 3) Force-push в Shamanic-Drums/main
git push --force shamanic _backup_tmp:main

# 4) Вернуться на рабочую ветку и удалить временную
git checkout $branch -q
git branch -D _backup_tmp -q

Write-Host "Готово: бэкап запушен в Shamanic-Drums (main)." -ForegroundColor Green
