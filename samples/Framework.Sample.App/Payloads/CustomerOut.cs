using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Abstracts.Concurrency;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class CustomerOut : CustomerIn, IDEntity,IConcurrencyEntity
{
    public int Id
    {
        get;
        set;
    }
    public string ConcurrencyCode
    {
        get;set;
    }
}