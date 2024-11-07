using System.Globalization;
using System.Net;
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.DataBind;

public static class HttpRequestExtensions
{
    public static int GetIntFromRoute(this HttpRequest httpRequest, string key)
    {
        return int.TryParse(httpRequest.GetStringFromRoute(key), CultureInfo.InvariantCulture, out var k) ? k : throw new HttpException(HttpStatusCode.BadRequest, $"Invalid route value {key}");
    }

    public static string GetStringFromRoute(this HttpRequest httpRequest, string key)
    {
        string httpRequestRouteValue;
        Safety.Check(!string.IsNullOrWhiteSpace(httpRequestRouteValue = "" + httpRequest.RouteValues[key]), new HttpException(HttpStatusCode.BadRequest, $"Invalid route value {key}"));
        return httpRequestRouteValue;
    }

    public static Version GetVersionFromRoute(this HttpRequest httpRequest, string key)
    {
        return Version.TryParse(httpRequest.GetStringFromRoute(key), out var v) ? v : throw new HttpException(HttpStatusCode.BadRequest, $"Invalid route value {key}");
    }

    public static T GetEnumFromRoute<T>(this HttpRequest httpRequest, string key)
        where T : struct, Enum
    {
        return Enum.TryParse<T>(httpRequest.GetStringFromRoute(key), out var v) ? v : throw new HttpException(HttpStatusCode.BadRequest, $"Invalid route value {key}");
    }
}