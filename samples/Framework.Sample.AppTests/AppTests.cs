using Framework.Sample.App;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using Xunit;

namespace Framework.Sample.AppTests;

public class AppTests : IDisposable, IAsyncDisposable
{
    private readonly HttpClient _httpClient;
    private readonly Microsoft.AspNetCore.Builder.WebApplication _webApplication;

    public AppTests()
    {
        _webApplication = App.WebApplicationFactory.Create(new string[0], new App.WebApplicationOptions(true)).Result;
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
    public async Task TestMethod1()
    {
        var aaaa=await _httpClient.PostAsync("/api/1.0/Batch/1/20000", null);
        aaaa.EnsureSuccessStatusCode();
    }
}
