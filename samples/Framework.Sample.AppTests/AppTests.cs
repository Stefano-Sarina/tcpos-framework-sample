using Framework.Sample.App;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Framework.Sample.AppTests;

public class AppTests : IDisposable, IAsyncDisposable
{
    private readonly HttpClient _httpClient;
    private readonly WebApplication _webApplication;

    public AppTests()
    {
        _webApplication = WebApplicationFactory.Create(new string[0], new App.WebApplicationFactoryOptions(true)).Result;
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

    [Fact]
    public async Task BatchCreateShouldWork()
    {
        var httpResponseMessage = await _httpClient.PostAsync("/api/1.0/Batch/1/20000", null);
        httpResponseMessage.EnsureSuccessStatusCode();
    }
}
