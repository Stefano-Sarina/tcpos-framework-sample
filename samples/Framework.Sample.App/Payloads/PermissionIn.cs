using Framework.Sample.App.DB.Enums;
using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class PermissionIn
{

    [Required]
    [StringLength(40, MinimumLength = 1)]
    public string PermissionName
    {
        get;
        set;
    }

    [Required]
    public PermissionTypes PermissionType
    {
        get;
        set;
    }
}
