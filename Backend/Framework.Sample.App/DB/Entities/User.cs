using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class User : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueIndexField(KeyName = "Unk_UserName")]
    [StringLength(40, MinimumLength = 1)]
    public string UserName
    {
        get;
        set;
    }

    [StringLength(40, MinimumLength = 1)]
    public string Password
    {
        get;
        set;
    }
}
