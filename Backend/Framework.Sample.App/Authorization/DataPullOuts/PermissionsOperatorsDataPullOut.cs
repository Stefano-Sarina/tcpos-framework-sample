using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Mvc;
using TCPOS.Lib.Web.DataBind.DataPullOut.Configuration;
using TCPOS.Lib.Web.DataBind.Implementations.OData.DataPullOut;
using TCPOS.Lib.Web.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Domains;
using TCPOS.Common.Diagnostics;
using TCPOS.Lib.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsOperatorsDataPullOut(
    DataPullOutConfiguration configuration,
    IEdmModelBuilder edmModelBuilder,
    IStorageProvider storageProvider,
    IMapper mapper,
    [FromServices] ITcposAuthorizationQuerable<AuthzPermissionValue, int> authzQuerable)
    : DbContextDataPullOutItem<PermissionsOperator, PermissionsOperatorOut<int>, int>(configuration, edmModelBuilder, storageProvider, mapper)
{
    public override string Name
    {
        get;
    } = "PermissionsOperators";

    protected override async Task<IQueryable<PermissionsOperator>> QueryAsync(CancellationToken cancellationToken = default)
    {
        var dbContext = storageProvider.GetStorage<SampleDbContext>();

        var permissionValues = await authzQuerable.QueryPermissionValues(cancellationToken);
        Safety.Check(permissionValues != null, new ArgumentNullException(nameof(permissionValues)));

        // retrieve permissions and group id's
        var permissionIds = permissionValues.Select(y => y.PermissionId);
        var groupIds = permissionValues.Select(y => y.GroupId).Distinct();

        // retrieve permissions and groups from db, than transform to dictionary for performances
        var dbPermissions = dbContext.Permissions.ToDictionary(y => y.Id, y => y);
        var dbGroups = dbContext.Groups.ToDictionary(y => y.Id, y => y);
        var dbUsers = dbContext.Users.ToDictionary(y => y.Id, y => y);

        return permissionValues.Select(x => new PermissionsOperator
        {
            Id = x.PermissionId,
            OperatorId = x.UserId!.Value,
            OperatorCode = x.UserId.ToString(),
            OperatorGroupId = x.GroupId,
            OperatorGroupCode = x.GroupId > 0 ? dbGroups[x.GroupId!.Value].GroupName : null,
            PermissionId = x.PermissionId,
            PermissionName = dbPermissions[x.PermissionId].PermissionName,
            PermissionType = (int)dbPermissions[x.PermissionId].PermissionType,
            PermissionValue = x.Value == PermissionValueEnum.Allow ? PermissionValue.Allow :
                              x.Value == PermissionValueEnum.Inherit ? PermissionValue.Inherit :
                              PermissionValue.Deny
        });
    }
}
