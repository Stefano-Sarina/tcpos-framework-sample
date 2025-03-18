using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class OrderDetailIn<T>
{
    [Required]
    [UniqueKeyField("Unk_OrderId_ProductId")]
    public T OrderId
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
