namespace Framework.Sample.App.WebApplication.FormsEndpoints
{
    public class FePermissionItemEndpoint
    {
        public VerbEnum Verb { get; set; }
        public string Url { get; set; } = null!;

        public FePermissionItemEndpoint(VerbEnum verb, string url)
        {
            Verb = verb;
            Url = url;
        }
    }
}
