using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Common.Diagnostics;
using TCPOS.Common.Linq.Extensions;
using TCPOS.Lib.Data.Batches.Enums;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

//SARSTE - NON passare mai IServiceProvider
internal class FeedDbBuilderDataPullOut(IEnumerable<IDataEntitiesRetriever> dataEntitiesRetrievers) : IFeedDatabaseManager<FeedDatabaseItem>
{
    private readonly IDataEntitiesRetriever[] _dataEntitiesRetrievers = dataEntitiesRetrievers.ToEnumerableOrEmpty().ToArray();

    public async Task<bool> CanHandleAsync(Endpoint endpoint)
    {
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var authorizationPolicy = endpoint.Metadata.OfType<AuthorizationPolicy>()
                                          .FirstOrDefault();

        var canHandle = authorizationPolicy?.Requirements.OfType<AuthorizationRequirementDataPullout>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }

    public async Task<IEnumerable<FeedDatabaseItem>> BuildFeedDatabaseItemsAsync(Endpoint endpoint, CancellationToken cancellationToken)
    {
        var items = new List<FeedDatabaseItem>();

        if (endpoint is RouteEndpoint routeEndpoint)
        {
            var dataPullOuts = _dataEntitiesRetrievers.SelectMany(x => x.GetDataEntities()
                                                                        .Where(x => x.Operation == Operations.Retrieve))
                                                      .ToArray();

            var methods = endpoint.Metadata.OfType<HttpMethodMetadata>().FirstOrDefault();

            if (methods?.HttpMethods != null)
            {
                foreach (var dataPullOut in dataPullOuts)
                {
                    foreach (var method in methods.HttpMethods)
                    {
                        items.Add(new FeedDatabaseItem($"{dataPullOut.Name}-{PermissionTypes.Api}-{method}"));
                    }
                }
            }
        }

        return await Task.FromResult(items);
    }
}
