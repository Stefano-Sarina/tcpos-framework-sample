namespace Framework.Sample.App.Payloads;

public class OrderDetailOut<T> : OrderDetailIn<T>
{
    public int Id
    {
        get;
        set;
    }
    public string ConcurrencyCode
    {
        get; set;
    }
}