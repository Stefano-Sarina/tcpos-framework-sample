using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.DB.Enums;
using TCPOS.Lib.Authorization.Domains;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Extensions;

public static class ToAuthorizationExtensions
{
    public static AuthzUser? ToAuthorizationData(this User? item)
    {
        if (item == null)
        {
            return null;
        }

        return new AuthzUser
        {
            Id = item.Id,
            IsPermissionAdministrator = item.UserName == "Admin" ? 1 : 0
        };
    }

    public static AuthzPermissionValue? ToAuthorizationData(this UserPermission? item)
    {
        if (item == null)
        {
            return null;
        }

        return new AuthzPermissionValue
        {
            UserId = item.UserId,
            PermissionId = item.PermissionId,
            Value = GetPermissionValue(item.PermissionValue)
        };
    }

    public static AuthzPermissionValue? ToAuthorizationData(this GroupPermission? item)
    {
        if (item == null)
        {
            return null;
        }

        return new AuthzPermissionValue
        {
            GroupId = item.GroupId,
            PermissionId = item.PermissionId,
            Value = GetPermissionValue(item.PermissionValue)
        };
    }
    public static AuthzGroup? ToAuthorizationData(this Group? item)
    {
        if (item == null)
        {
            return null;
        }

        return new AuthzGroup { Id = item.Id };
    }

    public static AuthzPermission? ToAuthorizationData(this Permission? item)
    {
        if (item == null)
        {
            return null;
        }

        return new AuthzPermission
        {
            Id = item.Id,
            Entity = $"{item.PermissionName}-{item.PermissionType}".ToLower()
        };
    }

    private static PermissionValueEnum GetPermissionValue(PermissionValue permissionValue)
    {
        return permissionValue switch
        {
            PermissionValue.Allow => PermissionValueEnum.Allow,
            PermissionValue.Deny => PermissionValueEnum.Deny,
            PermissionValue.Inherit => PermissionValueEnum.Inherit,
            _ => PermissionValueEnum.None
        };
    }
}
