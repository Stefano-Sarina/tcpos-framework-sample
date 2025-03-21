using System.Net;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using TCPOS.Lib.Web.DataBind.Exceptions;
using TCPOS.Lib.Common.Diagnostics;
using TCPOS.Lib.Common.Linq.Extensions;

namespace Framework.Sample.App.WebApplication.FormsEndpoints;

public class FeManager(SampleDbContext sampleDbContext)
{
    private readonly Dictionary<string, Permission?> permissionsCache = new(StringComparer.InvariantCultureIgnoreCase);

    internal async Task<IResult> ProcessAsync(FeIn formsEndpoints)
    {
        List<PermissionNode> nodes = [];

        try
        {
            nodes = PermissionNode.GetNodes(formsEndpoints);
        }
        catch (Exception ex)
        {
            throw new HttpException(HttpStatusCode.BadRequest, "Body is not valid", ex);
        }

        if (!Version.TryParse(formsEndpoints.Version, out var version))
        {
            throw new HttpException(HttpStatusCode.BadRequest, $"'{formsEndpoints.Version}' is not a valid version value");
        }

        try
        {
            var adWebEntityVersion = await GetAdWebEntityVersion(formsEndpoints.ApplicationName);
            var isAppVersionNewer = version > new Version(adWebEntityVersion.Version);

            if (!isAppVersionNewer)
            {
                return Results.Created();
            }

            var existingPermissions = await sampleDbContext.Permissions.ToListAsync();
            var existingDependencies = await sampleDbContext.PermissionsDependencies
                                                            .Where(p => p.ChildPermission.PermissionType == PermissionTypes.UI)
                                                            .ToListAsync();

            AddApiPermissionsToRootNodes(nodes, existingPermissions, formsEndpoints.ApplicationName);
            await AddPermissionsAsync(nodes, existingPermissions, formsEndpoints.ApplicationName);

            RemoveUnusedPemissionsDependencies(nodes, existingDependencies, formsEndpoints.ApplicationName);
            RemoveUnusedPemissions(nodes, existingPermissions, formsEndpoints.ApplicationName);
            // AddPermissionsDependenciesAsync must be after AddPermissionsAsync because we are using the dbcontext.Permissions.Local collection
            await AddPermissionsDependenciesAsync(nodes, existingDependencies, formsEndpoints.ApplicationName);

            adWebEntityVersion.Version = formsEndpoints.Version;

            await sampleDbContext.SaveChangesAsync();
            return Results.Created();
        }
        catch
        {
            throw new HttpException(HttpStatusCode.InternalServerError, "An error occurred while processing your request");
        }
    }

    private async Task<AdWebEntityVersion> GetAdWebEntityVersion(string applicationName)
    {
        var dbAdWebEntityVersion = await sampleDbContext.AdWebEntityVersions
                                                        .FirstOrDefaultAsync(x => x.EntityName == applicationName);

        if (dbAdWebEntityVersion == null)
        {
            dbAdWebEntityVersion = new AdWebEntityVersion
            {
                EntityName = applicationName,
                Version = new Version(0, 0).ToString()
            };

            await sampleDbContext.AdWebEntityVersions.AddAsync(dbAdWebEntityVersion);
        }

        return dbAdWebEntityVersion;
    }

    private void AddApiPermissionsToRootNodes(IEnumerable<PermissionNode> nodes, List<Permission> existingPermissions, string applicationName)
    {
        foreach (var node in nodes.Where(x => x.Item.PermissionItemEndpoint != null))
        {
            var existingPermission = existingPermissions.FirstOrDefault(p => p.PermissionType == PermissionTypes.Api
                                                                             && p.PermissionName.Equals(node.Item.ApiPermissionName, StringComparison.InvariantCultureIgnoreCase));

            Safety.Check(existingPermission != null, $"{node.Item.PermissionItemEndpoint!.Verb} {node.Item.PermissionItemEndpoint!.Url} permission not found");

            node.Item.PermissionItemParents = node.Item.PermissionItemParents == null ?
                                                  [existingPermission.PermissionName] :
                                                  [.. node.Item.PermissionItemParents, existingPermission.PermissionName];

            AddApiPermissionsToRootNodes(node.ParentNodes.ToEnumerableOrEmpty(), existingPermissions, applicationName);
        }
    }

    private async Task AddPermissionsAsync(List<PermissionNode> nodes, List<Permission> existingPermissions, string applicationName)
    {
        var permissionsToAdd = nodes.Where(n => n.Item.PermissionItemEndpoint == null
                                                && !existingPermissions.Any(p => p.PermissionName.Equals(n.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase)))
                                    .Select(n => new Permission
                                     {
                                         PermissionName = n.GetKeyCode(applicationName),
                                         PermissionType = PermissionTypes.UI
                                     });

        await sampleDbContext.Permissions.AddRangeAsync(permissionsToAdd);
    }

    private async Task AddPermissionsDependenciesAsync(List<PermissionNode> nodes, List<PermissionDependency> existingDependencies, string applicationName)
    {
        List<PermissionDependency> dependencies = [];

        foreach (var node in nodes)
        {
            foreach (var parentNode in node.ParentNodes.ToEnumerableOrEmpty())
            {
                var parentPermission = GetPermissionFromNode(parentNode, applicationName);
                var childPermission = GetPermissionFromNode(node, applicationName);

                if (parentPermission != null
                    && childPermission != null
                    && !existingDependencies.Any(p => p.ParentPermissionId == parentPermission.Id && p.ChildPermissionId == childPermission.Id)
                    && !dependencies.Any(p => p.ParentPermission == parentPermission && p.ChildPermission == childPermission))
                {
                    dependencies.Add(new PermissionDependency
                    {
                        ChildPermission = childPermission,
                        ParentPermission = parentPermission
                    });
                }
            }
        }

        await sampleDbContext.PermissionsDependencies.AddRangeAsync(dependencies);
    }

    private void RemoveUnusedPemissions(List<PermissionNode> nodes, List<Permission> existingPermissions, string applicationName)
    {
        var permissionsToRemove = existingPermissions.Where(p => p.PermissionType == PermissionTypes.UI && !nodes.Any(n => p.PermissionName.Equals(n.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase)));

        sampleDbContext.Permissions.RemoveRange(permissionsToRemove);
    }

    private void RemoveUnusedPemissionsDependencies(List<PermissionNode> nodes, List<PermissionDependency> existingDependencies, string applicationName)
    {
        List<PermissionDependency> nodesDependencies = [];

        foreach (var node in nodes)
        {
            foreach (var parentNode in node.ParentNodes.ToEnumerableOrEmpty())
            {
                var parentPermission = GetPermissionFromNode(parentNode, applicationName);
                var childPermission = GetPermissionFromNode(node, applicationName);

                if (parentPermission != null && childPermission != null)
                {
                    nodesDependencies.Add(new PermissionDependency
                    {
                        ChildPermissionId = childPermission.Id,
                        ParentPermissionId = parentPermission.Id
                    });
                }
            }
        }

        // delete all dependencies that exists in existing and not in nodes
        var dependenciesToRemove = existingDependencies
           .Where(ed => !nodesDependencies.Any(nd => nd.ParentPermissionId == ed.ParentPermissionId && nd.ChildPermissionId == ed.ChildPermissionId));

        sampleDbContext.PermissionsDependencies.RemoveRange(dependenciesToRemove);
    }

    private Permission? GetPermissionFromNode(PermissionNode node, string applicationName)
    {
        var key = node.GetKeyCode(applicationName);

        if (!permissionsCache.TryGetValue(key, out var permission))
        {
            permission = sampleDbContext.Permissions.Local
                                        .FirstOrDefault(p => p.PermissionName.Equals(key, StringComparison.InvariantCultureIgnoreCase));

            if (permission == null)
            {
                permissionsCache[key] = permission;
            }
        }

        return permission;
    }
}
