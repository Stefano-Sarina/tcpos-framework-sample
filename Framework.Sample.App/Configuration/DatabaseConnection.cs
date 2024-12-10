namespace Framework.Sample.App.Configuration;

public class DatabaseConnection
{
    public DatabaseTypes DatabaseType
    {
        get;
        set;
    }

    public string ConnectionString
    {
        get;
        set;
    }
}
