using Framework.Sample.App.Authorization.AuthorizationStores.Extensions;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

internal class AuthzPermissionValueStore(SampleDbContext dbContext)
    : IAuthorizationPermissionValueStore<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int>
{
    public void Dispose()
    { }

    public async Task<IEnumerable<AuthzPermissionValue>> GetPermissionValuesAsync(AuthzUser? user, CancellationToken cancellationToken)
    {
        if (user == null)
        {
            return Enumerable.Empty<AuthzPermissionValue>();
        }

        var authzValues = await dbContext.UserPermissions
                                         .Where(x => x.UserId == user.Id)
                                         .ToListAsync();

        return authzValues.Select(x => x.ToAuthorizationData())
                          .OfType<AuthzPermissionValue>();
    }

    public async Task<AuthzPermissionValue?> GetPermissionValueAsync(AuthzUser? user, AuthzPermission permission, CancellationToken cancellationToken)
    {
        if (user == null || permission == null)
        {
            return null;
        }

        return (await dbContext.UserPermissions
                               .FirstOrDefaultAsync(x => x.UserId == user.Id && x.PermissionId == permission.Id)
               )?.ToAuthorizationData();
    }

    public async Task<IEnumerable<AuthzPermissionValue>> GetPermissionValuesAsync(AuthzGroup? group, CancellationToken cancellationToken)
    {
        if (group == null)
        {
            return Enumerable.Empty<AuthzPermissionValue>();
        }

        var authzValues = await dbContext.GroupPermissions
                                         .Where(x => x.GroupId == group.Id)
                                         .ToListAsync();

        return authzValues.Select(x => x.ToAuthorizationData())
                          .OfType<AuthzPermissionValue>();
    }

    public async Task<AuthzPermissionValue?> GetPermissionValueAsync(AuthzGroup? group, AuthzPermission permission, CancellationToken cancellationToken)
    {
        if (group == null || permission == null)
        {
            return null;
        }

        return (await dbContext.GroupPermissions
                               .FirstOrDefaultAsync(x => x.GroupId == group.Id && x.PermissionId == permission.Id)
               )?.ToAuthorizationData();
    }
}
