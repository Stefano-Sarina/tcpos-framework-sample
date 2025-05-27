using Framework.Sample.App.DB.Entities;

namespace Framework.Sample.App.Authorization.SimpleAuthorization;

public class SimpleRequirementAttribute(string attributeName) : Attribute
{
    public string AttributeName
    {
        get;
        set;
    } = attributeName;
}