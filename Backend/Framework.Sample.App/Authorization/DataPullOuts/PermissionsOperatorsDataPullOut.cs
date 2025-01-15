using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;
using Framework.Sample.App.DB.Enums;
using Framework.Sample.App.DB;
using Microsoft.AspNetCore.Mvc;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Abstracts;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;
using Framework.Sample.App.DataBind;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsOperatorsDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder,
        IStorageProvider storageProvider, IMapper mapper,
        [FromServices] ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authzRepo)
    : DbContextDataPullOutItem<PermissionsOperator, PermissionsOperatorOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    public override string Name
    {
        get;
    } = "PermissionsOperators";


    protected override IQueryable<PermissionsOperator> Query()
    {
        CancellationToken none = CancellationToken.None;

        var dbContext = storageProvider.GetStorage<SampleDbContext>();

        var permissionValues = authzRepo.GetPermissionValues(none).Result;
        Safety.Check(permissionValues != null, new ArgumentNullException(nameof(permissionValues)));

        // retrieve permissions and group id's
        var permissionIds = permissionValues.Select(y => y.PermissionId);
        var groupIds = permissionValues.Select(y => y.GroupId).Distinct();

        // retrieve permissions and groups from db, than transform to dictionary for performances
        var dbPermissions = dbContext.Permissions.ToDictionary(y => y.Id, y => y);
        var dbGroups = dbContext.Groups.ToDictionary(y => y.Id, y => y);
        var dbUsers = dbContext.Users.ToDictionary(y => y.Id, y => y);

        int id = 1;
        return permissionValues.Select(x => new PermissionsOperator()
        {
            Id = id++,
            OperatorId = x.UserId,
            OperatorCode = x.UserId.ToString(),
            OperatorGroupId = x.GroupId,
            OperatorGroupCode = x.GroupId > 0 ? dbGroups[x.GroupId].GroupName : null,
            PermissionId = x.PermissionId,
            PermissionName = dbPermissions[x.PermissionId].PermissionName,
            PermissionValue = x.Value == TCPOS.Authorization.Domains.PermissionValueEnum.Allow ? PermissionValue.Allow :
                                x.Value == TCPOS.Authorization.Domains.PermissionValueEnum.Inherit ? PermissionValue.Inherit :
                                PermissionValue.Deny
        }).AsQueryable();
    }
}
