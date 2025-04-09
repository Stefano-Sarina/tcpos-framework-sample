using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using Microsoft.EntityFrameworkCore;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.EntityFramework.Attributes;

namespace Framework.Sample.App.DB.Entities;

[PrimaryKey(nameof(Id))]
public class Group : Entity
{
    [ConcurrencyItem]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueIndexField(KeyName = "Unk_GroupName")]
    [StringLength(40, MinimumLength = 1)]
    public string GroupName
    {
        get;
        set;
    }
}
