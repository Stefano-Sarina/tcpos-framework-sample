using Framework.Sample.App.DB;
using TCPOS.AspNetCore.DataBind.DataPullOut.Items;

namespace Framework.Sample.App.WebApplication.Samples;

public class DataPullOutItemCustom<TE, TP>(TElasticClient elasticClient, SampleDbContext sampleDbContext) : DataPullOutItem<TE, TP>
    where TE : class
    where TP : class
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

    protected override async Task<IQueryable<TE>> GetDataWithKeyFilterExpressionAsync(Task<IQueryable<TE>> queryableTask, int key, CancellationToken cancellationToken = new())
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