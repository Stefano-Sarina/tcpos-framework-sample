using Framework.Sample.App.DB.Entities;
using Microsoft.EntityFrameworkCore;
using TCPOS.EntityFramework;

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
}