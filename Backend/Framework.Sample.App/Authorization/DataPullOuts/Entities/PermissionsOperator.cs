using Framework.Sample.App.DB.Entities.Base;
using Framework.Sample.App.DB.Enums;

namespace Framework.Sample.App.Authorization.DataPullOuts.Entities;

public class PermissionsOperator : Entity
{
    public override int Id { get; set; }
    public int OperatorId { get; set; }
    public required string OperatorCode { get; set; }
    public int? OperatorGroupId { get; set; }
    public string? OperatorGroupCode { get; set; }
    public int PermissionId { get; set; }
    public required string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
    public int PermissionType { get; set; }
}