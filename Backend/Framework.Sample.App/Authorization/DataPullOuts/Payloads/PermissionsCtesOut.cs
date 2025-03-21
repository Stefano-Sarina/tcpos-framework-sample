using TCPOS.Lib.Web.DataBind.Interfaces;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts.Payloads;

public class PermissionsCtesOut<T> : PermissionsCtesIn<T>, IIDEntity<int>, IConcurrencyEntity
{
    public required string ConcurrencyCode
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
