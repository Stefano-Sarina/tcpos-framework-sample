if(Test-Path $PSScriptRoot/Publish)
{
    Remove-Item $PSScriptRoot/Publish -Force -Recurse
}
if(Test-Path $PSScriptRoot/Sample.App.zip)
{
    Remove-Item $PSScriptRoot/Sample.App.zip -Force -Recurse
}

& dotnet publish $PSScriptRoot/Framework.Sample.App.csproj -o $PSScriptRoot/Publish --sc -r win-x64

Remove-Item $PSScriptRoot/Publish/*.pdb -Force -Recurse
Remove-Item $PSScriptRoot/Publish/appsettings.json -Force -Recurse

Compress-Archive $PSScriptRoot/Publish/*.* $PSScriptRoot/Sample.App.zip
