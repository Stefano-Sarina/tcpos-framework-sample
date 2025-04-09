using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class UserPermission : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(User))]
    [UniqueIndexField(KeyName = "Unk_UserId_PermissionId")]
    public int UserId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Permission))]
    [UniqueIndexField(KeyName = "Unk_UserId_PermissionId")]
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
