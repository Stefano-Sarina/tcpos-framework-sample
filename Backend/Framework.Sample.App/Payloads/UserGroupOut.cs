using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class UserGroupOut<T> : UserGroupIn<T>, IIDEntity, IConcurrencyEntity
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
