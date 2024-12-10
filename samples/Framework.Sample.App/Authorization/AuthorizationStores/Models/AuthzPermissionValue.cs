using TCPOS.Authorization.Abstracts.AuthorizationStores;
using static TCPOS.Authorization.Abstracts.AuthorizationStores.ITPermissionValue;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzPermissionValue : ITPermissionValue
{
    public ValueEnum Value
    {
        get;
        set;
    }

    public object PermissionId
    {
        get;
        set;
    }
}
