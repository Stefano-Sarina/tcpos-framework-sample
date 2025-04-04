﻿using Framework.Sample.App.Authorization.AuthorizationStores.Extensions;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore;
using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

internal class AuthzUserStore(SampleDbContext dbContext) : IAuthorizationUserStore<AuthzUser, int>
{
    public void Dispose()
    { }

    public async Task<AuthzUser?> GetUserAsync(string userId, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(userId))
        {
            return null;
        }

        return (await dbContext.Users.FirstOrDefaultAsync(x => x.UserName == userId))?
           .ToAuthorizationData();
    }
}
