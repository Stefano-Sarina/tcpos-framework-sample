if(Test-Path $PSScriptRoot/Publish)
{
    Remove-Item $PSScriptRoot/Publish -Force -Recurse
}
Remove-Item $PSScriptRoot/Sample.App.*.zip -Force -Recurse

& dotnet publish $PSScriptRoot/Framework.Sample.App.csproj -o $PSScriptRoot/Publish --sc -r win-x64

Remove-Item $PSScriptRoot/Publish/*.pdb -Force -Recurse
Remove-Item $PSScriptRoot/Publish/appsettings.json -Force -Recurse

Compress-Archive $PSScriptRoot/Publish/*.* "$PSScriptRoot/Sample.App.$(Get-Date -format "yyyyMMddHHmm").zip"
