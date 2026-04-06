param(
  [Parameter(Mandatory=$false)][string]$ResourceGroup = "Supermarket-RG",
  [Parameter(Mandatory=$false)][string]$WebAppName = "supermarket-api-uksuper",
  [Parameter(Mandatory=$false)][string]$MySqlFlexibleServerName = "supermarket-mysql-abc123",
  [Parameter(Mandatory=$false)][string]$DatabaseName = "supermarketdb",
  [Parameter(Mandatory=$false)][string]$MySqlAdminUser = "sqladmin",
  [Parameter(Mandatory=$false)][string]$AllowedOrigins = "http://localhost:3000",
  [Parameter(Mandatory=$false)][string]$HealthCheckPath = "/api/health"
)

$ErrorActionPreference = "Stop"

$azPath = "C:\Program Files\Microsoft SDKs\Azure\CLI2\wbin"
if (Test-Path (Join-Path $azPath "az.cmd")) {
  $env:Path += ";$azPath"
}

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
  throw "Azure CLI (az) not found. Install it or add it to PATH."
}

try {
  az account show --output none | Out-Null
} catch {
  Write-Host "Not logged in. Starting 'az login'..."
  az login --output none | Out-Null
}

Write-Host "Configuring MySQL firewall (allow Azure services)..."
# For MySQL Flexible Server, allowing 0.0.0.0/0.0.0.0 enables Azure resources access.
az mysql flexible-server firewall-rule create `
  --resource-group $ResourceGroup `
  --name $MySqlFlexibleServerName `
  --rule-name AllowAllAzureIPs `
  --start-ip-address 0.0.0.0 `
  --end-ip-address 0.0.0.0 `
  --output none | Out-Null

$fqdn = az mysql flexible-server show --resource-group $ResourceGroup --name $MySqlFlexibleServerName --query fullyQualifiedDomainName --output tsv
if ([string]::IsNullOrWhiteSpace($fqdn)) {
  throw "Could not read MySQL server FQDN. Check server name/resource group."
}

Write-Host "Setting App Service health check path..."
$healthConfig = @{ healthCheckPath = $HealthCheckPath } | ConvertTo-Json
$healthConfigFile = Join-Path $env:TEMP "webapp-siteconfig.json"
$healthConfig | Set-Content -Path $healthConfigFile -Encoding utf8
az webapp config set --resource-group $ResourceGroup --name $WebAppName --generic-configurations "@$healthConfigFile" --output none | Out-Null

Write-Host "Setting ALLOWED_ORIGINS..."
az webapp config appsettings set --resource-group $ResourceGroup --name $WebAppName --settings "ALLOWED_ORIGINS=$AllowedOrigins" --output none | Out-Null

# Prompt for DB password securely (not echoed).
$securePassword = Read-Host -AsSecureString "Enter Azure MySQL password for user '$MySqlAdminUser'"
$bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringAuto($bstr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr)
}

# Azure MySQL commonly requires TLS.
$dbConn = "Server=$fqdn;Port=3306;Database=$DatabaseName;User=$MySqlAdminUser;Password=$plainPassword;SslMode=Required;"

Write-Host "Setting DB_CONNECTION_STRING (hidden)..."
az webapp config appsettings set --resource-group $ResourceGroup --name $WebAppName --settings "DB_CONNECTION_STRING=$dbConn" --output none | Out-Null

# Generate a strong JWT key (kept secret in App Service settings; not printed).
$jwtBytes = New-Object byte[] 64
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($jwtBytes)
$jwtKey = [Convert]::ToBase64String($jwtBytes)

Write-Host "Setting Jwt__Key (hidden)..."
az webapp config appsettings set --resource-group $ResourceGroup --name $WebAppName --settings "Jwt__Key=$jwtKey" --output none | Out-Null

Write-Host "Restarting Web App..."
az webapp restart --resource-group $ResourceGroup --name $WebAppName --output none | Out-Null

Write-Host "Done. Next: browse https://$((az webapp show --resource-group $ResourceGroup --name $WebAppName --query defaultHostName --output tsv))$HealthCheckPath"
