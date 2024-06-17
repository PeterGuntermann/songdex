Write-Host -ForegroundColor DarkMagenta "Build frontend ..."
Push-Location ./Coversongs.Frontend
docker build -t coversongs-frontend .
Pop-Location