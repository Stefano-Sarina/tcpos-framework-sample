//using AutoMapper;
//using Framework.Sample.App.Authorization.AuthorizationStores.Models;
//using Framework.Sample.App.DataBind;
//using Framework.Sample.App.DB;
//using Framework.Sample.App.DB.Entities.Base;
//using Framework.Sample.App.DB.Enums;
//using Microsoft.AspNetCore.Authorization;
//using Microsoft.EntityFrameworkCore;
//using System.ComponentModel.DataAnnotations;
//using TCPOS.AspNetCore.DataBind.DataPullOut.Configuration;
//using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
//using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
//using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
//using TCPOS.Authorization.Abstracts.AuthorizationStores;
//using TCPOS.Data.Batches.Interfaces;

//namespace Framework.Sample.App.Authorization.DataPullOuts;

//public class OperatorPermission : Entity
//{
//    public override int Id {get; set; }
//    public int OperatorId { get; set; }
//    public string OperatorCode { get; set; }
//    public int? OperatorGroupId { get; set; }
//    public string? OperatorGroupCode { get; set; }
//    public int PermissionId { get; set; }
//    public string PermissionName { get; set; }
//    public PermissionValue PermissionValue { get; set; }
//}

//public class OperatorPermissionIn<T>
//{
//    public T OperatorId { get; set; }
//    public string OperatorCode { get; set; }
//    public T? OperatorGroupId { get; set; }
//    public string? OperatorGroupCode { get; set; }
//    public T PermissionId { get; set; }
//    public string PermissionName { get; set; }
//    public PermissionValue PermissionValue { get; set; }
//}

//public class OperatorPermissionOut<T> : OperatorPermissionIn<T>, IIDEntity, IConcurrencyEntity
//{
//    public string ConcurrencyCode { get; set; }

//    public int Id { get; set; }
//}

//public class OperatorPermissionProfile : Profile
//{
//    public OperatorPermissionProfile()
//    {
//        CreateMap<OperatorPermissionIn<int>, OperatorPermission>(MemberList.None);
//        CreateMap<OperatorPermission, OperatorPermissionIn<int>>(MemberList.None);
//        CreateMap<OperatorPermission, OperatorPermissionOut<int>>(MemberList.None);
//        CreateMap<OperatorPermission, OperatorPermission>(MemberList.None);
//    }
//}

//public class OperatorPermissionsDataPullOut(DataPullOutConfiguration configuration, IEdmModelBuilder edmModelBuilder, IStorageProvider storageProvider, IMapper mapper,
//    IAuthorizationUserStore<AuthzUser, int> authzUserStore) 
//    : DbContextDataPullOutItem<OperatorPermission, OperatorPermissionOut<int>>(configuration, edmModelBuilder, storageProvider, mapper)
//{
//    protected override IQueryable<OperatorPermission> Query()
//    {
//        var dbContext = storageProvider.GetStorage<SampleDbContext>();

//        FormattableString sql = $@"
//select x.* from (
//	select ISNULL (cast ( ROW_NUMBER () OVER (ORDER BY u.id, p.id) as int) ,0) id, 
//	u.id OperatorId, u.username OperatorCode, g.id operatorgroupid, g.groupname operatorgroupcode, p.id permissionid, p.permissionname permissionname, x.permissionvalue 
//		from 
//		(
//			select u.id operatorid, null groupid, up.permissionid, up.permissionvalue
//				from [sample_app].[dbo].[user] u 
//				join [sample_app].[dbo].[userpermission] up on u.id = up.userid
//				where up.permissionvalue is not null
//			union all
//			select u.id operatorid, g.id groupid, gp.permissionid,min(gp.permissionvalue) permission_value
//				from [sample_app].[dbo].[usergroup]  ug 
//				join [sample_app].[dbo].[group] g on g.id = ug.groupid 
//				join [sample_app].[dbo].[user] u on u.id = ug.userid 
//				join [sample_app].[dbo].[grouppermission] gp on g.id = gp.groupid 
//				where gp.permissionvalue is not null
//					and not exists (select 1 from [sample_app].[dbo].[userpermission] up where up.userid = ug.userid and up.permissionid = gp.permissionid)
//				group by u.id , g.id , gp.permissionid
//		) x
//		join [sample_app].[dbo].[user] u on u.id = x.operatorid
//		left join [sample_app].[dbo].[group] g on g.id = x.groupid
//		join [sample_app].[dbo].[permission] p on p.id = x.permissionid
//) x";

//        return dbContext.Database.SqlQueryRaw<OperatorPermission>(sql.ToString());
//    }

//    protected override IQueryable<OperatorPermission> GetDataFilterEntity(IQueryable<OperatorPermission> queryable, HttpRequest request)
//    {
//        CancellationTokenSource cancellationTokenSource = new CancellationTokenSource(1000);

//        var userCode = request.HttpContext.User.Identities.FirstOrDefault()?.Name ?? "";
//        var userId = authzUserStore.GetUserAsync(userCode, cancellationTokenSource.Token)?.Result?.Id ?? 0;

//        return base.GetDataFilterEntity(queryable.Where(p => p.OperatorId == (int)userId), request);
//    }
//}
