$ErrorActionPreference = 'Stop'
$productRoot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$packageVersion = (Get-Content -LiteralPath (Join-Path $productRoot 'package.json') -Raw | ConvertFrom-Json).version
$releaseRoot = Join-Path $productRoot 'release'
$releaseName = 'VoltMart-' + $packageVersion + '-' + (Get-Date -Format 'yyyyMMdd-HHmmss')
$releaseTarget = [IO.Path]::GetFullPath((Join-Path $releaseRoot $releaseName))
if (-not $releaseTarget.StartsWith($productRoot + '\release\')) { throw 'Invalid release path' }
if (Test-Path -LiteralPath $releaseTarget) { throw 'Release already exists; choose a new output name' }
New-Item -ItemType Directory -Path $releaseTarget -Force | Out-Null
$included = @('src','backend','scripts','tests','documentation','deployment','licenses','dist','package.json','package-lock.json','tsconfig.json','vite.config.ts','tailwind.config.cjs','postcss.config.cjs','playwright.config.ts','index.html','server.ts','.env.example','.nvmrc','Dockerfile','.dockerignore','compose.yaml','README.md','IMPLEMENTATION_PLAN.md','RELEASE_CHECKLIST.md','THIRD_PARTY_NOTICES.md','ENVATO_LISTING.md')
foreach ($relativePath in $included) {
  $source = [IO.Path]::GetFullPath((Join-Path $productRoot $relativePath))
  if (-not $source.StartsWith($productRoot + '\')) { throw 'Invalid source path' }
  if (-not (Test-Path -LiteralPath $source)) { throw "Missing release file: $relativePath" }
  Copy-Item -LiteralPath $source -Destination (Join-Path $releaseTarget $relativePath) -Recurse
}
$forbidden = Get-ChildItem -LiteralPath $releaseTarget -Recurse -Force -File | Where-Object { $_.Name -eq '.env' -or $_.Extension -in @('.sqlite','.db','.log') -or $_.Name -match 'credentials' }
if ($forbidden) { throw 'Private data found in release; review before packaging.' }
$archivePath = $releaseTarget + '.zip'
Add-Type -AssemblyName System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory($releaseTarget, $archivePath, [IO.Compression.CompressionLevel]::Optimal, $true)
Write-Output $archivePath
