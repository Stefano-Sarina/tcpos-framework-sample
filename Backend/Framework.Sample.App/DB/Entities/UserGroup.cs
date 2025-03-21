using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class UserGroup : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(User))]
    [UniqueIndexField]
    public int UserId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Group))]
    [UniqueIndexField]
    public int GroupId
    {
        get;
        set;
    }

    public User User
    {
        get;
        set;
    }

    public Group Group
    {
        get;
        set;
    }
}
