using AutoMapper;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;
using TCPOS.AspNetCore.DataBind.Batch.Abstracts;
using TCPOS.AspNetCore.DataBind.Configuration;
using TCPOS.AspNetCore.DataBind.OData.DataPullOut;
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
              }).AddDataPullOutItem<DataPullOutItem<Customer, CustomerOut>>()
             .AddDataPullOutItem<DataPullOutItem<Order, OrderOut<int>>>()
             .AddDataPullOutItem<DataPullOutItem<OrderDetail, OrderDetailOut<int>>>()
             .AddDataPullOutItem<DataPullOutItem<Product, ProductOut>>()
                ;


            c.AddBatches<>(configuration =>
              {
                  
              })
             .AddBatchItem<TypedPostBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<TypedPutBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<TypedPatchBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<TypedDeleteBatchCommand<Customer>>()
                ;
            //batchBuilder.AddBatchItem<Kumo.Data.Lib.Implementations.Batches.Base.KumoTypedPostBatchCommand<TCPOS.Domain.Entities.EF.Entities.Abc, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<int, int?>, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<ValueReference, ValueReference?>>>();
            //batchBuilder.AddBatchItem<Kumo.Data.Lib.Implementations.Batches.Base.KumoTypedPutBatchCommand<TCPOS.Domain.Entities.EF.Entities.Abc, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<int, int?>, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<ValueReference, ValueReference?>>>();
            //batchBuilder.AddBatchItem<Kumo.Data.Lib.Implementations.Batches.Base.KumoTypedPatchBatchCommand<TCPOS.Domain.Entities.EF.Entities.Abc, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<int, int?>, Kumo.Data.Lib.Implementations.Data.Payloads.AbcIn<ValueReference, ValueReference?>>>();
            //batchBuilder.AddBatchItem<Kumo.Data.Lib.Implementations.Batches.Base.KumoTypedDeleteBatchCommand<TCPOS.Domain.Entities.EF.Entities.Abc>>();

        });
    }
}
