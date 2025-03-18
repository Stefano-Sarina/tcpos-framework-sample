using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.Lib.Data.EntityFramework;

namespace Framework.Sample.App.DB;

public class SampleDbContext(DbContextOptions options) : DbContextBase(options)
{
    public DbSet<Product> Products
    {
        get;
        set;
    }

    public DbSet<Customer> Customers
    {
        get;
        set;
    }

    public DbSet<Order> Orders
    {
        get;
        set;
    }

    public DbSet<OrderDetail> OrderDetails
    {
        get;
        set;
    }

    public DbSet<User> Users
    {
        get;
        set;
    }

    public DbSet<Group> Groups
    {
        get;
        set;
    }

    public DbSet<UserGroup> UserGroups
    {
        get;
        set;
    }

    public DbSet<Permission> Permissions
    {
        get;
        set;
    }

    public DbSet<UserPermission> UserPermissions
    {
        get;
        set;
    }

    public DbSet<GroupPermission> GroupPermissions
    {
        get;
        set;
    }

    public DbSet<PermissionDependency> PermissionsDependencies
    {
        get;
        set;
    }

    public DbSet<AdWebEntityVersion> AdWebEntityVersions
    {
        get;
        set;
    }
}
