using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.Common.Diagnostics;
using TCPOS.Common.Linq.Extensions;

namespace Framework.Sample.App.WebApplication.FormsEndpoints
{
    public class FeManager(SampleDbContext sampleDbContext)
    {
        internal async Task ProcessAsync(FeIn formsEndpoints)
        {
            List<PermissionNode> nodes = PermissionNode.GetNodes(formsEndpoints);

            List<Permission> existingPermissions = await sampleDbContext.Permissions.ToListAsync();
            List<PermissionDependency> existingDependencies = await sampleDbContext.PermissionsDependencies.ToListAsync();

            AddApiPermissionsToNodes(nodes, existingPermissions, formsEndpoints.ApplicationName);
            await AddPermissionsAsync(nodes, existingPermissions, formsEndpoints.ApplicationName);
            await AddPermissionsDependenciesAsync(nodes, existingDependencies, formsEndpoints.ApplicationName);
            await sampleDbContext.SaveChangesAsync();

            // remove unsued ??
        }

        private void AddApiPermissionsToNodes(IEnumerable<PermissionNode> nodes, List<Permission> existingPermissions, string applicationName)
        {
            foreach (PermissionNode node in nodes.Where(x => x.Item.PermissionItemEndpoint != null))
            {
                DB.Entities.Permission? existingPermission = existingPermissions.FirstOrDefault(p => p.PermissionType == DB.Enums.PermissionTypes.Api
                    && p.PermissionName.Equals(node.Item.ApiPermissionName, StringComparison.InvariantCultureIgnoreCase));

                Safety.Check(existingPermission != null, $"{node.Item.PermissionItemEndpoint.Verb} {node.Item.PermissionItemEndpoint.Url} permission not found");

                node.Item.PermissionItemParents = node.Item.PermissionItemParents == null ?
                                                      [existingPermission.PermissionName] :
                                                      [.. node.Item.PermissionItemParents, existingPermission.PermissionName];

                AddApiPermissionsToNodes(node.ParentNodes.ToEnumerableOrEmpty(), existingPermissions, applicationName);
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
                    Permission? parentPermission = sampleDbContext.Permissions.Local
                        .FirstOrDefault(p => p.PermissionName.Equals(parentNode.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase));
                    Permission? childPermission = sampleDbContext.Permissions.Local
                        .FirstOrDefault(p => p.PermissionName.Equals(node.GetKeyCode(applicationName), StringComparison.InvariantCultureIgnoreCase));

                    if (parentPermission != null && childPermission != null
                        && !existingDependencies.Any(p => p.ParentPermissionId == parentPermission.Id && p.ChildPermissionId == childPermission.Id))
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
    }
}
