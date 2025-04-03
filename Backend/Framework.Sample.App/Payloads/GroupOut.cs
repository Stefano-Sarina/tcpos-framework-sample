using TCPOS.Lib.Web.Data.Bind.Interfaces;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class GroupOut : GroupIn, IIDEntity<int>, IConcurrencyEntity
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
