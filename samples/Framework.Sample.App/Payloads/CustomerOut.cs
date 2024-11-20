using TCPOS.Data.Batches.Abstracts.Concurrency;

namespace Framework.Sample.App.Payloads;

public class CustomerOut : CustomerIn
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