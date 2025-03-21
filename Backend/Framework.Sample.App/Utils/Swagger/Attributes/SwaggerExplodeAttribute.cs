using TCPOS.Lib.Data.Batches.Enums;

namespace Framework.Sample.App.Utils.swagger.attributes;

/// <summary>
/// Attribute to specify the endpoint type and operations for Swagger documentation.
/// </summary>
/// <remarks>
/// Initializes a new instance of the <see cref="SwaggerExplodeAttribute"/> class.
/// </remarks>
/// <param name="endPointType">The type of the endpoint.</param>
/// <param name="operations">The operations associated with the endpoint.</param>
public class SwaggerExplodeAttribute(SwaggerExplodeAttribute.EndPointTypeEnum endPointType, Operations[]? operations = null) : Attribute
{
    /// <summary>
    /// Enum representing the type of endpoint.
    /// </summary>
    public enum EndPointTypeEnum
    {
        Batch,
        DataPullOut,
        Common
    }

    /// <summary>
    /// Gets or sets the type of the endpoint.
    /// </summary>
    public EndPointTypeEnum EndPointType
    {
        get;
        set;
    } = endPointType;

    /// <summary>
    /// Gets or sets the operations associated with the endpoint.
    /// </summary>
    public Operations[]? Operations
    {
        get;
        set;
    } = operations;
}
