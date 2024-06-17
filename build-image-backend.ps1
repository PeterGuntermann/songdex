Write-Host -ForegroundColor DarkMagenta "Build backend ..."
Push-Location ./Coversongs.Backend
docker build -t coversongs-backend .
Pop-Location