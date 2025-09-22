Write-Host -ForegroundColor DarkMagenta "Build backend ..."
Push-Location ./Songdex.Backend
docker build -t songdex-backend .
Pop-Location