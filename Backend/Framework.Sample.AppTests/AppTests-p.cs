using System.Net;
using Framework.Sample.App.WebApplication;
using Framework.Sample.AppTests.Helpers;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Hosting;
using TCPOS.Lib.Web.DataBind.Interfaces;
using TCPOS.Lib.Common.Linq.Extensions;

namespace Framework.Sample.AppTests;

public partial class AppTests : IDisposable, IAsyncDisposable
{
    private readonly HttpClient _httpClient;
    private readonly WebApplication _webApplication;

    public AppTests()
    {
        _webApplication = WebApplicationFactory.Create(Array.Empty<string>(), new WebApplicationFactoryOptions(true, true)).Result;
        _webApplication.Start();
        _httpClient = _webApplication.GetTestClient();
        var responseMessage = _httpClient.PostAsync("/api/login?isAdmin=true", null).Result;
        var cookie = responseMessage.Headers.SingleOrDefault(header => header.Key == "Set-Cookie").Value.ToEnumerableOrEmpty().First();
        _httpClient.DefaultRequestHeaders.Add("Cookie", cookie);
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

    private async Task RemoveAll<T>(string entityName)
        where T : IIDEntity<int>
    {
        var entities = await _httpClient.ODataHttpGetAsync<T>($"/api/1.0/{entityName}", HttpStatusCode.OK);

        foreach (var entity in entities.ToEnumerableOrEmpty())
        {
            await _httpClient.HttpDeleteAsync($"/api/1.0/{entityName}/{entity.Id}", HttpStatusCode.OK);
        }
    }
}
