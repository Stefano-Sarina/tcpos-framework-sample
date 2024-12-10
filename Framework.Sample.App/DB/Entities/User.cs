using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class User : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField("Unk_UserName")]
    [StringLength(40, MinimumLength = 1)]
    public string UserName
    {
        get;
        set;
    }

    [StringLength(40, MinimumLength = 1)]
    public string Password
    {
        get;
        set;
    }
}
