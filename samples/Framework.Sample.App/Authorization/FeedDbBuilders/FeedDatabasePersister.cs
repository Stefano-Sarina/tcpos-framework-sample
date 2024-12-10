using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDatabasePersister : IFeedDatabasePersister
{
    private readonly IServiceProvider _serviceProvider;

    public FeedDatabasePersister(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<bool> SaveAsync(IEnumerable<FeedDatabaseItem> feedDbItems, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            using var _dbContext = scope.ServiceProvider.GetRequiredService<SampleDbContext>();

            var permissions = await _dbContext.Permissions.ToListAsync();
            var permissionNames = permissions.Select(x => x.PermissionName);

            var existingPermissions = feedDbItems.Where(x => permissionNames.Contains(x.Permission.Name()));
            var missingPermissions = feedDbItems.Except(existingPermissions).ToList();

            if (!missingPermissions.Any())
            {
                return await Task.FromResult(true);
            }

            // remove duplicated permissions: multiple endpoint could refer same permissions
            missingPermissions = missingPermissions.DistinctBy(x => new { x.Permission.KeyCode}).ToList();
            var missingDbPermissions = missingPermissions.Select(
                p => new Permission()
                {
                    PermissionName = p.Permission.Name(),
                    PermissionType = DB.Enums.PermissionTypes.Api,
                });

            await _dbContext.Permissions.AddRangeAsync(missingDbPermissions);

#if DEBUG
            UserPermission[] userPermissions = _dbContext.Permissions.Local
                .SelectMany(p => _dbContext.Users,  (p,u)=>new UserPermission()
                {
                    Permission = p,
                    User = u,
                    PermissionValue = DB.Enums.PermissionValue.Allow
                }).ToArray();

            await _dbContext.UserPermissions.AddRangeAsync(userPermissions);
#endif


            var transaction = _dbContext.Database.BeginTransaction();
            try
            {
                var changes = await _dbContext.SaveChangesAsync();
                transaction.Commit();
                return await Task.FromResult(true);
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                throw;
            }
        }
        catch (Exception ex)
        {
            throw;
        }
    }
}


//public class PermissionItemsEqualityComparer : IEqualityComparer<FeedDatabaseItem>
//{
//    public bool Equals(FeedDatabaseItem? x, FeedDatabaseItem? y)
//    {
//        throw new NotImplementedException();
//    }

//    public int GetHashCode([DisallowNull] FeedDatabaseItem obj)
//    {
//        throw new NotImplementedException();
//    }
//}

public static class FeedDbExtension
{
    public static string Name(this FeedDatabaseItem.FeedPermission p)
    {
        return $"{p.Entity}-{p.Type}-{p.SubType}";
    }

    public static bool EqualTo(this FeedDatabaseItem.FeedPermission feedPermission, Permission permission)
    {
        Safety.Check(permission != null, () => new ArgumentNullException(nameof(permission)));
        return string.Compare(feedPermission.KeyCode, $"{permission.PermissionName}-{permission.PermissionType}", true) == 0;
    }
}
