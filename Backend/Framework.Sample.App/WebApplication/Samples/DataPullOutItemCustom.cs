using Framework.Sample.App.DB;
using TCPOS.Lib.Web.Data.Bind.DataPullOut.Items;

namespace Framework.Sample.App.WebApplication.Samples;

public class DataPullOutItemCustom<TE, TP, TKey>(TElasticClient elasticClient, SampleDbContext sampleDbContext) : DataPullOutItem<TE, TP, TKey>
    where TE : class
    where TP : class
    where TKey : struct
{
    public override string ResultTypeSchema
    {
        get;
    }

    public override Type ResultType
    {
        get;
    }

    public override Type EntityType
    {
        get;
    }

    public override string Name
    {
        get;
    }

    public override Version Version
    {
        get;
    }

    protected override Task<IQueryable<TE>> GetDataWithKeyFilterExpressionAsync(Task<IQueryable<TE>> queryableTask, TKey key, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }

    protected override async Task<IQueryable<TE>> QueryAsync(CancellationToken cancellationToken = new())
    {
        return sampleDbContext.Set<TE>();
    }

    protected override async Task<IQueryable<TP>> MapAsync(Task<IQueryable<TE>> queryableTask, CancellationToken cancellationToken = new())
    {
        throw new NotImplementedException();
    }
}