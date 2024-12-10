namespace Framework.Sample.App.Configuration;

public class Configuration
{
    public Debug Debug
    {
        get;
        set;
    } = new();

    public DatabaseConnection DatabaseConnection
    {
        get;
        set;
    } = new();
}
