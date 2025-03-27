using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[Table("PermissionsDependencies")]
[PrimaryKey(nameof(Id))]
public class PermissionDependency : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueIndexField("unk_childprm_parentprm")]
    public int ChildPermissionId
    {
        get;
        set;
    }

    [ForeignKey(nameof(ChildPermissionId))]
    [InverseProperty(nameof(Permission.ChildPermissionDependencies))]
    [DeleteBehavior(DeleteBehavior.Cascade)]
    public Permission ChildPermission
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueIndexField("unk_childprm_parentprm")]
    public int ParentPermissionId
    {
        get;
        set;
    }

    [ForeignKey(nameof(ParentPermissionId))]
    [InverseProperty(nameof(Permission.ParentPermissionDependencies))]
    [DeleteBehavior(DeleteBehavior.NoAction)]
    public Permission ParentPermission
    {
        get;
        set;
    }
}
