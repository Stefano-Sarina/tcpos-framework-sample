using AutoMapper;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;

namespace Framework.Sample.App.Mappings;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        //Customer
        CreateMap<CustomerIn, Customer>(MemberList.None);
        CreateMap<Customer, CustomerIn>(MemberList.None);
        CreateMap<Customer, CustomerOut>(MemberList.None);
        CreateMap<Customer, Customer>(MemberList.None);
        //Order
        CreateMap<OrderIn<int>, Order>(MemberList.None);
        CreateMap<Order, OrderIn<int>>(MemberList.None);
        CreateMap<Order, OrderOut<int>>(MemberList.None);
        CreateMap<Order, Order>(MemberList.None);
        //OrderDetail
        CreateMap<OrderDetailIn<int>, OrderDetail>(MemberList.None);
        CreateMap<OrderDetail, OrderDetailIn<int>>(MemberList.None);
        CreateMap<OrderDetail, OrderDetailOut<int>>(MemberList.None);
        CreateMap<OrderDetail, OrderDetail>(MemberList.None);
        //Product
        CreateMap<ProductIn, Product>(MemberList.None);
        CreateMap<Product, ProductIn>(MemberList.None);
        CreateMap<Product, ProductOut>(MemberList.None);
        CreateMap<Product, Product>(MemberList.None);
    }
}
