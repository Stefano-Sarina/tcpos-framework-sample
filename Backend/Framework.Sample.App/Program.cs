using Framework.Sample.App.WebApplication;

namespace Framework.Sample.App;

public static class Program
{
    public static async Task Main(string[] args)
    {
        await using var application = await WebApplicationFactory.Create(args);

        await application.RunAsync();
    }
}
