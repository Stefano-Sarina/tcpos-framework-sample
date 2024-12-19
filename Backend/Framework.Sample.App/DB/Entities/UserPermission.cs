using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class UserPermission : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(User))]
    [UniqueKeyField("Unk_UserId_PermissionId")]
    public int UserId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueKeyField("Unk_UserId_PermissionId")]
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

    public User User
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
