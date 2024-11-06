using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class OrderIn<T>
{
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

    public T CustomerId
    {
        get;
        set;
    }
}