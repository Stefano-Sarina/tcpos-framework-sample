using Framework.Sample.App.DB.Enums;

namespace Framework.Sample.App.Authorization.DataPullOuts.Payloads;

public class PermissionsOperatorIn<T>
{
    public required T OperatorId { get; set; }
    public required string OperatorCode { get; set; }
    public T? OperatorGroupId { get; set; }
    public string? OperatorGroupCode { get; set; }
    public required T PermissionId { get; set; }
    public required string PermissionName { get; set; }
    public PermissionValue PermissionValue { get; set; }
    public int PermissionType { get; set; }
}