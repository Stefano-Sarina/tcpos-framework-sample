using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Requirements;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

internal class AuthorizationManagerErpUpdate(
    IAuthzContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthzUserStore<AuthzUser> userStore,
    IAuthzPermissionStore<AuthzPermission> permissionStore,
    IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue> permissionValueStore,
    IAuthzGroupStore<AuthzUser, AuthzGroup>? groupStore = null)
    : AuthorizationManagerBaseErp<AuthorizationRequirementErpUpdate>(ctxStore, userStore, permissionStore, permissionValueStore, groupStore);
