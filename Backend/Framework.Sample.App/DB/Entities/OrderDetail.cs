using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class OrderDetail : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Order))]
    [UniqueIndexField("Unk_OrderId_ProductId")]
    public int OrderId
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Product))]
    [UniqueIndexField("Unk_OrderId_ProductId")]
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
