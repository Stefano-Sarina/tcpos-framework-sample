namespace Framework.Sample.App.WebApplication.FormsEndpoints;

public interface IFormsEndpoint
{
    string ApplicationName
    {
        get;
    }

    string Version
    {
        get;
    }

    FePermission[] Permissions
    {
        get;
    }
}
