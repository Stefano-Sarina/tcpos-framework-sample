using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal abstract class FeedDbBuilderErpBase<TAuthzReq> : IFeedDatabaseManager<FeedDatabaseItem>
    where TAuthzReq : IAuthorizationRequirement
{
    private readonly IDataEntitiesRetriever[] _dataEntitiesRetrievers;

    protected abstract Operations Operation { get; }

    public FeedDbBuilderErpBase(IServiceProvider serviceProvider)
    {
        _dataEntitiesRetrievers = serviceProvider.GetServices<IDataEntitiesRetriever>().ToArray();
    }

    public async Task<bool> CanHandleAsync(Endpoint endpoint)
    {
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var authorizationPolicy = endpoint.Metadata.OfType<Microsoft.AspNetCore.Authorization.AuthorizationPolicy>()
            .FirstOrDefault();

        var canHandle = authorizationPolicy?.Requirements.OfType<TAuthzReq>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }

    public async Task<IEnumerable<FeedDatabaseItem>> BuildFeedDatabaseItemsAsync(Endpoint endpoint, CancellationToken cancellationToken)
    {
        List<FeedDatabaseItem> items = new List<FeedDatabaseItem>();
        if (endpoint is RouteEndpoint routeEndpoint)
        {
            var dataPullOuts = _dataEntitiesRetrievers.SelectMany(x => x.GetDataEntities()
                .Where(x => x.Operation == Operation))
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
