﻿using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;
using TCPOS.Common.Linq.Extensions;
using TCPOS.Data.Batches.Interfaces;
using TCPOS.Data.Batches.Payload;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class FullPermissionDependency : Entity
{
    public override int Id { get; set; }

    public int ChildPermissionId{get;set;}

    public string ChildPermissionName { get; set; }

    public int ParentPermissionId { get; set; }

    public string ParentPermissionName { get; set; }
    public int Level { get; set; }
}

public class FullPermissionDependencyIn<T> 
{
    [Required]
    public T ChildPermissionId
    {
        get;
        set;
    }

    [Required]
    public string ChildPermissionName
    {
        get;
        set;
    }

    [Required]
    public T ParentPermissionId
    {
        get;
        set;
    }

    [Required]
    public string ParentPermissionName
    {
        get;
        set;
    }

    [Required] 
    public int Level { get; set; }
}

public class FullPermissionDependencyOut<T> : FullPermissionDependencyIn<T>, IIDEntity, IConcurrencyEntity
{
    public string ConcurrencyCode { get; set; }

    public int Id { get; set; }
}

public class PermissionsDependencyProfile : Profile
{
    public PermissionsDependencyProfile()
    {
        CreateMap<FullPermissionDependencyIn<int>, FullPermissionDependency>(MemberList.None);
        CreateMap<FullPermissionDependency, FullPermissionDependencyIn<int>>(MemberList.None);
        CreateMap<FullPermissionDependency, FullPermissionDependencyOut<int>>(MemberList.None);
        CreateMap<FullPermissionDependency, FullPermissionDependency>(MemberList.None);
    }
}

public class PermissionsDependenciesDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder, IStorageProvider storageProvider, IMapper mapper, SampleDbContext dbContext)
    : DbContextDataPullOutItem<FullPermissionDependency, FullPermissionDependencyOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    protected class PermissionNode(int id)
    {
        public int Id { get; set; } = id;
        public IEnumerable<PermissionNode>? ChildNodes { get; set; }

        public void Explode(IEnumerable<PermissionDependency> permissionsDependencies)
        {
            ChildNodes = permissionsDependencies.Where(x => x.ParentPermissionId == Id)
                .Select(x => new PermissionNode(x.ChildPermissionId))
                .ToList();

            foreach (var node in ChildNodes)
            {
                node.Explode(permissionsDependencies);
            };
        }
    }

    public async override Task<System.Collections.IEnumerable> GetData(HttpRequest request, AdditionalData[] requestAdditionalData)
    {
        using (CancellationTokenSource cts = new CancellationTokenSource(1000))
        {
            // retrieve permissions and group id's
            var permissions = await dbContext.Permissions
                .OrderBy(x => x.Id)
                .ToDictionaryAsync(y => y.Id, y => y);

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

            List<FullPermissionDependency> result = [];
            foreach (var node in rootPermissions)
            {
                result.AddRange(CreateNodes(node, permissions, 0));
            }

            int id = 0;
            result.ForEach(x => x.Id = ++id);

            return mapper.Map<IEnumerable<FullPermissionDependency>, IEnumerable<FullPermissionDependencyOut<int>>>(result); 
        }
    }

    protected IEnumerable<FullPermissionDependency> CreateNodes(PermissionNode node, Dictionary<int, Permission> permissions, int level)
    {
        List<FullPermissionDependency> collection = [];

        // add self dependency for roots
        if (level == 0)
        {
            collection.Add(new FullPermissionDependency()
            {
                ParentPermissionId = node.Id,
                ParentPermissionName = permissions[node.Id].PermissionName,
                ChildPermissionId = node.Id,
                ChildPermissionName = permissions[node.Id].PermissionName,
                Level = 0,
            });
        }

        // then add children
        foreach (var child in node.ChildNodes.ToEnumerableOrEmpty())
        {
            collection.AddRange([new FullPermissionDependency()
            {
                ParentPermissionId = node.Id,
                ParentPermissionName = permissions[node.Id].PermissionName,
                ChildPermissionId = child.Id,
                ChildPermissionName = permissions[child.Id].PermissionName,
                Level = 1,
            }]);

            /*  do not create tree!
            collection.AddRange(CreateNodes(child, permissions, level+1));
            */
        }

        return collection;
    }

}
