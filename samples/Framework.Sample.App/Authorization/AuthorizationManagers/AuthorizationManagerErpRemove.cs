using Framework.Sample.App.Authorization.AuthorizationManagers.Base;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.Requirements;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

internal class AuthorizationManagerErpRemove(
    IAuthzContextStore<AuthorizationHandlerContext> ctxStore,
    IAuthzUserStore<AuthzUser> userStore,
    IAuthzPermissionStore<AuthzPermission> permissionStore,
    IAuthzPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue> permissionValueStore,
    IAuthzGroupStore<AuthzUser, AuthzGroup>? groupStore = null)
    : AuthorizationManagerBaseErp<AuthorizationRequirementErpRemove>(ctxStore, userStore, permissionStore, permissionValueStore, groupStore);
