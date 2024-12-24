using Framework.Sample.App.DB.Enums;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDatabaseItem: IFeedDatabaseItem
{
    public string PermissionName { get; set; }

    public FeedDatabaseItem(string permissionName)
    {
        PermissionName = permissionName.ToLower();
    }
}
