if(Test-Path $PSScriptRoot/Packages)
{
    Remove-Item $PSScriptRoot/Packages -Force -Recurse
}
# Remove-Item $PSScriptRoot/Sample.App.*.zip -Force -Recurse

& dotnet pack $PSScriptRoot\..\..\src\TCPOS.AspNetCore.DataBind\TCPOS.AspNetCore.DataBind.csproj -o $PSScriptRoot/Packages --include-symbols
& dotnet pack $PSScriptRoot\..\..\src\TCPOS.AspNetCore.DataBind.Implementations\TCPOS.AspNetCore.DataBind.Implementations.csproj -o $PSScriptRoot/Packages --include-symbols
& dotnet pack $PSScriptRoot\..\..\src\TCPOS.EntityFramework\TCPOS.EntityFramework.csproj -o $PSScriptRoot/Packages --include-symbols
& dotnet pack $PSScriptRoot\..\..\src\TCPOS.Common\TCPOS.Common.csproj -o $PSScriptRoot/Packages --include-symbols
& dotnet pack $PSScriptRoot\..\..\src\TCPOS.Common.CommandLine\TCPOS.Common.CommandLine.csproj -o $PSScriptRoot/Packages --include-symbols
& dotnet pack $PSScriptRoot\..\..\..\tcpos-authorization\src\TCPOS.Authorization\TCPOS.Authorization.csproj -o $PSScriptRoot/Packages --include-symbols

# Remove-Item $PSScriptRoot/Publish/*.pdb -Force -Recurse
# Remove-Item $PSScriptRoot/Publish/appsettings.json -Force -Recurse

# Compress-Archive $PSScriptRoot/Publish/*.* "$PSScriptRoot/Sample.App.$(Get-Date -format "yyyyMMddHHmm").zip"
