﻿using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB.Entities;
using Framework.Sample.App.DB.Enums;
using static TCPOS.Authorization.Abstracts.AuthorizationStores.ITPermissionValue;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Extensions;

public static class ToAuthorizationExtensions
{
    public static AuthzUser? ToAuthorizationData(this User? item)
    {
        return item != null ?
                   new AuthzUser
                   {
                       Id = item.Id
                   } : null;
    }

    public static AuthzPermissionValue? ToAuthorizationData(this UserPermission? item)
    {
        return item != null ?
                   new AuthzPermissionValue
                   {
                       PermissionId = item.PermissionId,
                       Value = item.PermissionValue == PermissionValue.Allow ? ValueEnum.Allow :
                               item.PermissionValue == PermissionValue.Deny ? ValueEnum.Deny :
                               item.PermissionValue == PermissionValue.Inherit ? ValueEnum.Inherit :
                               ValueEnum.None
                   } : null;
    }

    public static AuthzPermissionValue? ToAuthorizationData(this GroupPermission? item)
    {
        return item != null ?
                   new AuthzPermissionValue
                   {
                       PermissionId = item.PermissionId,
                       Value = item.PermissionValue == PermissionValue.Allow ? ValueEnum.Allow :
                               item.PermissionValue == PermissionValue.Deny ? ValueEnum.Deny :
                               item.PermissionValue == PermissionValue.Inherit ? ValueEnum.Inherit :
                               ValueEnum.None
                   } : null;
    }

    public static AuthzGroup? ToAuthorizationData(this Group? item)
    {
        return item != null ?
                   new AuthzGroup
                   {
                       Id = item.Id
                   } : null;
    }

    public static AuthzPermission? ToAuthorizationData(this Permission? item)
    {
        return item != null ?
                   new AuthzPermission
                   {
                       Id = item.Id,
                       Entity = $"{item.PermissionName}-{item.PermissionType}".ToLower()
                   } : null;
    }
}