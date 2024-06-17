
pwsh .\build-image-backend.ps1
pwsh .\build-image-frontend.ps1

docker images

Write-Host -ForegroundColor DarkMagenta "Start containers ..."
docker compose up --detach
