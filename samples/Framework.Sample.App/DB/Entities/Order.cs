using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Order : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    public DateOnly OrderDate
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [StringLength(int.MaxValue)]
    public string? Notes
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [ForeignKey(nameof(Customer))]
    public int CustomerId
    {
        get;
        set;
    }

    public Customer Customer
    {
        get;
        set;
    }

    public HashSet<OrderDetail> OrderDetails
    {
        get;
        set;
    }
}
