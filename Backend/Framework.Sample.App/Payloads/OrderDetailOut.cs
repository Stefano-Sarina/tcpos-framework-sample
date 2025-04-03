using TCPOS.Lib.Web.Data.Bind.Interfaces;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class OrderDetailOut<T> : OrderDetailIn<T>, IIDEntity<int>, IConcurrencyEntity
{
    public string ConcurrencyCode
    {
        get;
        set;
    }

    public int Id
    {
        get;
        set;
    }
}
