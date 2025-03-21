using AutoMapper;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using TCPOS.Lib.Web.DataBind.DataPullOut.Configuration;
using TCPOS.Lib.Web.DataBind.Implementations.OData.DataPullOut;
using TCPOS.Lib.Web.DataBind.Implementations.OData.Interfaces;
using TCPOS.Lib.Common.Linq.Extensions;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsCtesDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder, IStorageProvider storageProvider, IMapper mapper, SampleDbContext dbContext)
    : DbContextDataPullOutItem<PermissionsCtes, PermissionsCtesOut<int>, int>(configuration, edmModelBuilder, storageProvider, mapper)
{
    protected override async Task<IQueryable<PermissionsCtes>> QueryAsync(CancellationToken cancellationToken = default)
    {
        // retrieve permissions and group id's
        var permissions = dbContext.Permissions
                                   .OrderBy(x => x.Id)
                                   .ToDictionary(y => y.Id, y => y);

        var permissionsDependencies = dbContext.PermissionsDependencies
                                               .OrderBy(x => x.ParentPermissionId)
                                               .ThenBy(x => x.ChildPermissionId);

        // add root permissions
        var rootPermissions = permissions.Select(x => new PermissionNode(x.Value.Id))
                                         .ToList();

        foreach (var node in rootPermissions)
        {
            node.Explode(permissionsDependencies);
        }

        List<PermissionsCtes> result = [];

        foreach (var node in rootPermissions)
        {
            result.AddRange(CreateNodes(node, permissions, 0));
        }

        var id = 0;
        result.ForEach(x => x.Id = ++id);

        return result.AsQueryable();
    }

    protected IEnumerable<PermissionsCtes> CreateNodes(PermissionNode node, Dictionary<int, Permission> permissions, int level)
    {
        List<PermissionsCtes> collection = [];

        // add self dependency for roots
        if (level == 0)
        {
            collection.Add(new PermissionsCtes
            {
                ParentPermissionId = node.Id,
                ParentPermissionName = permissions[node.Id].PermissionName,
                ParentPermissionType = (int)permissions[node.Id].PermissionType,
                ChildPermissionId = node.Id,
                ChildPermissionName = permissions[node.Id].PermissionName,
                ChildPermissionType = (int)permissions[node.Id].PermissionType,
                Level = 0
            });
        }

        // then add children
        foreach (var child in node.ChildNodes.ToEnumerableOrEmpty())
        {
            collection.AddRange([
                new PermissionsCtes
                {
                    ParentPermissionId = node.Id,
                    ParentPermissionName = permissions[node.Id].PermissionName,
                    ParentPermissionType = (int)permissions[node.Id].PermissionType,
                    ChildPermissionId = child.Id,
                    ChildPermissionName = permissions[child.Id].PermissionName,
                    ChildPermissionType = (int)permissions[child.Id].PermissionType,
                    Level = 1
                }
            ]);

            /*  do not create tree!
            collection.AddRange(CreateNodes(child, permissions, level+1));
            */
        }

        return collection;
    }

    protected class PermissionNode(int id)
    {
        public int Id
        {
            get;
            set;
        } = id;

        public IEnumerable<PermissionNode>? ChildNodes
        {
            get;
            set;
        }

        public void Explode(IEnumerable<PermissionDependency> permissionsDependencies)
        {
            ChildNodes = permissionsDependencies.Where(x => x.ParentPermissionId == Id)
                                                .Select(x => new PermissionNode(x.ChildPermissionId))
                                                .ToList();

            foreach (var node in ChildNodes)
            {
                node.Explode(permissionsDependencies);
            }

            ;
        }
    }
}
