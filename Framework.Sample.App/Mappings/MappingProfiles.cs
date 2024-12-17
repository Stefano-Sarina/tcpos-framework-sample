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
        //Group
        CreateMap<GroupIn, Group>(MemberList.None);
        CreateMap<Group, GroupIn>(MemberList.None);
        CreateMap<Group, GroupOut>(MemberList.None);
        CreateMap<Group, Group>(MemberList.None);
        //GroupPermission
        CreateMap<GroupPermissionIn<int>, GroupPermission>(MemberList.None);
        CreateMap<GroupPermission, GroupPermissionIn<int>>(MemberList.None);
        CreateMap<GroupPermission, GroupPermissionOut<int>>(MemberList.None);
        CreateMap<GroupPermission, GroupPermission>(MemberList.None);
        //Permission
        CreateMap<PermissionIn, Permission>(MemberList.None);
        CreateMap<Permission, PermissionIn>(MemberList.None);
        CreateMap<Permission, PermissionOut>(MemberList.None);
        CreateMap<Permission, GroupPermission>(MemberList.None);
        //User
        CreateMap<UserIn, User>(MemberList.None);
        CreateMap<User, UserIn>(MemberList.None);
        CreateMap<User, UserOut>(MemberList.None);
        CreateMap<User, User>(MemberList.None);
        //UserGroup
        CreateMap<UserGroupIn<int>, UserGroup>(MemberList.None);
        CreateMap<UserGroup, UserGroupIn<int>>(MemberList.None);
        CreateMap<UserGroup, UserGroupOut<int>>(MemberList.None);
        CreateMap<UserGroup, UserGroup>(MemberList.None);
        //UserPermission
        CreateMap<UserPermissionIn<int>, UserPermission>(MemberList.None);
        CreateMap<UserPermission, UserPermissionIn<int>>(MemberList.None);
        CreateMap<UserPermission, UserPermissionOut<int>>(MemberList.None);
        CreateMap<UserPermission, UserPermission>(MemberList.None);
        //AdWebVersionEntity
        CreateMap<AdWebEntityVersionIn, AdWebEntityVersion>(MemberList.None);
        CreateMap<AdWebEntityVersion, AdWebEntityVersionIn>(MemberList.None);
        CreateMap<AdWebEntityVersion, AdWebEntityVersionOut>(MemberList.None);
        CreateMap<AdWebEntityVersion, AdWebEntityVersion>(MemberList.None);
    }
}
