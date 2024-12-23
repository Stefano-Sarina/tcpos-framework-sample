﻿using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Payloads;

public class PermissionOut : PermissionIn, IIDEntity, IConcurrencyEntity
{
    public int Id
    {
        get;
        set;
    }

    public string ConcurrencyCode
    {
        get;
        set;
    }
}