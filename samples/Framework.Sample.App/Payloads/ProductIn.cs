using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class ProductIn
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string Name
    {
        get;
        set;
    }

    [Required]
    public decimal Price
    {
        get;
        set;
    }
}
