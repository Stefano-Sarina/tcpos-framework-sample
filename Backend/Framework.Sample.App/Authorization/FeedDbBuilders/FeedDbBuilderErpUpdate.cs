using Framework.Sample.App.Authorization.Requirements;
using TCPOS.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderErpUpdate : FeedDbBuilderErpBase<AuthorizationRequirementErpUpdate>
{
    public FeedDbBuilderErpUpdate(IServiceProvider serviceProvider) :
        base(serviceProvider)
    { }

    protected override Operations Operation
    {
        get
        {
            return Operations.Update;
        }
    }
}
