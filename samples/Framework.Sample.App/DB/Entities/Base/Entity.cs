using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.DB.Entities.Base;

public abstract class Entity : IDEntity, IConcurrencyEntity
{
    public abstract int Id
    {
        get;
        set;
    }

    public string ConcurrencyCode
    {
        get
        {
            return ConcurrencyUtils.CalculateConcurrencyCode(this);
        }
    }
}