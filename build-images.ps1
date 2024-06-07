
Write-Host -ForegroundColor DarkMagenta "Build backend ..."
Push-Location ./Coversongs.Backend
docker build -t coversongs-backend .
Pop-Location

Write-Host -ForegroundColor DarkMagenta "Build frontend ..."
Push-Location ./Coversongs.Frontend
docker build -t coversongs-frontend .
Pop-Location

docker images

Write-Host -ForegroundColor DarkMagenta "Start containers ..."
docker compose up --detach
