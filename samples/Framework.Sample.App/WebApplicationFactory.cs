using System.Security.Claims;
using AutoMapper;
using Framework.Sample.App.Configuration;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using TCPOS.AspNetCore.DataBind.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.AspNetCore.DataBind.Implementations.Routes;
using TCPOS.AspNetCore.DataBind.Payloads;

namespace Framework.Sample.App;

public static class WebApplicationFactory
{
    private const string Admin = "Admin";
    private const string User = "User";

    public static async Task<Microsoft.AspNetCore.Builder.WebApplication> Create(string[] args, WebApplicationFactoryOptions webApplicationFactoryOptions=null)
    {
        var builder = Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(args);

        builder.Configuration.AddJsonFile("appsettings.json", false, true);

        if (webApplicationFactoryOptions?.UseTestServer??false)
        {
            builder.WebHost.UseTestServer();
        }

        ConfigureServices(builder.Services);

        var application = builder.Build();

        ConfigureApplication(application);

        var cfg = application.Configuration.Get<Configuration.Configuration>();

        if (cfg?.Debug?.CreateDatabase ?? false)
        {
            using var scope = application.Services.CreateScope();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureDeletedAsync();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureCreatedAsync();
        }

        if (cfg?.Debug?.FillDemoData ?? false)
        {
            using var scope = application.Services.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<SampleDbContext>();
            //ctx.Products.InsertOrUpdate(i=>i.Name=="");
        }

        return application;
    }

    private static void ConfigureApplication(Microsoft.AspNetCore.Builder.WebApplication webApplication)
    {
        webApplication.UseAuthentication();

        webApplication.UseSwagger();
        webApplication.UseSwaggerUI();
        webApplication.UseDataBind();
        webApplication.MapPost("/api/login", async (HttpContext httpContext, [FromQuery] bool isAdmin) =>
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, isAdmin ? Admin : User),
                new(ClaimTypes.Role, isAdmin ? Admin : User)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties();
            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

            return Results.Created();
        });
    }

    private static void ConfigureServices(IServiceCollection services)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();

        typeof(Program).Assembly.GetTypes().Where(x => x is { IsClass: true, IsAbstract: false } && x.IsSubclassOf(typeof(Profile)))
                       .ToList()
                       .ForEach(x => services.AddAutoMapper(x));

        services.AddSingleton<IEdmModelBuilder, DataEntityEdmModelBuilder>();

        services.AddDbContext<SampleDbContext>((s, o) =>
        {
            var cfg = s.GetRequiredService<IConfiguration>().Get<Configuration.Configuration>();

            switch (cfg?.DatabaseConnection?.DatabaseType)
            {
                case DatabaseTypes.SqlServer:
                    o.UseSqlServer(cfg?.DatabaseConnection.ConnectionString);
                    break;
                case DatabaseTypes.Sqlite:
                    o.UseSqlite(cfg?.DatabaseConnection.ConnectionString);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddDataBind(c =>
        {
            c.AddStorageProvider<StorageProvider>();
            c.AddRouteConfigurationData<RouteConfigurationDataByRouteValues>();

            c.AddDataPullOuts()
              //Customer
             .AddDataPullOutItem<DbContextDataPullOutItem<Customer, CustomerOut>>()
              //Order
             .AddDataPullOutItem<DbContextDataPullOutItem<Order, OrderOut<int>>>()
              //OrderDetail
             .AddDataPullOutItem<DbContextDataPullOutItem<OrderDetail, OrderDetailOut<int>>>()
              //Product
             .AddDataPullOutItem<DbContextDataPullOutItem<Product, ProductOut>>()
                ;

            c.AddBatches<InMemoryBatchStorage>()
              //Customer
             .AddBatchItem<DbContextTypedPostBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<DbContextTypedPutBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<DbContextTypedPatchBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<DbContextTypedDeleteBatchCommand<Customer>>()
              //Order
             .AddBatchItem<DbContextTypedPostBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedPutBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedPatchBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedDeleteBatchCommand<Order>>()
              //OrderDetail
             .AddBatchItem<DbContextTypedPostBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedPutBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedPatchBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<DbContextTypedDeleteBatchCommand<OrderDetail>>()
              //Product
             .AddBatchItem<DbContextTypedPostBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<DbContextTypedPutBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<DbContextTypedPatchBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<DbContextTypedDeleteBatchCommand<Product>>()
                ;
        });
    }
}
