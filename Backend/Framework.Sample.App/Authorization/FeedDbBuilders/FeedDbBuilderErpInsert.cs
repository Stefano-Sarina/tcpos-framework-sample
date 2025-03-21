using Framework.Sample.App.Authorization.Requirements;
using TCPOS.Lib.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderErpInsert : FeedDbBuilderErpBase<AuthorizationRequirementErpInsert>
{
    public FeedDbBuilderErpInsert(IServiceProvider serviceProvider) :
        base(serviceProvider)
    { }

    protected override Operations Operation
    {
        get
        {
            return Operations.Insert;
        }
    }
}
