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

            List<DB.Entities.Permission> existingPermissions = await sampleDbContext.Permissions.ToListAsync();

            AddErpPermissionsToNodes(nodes, existingPermissions);

            IEnumerable<Permission> permissionsToAdd = nodes.Where(n => !existingPermissions.Any(p => p.PermissionName.Equals(n.Item.ApiPermissionName)))
                .Select(n => new Permission()
                {
                    PermissionName = n.Name,
                    PermissionType = DB.Enums.PermissionTypes.UI
                });

            // calculate edits

            await sampleDbContext.Permissions.AddRangeAsync(permissionsToAdd);
            await sampleDbContext.SaveChangesAsync();

            // remove unsued ??
        }

        private void AddErpPermissionsToNodes(IEnumerable<PermissionNode> nodes, List<DB.Entities.Permission> existingPermissions)
        {
            foreach (PermissionNode node in nodes.Where(x => x.Item.PermissionItemEndpoint != null))
            {
                DB.Entities.Permission? existingPermission = existingPermissions.FirstOrDefault(p => p.PermissionType == DB.Enums.PermissionTypes.Api
                    && p.PermissionName.Equals(node.Item.ApiPermissionName, StringComparison.InvariantCultureIgnoreCase));

                Safety.Check(existingPermission != null, $"{node.Item.PermissionItemEndpoint.Verb} {node.Item.PermissionItemEndpoint.Url} permission not found");

                node.Item.PermissionItemParents = node.Item.PermissionItemParents == null ?
                                                      [existingPermission.PermissionName] :
                                                      [.. node.Item.PermissionItemParents, existingPermission.PermissionName];

                AddErpPermissionsToNodes(node.ParentNodes.ToEnumerableOrEmpty(), existingPermissions);
            }
        }
    }
}
