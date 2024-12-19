using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class CustomerIn
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string FirstName
    {
        get;
        set;
    }

    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string LastName
    {
        get;
        set;
    }
}
