namespace Framework.Sample.App.WebApplication.FormsEndpoints
{
    public class FeIn : IFormsEndpoint
    {
        public required string ApplicationName { get; set; }
        public required string Version { get; set; }
        public required FePermission[] Permissions { get; set; }
    }
}
