using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class Order : Entity
{
    [ConcurrencyItem]
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
