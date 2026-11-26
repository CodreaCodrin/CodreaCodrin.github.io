param([ValidatePattern('^[A-Za-z0-9_]+\.exe$')][string] $OutputName = 'PortfolioEditor.exe')

$ErrorActionPreference = 'Stop'
$compiler = Join-Path $env:WINDIR 'Microsoft.NET\Framework64\v4.0.30319\csc.exe'
$outputDirectory = Join-Path $PSScriptRoot 'bin'
$output = Join-Path $outputDirectory $OutputName
$backend = Join-Path $PSScriptRoot 'editor_backend.mjs'
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null
& $compiler /nologo /target:winexe /platform:anycpu /optimize+ /codepage:65001 "/out:$output" "/resource:$backend,editor_backend.mjs" `
  /reference:System.Windows.Forms.dll /reference:System.Drawing.dll /reference:System.Web.Extensions.dll `
  (Join-Path $PSScriptRoot 'EditorRuntime.cs') (Join-Path $PSScriptRoot 'PortfolioEditor.cs')
if ($LASTEXITCODE -ne 0) { throw 'Compilarea Portfolio Editor a eșuat.' }
Get-Item -LiteralPath $output
