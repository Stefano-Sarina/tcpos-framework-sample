using System.Security.Claims;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using TCPOS.Lib.Authorization.Abstracts;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.Implementations;

internal class PermissionClaimsTransformationBuilder(IAuthorizationUserStore<AuthzUser, int> userStore) : ITcposPermissionClaimsTransformationBuilder
{
    public async Task<ClaimsPrincipal> TransformAsync(IHttpContextAccessor context, ClaimsPrincipal principal, CancellationToken cancellationToken)
    {
        Safety.Check(context != null, new ArgumentNullException(nameof(context)));
        Safety.Check(principal != null, new ArgumentNullException(nameof(principal)));

        var userName = principal.Claims.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value ?? "";

        var authzUser = await userStore.GetUserAsync(userName, cancellationToken);

        if (authzUser == null)
        {
            return await Task.FromResult(principal);
        }

        principal.Claims.Append(new Claim("UserId", authzUser.Id.ToString()));

        return await Task.FromResult(principal);
    }
}
