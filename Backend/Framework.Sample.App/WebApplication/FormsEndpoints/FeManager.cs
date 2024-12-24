using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.Common.Diagnostics;
using TCPOS.Common.Linq.Extensions;

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
            throw new HttpException(System.Net.HttpStatusCode.BadRequest, "Body is not valid", ex);
        }

        if (!Version.TryParse(formsEndpoints.Version, out var version))
        {
            throw new HttpException(System.Net.HttpStatusCode.BadRequest, $"'{formsEndpoints.Version}' is not a valid version value");
        }

        try
        {
            AdWebEntityVersion adWebEntityVersion = await GetAdWebEntityVersion(formsEndpoints.ApplicationName);
            bool isAppVersionNewer = version > new Version(adWebEntityVersion.Version);
            if (!isAppVersionNewer)
            {
                return Results.Created();
            }

            List<Permission> existingPermissions = await sampleDbContext.Permissions.ToListAsync();
            List<PermissionDependency> existingDependencies = await sampleDbContext.PermissionsDependencies
                .Where(p => p.ChildPermission.PermissionType == DB.Enums.PermissionTypes.UI)
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
            throw new HttpException(System.Net.HttpStatusCode.InternalServerError, "An error occurred while processing your request");
        }
    }

    private async Task<AdWebEntityVersion> GetAdWebEntityVersion(string applicationName)
    {
        AdWebEntityVersion? dbAdWebEntityVersion = await sampleDbContext.AdWebEntityVersions
                            .FirstOrDefaultAsync(x => x.EntityName == applicationName);

        if (dbAdWebEntityVersion == null)
        {
            dbAdWebEntityVersion = new AdWebEntityVersion()
            {
                EntityName = applicationName,
                Version = new Version(0, 0).ToString(),
            };

            await sampleDbContext.AdWebEntityVersions.AddAsync(dbAdWebEntityVersion);
        }

        return dbAdWebEntityVersion;
    }

    private void AddApiPermissionsToRootNodes(IEnumerable<PermissionNode> nodes, List<Permission> existingPermissions, string applicationName)
    {
        foreach (PermissionNode node in nodes.Where(x => x.Item.PermissionItemEndpoint != null))
        {
            Permission? existingPermission = existingPermissions.FirstOrDefault(p => p.PermissionType == DB.Enums.PermissionTypes.Api
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
        IEnumerable<Permission> permissionsToAdd = nodes.Where(n => n.Item.PermissionItemEndpoint == null
            && !existingPermissions.Any(p => p.PermissionName.Equals(n.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase)))
            .Select(n => new Permission()
            {
                PermissionName = n.GetKeyCode(applicationName),
                PermissionType = DB.Enums.PermissionTypes.UI
            });

        await sampleDbContext.Permissions.AddRangeAsync(permissionsToAdd);
    }

    private async Task AddPermissionsDependenciesAsync(List<PermissionNode> nodes, List<PermissionDependency> existingDependencies, string applicationName)
    {
        List<PermissionDependency> dependencies = [];
        foreach (PermissionNode node in nodes)
        {
            foreach (PermissionNode parentNode in node.ParentNodes.ToEnumerableOrEmpty())
            {
                Permission? parentPermission = GetPermissionFromNode(parentNode, applicationName);
                Permission? childPermission = GetPermissionFromNode(node, applicationName);

                if (parentPermission != null && childPermission != null
                    && !existingDependencies.Any(p => p.ParentPermissionId == parentPermission.Id && p.ChildPermissionId == childPermission.Id)
                    && !dependencies.Any(p => p.ParentPermission == parentPermission && p.ChildPermission == childPermission))
                {
                    dependencies.Add(new PermissionDependency()
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
        IEnumerable<Permission> permissionsToRemove = existingPermissions.Where(p => p.PermissionType == DB.Enums.PermissionTypes.UI &&
            !nodes.Any(n => p.PermissionName.Equals(n.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase)));

        sampleDbContext.Permissions.RemoveRange(permissionsToRemove);
    }

    private void RemoveUnusedPemissionsDependencies(List<PermissionNode> nodes, List<PermissionDependency> existingDependencies, string applicationName)
    {
        List<PermissionDependency> nodesDependencies = [];
        foreach (PermissionNode node in nodes)
        {
            foreach (PermissionNode parentNode in node.ParentNodes.ToEnumerableOrEmpty())
            {
                Permission? parentPermission = GetPermissionFromNode(parentNode, applicationName);
                Permission? childPermission = GetPermissionFromNode(node, applicationName);

                if (parentPermission != null && childPermission != null)
                {
                    nodesDependencies.Add(new PermissionDependency()
                    {
                        ChildPermissionId = childPermission.Id,
                        ParentPermissionId = parentPermission.Id
                    });
                }
            }
        }

        // delete all dependencies that exists in existing and not in nodes
        IEnumerable<PermissionDependency> dependenciesToRemove = existingDependencies
            .Where(ed => !nodesDependencies.Any(nd => nd.ParentPermissionId == ed.ParentPermissionId && nd.ChildPermissionId == ed.ChildPermissionId));

        sampleDbContext.PermissionsDependencies.RemoveRange(dependenciesToRemove);
    }

    private Permission? GetPermissionFromNode(PermissionNode node, string applicationName)
    {
        string key = node.GetKeyCode(applicationName);
        if (!permissionsCache.TryGetValue(key, out Permission? permission))
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
