using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

internal class AuthorizationManagerBatch(
    IAuthzContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthzUserStore<AuthzUser> userStore,
    IAuthzPermissionStore<AuthzPermission> permissionStore,
    IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue> permissionValueStore,
    IAuthzGroupStore<AuthzUser, AuthzGroup>? groupStore = null)
    : AuthorizationManagerBase<AuthorizationRequirementBatch>(ctxStore, userStore, permissionStore, permissionValueStore, groupStore)
{
    protected override string GetPermission(HttpContext context, ITcposAuthorizationRequirement requirement)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(requirement != null, new ArgumentNullException(nameof(requirement)));

        return $"batch-{context.Request.Method}-{PermissionTypes.Api}".ToLower();
    }
}
