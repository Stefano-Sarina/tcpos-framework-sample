namespace Framework.Sample.App.Configuration;

public class Configuration
{
    public Debug Debug
    {
        get;
        set;
    } = new();

    public TenantSettings[] TenantSettings
    {
        get;
        set;
    } = [];
}
