using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Permission : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField]
    [StringLength(250, MinimumLength = 1)]
    public string PermissionName
    {
        get;
        set;
    }

    public PermissionTypes PermissionType
    {
        get;
        set;
    }

    public virtual HashSet<PermissionDependency> ChildPermissionDependencies
    {
        get;
    } = new();

    public virtual HashSet<PermissionDependency> ParentPermissionDependencies
    {
        get;
    } = new();
}
