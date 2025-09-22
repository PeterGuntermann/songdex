Write-Host -ForegroundColor DarkMagenta "Build frontend ..."
Push-Location ./Songdex.Frontend
docker build -t songdex-frontend .
Pop-Location