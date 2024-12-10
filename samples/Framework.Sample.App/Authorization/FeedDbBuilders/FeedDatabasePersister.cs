using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using System.Linq;
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
            var missingPermissions = feedDbItems.Where(x => !permissions.Any(y => x.Permission.EqualTo(y))).ToList();

            if (!missingPermissions.Any())
            {
                return await Task.FromResult(true);
            }

            // remove duplicated permissions: multiple endpoint could refer same permissions
            missingPermissions = missingPermissions.DistinctBy(x => new { x.Permission.KeyCode}).ToList();

            await _dbContext.Permissions.AddRangeAsync(missingPermissions.DistinctBy(p => p.Permission.KeyCode).Select(
                p => new Permission()
                {
                    PermissionName = $"{p.Permission.Entity}-{p.Permission.SubType}",
                    PermissionType = DB.Enums.PermissionTypes.Api,
                }));

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

public static class FeedDbExtension
{
 
    public static bool EqualTo(this FeedDatabaseItem.FeedPermission feedPermission, Permission permission)
    {
        Safety.Check(permission != null, () => new ArgumentNullException(nameof(permission)));
        return string.Compare(feedPermission.KeyCode, $"{permission.PermissionName}-{permission.PermissionType}", true) == 0;
    }
}