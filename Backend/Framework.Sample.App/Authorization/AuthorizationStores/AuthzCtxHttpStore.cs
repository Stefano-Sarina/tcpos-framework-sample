using System.Security.Claims;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

public class AuthzCtxHttpStore : IAuthorizationContextStore<HttpContext>
{
    public async Task<string> GetUserIdAsync(HttpContext ctx, CancellationToken cancellationToken)
    {
        Safety.Check(ctx != null, () => new ArgumentNullException(nameof(ctx)));
        var userName = ctx.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value ?? "";

        return await Task.FromResult(userName);
    }

    public void Dispose()
    { }
}
