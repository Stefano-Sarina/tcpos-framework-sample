namespace Framework.Sample.App.Utils.swagger.attributes;

public class SwaggerOrderAttribute(int order) : Attribute
{
    public int Order
    {
        get;
        set;
    } = order;
}
