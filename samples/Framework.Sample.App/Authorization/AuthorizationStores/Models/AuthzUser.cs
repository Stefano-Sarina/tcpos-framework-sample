namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzUser
{
    public int Id
    {
        get;
        set;
    }

    public decimal? IsPermissionAdministrator
    {
        get;
        set;
    }
}
