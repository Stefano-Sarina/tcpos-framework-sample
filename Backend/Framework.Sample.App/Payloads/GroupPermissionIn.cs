using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Enums;

namespace Framework.Sample.App.Payloads;

public class GroupPermissionIn<T>
{
    [Required]
    public T GroupId
    {
        get;
        set;
    }

    [Required]
    public T PermissionId
    {
        get;
        set;
    }

    [Required]
    public PermissionValue PermissionValue
    {
        get;
        set;
    }
}
