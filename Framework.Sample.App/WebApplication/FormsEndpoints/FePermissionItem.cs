using System.Xml.Linq;

namespace Framework.Sample.App.WebApplication.FormsEndpoints
{
    public class FePermissionItem
    {
        public string Entity { get; set; } = null!;
        public string Code { get; set; } = null!;
        public string Description { get; set; } = null!;
        public FePermissionItemEndpoint PermissionItemEndpoint { get; set; }
        public string[] PermissionItemParents { get; set; }

        internal string ApiPermissionName => GetPermissionName(DB.Enums.PermissionTypes.Api);

        internal string GetPermissionName(DB.Enums.PermissionTypes permissionType) => $"{Entity}-{permissionType}-{PermissionItemEndpoint.Verb.ToString().ToLower()}";
    }
}
