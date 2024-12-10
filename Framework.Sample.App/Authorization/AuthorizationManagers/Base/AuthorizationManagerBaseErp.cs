using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers.Base;

internal class AuthorizationManagerBaseErp<TAuthzReq>(
    IAuthzContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthzUserStore<AuthzUser> userStore,
    IAuthzPermissionStore<AuthzPermission> permissionStore,
    IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue> permissionValueStore,
    IAuthzGroupStore<AuthzUser, AuthzGroup>? groupStore = null)
    : AuthorizationManagerBase<TAuthzReq>(ctxStore, userStore, permissionStore, permissionValueStore, groupStore)
    where TAuthzReq : IAuthorizationRequirement
{
    protected override string GetPermission(HttpContext context, ITcposAuthorizationRequirement requirement)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(requirement != null, new ArgumentNullException(nameof(requirement)));

        var routeEndpoint = context.GetEndpoint() as RouteEndpoint;
        Safety.Check(routeEndpoint != null, "Not a valid endpoint");

        Safety.Check(context.Request.RouteValues.Any(x => x.Key == "name"), "Missing 'name' route value");
        var name = context.Request.RouteValues["name"]?.ToString() ?? "";

        Safety.Check(!string.IsNullOrEmpty(name), "Missing 'name' route value");

        var permission = $"{name}-{PermissionTypes.Api}-{context.Request.Method}".ToLower();

        return permission;
    }
}
