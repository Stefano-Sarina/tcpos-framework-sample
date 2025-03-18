using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class UserGroupIn<T>
{
    [Required]
    [UniqueKeyField("Unk_UserId_GroupId")]
    public T UserId
    {
        get;
        set;
    }

    [Required]
    public T GroupId
    {
        get;
        set;
    }
}
