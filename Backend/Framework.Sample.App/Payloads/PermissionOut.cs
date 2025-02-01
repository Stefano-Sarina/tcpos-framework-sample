using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class PermissionOut : PermissionIn, IIDEntity, IConcurrencyEntity
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
