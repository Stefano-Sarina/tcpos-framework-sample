using Framework.Sample.App;
using Framework.Sample.App.Payloads;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
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
        var batchId= await _httpClient.HttpPostAsync<object,string>("/api/1.0/Batch/1/200000", new object(),System.Net.HttpStatusCode.Created);
        await _httpClient.HttpPostAsync<CustomerIn, string>($"/api/1.0/Batch/{batchId}/1/Customer/Insert", new CustomerIn()
        {
            FirstName = "Dario",
            LastName = "Rossi"
        }, System.Net.HttpStatusCode.Created);
        await _httpClient.HttpPutAsync<object, string>($"/api/1.0/Batch/{batchId}", new object(), System.Net.HttpStatusCode.OK);
        var arr=await _httpClient.HttpGetAsync<CustomerOut[]>($"/api/1.0/Customer", new QueryString(),System.Net.HttpStatusCode.OK);
    }
}