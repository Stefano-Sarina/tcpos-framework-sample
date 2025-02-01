using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Mvc;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Authorization.Domains;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsOperatorDataPullOut(
    DataPullOutConfiguration configuration,
    IEdmModelBuilder edmModelBuilder,
    IStorageProvider storageProvider,
    IMapper mapper,
    [FromServices] IHttpContextAccessor httpContextAccessor,
    [FromServices] SampleDbContext dbContext,
    [FromServices] IAuthorizationContextStore<HttpContext> authzCtx,
    [FromServices] IAuthorizationUserStore<AuthzUser, int> authzUser,
    [FromServices] ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authzRepo)
    : DbContextDataPullOutItem<PermissionsOperator, PermissionsOperatorOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    protected override async Task<IQueryable<PermissionsOperator>> QueryAsync(CancellationToken cancellationToken = default)
    {
        // retrieve the user
        var userId = await authzCtx.GetUserIdAsync(httpContextAccessor.HttpContext!, cancellationToken);
        var user = await authzUser.GetUserAsync(userId, cancellationToken);
        Safety.Check(user != null, $"User not found: {userId}");

        if (user == null)
        {
            return Array.Empty<PermissionsOperator>().AsQueryable();
        }

        var permissionValues = await authzRepo.GetPermissionValues(user, cancellationToken);

        // retrieve permissions and group id's
        var permissionIds = permissionValues.Select(y => y.PermissionId);
        var groupIds = permissionValues.Select(y => y.GroupId).Distinct();

        // retrieve user from db
        var dbUser = dbContext.Users.FirstOrDefault(x => user.Id == x.Id);
        Safety.Check(dbUser != null, $"User not found on db, Id:{user.Id}");

        // retrieve permissions and groups from db, than transform to dictionary for performances
        var dbPermissions = dbContext.Permissions.Where(x => permissionIds.Contains(x.Id))
                                     .ToDictionary(y => y.Id, y => y);
        var dbGroups = dbContext.Groups.Where(x => groupIds.Contains(x.Id))
                                .ToDictionary(y => y.Id, y => y);

        var id = 1;
        return permissionValues.Select(x => new PermissionsOperator
        {
            Id = id++,
            OperatorId = dbUser.Id,
            OperatorCode = dbUser.UserName,
            OperatorGroupId = x.GroupId,
            OperatorGroupCode = x.GroupId > 0 ? dbGroups[x.GroupId].GroupName : null,
            PermissionId = x.PermissionId,
            PermissionName = dbPermissions[x.PermissionId].PermissionName,
            PermissionType = (int)dbPermissions[x.PermissionId].PermissionType,
            PermissionValue = x.Value == PermissionValueEnum.Allow ? PermissionValue.Allow :
                              x.Value == PermissionValueEnum.Inherit ? PermissionValue.Inherit :
                              PermissionValue.Deny
        }).AsQueryable();
    }
}
