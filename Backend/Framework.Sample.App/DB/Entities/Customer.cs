using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Customer : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField("Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string FirstName
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField("Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string LastName
    {
        get;
        set;
    }
}
