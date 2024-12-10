using System.Text.RegularExpressions;
using Framework.Sample.App.Authorization.AuthorizationStores.Extensions;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

internal class AuthzPermissionStore(SampleDbContext dbContext) : IAuthzPermissionStore<AuthzPermission>
{
    public void Dispose()
    { }

    public async Task<AuthzPermission?> GetPermissionAsync(string keyCode, CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(keyCode))
        {
            return null;
        }
        
        return (await dbContext.Permissions.FirstOrDefaultAsync(x => x.PermissionName == keyCode))?
           .ToAuthorizationData();

        //var regex = new Regex("(.*)-(.*)$");
        //var match = regex.Match(keyCode);

        //if (!match.Success)
        //{
        //    return null;
        //}

        //PermissionTypes permissionType;

        //if (!Enum.TryParse(match.Groups[2].Value, true, out permissionType))
        //{
        //    return null;
        //}

        //return (await dbContext.Permissions.FirstOrDefaultAsync(x => x.PermissionName == match.Groups[1].Value && x.PermissionType == permissionType))?
        //   .ToAuthorizationData();
    }

    public async Task<IEnumerable<AuthzPermission>> GetPermissionsAsync(CancellationToken cancellationToken)
    {
        var permission = await dbContext.Permissions
                                        .ToListAsync(cancellationToken);

        return permission.Select(x => x.ToAuthorizationData())
                         .OfType<AuthzPermission>();
    }
}
