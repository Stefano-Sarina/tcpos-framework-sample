﻿using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderFormsEndpoints : IFeedDatabaseManager<FeedDatabaseItem>
{
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
                items.Add(new FeedDatabaseItem($"formsendpoints-{PermissionTypes.Api}-{method}"));
            }
        }

        return await Task.FromResult(items);
    }

    public async Task<bool> CanHandleAsync(Endpoint endpoint)
    {
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var authorizationPolicy = endpoint.Metadata.OfType<AuthorizationPolicy>()
                                          .FirstOrDefault();

        var canHandle = authorizationPolicy?.Requirements.OfType<AuthorizationRequirementFormsEndpoints>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }
}
