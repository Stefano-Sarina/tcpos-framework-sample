namespace Framework.Sample.App.Authorization.DataPullOuts.Payloads;

public class PermissionsCtesIn<T>
{
    public required T ChildPermissionId
    {
        get;
        set;
    }

    public required string ChildPermissionName
    {
        get;
        set;
    }

    public int ChildPermissionType
    {
        get;
        set;
    }

    public required T ParentPermissionId
    {
        get;
        set;
    }

    public required string ParentPermissionName
    {
        get;
        set;
    }

    public int ParentPermissionType
    {
        get;
        set;
    }

    public int Level
    {
        get;
        set;
    }
}
