using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class Permission : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueIndexField]
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
