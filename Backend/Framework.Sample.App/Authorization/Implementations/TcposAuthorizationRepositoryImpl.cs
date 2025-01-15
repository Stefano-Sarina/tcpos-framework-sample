using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Implementations;
using TCPOS.Data.Batches.Interfaces;
using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.Domains;
using Microsoft.AspNetCore.Identity;

namespace Framework.Sample.App.Authorization.Implementations;

public class TcposAuthorizationRepositoryImpl<TUser, TGroup, TPermission, TPermissionValue> : TcposAuthorizationRepository<TUser, TGroup, TPermission, TPermissionValue, int>, IDisposable 
    where TUser : ITAuthorizationEntityId<int> 
    where TGroup : ITAuthorizationEntityId<int> 
    where TPermission : ITAuthorizationEntityId<int> 
    where TPermissionValue : ITPermissionValue<int>, new()
{
    private readonly IStorageProvider storageProvider;

    public TcposAuthorizationRepositoryImpl(
        IStorageProvider storageProvider,
        IAuthorizationPermissionStore<TPermission, int> permissionStore,
        IAuthorizationPermissionValueStore<TUser, TGroup, TPermission, TPermissionValue, int> permissionValueStore,
        IAuthorizationGroupStore<TUser, TGroup, int>? groupStore = null)
        : base(permissionStore, permissionValueStore, groupStore)
    {
        this.storageProvider = storageProvider;
    }

    public override async Task<IEnumerable<TPermissionValue>>? GetPermissionValues(CancellationToken cancellationToken)
    {
        var dbContext = storageProvider.GetStorage<SampleDbContext>();

        var operatorPermissions = from u in dbContext.Users
                                    join up in dbContext.UserPermissions on u.Id equals up.UserId
                                    select new
                                    {
                                        UserId = u.Id,
                                        GroupId = 0,
                                        PermissionId = up.PermissionId,
                                        PermissionValue = up.PermissionValue
                                    };

        var groupPermissions =
        from ug in dbContext.UserGroups
        join g in dbContext.Groups on ug.GroupId equals g.Id
        join u in dbContext.Users on ug.UserId equals u.Id
        join gp in dbContext.GroupPermissions on g.Id equals gp.GroupId
        where !dbContext.UserPermissions.Any(y => y.UserId == u.Id && y.PermissionId == gp.PermissionId)
        group new { u, g, gp } by new { userId = u.Id, groupId = g.Id, permissionId = gp.PermissionId } into grouped
        select new
        {
            UserId = grouped.Key.userId,
            GroupId = grouped.Key.groupId,
            PermissionId = grouped.Key.permissionId,
            PermissionValue = grouped.Min(x => x.gp.PermissionValue)
        };

        return operatorPermissions.Union(groupPermissions)
            .OrderBy(x => x.UserId)
                            .ThenBy(x => x.PermissionId)
                            .Select((x) => new TPermissionValue()
                            {
                                UserId = x.UserId,
                                GroupId = x.GroupId,
                                PermissionId = x.PermissionId,
                                Value = x.PermissionValue == DB.Enums.PermissionValue.Allow ? PermissionValueEnum.Allow : PermissionValueEnum.Deny
                            }
        ).AsQueryable();
    }
}
