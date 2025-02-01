using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Enums;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class GroupPermissionIn<T>
{
    [Required]
    [UniqueKeyField("Unk_GroupId_PermissionId")]
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
