using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class Customer : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueIndexField(KeyName = "Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string FirstName
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueIndexField(KeyName = "Unk_FirstName_LastName")]
    [StringLength(40, MinimumLength = 1)]
    public string LastName
    {
        get;
        set;
    }
}
