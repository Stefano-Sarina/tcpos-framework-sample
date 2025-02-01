using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderBatch : IFeedDatabaseManager<FeedDatabaseItem>
{
    public async Task<bool> CanHandleAsync(Endpoint endpoint)
    {
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var authorizationPolicy = endpoint.Metadata.OfType<Microsoft.AspNetCore.Authorization.AuthorizationPolicy>()
            .FirstOrDefault();

        var canHandle = authorizationPolicy?.Requirements.OfType<AuthorizationRequirementBatch>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }

    public async Task<IEnumerable<FeedDatabaseItem>> BuildFeedDatabaseItemsAsync(Endpoint endpoint, CancellationToken cancellationToken)
    {
        var items = new List<FeedDatabaseItem>();
        if (endpoint is RouteEndpoint routeEndpoint)
        {
            var methods = endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault();
            if (methods?.HttpMethods != null)
            {
                foreach (var method in methods.HttpMethods)
                {
                    items.Add(new FeedDatabaseItem($"batch-{PermissionTypes.Api}-{method}"));
                }
            }
        }

        return await Task.FromResult(items);
    }
}
