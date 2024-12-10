using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class GroupIn
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string GroupName
    {
        get;
        set;
    }
}
