using System.ComponentModel.DataAnnotations;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

public class Customer : IDEntity
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
