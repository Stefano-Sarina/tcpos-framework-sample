using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

internal class AuthorizationManagerFormsEndpoints(
    IAuthorizationContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthorizationUserStore<AuthzUser, int> userStore,
    IAuthorizationPermissionStore<AuthzPermission, int> permissionStore,
    ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authorizationRepository)
    : AuthorizationManagerBase<AuthorizationRequirementFormsEndpoints>(ctxStore, userStore, permissionStore, authorizationRepository)
{
    protected override string GetPermission(HttpContext context, ITcposAuthorizationRequirement requirement)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(requirement != null, new ArgumentNullException(nameof(requirement)));

        return $"formsendpoints-{PermissionTypes.Api}-{context.Request.Method}".ToLower();
    }
}
