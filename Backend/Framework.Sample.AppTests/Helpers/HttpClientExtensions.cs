using System.Diagnostics;
using System.Linq.Expressions;
using System.Net;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using TCPOS.Lib.Common.Extensions;
using TCPOS.Lib.Common.Text.Json.Extensions;

namespace Framework.Sample.AppTests.Helpers;

internal static class HttpClientExtensions
{
    private static readonly JsonSerializerOptions serializerOptions = new()
    {
        WriteIndented = true,
        ReferenceHandler = ReferenceHandler.IgnoreCycles
    };

    public static async Task RunBatch(this HttpClient httpClient, int numCommands, int ttl, Func<string, Task> commands, HttpStatusCode expectedRunStatusCode)
    {
        var batchId = await httpClient.HttpPostAsync<object, string>($"/api/1.0/Batch/{numCommands}/{ttl}", new object(), HttpStatusCode.Created);
        await commands(batchId!);
        await httpClient.HttpPutAsync<object, string>($"/api/1.0/Batch/{batchId}/Run", new object(), expectedRunStatusCode);
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
        var strResponse = await response.TryReadAsStringAsync();
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [GET:{endPoint}]");
        return strResponse.DeSerialize<T>();
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
        var strResponse = await response.TryReadAsStringAsync();
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [POST:{endPoint}]");
        return strResponse.DeSerialize<To>();
    }

    private static async Task<string> TryReadAsStringAsync(this HttpResponseMessage response)
    {
        try
        {
            var readAsStringAsync = await response.Content.ReadAsStringAsync();
            Debug.WriteLine($"********** Response body:\r\n\r\n{readAsStringAsync}\r\n\r\n**************************************************");
            return readAsStringAsync;
        }
        catch
        {
            return "";
        }
    }

    internal static async Task HttpPostAsync<Ti>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PostAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [POST:{endPoint}]");
    }

    internal static async Task HttpPostAsync(this HttpClient httpClient, string endPoint, HttpStatusCode expectedStatusCode)
    {
        using var postContent = ((string)null).ToStringContent();
        using var response = await httpClient.PostAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [POST:{endPoint}]");
    }

    internal static async Task<To?> HttpPutAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PutAsync(endPoint, postContent);
        var strResponse = await response.TryReadAsStringAsync();
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PUT:{endPoint}]");

        if (typeof(To) == typeof(string))
        {
            return (To)(object)strResponse;
        }

        return strResponse.DeSerialize<To>();
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
        var strResponse = await response.TryReadAsStringAsync();
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PATCH:{endPoint}]");
        return strResponse.DeSerialize<To>();
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
        return JsonSerializer.Serialize(o, serializerOptions);
    }
}
