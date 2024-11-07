using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Order : IDEntity
{
    [PrimaryKeyField]
    public int Id
    {
        get;
        set;
    }

    public DateOnly OrderDate
    {
        get;
        set;
    }

    [StringLength(int.MaxValue)]
    public string? Notes
    {
        get;
        set;
    }

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
