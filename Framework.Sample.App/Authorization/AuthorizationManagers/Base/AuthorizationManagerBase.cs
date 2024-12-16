using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Implementations;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers.Base;

internal abstract class AuthorizationManagerBase<TAuthzReq>(
    IAuthorizationContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthorizationUserStore<AuthzUser, int> userStore,
    IAuthorizationPermissionStore<AuthzPermission, int> permissionStore,
    ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authorizationRepository)
    : TcposAuthorizationManager<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>(ctxStore, userStore, permissionStore, authorizationRepository)
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
