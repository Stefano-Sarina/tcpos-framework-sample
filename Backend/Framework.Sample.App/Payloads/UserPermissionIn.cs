using Framework.Sample.App.DB.Enums;
using System.ComponentModel.DataAnnotations;

namespace Framework.Sample.App.Payloads;

public class UserPermissionIn<T>
{
    [Required]
    public T UserId
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
