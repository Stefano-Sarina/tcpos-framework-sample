using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Enums;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Domains;

namespace Framework.Sample.App.Authorization.Implementations;

//SARSTE - Querable in Queryable
public class TcposAuthorizationQuerableImpl<TPermissionValue>(SampleDbContext dbContext) : ITcposAuthorizationQuerable<TPermissionValue, int>, IDisposable
    where TPermissionValue : ITPermissionValue<int>, new()
{
    public void Dispose()
    { }

    public async Task<IQueryable<TPermissionValue>> QueryPermissionValues(CancellationToken cancellationToken)
    {
        var operatorPermissions = from u in dbContext.Users
                                  join up in dbContext.UserPermissions on u.Id equals up.UserId
                                  select new
                                  {
                                      UserId = u.Id,
                                      GroupId = 0,
                                      up.PermissionId,
                                      up.PermissionValue
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
                                  .Select(x => new TPermissionValue
                                   {
                                       UserId = x.UserId,
                                       GroupId = x.GroupId,
                                       PermissionId = x.PermissionId,
                                       Value = x.PermissionValue == PermissionValue.Allow ? PermissionValueEnum.Allow : PermissionValueEnum.Deny
                                   }).AsQueryable();
    }
}
