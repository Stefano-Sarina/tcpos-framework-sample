using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Interfaces;
using TCPOS.Data.Batches.Payload;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class PermissionsOperator : OperatorPermission
{
}

public class PermissionsOperatorIn<T> : OperatorPermissionIn<T>
{
}

public class PermissionsOperatorOut<T> : OperatorPermissionOut<T>
{
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
        [FromServices] SampleDbContext dbContext,
        [FromServices] IAuthorizationContextStore<HttpContext> authzCtx,
        [FromServices] IAuthorizationUserStore<AuthzUser, int> authzUser,
        [FromServices] ITcposAuthorizationRepository<AuthzUser, AuthzGroup, AuthzPermission, AuthzPermissionValue, int> authzRepo)
    : DbContextDataPullOutItem<PermissionsOperator, PermissionsOperatorOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    public async override Task<System.Collections.IEnumerable> GetData(HttpRequest request, AdditionalData[] requestAdditionalData)
    {
        using (CancellationTokenSource cts = new CancellationTokenSource(1000))
        {
            // retrieve the user
            var userId = await authzCtx.GetUserIdAsync(request.HttpContext, cts.Token);
            var user = await authzUser.GetUserAsync(userId, cts.Token);
            Safety.Check(user != null, $"User not found: {userId}");

            if (user == null)
            {
                return Array.Empty<PermissionsOperatorOut<int>>();
            }

            var permissionValues = await authzRepo.GetPermissionValues(user, cts.Token);

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
            var result = permissionValues.Select(x => new PermissionsOperatorOut<int>()
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
            });

            return result;
        }            
    }
}
