﻿using Framework.Sample.App.Authorization.Requirements;
using TCPOS.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderErpReplace : FeedDbBuilderErpBase<AuthorizationRequirementErpReplace>
{
    public FeedDbBuilderErpReplace(IServiceProvider serviceProvider) :
        base(serviceProvider)
    {
    }

    protected override Operations Operation => Operations.Replace;
}