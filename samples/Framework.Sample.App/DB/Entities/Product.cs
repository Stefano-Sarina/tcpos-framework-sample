using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Product : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField]
    [StringLength(40, MinimumLength = 1)]
    public string Name
    {
        get;
        set;
    }

    [ConcurrencyItem]
    public decimal Price
    {
        get;
        set;
    }
}
