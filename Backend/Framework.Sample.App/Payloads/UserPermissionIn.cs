using Framework.Sample.App.DB.Enums;
using System.ComponentModel.DataAnnotations;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class UserPermissionIn<T>
{
    [Required]
    [UniqueKeyField("Unk_UserId_PermissionId")]
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
