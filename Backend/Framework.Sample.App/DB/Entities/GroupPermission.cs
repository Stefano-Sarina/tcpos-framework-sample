using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class GroupPermission : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Group))]
    [UniqueIndexField("Unk_GroupId_PermissionId")]
    public int GroupId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueIndexField("Unk_GroupId_PermissionId")]
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
