using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Implementations;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers.Base;

internal abstract class AuthorizationManagerBase<TAuthzReq>(
    IAuthzContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthzUserStore<AuthzUser> userStore,
    IAuthzPermissionStore<AuthzPermission> permissionStore,
    IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue> permissionValueStore,
    IAuthzGroupStore<AuthzUser, AuthzGroup>? groupStore = null)
    : TcposAuthorizationManager<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue>(ctxStore, userStore, permissionStore, permissionValueStore, groupStore)
    where TAuthzReq : IAuthorizationRequirement
{
    public override async Task<bool> CanHandleAsync(AuthorizationHandlerContext context, ITcposAuthorizationRequirement requirement)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(requirement != null, new ArgumentNullException(nameof(requirement)));

        var canHandle = context.Requirements?.OfType<TAuthzReq>().Any() ?? false;
        return await Task.FromResult(canHandle);
    }
}
