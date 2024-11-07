namespace Framework.Sample.App.Configuration;

public class Configuration
{
    public Debug Debug
    {
        get;
        set;
    }=new Debug();

    public DatabaseConnection DatabaseConnection
    {
        get;
        set;
    }=new DatabaseConnection();
}
