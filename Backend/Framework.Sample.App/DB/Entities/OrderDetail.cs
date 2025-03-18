using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class OrderDetail : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Order))]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public int OrderId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Product))]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public int ProductId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    public int Quantity
    {
        get;
        set;
    }

    public Order Order
    {
        get;
        set;
    }

    public Product Product
    {
        get;
        set;
    }
}
