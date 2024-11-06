using AutoMapper;
using Framework.Sample.App.DataBind;
using Microsoft.AspNetCore.Http;
using TCPOS.AspNetCore.DataBind.Configuration;

namespace Framework.Sample.App;

public class Program
{
    public static void Main(string[] args)
    {
        var webApplicationBuilder = WebApplication.CreateBuilder(args);

        typeof(Program).Assembly.GetTypes().Where(x => x is { IsClass: true, IsAbstract: false } && x.IsSubclassOf(typeof(Profile)))
                       .ToList()
                       .ForEach(x => webApplicationBuilder.Services.AddAutoMapper(x));
        webApplicationBuilder.Services.AddDataBind(c =>
        {
            c.AddStorageProvider<StorageProvider>();
            c.AddRouteConfigurationData<RouteConfigurationData>();
        });
    }
}