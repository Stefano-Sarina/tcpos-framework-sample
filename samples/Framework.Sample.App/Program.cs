using AutoMapper;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;
using TCPOS.AspNetCore.DataBind.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Payloads;

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

            c.AddDataPullOuts(configuration =>
              {
                  configuration.DefaultPageSize = 50;
              })
              //Customer
             .AddDataPullOutItem<DataPullOutItem<Customer, CustomerOut>>()
              //Order
             .AddDataPullOutItem<DataPullOutItem<Order, OrderOut<int>>>()
              //OrderDetail
             .AddDataPullOutItem<DataPullOutItem<OrderDetail, OrderDetailOut<int>>>()
              //Product
             .AddDataPullOutItem<DataPullOutItem<Product, ProductOut>>()
                ;

            c.AddBatches<InMemoryBatchStorage>(configuration =>
                                               { })
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
