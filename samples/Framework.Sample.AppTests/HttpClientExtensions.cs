using System.Net;
using System.Text;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Newtonsoft.Json;
using TCPOS.Common.Extensions;
using TCPOS.Common.Text.Json.Extensions;

namespace Framework.Sample.AppTests;

internal static class HttpClientExtensions
{
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

    internal static async Task<To?> HttpPutAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PutAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PUT:{endPoint}]");
        var str=(await response.Content.ReadAsStringAsync());
        if (typeof(To) == typeof(string))
        {
            return (To)(object)str;
        }
        return str.DeSerialize<To>();
    }

    internal static async Task<To?> HttpPatchAsync<Ti, To>(this HttpClient httpClient, string endPoint, Ti payload, HttpStatusCode expectedStatusCode)
    {
        using var postContent = payload.ToStringContent();
        using var response = await httpClient.PatchAsync(endPoint, postContent);
        response.StatusCode.Should().Be(expectedStatusCode, $"is requested by the route [PATCH:{endPoint}]");
        return (await response.Content.ReadAsStringAsync()).DeSerialize<To>();
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
            Formatting = Formatting.Indented,
        };

        return JsonConvert.SerializeObject(o, settings);
    }
}