using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Lib.Authorization.Domains;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzPermissionValue : ITPermissionValue<int>
{
    public PermissionValueEnum Value
    {
        get;
        set;
    }

    public int PermissionId
    {
        get;
        set;
    }

    public int? UserId
    {
        get;
        set;
    }

    public int? GroupId
    {
        get;
        set;
    }
}
