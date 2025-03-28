﻿using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.Abstracts;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers.Base;

internal class AuthorizationManagerBaseErp<TAuthzReq>(
    IAuthorizationContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthorizationUserStore<AuthzUser, int> userStore,
    IAuthorizationPermissionStore<AuthzPermission, int> permissionStore,
    ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authorizationRepository)
    : AuthorizationManagerBase<TAuthzReq>(ctxStore, userStore, permissionStore, authorizationRepository)
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
