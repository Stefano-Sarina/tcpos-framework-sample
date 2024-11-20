namespace Framework.Sample.App.Payloads;

public class OrderOut<T> : OrderIn<T>
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