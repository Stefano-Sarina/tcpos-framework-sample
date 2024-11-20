namespace Framework.Sample.App.Payloads;

public class ProductOut : ProductIn
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