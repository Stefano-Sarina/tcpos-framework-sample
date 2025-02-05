namespace Framework.Sample.App.Utils.swagger;

public class OpenApiOperationSort
{
    private int _mainSortNumber;

    public int SecondaryOrderNumber;

    public int MainSortNumber
    {
        get => _mainSortNumber;
        set
        {
            _mainSortNumber = value;
            SecondaryOrderNumber = 0;
        }
    }
}
