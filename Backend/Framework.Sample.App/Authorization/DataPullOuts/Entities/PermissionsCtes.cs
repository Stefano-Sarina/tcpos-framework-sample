using Framework.Sample.App.DB.Entities.Base;

namespace Framework.Sample.App.Authorization.DataPullOuts.Entities;

public class PermissionsCtes : Entity
{
    public override int Id
    {
        get;
        set;
    }

    public int ChildPermissionId
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

    public int ParentPermissionId
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
