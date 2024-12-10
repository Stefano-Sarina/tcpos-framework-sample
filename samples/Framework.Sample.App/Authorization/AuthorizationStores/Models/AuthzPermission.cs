using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzPermission : ITAuthzEntityId
{
    public string Entity
    {
        get;
        set;
    }

    public object Id
    {
        get;
        set;
    }
}
