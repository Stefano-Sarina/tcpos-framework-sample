using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDatabasePersister(IServiceProvider serviceProvider, ILogger<FeedDatabasePersister> logger) 
    : IFeedDatabasePersister<FeedDatabaseItem>
{
    public async Task<bool> SaveAsync(IEnumerable<FeedDatabaseItem> feedDbItems, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();
            using var dbContext = scope.ServiceProvider.GetRequiredService<SampleDbContext>();

            var permissions = await dbContext.Permissions.ToListAsync();
            var permissionNames = permissions.Select(x => x.PermissionName);

            var existingPermissions = feedDbItems.Where(x => permissionNames.Contains(x.PermissionName));
            var missingPermissions = feedDbItems.Except(existingPermissions).ToList();

            if (!missingPermissions.Any())
            {
                return await Task.FromResult(true);
            }

            // remove duplicated permissions: multiple endpoint could refer same permissions
            missingPermissions = missingPermissions.DistinctBy(x => new { x.PermissionName}).ToList();
            var missingDbPermissions = missingPermissions.Select(
                p => new Permission()
                {
                    PermissionName = p.PermissionName,
                    PermissionType = DB.Enums.PermissionTypes.Api,
                });

            await dbContext.Permissions.AddRangeAsync(missingDbPermissions);

            await dbContext.SaveChangesAsync();

            return true;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Feeding permissions error");
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

/*
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
*/