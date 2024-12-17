using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzGroup : ITAuthorizationEntityId<int>
{
    public int Id
    {
        get;
        set;
    }
}
