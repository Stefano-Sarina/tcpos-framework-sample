using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.DB.Enums;
using Framework.Sample.App.Utils;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

//SARSTE - Persister, trovare altro nome
//Questa classe dovrebbe essere scoped e lasciare che sia l'engine a creare lo scope
internal class FeedDatabasePersister(IServiceProvider serviceProvider, ILogger<FeedDatabasePersister> logger)
    : IFeedDatabasePersister<FeedDatabaseItem>
{
    public async Task<bool> SaveAsync(IEnumerable<FeedDatabaseItem> feedDbItems, CancellationToken cancellationToken)
    {
        try
        {
            using var scope = serviceProvider.CreateScope();

            foreach (var dbContext in scope.ServiceProvider.GetRequiredService<DisposableList<SampleDbContext>>())
            {
                var permissions = await dbContext.Permissions.ToListAsync(cancellationToken);
                var permissionNames = permissions.Select(x => x.PermissionName);

                var existingPermissions = feedDbItems.Where(x => permissionNames.Contains(x.PermissionName));
                var missingPermissions = feedDbItems.Except(existingPermissions).ToList();

                if (!missingPermissions.Any())
                {
                    return await Task.FromResult(true);
                }

                // remove duplicated permissions: multiple endpoint could refer same permissions
                missingPermissions = missingPermissions.DistinctBy(x => new { x.PermissionName }).ToList();
                var missingDbPermissions = missingPermissions.Select(p => new Permission
                {
                    PermissionName = p.PermissionName,
                    PermissionType = PermissionTypes.Api
                });

                await dbContext.Permissions.AddRangeAsync(missingDbPermissions, cancellationToken);

                await dbContext.SaveChangesAsync(cancellationToken);
            }

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
