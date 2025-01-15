using TCPOS.AspNetCore.DataBind.Implementations.Interfaces;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Authorization.DataPullOuts.Payloads;

public class PermissionsCtesOut<T> : PermissionsCtesIn<T>, IIDEntity, IConcurrencyEntity
{
    public required string ConcurrencyCode { get; set; }
    public int Id { get; set; }
}