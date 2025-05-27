using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.Abstracts;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Common.Diagnostics;
using TCPOS.Lib.Authorization.Implementations;
using System.Text.RegularExpressions;

namespace Framework.Sample.App.Authorization.SimpleAuthorization;

internal class AuthorizationManagerSimple(
    IAuthorizationContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthorizationUserStore<AuthzUser, int> userStore,
    IAuthorizationPermissionStore<AuthzPermission, int> permissionStore,
    ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authorizationRepository)
    : TcposAuthorizationManager<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>(ctxStore, userStore, permissionStore, authorizationRepository)
{
    /// <summary>
    /// Returns true if the manager can handle the context
    /// </summary>
    /// <param name="context"></param>
    /// <param name="requirement"></param>
    /// <returns></returns>
    public override async Task<bool> CanHandleAsync(AuthorizationHandlerContext context, ITcposAuthorizationRequirement requirement)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(requirement != null, new ArgumentNullException(nameof(requirement)));

        var canHandle = context.Requirements?.OfType<AuthorizationRequirementSimple>().Any() ?? false ;

        return await Task.FromResult(canHandle);
    }

    /// <summary>
    /// returns true if the user is allowed for the permission
    /// </summary>
    /// <param name="context"></param>
    /// <param name="user"></param>
    /// <param name="permission"></param>
    /// <param name="requirement"></param>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    protected override async Task<bool> IsRequirementAllowedAsync(AuthorizationHandlerContext context, AuthzUser? user, AuthzPermission? permission,
                                                                  ITcposAuthorizationRequirement requirement, CancellationToken cancellationToken)
    {
        var isAllowed = false;
        var permissionCode = GetPermissionCode(context, requirement);

        if (isAllowed == false)
        {
            isAllowed = await base.IsRequirementAllowedAsync(context, user, permission, requirement, cancellationToken);
        }

        return isAllowed;
    }

    /// <summary>
    /// Retrieve permission string from the context and requirement.
    /// </summary>
    /// <param name="context"></param>
    /// <param name="requirement"></param>
    /// <returns></returns>
    protected override string GetPermission(HttpContext context, ITcposAuthorizationRequirement requirement)
    {
        var endpoint = context.GetEndpoint();
        Safety.Check(endpoint != null, new ArgumentNullException(nameof(endpoint)));

        var simpleRequirementAttribute = endpoint.Metadata.OfType<SimpleRequirementAttribute>()
                                                  .FirstOrDefault();

        Safety.Check(!string.IsNullOrEmpty(simpleRequirementAttribute?.AttributeName), "Attribute not defined");

        return $"{simpleRequirementAttribute.AttributeName}-{PermissionTypes.Api}-{context.Request.Method}".ToLower();
    }
}
