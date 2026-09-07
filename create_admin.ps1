Param(
    [string]$Login = 'admin',
    [Parameter(Mandatory = $true)]
    [string]$Senha,
    [string]$Nome = 'Admin',
    [string]$Email = 'admin@local'
)

$api = 'http://localhost:3000/api'

Write-Host "Creating funcionario: $Login"
$body = @{ nome = $Nome; login = $Login; senha = $Senha; email = $Email } | ConvertTo-Json
Invoke-RestMethod -Uri "$api/funcionarios" -Method Post -ContentType 'application/json' -Body $body

Write-Host "Logging in to get token..."
$loginBody = @{ login = $Login; senha = $Senha } | ConvertTo-Json
$resp = Invoke-RestMethod -Uri "$api/auth/login" -Method Post -ContentType 'application/json' -Body $loginBody

Write-Output ($resp | ConvertTo-Json -Depth 5)
