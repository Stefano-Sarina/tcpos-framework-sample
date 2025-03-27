using TCPOS.Lib.Web.DataBind.Interfaces;
using TCPOS.Lib.Data.Batches.Abstracts.Concurrency;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.DB.Entities.Base;

public abstract class Entity : IIDEntity<int>, IConcurrencyEntity
{
    public string ConcurrencyCode
    {
        get
        {
            return ConcurrencyUtils.CalculateConcurrencyCode(this);
        }
    }

    public abstract int Id
    {
        get;
        set;
    }
}
