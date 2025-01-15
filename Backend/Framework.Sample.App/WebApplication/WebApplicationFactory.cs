using System.Security.Claims;
using AutoMapper;
using Framework.Sample.App.Authorization.DataPullOuts;
using Framework.Sample.App.Authorization.Extensions;
using Framework.Sample.App.Authorization.Requirements;
using Framework.Sample.App.Configuration;
using Framework.Sample.App.DataBind;
using Framework.Sample.App.DB;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;
using Framework.Sample.App.Utils;
using Framework.Sample.App.WebApplication.FormsEndpoints;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using TCPOS.AspNetCore.DataBind.Configuration;
using TCPOS.AspNetCore.DataBind.Extensions;
using TCPOS.AspNetCore.DataBind.Implementations.Batches;
using TCPOS.AspNetCore.DataBind.Implementations.Batches.Concurrency;
using TCPOS.AspNetCore.DataBind.Implementations.OData.DataPullOut;
using TCPOS.AspNetCore.DataBind.Implementations.OData.Interfaces;
using TCPOS.Data.Batches.Payload;
using TCPOS.EntityFramework.Extensions;

namespace Framework.Sample.App.WebApplication;

public static class WebApplicationFactory
{
    private const string Admin = "Admin";
    private const string User = "User";
    private const string AdminGroup = "AdminGroup";
    private const string UserGroup = "UserGroup";

    public static async Task<Microsoft.AspNetCore.Builder.WebApplication> Create(string[] args, WebApplicationFactoryOptions webApplicationFactoryOptions = null)
    {
        var builder = Microsoft.AspNetCore.Builder.WebApplication.CreateBuilder(args);

        builder.Configuration.AddJsonFile("appsettings.json", false, true);

        if (webApplicationFactoryOptions?.UseTestServer ?? false)
        {
            builder.WebHost.UseTestServer();
        }

        ConfigureServices(builder.Services, webApplicationFactoryOptions);

        var application = builder.Build();

        ConfigureApplication(application);

        var cfg = application.Configuration.Get<Configuration.Configuration>();

        if (cfg?.Debug?.CreateDatabase ?? false)
        {
            using var scope = application.Services.CreateScope();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureDeletedAsync();
            await scope.ServiceProvider.GetRequiredService<SampleDbContext>().Database.EnsureCreatedAsync();
        }

        if (cfg?.Debug?.FillDemoData ?? false)
        {
            using var scope = application.Services.CreateScope();
            var ctx = scope.ServiceProvider.GetRequiredService<SampleDbContext>();

            // add users
            ctx.Users.InsertOrUpdate(i => i.UserName == Admin, o =>
            {
                o.UserName = Admin;
                o.Password = Admin;
                return o;
            });
            ctx.Users.InsertOrUpdate(i => i.UserName == User, o =>
            {
                o.UserName = User;
                o.Password = User;
                return o;
            });
            ctx.Groups.InsertOrUpdate(i => i.GroupName == AdminGroup, o =>
            {
                o.GroupName = AdminGroup;
                return o;
            });
            ctx.Groups.InsertOrUpdate(i => i.GroupName == UserGroup, o =>
            {
                o.GroupName = UserGroup;
                return o;
            });

            await ctx.SaveChangesAsync();
        }

        return application;
    }

    private static void ConfigureApplication(Microsoft.AspNetCore.Builder.WebApplication webApplication)
    {
        webApplication.UseMiddleware<ExceptionMiddleware>();

        webApplication.UseAuthentication();

        webApplication.UseSwagger();
        webApplication.UseSwaggerUI();
        webApplication.UseDataBind(batchRouteMapper =>
        {
            batchRouteMapper.MapBatchCreate("/api/1.0/Batch/{numCommands}/{ttlMilliseconds}", Delegates.BatchCreate)
                            .RequireTcposAuthorization<AuthorizationRequirementBatch>();
            batchRouteMapper.MapBatchGet("/api/1.0/Batch/{batchId}", Delegates.BatchGet)
                            .RequireTcposAuthorization<AuthorizationRequirementBatch>();
            batchRouteMapper.MapBatchRun("/api/1.0/Batch/{batchId}/Run", Delegates.BatchRun)
                            .RequireTcposAuthorization<AuthorizationRequirementBatch>();

            batchRouteMapper.MapBatchAddInsert(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/insert", Delegates.BatchAddInsert)
                            .RequireTcposAuthorization<AuthorizationRequirementErpInsert>();
            batchRouteMapper.MapBatchAddRemove(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/remove/{key}/{concurrencyCode?}", Delegates.BatchAddRemove)
                            .RequireTcposAuthorization<AuthorizationRequirementErpRemove>();
            batchRouteMapper.MapBatchAddReplace(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/replace/{key}/{concurrencyCode?}", Delegates.BatchAddReplace)
                            .RequireTcposAuthorization<AuthorizationRequirementErpReplace>();
            batchRouteMapper.MapBatchAddUpdate(HttpVerbs.Post, "/api/{version}/Batch/{batchId}/{commandId}/{name}/update/{key}/{concurrencyCode?}", Delegates.BatchAddUpdate)
                            .RequireTcposAuthorization<AuthorizationRequirementErpUpdate>();

            batchRouteMapper.MapErpInsert(HttpVerbs.Post, "/api/{version}/{name}", Delegates.ErpInsert)
                            .RequireTcposAuthorization<AuthorizationRequirementErpInsert>();
            batchRouteMapper.MapErpRemove(HttpVerbs.Delete, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpRemove)
                            .RequireTcposAuthorization<AuthorizationRequirementErpRemove>();
            batchRouteMapper.MapErpReplace(HttpVerbs.Put, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpReplace)
                            .RequireTcposAuthorization<AuthorizationRequirementErpReplace>();
            batchRouteMapper.MapErpUpdate(HttpVerbs.Patch, "/api/{version}/{name}/{key}/{concurrencyCode?}", Delegates.ErpUpdate)
                            .RequireTcposAuthorization<AuthorizationRequirementErpUpdate>();
        }, dataPullOutRouteMapper =>
        {
            dataPullOutRouteMapper.MapDataPullOut(HttpVerbs.Get, "/api/{version}/{name}", Delegates.DataPullOut)
                                  .RequireTcposAuthorization<AuthorizationRequirementDataPullout>();
            dataPullOutRouteMapper.MapDataPullOutWithKey(HttpVerbs.Get, "/api/{version}/{name}/{key}", Delegates.DataPullOutWithKey)
                                  .RequireTcposAuthorization<AuthorizationRequirementDataPullout>();
            dataPullOutRouteMapper.MapDataPullOutCount(HttpVerbs.Get, "/api/{version}/{name}/count", Delegates.DataPullOutCount)
                                  .RequireTcposAuthorization<AuthorizationRequirementDataPullout>();
            dataPullOutRouteMapper.MapDataPullSchema(HttpVerbs.Get, "/api/{version}/{name}/schema", Delegates.DataPullSchema);
        });
        webApplication.MapPost("/api/login", async (HttpContext httpContext, [FromQuery] bool isAdmin) =>
        {
            
            var claims = new List<Claim>
            {
                new(ClaimTypes.Name, isAdmin ? Admin : User),
                new(ClaimTypes.Role, isAdmin ? Admin : User)
            };

            var claimsIdentity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
            var authProperties = new AuthenticationProperties();
            await httpContext.SignInAsync(CookieAuthenticationDefaults.AuthenticationScheme, new ClaimsPrincipal(claimsIdentity), authProperties);

            return Results.Created();
        });
        webApplication.MapGet("connect/userinfo", async (HttpContext httpContext) =>
        {
            var name = httpContext.User.FindFirst(ClaimTypes.Name);
            return await Task.FromResult(Results.Ok(name?.Value));
        });

        webApplication.MapPost("/api/{version}/formsendpoints", FormsEndpointsDelegates.SaveFormEndpoints)
           .RequireTcposAuthorization<AuthorizationRequirementFormsEndpoints>();

        webApplication.UseAuthorization();
    }

    private static void ConfigureServices(IServiceCollection services, WebApplicationFactoryOptions? webApplicationFactoryOptions)
    {
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme).AddCookie();

        typeof(Program).Assembly.GetTypes().Where(x => x is { IsClass: true, IsAbstract: false } && x.IsSubclassOf(typeof(Profile)))
                       .ToList()
                       .ForEach(x => services.AddAutoMapper(x));

        services.ConfigureHttpJsonOptions(options =>
        {
            options.SerializerOptions.Converters.Add(new StringToEnumConverter<VerbEnum>());
        });

        services.AddSingleton<IEdmModelBuilder, DataEntityEdmModelBuilder>();

        services.AddDbContext<SampleDbContext>((s, o) =>
        {
            var cfg = s.GetRequiredService<IConfiguration>().Get<Configuration.Configuration>();

            switch (cfg?.DatabaseConnection?.DatabaseType)
            {
                case DatabaseTypes.SqlServer:
                    o.UseSqlServer(cfg?.DatabaseConnection.ConnectionString);
                    break;
                case DatabaseTypes.Postgres:
                    o.UseNpgsql(cfg?.DatabaseConnection.ConnectionString);
                    break;
                case DatabaseTypes.Sqlite:
                    o.UseSqlite(cfg?.DatabaseConnection.ConnectionString);
                    break;
                default:
                    throw new ArgumentOutOfRangeException($"'{cfg?.DatabaseConnection?.DatabaseType}' is not a supported database type");
            }
        });

        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen();

        services.AddDataBind(c =>
        {
            c.AddDataPullOut()
              //Customer
             .AddDataPullOutItem<DbContextDataPullOutItem<Customer, CustomerOut>>()
              //Order
             .AddDataPullOutItem<DbContextDataPullOutItem<Order, OrderOut<int>>>()
              //OrderDetail
             .AddDataPullOutItem<DbContextDataPullOutItem<OrderDetail, OrderDetailOut<int>>>()
              //Product
             .AddDataPullOutItem<DbContextDataPullOutItem<Product, ProductOut>>()
              //User
             .AddDataPullOutItem<DbContextDataPullOutItem<User, UserOut>>()
              //Group
             .AddDataPullOutItem<DbContextDataPullOutItem<Group, GroupOut>>()
              //UserGroup
             .AddDataPullOutItem<DbContextDataPullOutItem<UserGroup, UserGroupOut<int>>>()
              //Permission
             .AddDataPullOutItem<DbContextDataPullOutItem<Permission, PermissionOut>>()
              //GroupPermission
             .AddDataPullOutItem<DbContextDataPullOutItem<GroupPermission, GroupPermissionOut<int>>>()
              //UserPermission
             .AddDataPullOutItem<DbContextDataPullOutItem<UserPermission, UserPermissionOut<int>>>()
             //PermissionsOperators
             .AddDataPullOutItem<PermissionsOperatorDataPullOut>()
             //PermissionsOperator
             .AddDataPullOutItem<PermissionsOperatorsDataPullOut>()
             //PermissionsOperator
             .AddDataPullOutItem<PermissionsCtesDataPullOut>()
             //AdWebVersionEntity
             .AddDataPullOutItem<DbContextDataPullOutItem<AdWebEntityVersion, AdWebEntityVersionOut>>();

            c.AddBatches<InMemoryBatchStorage, StorageProvider>()
              //Customer
             .AddBatchItem<DbContextTypedPostBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Customer, CustomerIn, CustomerIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Customer>>()
              //Order
             .AddBatchItem<DbContextTypedPostBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Order, OrderIn<int>, OrderIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Order>>()
              //OrderDetail
             .AddBatchItem<DbContextTypedPostBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<OrderDetail, OrderDetailIn<int>, OrderDetailIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<OrderDetail>>()
              //Product
             .AddBatchItem<DbContextTypedPostBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Product, ProductIn, ProductIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Product>>()
              //User
             .AddBatchItem<DbContextTypedPostBatchCommand<User, UserIn, UserIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<User, UserIn, UserIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<User, UserIn, UserIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<User>>()
              //Group
             .AddBatchItem<DbContextTypedPostBatchCommand<Group, GroupIn, GroupIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Group, GroupIn, GroupIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Group, GroupIn, GroupIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Group>>()
              //UserGroup
             .AddBatchItem<DbContextTypedPostBatchCommand<UserGroup, UserGroupIn<int>, UserGroupIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<UserGroup, UserGroupIn<int>, UserGroupIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<UserGroup, UserGroupIn<int>, UserGroupIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<UserGroup>>()
              //Permission
             .AddBatchItem<DbContextTypedPostBatchCommand<Permission, PermissionIn, PermissionIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<Permission, PermissionIn, PermissionIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<Permission, PermissionIn, PermissionIn>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<Permission>>()
              //GroupPermission
             .AddBatchItem<DbContextTypedPostBatchCommand<GroupPermission, GroupPermissionIn<int>, GroupPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<GroupPermission, GroupPermissionIn<int>, GroupPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<GroupPermission, GroupPermissionIn<int>, GroupPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<GroupPermission>>()
              //UserPermission
             .AddBatchItem<DbContextTypedPostBatchCommand<UserPermission, UserPermissionIn<int>, UserPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPutBatchCommand<UserPermission, UserPermissionIn<int>, UserPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedPatchBatchCommand<UserPermission, UserPermissionIn<int>, UserPermissionIn<ValueReference>>>()
             .AddBatchItem<ConcurrencyDbContextTypedDeleteBatchCommand<UserPermission>>();
        });

        services.AddScoped<FeManager>();
        services.AddTcposAuthorization(webApplicationFactoryOptions);
    }
}
