using AutoMapper;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.Payloads;

namespace Framework.Sample.App.Mappings;

public class MappingProfiles : Profile
{
    public MappingProfiles()
    {
        CreateMap<CustomerIn, Customer>(MemberList.None);
        CreateMap<Customer, CustomerIn>(MemberList.None);
        CreateMap<Customer, CustomerOut>(MemberList.None);
        CreateMap<Customer, Customer>(MemberList.None);
    }
}
