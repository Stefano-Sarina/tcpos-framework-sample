namespace Framework.Sample.App.Authorization.DataPullOuts.Payloads;

public class PermissionsOperatorOut<T> : PermissionsOperatorIn<T>
{
    public required string ConcurrencyCode
    {
        get;
        set;
    }

    public int Id
    {
        get;
        set;
    }
}
