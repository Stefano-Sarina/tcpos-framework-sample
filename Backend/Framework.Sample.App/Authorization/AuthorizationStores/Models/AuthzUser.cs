using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzUser : ITAuthorizationEntityId<int>
{
    public decimal? IsPermissionAdministrator
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
