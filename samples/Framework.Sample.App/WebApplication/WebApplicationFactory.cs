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
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.AspNetCore.DataBind.Extensions;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.Batches.Concurrency;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Data.Batches.Payload;

namespace Framework.Sample.App.WebApplication;

public static class WebApplicationFactory
{
    private const string Admin = "Admin";
    private const string User = "User";

    public static async Task<Microsoft.AspNetCore.Builder.WebApplication> Create(string[] args, WebApplicationFactoryOptions webApplicationFactoryOptions = null)
    {
        var builder = Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(args);

        builder.Configuration.AddJsonFile("appsettings.json", false, true);

        if (webApplicationFactoryOptions?.UseTestServer ?? false)
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
        webApplication.UseMiddleware<ExceptionMiddleware>();

        webApplication.UseAuthentication();

        webApplication.UseSwagger();
        webApplication.UseSwaggerUI();
        webApplication.UseDataBind(batchRouteMapper =>
        {
            batchRouteMapper.MapBatchCreate( "/api/1.0/Batch/{numCommands}/{ttlMilliseconds}", Delegates.BatchCreate);
            batchRouteMapper.MapBatchGet("/api/1.0/Batch/{batchId}", Delegates.BatchGet);
            batchRouteMapper.MapBatchRun("/api/1.0/Batch/{batchId}/Run", Delegates.BatchRun);

            batchRouteMapper.MapBatchAddInsert(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/insert", Delegates.BatchAddInsert);
            batchRouteMapper.MapBatchAddRemove(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/remove/{key}/{concurrencyCode?}", Delegates.BatchAddRemove);
            batchRouteMapper.MapBatchAddReplace(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/replace/{key}/{concurrencyCode?}", Delegates.BatchAddReplace);
            batchRouteMapper.MapBatchAddUpdate(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/update/{key}/{concurrencyCode?}", Delegates.BatchAddUpdate);

            batchRouteMapper.MapErpInsert(HttpVerbs.Post, "/api/{version}/{name}", Delegates.ErpInsert);
            batchRouteMapper.MapErpRemove(HttpVerbs.Delete, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpRemove);
            batchRouteMapper.MapErpReplace(HttpVerbs.Put, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpReplace);
            batchRouteMapper.MapErpUpdate(HttpVerbs.Patch, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpUpdate);
        }, dataPullOutRouteMapper =>
        {
            dataPullOutRouteMapper.MapDataPullOut(HttpVerbs.Get, "/api/{version}/{name}", Delegates.DataPullOut);
            dataPullOutRouteMapper.MapDataPullOutWithKey(HttpVerbs.Get, "/api/{version}/{name}/{key}", Delegates.DataPullOutWithKey);
            dataPullOutRouteMapper.MapDataPullOutCount(HttpVerbs.Get, "/api/{version}/{name}/count", Delegates.DataPullOutCount);
            dataPullOutRouteMapper.MapDataPullSchema(HttpVerbs.Get, "/api/{version}/{name}/schema", Delegates.DataPullSchema);
        });
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
            c.AddDataPullOut()
              //Customer
             .AddDataPullOutItem<DbContextDataPullOutItem<Customer, CustomerOut>>()
              //Order
             .AddDataPullOutItem<DbContextDataPullOutItem<Order, OrderOut<int>>>()
              //OrderDetail
             .AddDataPullOutItem<DbContextDataPullOutItem<OrderDetail, OrderDetailOut<int>>>()
              //Product
             .AddDataPullOutItem<DbContextDataPullOutItem<Product, ProductOut>>()
                ;

            c.AddBatches<InMemoryBatchStorage, StorageProvider>()
              //Customer
             .AddBatchItem<DbContextTypedPostBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Customer>>()
              //Order
             .AddBatchItem<DbContextTypedPostBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Order>>()
              //OrderDetail
             .AddBatchItem<DbContextTypedPostBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<OrderDetail>>()
              //Product
             .AddBatchItem<DbContextTypedPostBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Product>>()
                ;
        });
    }
}