using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;
//SARSTE - IFeedDatabaseItem è una interfaccia vuota....a cosa serve?
internal class FeedDatabaseItem : IFeedDatabaseItem
{
    public FeedDatabaseItem(string permissionName)
    {
        PermissionName = permissionName.ToLower();
    }

    public string PermissionName
    {
        get;
        set;
    }
}
