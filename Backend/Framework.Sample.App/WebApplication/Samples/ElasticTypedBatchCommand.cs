using System.Text.Json.Nodes;
using TCPOS.Lib.Data.Batches.Abstracts;
using TCPOS.Lib.Data.Batches.Enums;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.WebApplication.Samples;

public class ElasticTypedBatchCommand<TElasticDocument, TBatchPayload, TErpPayload>(TElasticStorageProvider storageProvider) 
    : TypedBatchCommand<TElasticDocument, TBatchPayload, TErpPayload, int>
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

    protected override async Task<JsonValue> Execute(IStorageProvider storageProvider, TBatchPayload payload)
    {
        throw new NotImplementedException();
    }

    protected override async Task<TElasticDocument> SaveToDatabase(IStorageProvider storageProvider, TElasticDocument entity)
    {
        throw new NotImplementedException();
    }

    protected override JsonValue GetEntityKey(TElasticDocument entity)
    {
        throw new NotImplementedException();
    }
}