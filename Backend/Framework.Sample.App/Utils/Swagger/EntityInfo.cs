using Framework.Sample.App.Utils.swagger.attributes;
using TCPOS.Lib.Common.Diagnostics;
using TCPOS.Lib.Data.Batches.Enums;

namespace Framework.Sample.App.Utils.swagger;

internal class EntityInfo(string name, Version version, Operations operation, Type? resultType, Type? payLoadVal, Type? payLoadRef)
{
    public string Name
    {
        get;
        set;
    } = name;

    public Version Version
    {
        get;
        set;
    } = version;

    public Operations Operation
    {
        get;
        set;
    } = operation;

    public Type? ResultType
    {
        get;
        set;
    } = resultType;

    public Type? PayLoadVal
    {
        get;
        set;
    } = payLoadVal;

    public Type? PayLoadRef
    {
        get;
        set;
    } = payLoadRef;

    public string PayloadOutItemName(Operations operation)
    {
        return $"Int32{Name}-{operation}-OutItem";
    }

    public string PayloadOutArrayName(Operations operation)
    {
        return $"Int32{Name}-{operation}-OutArray";
    }

    public string PayloadInItemVal(Operations operation)
    {
        return $"Int32{Name}-{operation}-InVal";
    }

    public string PayloadInItemRef(Operations operation)
    {
        return $"Int32{Name}-{operation}-InRef";
    }

    internal bool IsAllowed(RouteEndpoint endpoint)
    {
        Safety.Check(endpoint != null, "endpoint cannot be null");

        if (endpoint.GetMetadata<SwaggerExplodeAttribute>()?.EndPointType == SwaggerExplodeAttribute.EndPointTypeEnum.Common
            || Operation == Operations.Retrieve)
        {
            return true;
        }

        return endpoint.IsSchema() || endpoint.HasSegment(Operation.ToString());
    }
}