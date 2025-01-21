using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
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

    protected override async Task<bool> IsRequirementAllowedAsync(AuthorizationHandlerContext context, AuthzUser? user, AuthzPermission? permission,
                                                             ITcposAuthorizationRequirement requirement, CancellationToken cancellationToken)
    {
        var isAllowed = false;

        var permissionCode = GetPermissionCode(context, requirement);
        var regex = new Regex($"(.*)-(.*)-(.*)");

        // check if current endpoint is allowed for PermissionAdministrator user
        var match = regex.Match(permissionCode);
        if (match.Success)
        {
            Safety.Check(match.Groups.Count > 0, "cannot retrieve entity name from permission");

            string[] adminAllowedNames = [
                "adwebentityversion","permissionsoperator", "permissionsoperators","permissionsctes","formsendpoints",
                "user", "group", "usergroup", "batch", "userpermission", "grouppermission"];

            isAllowed = user?.IsPermissionAdministrator != 0 && adminAllowedNames.Contains(match.Groups[1].Value);
        }

        if (isAllowed == false)
        {
            isAllowed = await base.IsRequirementAllowedAsync(context, user, permission, requirement, cancellationToken);
        }

        return isAllowed;
    }
}
