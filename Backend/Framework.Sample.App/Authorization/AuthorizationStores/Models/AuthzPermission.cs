using TCPOS.Lib.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzPermission : ITAuthorizationEntityId<int>
{
    public string Entity
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
