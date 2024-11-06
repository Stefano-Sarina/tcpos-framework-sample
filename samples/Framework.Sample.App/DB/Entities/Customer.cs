using System.ComponentModel.DataAnnotations;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Customer
{
    [PrimaryKeyField]
    public int Id
    {
        get;
        set;
    }

    [UniqueKeyField("Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string FirstName
    {
        get;
        set;
    }

    [UniqueKeyField("Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string LastName
    {
        get;
        set;
    }
}
