using System.ComponentModel.DataAnnotations;
using Framework.Sample.App.DB.Entities.Base;
using TCPOS.Lib.Data.EntityFramework.Attributes;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;

namespace Framework.Sample.App.DB.Entities;

public class Group : Entity
{
    [ConcurrencyItem]
    [PrimaryKeyField]
    public override int Id
    {
        get;
        set;
    }

    [ConcurrencyItem]
    [UniqueKeyField("Unk_GroupName")]
    [StringLength(40, MinimumLength = 1)]
    public string GroupName
    {
        get;
        set;
    }
}
