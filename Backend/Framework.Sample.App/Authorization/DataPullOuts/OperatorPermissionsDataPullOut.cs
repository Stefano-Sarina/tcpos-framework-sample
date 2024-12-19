using AutoMapper;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Authorization.Abstracts.AuthorizationStores;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts;

public class OperatorPermission : Entity
{
    public override int Id {get; set;}
    public int UserId { get; set; }
    public string UserName { get; set; }
    public int PermissionId { get; set; }
    public string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
}

public class OperatorPermissionIn<T>
{
    public T UserId { get; set; }
    public string UserName { get; set; }
    public T PermissionId { get; set; }
    public string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
}

public class OperatorPermissionOut<T> : OperatorPermissionIn<T>, IIDEntity, IConcurrencyEntity
{
    public string ConcurrencyCode { get; set; }

    public int Id { get; set; }
}

public class OperatorPermissionProfile : Profile
{
    public OperatorPermissionProfile()
    {
        CreateMap<OperatorPermissionIn<int>, OperatorPermission>(MemberList.None);
        CreateMap<OperatorPermission, OperatorPermissionIn<int>>(MemberList.None);
        CreateMap<OperatorPermission, OperatorPermissionOut<int>>(MemberList.None);
        CreateMap<OperatorPermission, OperatorPermission>(MemberList.None);
    }
}

public class OperatorPermissionsDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder, IStorageProvider storageProvider, IMapper mapper,
    IAuthorizationUserStore<AuthzUser, int> authzUserStore) 
    : DbContextDataPullOutItem<OperatorPermission, OperatorPermissionOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
{
    protected override IQueryable<OperatorPermission> Query()
    {
        var dbContext = storageProvider.GetStorage<SampleDbContext>();

        FormattableString sql = $@"
select p.id, u.id userid, u.username username , p.id permissionid, p.permissionname permissionname, up.permissionvalue
  from Permission p 
  left join UserPermission up on up.PermissionId = p.id
  left join [sample_app].[dbo].[User] u on up.UserId = u.id";

        return dbContext.Database.SqlQueryRaw<OperatorPermission>(sql.ToString());
    }

    protected override IQueryable<OperatorPermission> GetDataFilterEntity(IQueryable<OperatorPermission> queryable, HttpRequest request)
    {
        CancellationTokenSource cancellationTokenSource = new CancellationTokenSource(1000);

        var userCode = request.HttpContext.User.Identities.FirstOrDefault()?.Name ?? "";
        var userId = authzUserStore.GetUserAsync(userCode, cancellationTokenSource.Token)?.Result?.Id ?? 0;

        return base.GetDataFilterEntity(queryable.Where(p => p.UserId == (int)userId), request);
    }
}
