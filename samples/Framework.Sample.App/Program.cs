using AutoMapper;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;
using Microsoft.EntityFrameworkCore;
using TCPOS.AspNetCore.DataBind.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.AspNetCore.DataBind.Payloads;

namespace Framework.Sample.App;

public class Program
{
    public static async Task Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddJsonFile("appsettings.json", false, true);

        ConfigureServices(builder.Services);

        await using var application = builder.Build();

        ConfigureApplication(application);

        var cfg = application.Configuration.Get<Configuration.Configuration>();

        if (cfg?.Debug?.CreateDatabase??false)
        {
            using var scope = application.Services.CreateScope();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureDeletedAsync();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureCreatedAsync();
        }

        await application.RunAsync();
    }

    private static void ConfigureApplication(WebApplication webApplication)
    {
        webApplication.UseSwagger();
        webApplication.UseSwaggerUI();
        webApplication.UseDataBind(bc =>
                                   { }, dc =>
                                   { });
    }

    private static void ConfigureServices(IServiceCollection services)
    {
        typeof(Program).Assembly.GetTypes().Where(x => x is { IsClass: true, IsAbstract: false } && x.IsSubclassOf(typeof(Profile)))
                       .ToList()
                       .ForEach(x => services.AddAutoMapper(x));

        services.AddSingleton<IEdmModelBuilder, DataEntityEdmModelBuilder>();

        services.AddDbContext<SampleDbContext>((s, o) =>
        {
            var cfg = s.GetRequiredService<IConfiguration>().Get<Configuration.Configuration>();
            switch (cfg?.DatabaseConnection?.DatabaseType)
            {
                case Configuration.DatabaseTypes.SqlServer:
                    o.UseSqlServer(cfg?.DatabaseConnection.ConnectionString);
                    break;
                case Configuration.DatabaseTypes.Sqlite:
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
            c.AddRouteConfigurationData<RouteConfigurationData>();

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
