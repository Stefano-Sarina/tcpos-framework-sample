using Framework.Sample.App.Authorization.FeedDbBuilders;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.SimpleAuthorization;

internal class FeedDbBuilderSimple : IFeedDatabaseManager<FeedDatabaseItem>
{
    /// <summary>
    /// Returns true if the feeder can handle the endpoint
    /// </summary>
    /// <param name="endpoint"></param>
    /// <returns></returns>
    public async Task<bool> CanHandleAsync(Endpoint endpoint)
    {
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var authorizationPolicy = endpoint.Metadata.OfType<AuthorizationPolicy>()
                                          .FirstOrDefault();

        var canHandle = authorizationPolicy?.Requirements.OfType<AuthorizationRequirementSimple>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }

    /// <summary>
    /// Returns the list of permission to be added in the database
    /// </summary>
    /// <param name="endpoint"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    public async Task<IEnumerable<FeedDatabaseItem>> BuildFeedDatabaseItemsAsync(Endpoint endpoint, CancellationToken cancellationToken)
    {
        var methods = endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault();

        if (methods == null)
        {
            return [];
        }

        List<FeedDatabaseItem> items = [];

        if (methods?.HttpMethods != null)
        {
            foreach (var method in methods.HttpMethods)
            {
                var simpleRequirementAttribute = endpoint.Metadata.OfType<SimpleRequirementAttribute>()
                                                          .FirstOrDefault();

                Safety.Check(!string.IsNullOrEmpty(simpleRequirementAttribute?.AttributeName), "Invalid simpleRequirementAttribute");

                items.Add(new FeedDatabaseItem($"{simpleRequirementAttribute.AttributeName}-{PermissionTypes.Api}-{method}"));
            }
        }

        return await Task.FromResult(items);
    }
}
