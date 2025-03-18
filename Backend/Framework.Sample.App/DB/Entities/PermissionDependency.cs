using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[Table("PermissionsDependencies")]
public class PermissionDependency : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueKeyField("unk_childprm_parentprm")]
    public int ChildPermissionId
    {
        get;
        set;
    }

    // ForeignKeyOneAttribute(string[]? keyFieldsOne = null, bool isRequired = true, string[]? keyFieldsMany = null, string? manyNavigationProperty = null, DeleteBehavior deleteBehavior = DeleteBehavior.Restrict)
    [ForeignKeyOne(null, false, [nameof(ChildPermissionId)], nameof(Permission.ChildPermissionDependencies), DeleteBehavior.Cascade)]
    public Permission ChildPermission
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueKeyField("unk_childprm_parentprm")]
    public int ParentPermissionId
    {
        get;
        set;
    }

    [ForeignKeyOne(null, false, [nameof(ParentPermissionId)], nameof(Permission.ParentPermissionDependencies), DeleteBehavior.NoAction)]
    public Permission ParentPermission
    {
        get;
        set;
    }
}
