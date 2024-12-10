using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class CustomerOut : CustomerIn, IIDEntity,IConcurrencyEntity
{
    public int Id
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