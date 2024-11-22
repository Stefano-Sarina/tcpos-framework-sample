using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class OrderDetailOut<T> : OrderDetailIn<T>, IDEntity, IConcurrencyEntity
{
    public int Id
    {
        get;
        set;
    }
    public string ConcurrencyCode
    {
        get; set;
    }
}