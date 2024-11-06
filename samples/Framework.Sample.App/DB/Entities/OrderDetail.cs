using System.ComponentModel.DataAnnotations.Schema;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class OrderDetail
{
    [PrimaryKeyField]
    public int Id
    {
        get;
        set;
    }

    [ForeignKey(nameof(Order))]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public int OrderId
    {
        get;
        set;
    }

    public Order Order
    {
        get;
        set;
    }

    [ForeignKey(nameof(Product))]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public int ProductId
    {
        get;
        set;
    }

    public Product Product
    {
        get;
        set;
    }

    public int Quantity
    {
        get;
        set;
    }
}
