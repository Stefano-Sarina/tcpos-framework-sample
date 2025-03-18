using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.Payloads;

public class UserIn
{
    [Required]
    [StringLength(40, MinimumLength = 1)]
    [UniqueKeyField("Unk_UserName")]
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
