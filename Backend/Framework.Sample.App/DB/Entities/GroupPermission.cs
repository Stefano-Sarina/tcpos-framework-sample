using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class GroupPermission : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Group))]
    [UniqueKeyField("Unk_GroupId_PermissionId")]
    public int GroupId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueKeyField("Unk_GroupId_PermissionId")]
    public int PermissionId
    {
        get;
        set;
    }

    public PermissionValue PermissionValue
    {
        get;
        set;
    }

    public Group Group
    {
        get;
        set;
    }

    public Permission Permission
    {
        get;
        set;
    }
}
