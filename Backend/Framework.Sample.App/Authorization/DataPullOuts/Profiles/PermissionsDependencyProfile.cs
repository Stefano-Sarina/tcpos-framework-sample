using AutoMapper;
using Framework.Sample.App.Authorization.DataPullOuts.Entities;
using Framework.Sample.App.Authorization.DataPullOuts.Payloads;

namespace Framework.Sample.App.Authorization.DataPullOuts.Profiles;

public class PermissionsDependencyProfile : Profile
{
    public PermissionsDependencyProfile()
    {
        CreateMap<PermissionsCtesIn<int>, PermissionsCtes>(MemberList.None);
        CreateMap<PermissionsCtes, PermissionsCtesIn<int>>(MemberList.None);
        CreateMap<PermissionsCtes, PermissionsCtesOut<int>>(MemberList.None);
        CreateMap<PermissionsCtes, PermissionsCtes>(MemberList.None);
    }
}
