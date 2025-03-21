using TCPOS.Lib.Web.DataBind.Interfaces;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class ProductOut : ProductIn, IIDEntity<int>, IConcurrencyEntity
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
