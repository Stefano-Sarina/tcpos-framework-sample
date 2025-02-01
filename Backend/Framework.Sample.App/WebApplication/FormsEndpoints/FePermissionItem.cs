using Framework.Sample.App.DB.Enums;

namespace Framework.Sample.App.WebApplication.FormsEndpoints;

public class FePermissionItem
{
    public string Entity
    {
        get;
        set;
    } = null!;

    public string Code
    {
        get;
        set;
    } = null!;

    public string Description
    {
        get;
        set;
    } = null!;

    public FePermissionItemEndpoint? PermissionItemEndpoint
    {
        get;
        set;
    }

    public string[] PermissionItemParents
    {
        get;
        set;
    } = [];

    internal string ApiPermissionName
    {
        get
        {
            return $"{Entity}-{PermissionTypes.Api}-{PermissionItemEndpoint?.Verb.ToString()}".ToLower();
        }
    }
}
