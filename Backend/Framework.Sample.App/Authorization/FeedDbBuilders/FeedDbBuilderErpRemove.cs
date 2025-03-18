using Framework.Sample.App.Authorization.Requirements;
using TCPOS.Lib.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderErpRemove : FeedDbBuilderErpBase<AuthorizationRequirementErpRemove>
{
    public FeedDbBuilderErpRemove(IServiceProvider serviceProvider) :
        base(serviceProvider)
    { }

    protected override Operations Operation
    {
        get
        {
            return Operations.Remove;
        }
    }
}
