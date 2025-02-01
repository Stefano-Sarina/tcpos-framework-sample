using AutoMapper;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;

namespace Framework.Sample.App.Authorization.DataPullOuts.Profiles;

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
