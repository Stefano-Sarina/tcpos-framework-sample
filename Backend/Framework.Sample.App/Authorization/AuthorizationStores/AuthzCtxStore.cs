﻿using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

internal class AuthzCtxStore : IAuthorizationContextStore<AuthorizationHandlerContext>
{
    public async Task<string> GetUserIdAsync(AuthorizationHandlerContext ctx, CancellationToken cancellationToken)
    {
        Safety.Check(ctx != null, () => new ArgumentNullException(nameof(ctx)));
        var userName = ctx.User?.Claims?.FirstOrDefault(x => x.Type == ClaimTypes.Name)?.Value ?? "";

        return await Task.FromResult(userName);
    }

    public void Dispose()
    { }
}
