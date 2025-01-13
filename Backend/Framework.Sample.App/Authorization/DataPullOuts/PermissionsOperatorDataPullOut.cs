using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Mvc;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsOperator : Entity
{
    public override int Id { get; set; }
    public int OperatorId { get; set; }
    public string OperatorCode { get; set; }
    public int? OperatorGroupId { get; set; }
    public string? OperatorGroupCode { get; set; }
    public int PermissionId { get; set; }
    public string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
}

public class PermissionsOperatorIn<T> 
{
    public T OperatorId { get; set; }
    public string OperatorCode { get; set; }
    public T? OperatorGroupId { get; set; }
    public string? OperatorGroupCode { get; set; }
    public T PermissionId { get; set; }
    public string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
}

public class PermissionsOperatorOut<T> : PermissionsOperatorIn<T>
{
    public string ConcurrencyCode { get; set; }
    public int Id { get; set; }
}

public class PermissionsOperatorProfile : Profile
{
    public PermissionsOperatorProfile()
    {
        CreateMap<PermissionsOperatorIn<int>, PermissionsOperator>(MemberList.None);
        CreateMap<PermissionsOperator, PermissionsOperatorIn<int>>(MemberList.None);
        CreateMap<PermissionsOperator, PermissionsOperatorOut<int>>(MemberList.None);
        CreateMap<PermissionsOperator, PermissionsOperator>(MemberList.None);
    }
}

public class PermissionsOperatorDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder, 
        IStorageProvider storageProvider, IMapper mapper,
        [FromServices] IHttpContextAccessor httpContextAccessor,
        [FromServices] SampleDbContext dbContext,
        [FromServices] IAuthorizationContextStore<HttpContext> authzCtx,
        [FromServices] IAuthorizationUserStore<AuthzUser, int> authzUser,
        [FromServices] ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authzRepo)
    : DbContextDataPullOutItem<PermissionsOperator, PermissionsOperatorOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    protected override IQueryable<PermissionsOperator> Query()
    {
        CancellationToken none = CancellationToken.None;

        {
            // retrieve the user
            var userId = authzCtx.GetUserIdAsync(httpContextAccessor.HttpContext!, none).Result;
            var user = authzUser.GetUserAsync(userId, none).Result;
            Safety.Check(user != null, $"User not found: {userId}");

            if (user == null)
            {
                return Array.Empty<PermissionsOperator>().AsQueryable();
            }

            var permissionValues = authzRepo.GetPermissionValues(user, none).Result;

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

            int id = 1;
            return permissionValues.Select(x => new PermissionsOperator()
            {
                Id = id++,
                OperatorId = dbUser.Id,
                OperatorCode = dbUser.UserName,
                OperatorGroupId = x.GroupId,
                OperatorGroupCode = x.GroupId > 0 ? dbGroups[x.GroupId].GroupName : null,
                PermissionId = x.PermissionId,
                PermissionName = dbPermissions[x.PermissionId].PermissionName,
                PermissionValue = x.Value == TCPOS.Authorization.Domains.PermissionValueEnum.Allow ? PermissionValue.Allow :
                                  x.Value == TCPOS.Authorization.Domains.PermissionValueEnum.Inherit ? PermissionValue.Inherit:
                                  PermissionValue.Deny
            }).AsQueryable();
        }            
    }
}
