using System.Linq.Expressions;
using System.Net;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using TCPOS.Common.Extensions;
using TCPOS.Common.Text.Json.Extensions;

namespace Framework.Sample.AppTests.Helpers;

internal static class HttpClientExtensions
{
    public static async Task RunBatch(this HttpClient httpClient, int numCommands, int ttl, Func<string, Task> commands)
    {
        var batchId = await httpClient.HttpPostAsync<object, string>($"/api/1.0/Batch/{numCommands}/{ttl}", new object(), HttpStatusCode.Created);
        await commands(batchId!);
        await httpClient.HttpPutAsync<object, string>($"/api/1.0/Batch/{batchId}/Run", new object(), HttpStatusCode.OK);
    }

    internal static async Task<T[]?> ODataHttpGetAsync<T>(this HttpClient httpClient, string endPoint, HttpStatusCode expectedStatusCode)
    {
        return await httpClient.ODataHttpGetAsync<T>($"{endPoint.TrimStringEnd("/")}", null, expectedStatusCode);
    }

    internal static async Task<T[]?> ODataHttpGetAsync<T>(this HttpClient httpClient, string endPoint, Expression<Func<T, bool>>? expr, HttpStatusCode expectedStatusCode)
    {
        var queryString = expr == null ? QueryString.Empty : QueryString.Create(new[]
        {
            new KeyValuePair<string, string>("$filter", ODataUtils.ExpressionToODataFilter(expr))
        }!);
        return await httpClient.HttpGetAsync<T[]>($"{endPoint.TrimStringEnd("/")}", queryString, expectedStatusCode);
    }

    internal static async Task<T?> HttpGetAsync<T>(this HttpClient httpClient, string endPoint, QueryString query, HttpStatusCode expectedStatusCode)
    {
        using var response = await httpClient.GetAsync($"{endPoint.TrimStringEnd("/")}{query.ToString()}");
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [GET:{endPoint}]");
        return (await response.Content.ReadAsStringAsync()).DeSerialize<T>();
    }

    internal static async Task HttpDeleteAsync(this HttpClient httpClient, string endPoint, HttpStatusCode expectedStatusCode)
    {
        using var response = await httpClient.DeleteAsync(endPoint);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [DELETE:{endPoint}]");
    }

    internal static async Task<To?> HttpPostAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PostAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [POST:{endPoint}]");
        var readAsStringAsync = await response.Content.ReadAsStringAsync();
        return readAsStringAsync.DeSerialize<To>();
    }
    internal static async Task HttpPostAsync<Ti>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PostAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [POST:{endPoint}]");
    }

    internal static async Task<To?> HttpPutAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PutAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PUT:{endPoint}]");
        var str = await response.Content.ReadAsStringAsync();

        if (typeof(To) == typeof(string))
        {
            return (To)(object)str;
        }

        return str.DeSerialize<To>();
    }

    internal static async Task HttpPutAsync<Ti>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PutAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PUT:{endPoint}]");
    }

    internal static async Task<To?> HttpPatchAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PatchAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PATCH:{endPoint}]");
        return (await response.Content.ReadAsStringAsync()).DeSerialize<To>();
    }

    internal static async Task HttpPatchAsync<Ti>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PatchAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PATCH:{endPoint}]");
    }

    public static StringContent ToStringContent(this object o)
    {
        return new StringContent(o.ToJson(), Encoding.UTF8, "application/json");
    }

    public static string ToJson(this object o)
    {
        var settings = new JsonSerializerSettings
        {
            ReferenceLoopHandling = ReferenceLoopHandling.Ignore,
            Formatting = Formatting.Indented
        };

        return JsonConvert.SerializeObject(o, settings);
    }
}
