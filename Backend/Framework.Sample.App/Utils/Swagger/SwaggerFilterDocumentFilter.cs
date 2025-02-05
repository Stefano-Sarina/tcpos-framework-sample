using Framework.Sample.App.Utils.swagger.attributes;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace Framework.Sample.App.Utils.Swagger;

public class SwaggerFilterDocumentFilter : IDocumentFilter
{
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        var apiDescriptions = context.ApiDescriptions.Where(d => d.ActionDescriptor.EndpointMetadata.OfType<SwaggerFilterAttribute>().Any());

        foreach (var apiDescription in apiDescriptions)
        {
            var relativePath = apiDescription?.RelativePath?.Replace("?", "") ?? "";

            swaggerDoc.Paths.Remove(relativePath);
            swaggerDoc.Paths.Remove($@"/{relativePath}");
        }

        foreach (Microsoft.AspNetCore.Mvc.ApiExplorer.ApiDescription? apiDescription in context.ApiDescriptions.Where(d => d.ActionDescriptor.EndpointMetadata.OfType<SwaggerFilterAttribute>().Any()))
        {
            if (!string.IsNullOrEmpty(apiDescription.RelativePath))
                swaggerDoc.Paths.Remove(apiDescription.RelativePath);
        }
    }
}