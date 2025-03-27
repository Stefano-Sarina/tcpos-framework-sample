using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.WebApplication.Samples;

public class TElasticStorageProvider(TElasticClient elasticClient) : IStorageProvider
{
    public async Task BeginTransaction()
    {
        await Task.CompletedTask;
    }

    public async Task CommitTransaction()
    {
        await Task.CompletedTask;
    }

    public async Task RollbackTransaction()
    {
        await Task.CompletedTask;
    }

    public T GetStorage<T>()
    {
        return elasticClient is T storage ? storage :
                   throw new NotImplementedException();
    }
}