namespace Framework.Sample.App.Configuration;

public class TenantSettings
{
    public string Tenant
    {
        get;
        set;
    }

    public DatabaseConnection DatabaseConnection
    {
        get;
        set;
    } = new();
}
