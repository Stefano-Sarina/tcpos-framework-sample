using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.OpenApi.Models;

namespace Framework.Sample.App.Utils.swagger;

public static class SwaggerExtensions
{
    public static bool IsCount(this RouteEndpoint routeEndpoint)
    {
        var segments = routeEndpoint?.RoutePattern.PathSegments;

        var parts = segments.SelectMany(x => x.Parts)
                            .OfType<RoutePatternLiteralPart>()
                            .ToList();

        var lastPart = parts?.LastOrDefault();

        return string.Compare(lastPart?.Content, "count", true) == 0;
    }

    public static bool IsBatch(this RouteEndpoint routeEndpoint)
    {
        var segments = routeEndpoint?.RoutePattern.PathSegments;

        var parts = segments.SelectMany(x => x.Parts)
                            .OfType<RoutePatternLiteralPart>()
                            .ToList();

        return parts.Any(x => string.Compare(x?.Content, Constants.Batch.ToLowerInvariant(), true) == 0);
    }

    public static bool IsSingleItem(this RouteEndpoint routeEndpoint)
    {
        var parameters = routeEndpoint?.RoutePattern.Parameters;
        return parameters.Any(x => string.Compare(x?.Name, "key", true) == 0);
    }

    public static bool IsSchema(this RouteEndpoint routeEndpoint)
    {
        var segments = routeEndpoint?.RoutePattern.PathSegments;

        var parts = segments.SelectMany(x => x.Parts)
                            .OfType<RoutePatternLiteralPart>()
                            .ToList();

        var lastPart = parts?.LastOrDefault();

        return string.Compare(lastPart?.Content, "schema", true) == 0;
    }

    public static string GetSchemaTypeName(this RoutePatternParameterPart routePatternParameterPart)
    {
        switch (routePatternParameterPart.Name.ToLower())
        {
            case "key":
            case "commandid":
                return "integer";
            default:
                return "string";
        }
    }

    public static int MainSortNumber(this OpenApiPathItem openApiPathItem)
    {
        if (openApiPathItem is ExplodeDocumentFilter.OpenApiPathItemEx x)
        {
            return x.Sort.MainSortNumber;
        }

        return 0;
    }

    public static int SecondaryOrderNumber(this OpenApiPathItem openApiPathItem)
    {
        if (openApiPathItem is ExplodeDocumentFilter.OpenApiPathItemEx x)
        {
            return x.Sort.SecondaryOrderNumber;
        }

        return 0;
    }
}
