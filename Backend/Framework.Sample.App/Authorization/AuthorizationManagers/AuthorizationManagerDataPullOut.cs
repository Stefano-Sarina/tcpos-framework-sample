using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Requirements;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.Abstracts;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

internal class AuthorizationManagerDataPullOut(
    IAuthorizationContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthorizationUserStore<AuthzUser, int> userStore,
    IAuthorizationPermissionStore<AuthzPermission, int> permissionStore,
    ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authorizationRepository)
    : AuthorizationManagerBaseErp<AuthorizationRequirementDataPullout>(ctxStore, userStore, permissionStore, authorizationRepository)
{ }
