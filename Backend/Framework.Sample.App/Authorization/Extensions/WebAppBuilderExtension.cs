using Framework.Sample.App.Authorization.AuthorizationManagers;
using Framework.Sample.App.Authorization.AuthorizationStores;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.FeedDbBuilders;
using Framework.Sample.App.Authorization.Implementations;
using Framework.Sample.App.WebApplication;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Extensions;
using TCPOS.Authorization.FeedDatabase;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Authorization.Implementations;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.Extensions;

public static class WebAppBuilderExtension
{
    public static void AddTcposAuthorization(this IServiceCollection serviceCollection, WebApplicationFactoryOptions? webApplicationFactoryOptions)
    {
        Safety.Check(serviceCollection != null, () => new ArgumentNullException(nameof(serviceCollection)));

        serviceCollection.AddHttpContextAccessor();

        serviceCollection.AddScoped<IAuthorizationContextStore<HttpContext>, AuthzCtxHttpStore>();
        serviceCollection.AddScoped<IAuthorizationContextStore<AuthorizationHandlerContext>, AuthzCtxStore>();
        serviceCollection.AddScoped<IAuthorizationUserStore<AuthzUser, int>, AuthzUserStore>();
        serviceCollection.AddScoped<IAuthorizationGroupStore<AuthzUser, AuthzGroup, int>, AuthzGroupStore>();
        serviceCollection.AddScoped<IAuthorizationPermissionStore<AuthzPermission, int>, AuthzPermissionStore>();
        serviceCollection.AddScoped<IAuthorizationPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>, AuthzPermissionValueStore>();
        serviceCollection.AddScoped<ITcposAuthorizationQuerable<AuthzPermissionValue, int>, TcposAuthorizationQuerableImpl<AuthzPermissionValue>>();
        serviceCollection.AddScoped<ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>,
            TcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>>();

        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerBatch>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerDataPullOut>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpInsert>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpRemove>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpReplace>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpUpdate>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerFormsEndpoints>();

        serviceCollection.AddScoped<ITcposPermissionClaimsTransformationBuilder, PermissionClaimsTransformationBuilder>();

        if (webApplicationFactoryOptions?.DisableAuthorization ?? false)
        {
            serviceCollection.AddTcposAuthorization<FakeTcposAuthorizationHandler>(options =>
            {
                // those are for mvc
                //options.AddPolicy(nameof(AuthorizationRequirementEtl), policy => policy.Requirements.Add(new AuthorizationRequirementEtl()));
            });
        }
        else
        {
            serviceCollection.AddTcposAuthorization<TcposAuthorizationHandler>(options =>
            {
                // those are for mvc
                //options.AddPolicy(nameof(AuthorizationRequirementEtl), policy => policy.Requirements.Add(new AuthorizationRequirementEtl()));
            });
        }

        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderBatch>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderDataPullOut>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderErpInsert>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderErpRemove>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderErpReplace>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderErpUpdate>();
        serviceCollection.AddSingleton<IFeedDatabaseManager<FeedDatabaseItem>, FeedDbBuilderFormsEndpoints>();
        serviceCollection.AddSingleton<IFeedDatabasePersister<FeedDatabaseItem>, FeedDatabasePersister>();
        serviceCollection.AddSingleton<IFeedDatabaseEngine, FeedDatabaseEngine<FeedDatabaseItem>>();

        serviceCollection.AddHostedService<PermissionBackgroundService>();
    }
}
