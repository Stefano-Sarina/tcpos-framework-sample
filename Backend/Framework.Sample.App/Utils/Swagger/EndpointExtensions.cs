using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Routing.Patterns;
using System.Text.RegularExpressions;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Utils.swagger;

public static class EndpointExtensions
{
    /// <summary>
    ///     Returns first IAuthorizationRequirement from AuthorizationPolicy metadata
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="endpoint"></param>
    /// <returns></returns>
    public static T? GetRequirement<T>(this Endpoint endpoint)
        where T : IAuthorizationRequirement
    {
        Safety.Check(endpoint != null, "endpoint cannot be null");
        var authorizationPolicy = endpoint.Metadata.GetMetadata<AuthorizationPolicy>();
        return (T?)authorizationPolicy?.Requirements?.FirstOrDefault(x => x is T);
    }

    /// <summary>
    ///     Returns endpoint metadata by type
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="endpoint"></param>
    /// <returns></returns>
    public static T? GetMetadata<T>(this Endpoint endpoint)
        where T : class
    {
        Safety.Check(endpoint != null, "endpoint cannot be null");
        var attribute = endpoint.Metadata.GetMetadata<T>();
        return attribute;
    }

    /// <summary>
    ///     Returns true if in route patter there a parameter by name
    /// </summary>
    /// <param name="endpoint"></param>
    /// <param name="paramName"></param>
    /// <returns></returns>
    public static bool HasParameter(this Endpoint endpoint, string paramName)
    {
        var routeEndpoint = endpoint as RouteEndpoint;
        return routeEndpoint?.RoutePattern.Parameters.Any(x => string.Compare(x.Name, paramName, true) == 0) ?? false;
    }

    /// <summary>
    ///     Returns collection of endpoint methods
    /// </summary>
    /// <param name="endpoint"></param>
    /// <returns></returns>
    public static string[] GetMethods(this Endpoint endpoint)
    {
        Safety.Check(endpoint != null, "endpoint cannot be null");
        var httpMethodMetadata = endpoint.Metadata.GetMetadata<IHttpMethodMetadata>();
        return httpMethodMetadata!.HttpMethods.ToArray();
    }

    /// <summary>
    ///     Returns true if in PathSegments there is a segment by name
    /// </summary>
    /// <param name="endpoint"></param>
    /// <param name="segmentName"></param>
    /// <returns></returns>
    public static bool HasSegment(this Endpoint endpoint, string segmentName)
    {
        Safety.Check(endpoint != null, "endpoint cannot be null");

        if (endpoint is RouteEndpoint routeEndpoint)
        {
            return routeEndpoint.RoutePattern.PathSegments
                                .SelectMany(x => x.Parts.OfType<RoutePatternLiteralPart>())
                                .Any(x => string.Compare(x.Content, segmentName, true) == 0);
        }

        return false;
    }

    public static string FillRoute(this string? v, object values)
    {
        Safety.Check(values != null, nameof(values));

        return values.GetType().GetProperties().Aggregate(v ?? "", (a, p) => Regex.Replace(a, $"(?i)\\{{{Regex.Escape(p.Name)}\\}}", Convert.ToString(p.GetValue(values)) ?? ""));
    }
}
