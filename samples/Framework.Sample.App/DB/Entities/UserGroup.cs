using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class UserGroup : Entity
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
    [UniqueKeyField]
    public int UserId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Group))]
    [UniqueKeyField]
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
