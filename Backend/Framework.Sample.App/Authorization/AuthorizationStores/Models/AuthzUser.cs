﻿using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores.Models;

public class AuthzUser: ITAuthorizationEntityId<int>
{
    public int Id
    {
        get;
        set;
    }

    public decimal? IsPermissionAdministrator
    {
        get;
        set;
    }
}