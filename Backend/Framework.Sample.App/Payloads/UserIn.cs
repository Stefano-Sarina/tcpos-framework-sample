using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class UserIn
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string UserName
    {
        get;
        set;
    }

    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string Password
    {
        get;
        set;
    }
}
