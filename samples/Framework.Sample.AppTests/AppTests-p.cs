using Framework.Sample.App.WebApplication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;

namespace Framework.Sample.AppTests;

public partial class AppTests : IDisposable, IAsyncDisposable
{
    private readonly HttpClient _httpClient;
    private readonly WebApplication _webApplication;

    public AppTests()
    {
        _webApplication = WebApplicationFactory.Create(Array.Empty<string>(), new WebApplicationFactoryOptions(true)).Result;
        _webApplication.Start();
        _httpClient = _webApplication.GetTestClient();
    }

    public async ValueTask DisposeAsync()
    {
        await _webApplication.DisposeAsync();
        _httpClient.Dispose();
    }

    public void Dispose()
    {
        ((IDisposable)_webApplication).Dispose();
        _httpClient.Dispose();
    }
}
