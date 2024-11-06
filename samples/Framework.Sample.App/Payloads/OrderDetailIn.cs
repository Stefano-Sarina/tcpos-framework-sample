using System.ComponentModel.DataAnnotations;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class OrderDetailIn<T>
{
    [Required]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public int OrderId
    {
        get;
        set;
    }

    [Required]
    public T ProductId
    {
        get;
        set;
    }

    [Required]
    public int Quantity
    {
        get;
        set;
    }
}