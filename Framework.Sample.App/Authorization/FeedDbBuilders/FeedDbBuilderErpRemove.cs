﻿using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.DB.Enums;
using TCPOS.Authorization.FeedDatabase.Engine.Abstracts;
using TCPOS.Authorization.FeedDatabase.Engine;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;
using TCPOS.Data.Batches.Enums;

namespace Framework.Sample.App.Authorization.FeedDbBuilders;

internal class FeedDbBuilderErpRemove : FeedDbBuilderErpBase<AuthorizationRequirementErpRemove>
{
    public FeedDbBuilderErpRemove(IServiceProvider serviceProvider) :
        base(serviceProvider)
    {
    }

    protected override Operations Operation => Operations.Remove;
}