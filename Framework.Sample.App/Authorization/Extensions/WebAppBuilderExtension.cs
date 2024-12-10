using Framework.Sample.App.Authorization.AuthorizationManagers;
using Framework.Sample.App.Authorization.AuthorizationStores;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Implementations;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Extensions;
using TCPOS.Authorization.FeedDatabase;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Authorization.Implementations;
using TCPOS.Common.Diagnostics;
using Framework.Sample.App.Authorization.FeedDbBuilders;

namespace Framework.Sample.App.Authorization.Extensions;

public static class WebAppBuilderExtension
{
    public static void AddTcposAuthorization(this IServiceCollection serviceCollection)
    {
        Safety.Check(serviceCollection != null, () => new ArgumentNullException(nameof(serviceCollection)));

        serviceCollection.AddHttpContextAccessor();

        serviceCollection.AddScoped<IAuthzContextStore<AuthorizationHandlerContext>, AuthzCtxStore>();
        serviceCollection.AddScoped<IAuthzUserStore<AuthzUser>, AuthzUserStore>();
        serviceCollection.AddScoped<IAuthzGroupStore<AuthzUser, AuthzGroup>, AuthzGroupStore>();
        serviceCollection.AddScoped<IAuthzPermissionStore<AuthzPermission>, AuthzPermissionStore>();
        serviceCollection.AddScoped<IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue>, AuthzPermissionValueStore>();

        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerBatch>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerDataPullOut>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpInsert>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpRemove>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpReplace>();
        serviceCollection.AddScoped<ITcposAuthorizationManager, AuthorizationManagerErpUpdate>();

        serviceCollection.AddScoped<ITcposPermissionClaimsTransformationBuilder, PermissionClaimsTransformationBuilder>();

        serviceCollection.AddTcposAuthorization<TcposAuthorizationHandler>(options =>
        {
            // those are for mvc
            //options.AddPolicy(nameof(AuthorizationRequirementEtl), policy => policy.Requirements.Add(new AuthorizationRequirementEtl()));
        });


        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderBatch>();
        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderDataPullOut>();
        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderErpInsert>();
        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderErpRemove>();
        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderErpReplace>();
        serviceCollection.AddSingleton<IFeedDatabaseManager, FeedDbBuilderErpUpdate>();
        serviceCollection.AddSingleton<IFeedDatabasePersister, FeedDatabasePersister>();
        serviceCollection.AddSingleton<IFeedDatabaseEngine, FeedDatabaseEngine>();

        serviceCollection.AddHostedService<PermissionBackgroundService>();
    }
}
