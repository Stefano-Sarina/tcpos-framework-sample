using Newtonsoft.Json.Linq;
using TCPOS.Data.Batches.Abstracts;
using TCPOS.Data.Batches.Enums;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.WebApplication.Samples;

public class ElasticTypedBatchCommand<TElasticDocument, TBatchPayload, TErpPayload>(TElasticStorageProvider storageProvider) : TypedBatchCommand<TElasticDocument, TBatchPayload, TErpPayload>
    where TElasticDocument : class
    where TBatchPayload : class
    where TErpPayload : class
{
    public override string Name
    {
        get;
    }

    public override Operations Operation
    {
        get;
    }

    protected override async Task<JToken> Execute(IStorageProvider storageProvider, TBatchPayload payload)
    {
        throw new NotImplementedException();
    }

    protected override async Task<TElasticDocument> SaveToDatabase(IStorageProvider storageProvider, TElasticDocument entity)
    {
        throw new NotImplementedException();
    }

    protected override JToken GetEntityKey(TElasticDocument entity)
    {
        throw new NotImplementedException();
    }
}