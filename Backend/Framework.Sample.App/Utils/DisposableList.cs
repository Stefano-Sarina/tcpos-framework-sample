namespace Framework.Sample.App.Utils;

public class DisposableList<T> : List<T>, IDisposable
    where T:IDisposable
{
    public DisposableList(IEnumerable<T> collection) : base(collection)
    { }
    public DisposableList() : base()
    { }
    public void Dispose()
    {
        this.ForEach(x => x.Dispose());
    }
}
