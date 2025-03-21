using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class OrderDetailIn<T>
{
    [Required]
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
