using Microsoft.EntityFrameworkCore.Infrastructure;
using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Abstracts.Concurrency;

namespace Framework.Sample.App.DB.Entities;

public abstract class Entity : IDEntity, IConcurrencyEntity
{
    public abstract int Id
    {
        get;
        set;
    }

    public string ConcurrencyCode
    {
        get
        {
            return ConcurrencyUtils.CalculateConcurrencyCode(this);
        }
    }
}