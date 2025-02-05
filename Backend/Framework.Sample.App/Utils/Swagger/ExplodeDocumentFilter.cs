using Framework.Sample.App.Utils.swagger.attributes;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Routing.Patterns;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Reflection;
using System.Web;
using TCPOS.AspNetCore.DataBind.DataPullOut.Items;
using TCPOS.Common.Diagnostics;
using TCPOS.Common.Linq.Extensions;
using TCPOS.Data.Batches.Enums;
using TCPOS.Data.Batches.Interfaces;

namespace Framework.Sample.App.Utils.swagger;

public class ExplodeDocumentFilter : IDocumentFilter
{
    private readonly IList<IBatchCommand> _batchCommands;
    private readonly IList<DataPullOutItem> _dataPullOutItems;
    private readonly EndpointDataSource _endpointDataSource;

    /// <summary>
    ///     Constructor
    /// </summary>
    /// <param name="serviceProvider"></param>
    public ExplodeDocumentFilter(IServiceProvider serviceProvider)
    {
        Safety.Check(serviceProvider != null, "serviceProvider cannot be null");

        using IServiceScope scope = serviceProvider.CreateScope();
        _batchCommands = scope.ServiceProvider.GetServices<IBatchCommand>().ToEnumerableOrEmpty().ToArray();
        _dataPullOutItems = scope.ServiceProvider.GetServices<DataPullOutItem>().ToEnumerableOrEmpty().ToArray();
        _endpointDataSource = scope.ServiceProvider.GetRequiredService<EndpointDataSource>();
    }

    /// <summary>
    ///     Apply filter
    /// </summary>
    /// <param name="swaggerDoc"></param>
    /// <param name="context"></param>
    public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
    {
        Safety.Check(swaggerDoc != null, "swaggerDoc cannot be null");
        Safety.Check(context != null, "contextcannot be null");

        // put the "buildversion" api on top
        ReorderBasePaths(swaggerDoc);

        var sort = new OpenApiOperationSort();

        ++sort.MainSortNumber;
        AddPathsFormsEndpoint(swaggerDoc, context, sort);

        ++sort.MainSortNumber;
        AddPathsDataPullouts(swaggerDoc, context, sort);

        ++sort.MainSortNumber;
        AddPathsBatches(swaggerDoc, context, sort);

        // order by Major & Minor
        var sortedPaths = swaggerDoc.Paths
                                    .OrderBy(x => x.Value.MainSortNumber())
                                    .ThenBy(x => x.Value.SecondaryOrderNumber())
                                    .ToList();

        swaggerDoc.Paths.Clear();

        foreach (var item in sortedPaths)
        {
            swaggerDoc.Paths.Add(item.Key, item.Value);
        }
    }

    /// <summary>
    ///     Put the buildversion endpoint on the top
    /// </summary>
    /// <param name="swaggerDoc"></param>
    internal void ReorderBasePaths(OpenApiDocument swaggerDoc)
    {
        Safety.Check(swaggerDoc != null, "swaggerDoc be null");

        var sortedPaths = swaggerDoc.Paths
                                    .OrderBy(x => x.Key.IndexOf("buildversion") > -1 ? 0 : 1)
                                    .ToList();

        swaggerDoc.Paths.Clear();

        foreach (var item in sortedPaths)
        {
            swaggerDoc.Paths.Add(item.Key, item.Value);
        }
    }

    internal void AddPathsDataPullouts(OpenApiDocument swaggerDoc, DocumentFilterContext context, OpenApiOperationSort sort)
    {
        Safety.Check(swaggerDoc != null, "swaggerDoc be null");
        Safety.Check(context != null, "context be null");
        Safety.Check(sort != null, "sort be null");

        // filter out dataPullOuts having SwaggerExcludeExplodeAttribute, if any 
        var entityInfoes = _dataPullOutItems.Where(x => !x.GetType().GetCustomAttributes().OfType<SwaggerExcludeExplodeAttribute>().Any())
                                              .Select(x => new EntityInfo(x.Name, x.Version, x.Operation, x.ResultType, null, null))
                                              .OrderBy(x => x.Name).ThenBy(x => x.Version)
                                              .ToList();

        var endpoints = _endpointDataSource.Endpoints
                                           .Where(x => x.GetMetadata<SwaggerExplodeAttribute>()?.EndPointType == SwaggerExplodeAttribute.EndPointTypeEnum.DataPullOut)
                                           .OrderBy(x => x.GetMetadata<SwaggerOrderAttribute>()?.Order)
                                           .OfType<RouteEndpoint>()
                                           .ToList();

        Apply(swaggerDoc, context, entityInfoes, endpoints, sort, "");
    }

    internal void AddPathsBatches(OpenApiDocument swaggerDoc, DocumentFilterContext context, OpenApiOperationSort sort)
    {
        Safety.Check(swaggerDoc != null, "swaggerDoc be null");
        Safety.Check(context != null, "context be null");
        Safety.Check(sort != null, "sort be null");

        // filter out batches having SwaggerExcludeExplodeAttribute , like "formsEndpoint" 
        var entityInfoes = _batchCommands
                                               .Where(x => !x.GetType().GetCustomAttributes().OfType<SwaggerExcludeExplodeAttribute>().Any())
                                               .Select(x => new EntityInfo(x.Name, x.Version, x.Operation, null, x.ErpPayloadType, x.BatchPayloadType))
                                               .OrderBy(x => x.Name).ThenBy(x => x.Version)
                                               .ToList();

        var endpoints = _endpointDataSource.Endpoints
                                           .Where(x => x.GetMetadata<SwaggerExplodeAttribute>()?.EndPointType == SwaggerExplodeAttribute.EndPointTypeEnum.Batch)
                                           .OrderBy(x => x.GetMetadata<SwaggerOrderAttribute>()?.Order)
                                           .OfType<RouteEndpoint>()
                                           .ToList();

        Apply(swaggerDoc, context, entityInfoes, endpoints, sort, SwaggerExplodeAttribute.EndPointTypeEnum.Batch.ToString());
    }

    /// <summary>
    ///     Special endpoint for FormsEndpoint, only POST verb is defined
    /// </summary>
    /// <param name="swaggerDoc"></param>
    /// <param name="context"></param>
    /// <param name="sort"></param>
    internal void AddPathsFormsEndpoint(OpenApiDocument swaggerDoc, DocumentFilterContext context, OpenApiOperationSort sort)
    {
        var commonGroupName = "Common";
        var entityName = "FeIn";
        var entityInfoes = _batchCommands.Where(x => x.Name == entityName)
                                               .Select(x => new EntityInfo(x.Name, x.Version, x.Operation, null, x.ErpPayloadType, x.BatchPayloadType))
                                               .OrderBy(x => x.Name).ThenBy(x => x.Version)
                                               .ToList();
        var endpoints = _endpointDataSource.Endpoints
                                           .Where(x => x.GetMetadata<SwaggerExplodeAttribute>()?.EndPointType == SwaggerExplodeAttribute.EndPointTypeEnum.Common)
                                           .Where(x => x.HasSegment("FormsEndpoints"))
                                           .OrderBy(x => x.GetMetadata<SwaggerOrderAttribute>()?.Order)
                                           .OfType<RouteEndpoint>()
                                           .ToList();

        Apply(swaggerDoc, context, entityInfoes, endpoints, sort, commonGroupName);
    }

    internal void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context, IEnumerable<EntityInfo> entityInfoes, IEnumerable<RouteEndpoint> endpoints, OpenApiOperationSort sort, string tagPrefix)
    {
        foreach (var entityInfo in entityInfoes)
        {
            CreateComponentSchema(swaggerDoc, context, entityInfo);

            foreach (var endpoint in endpoints)
            {
                ApplyToEndpoint(swaggerDoc, context, entityInfo, endpoint, sort, tagPrefix);
            }
        }
    }

    internal void ApplyToEndpoint(OpenApiDocument swaggerDoc, DocumentFilterContext context, EntityInfo entityInfo, RouteEndpoint endpoint, OpenApiOperationSort sort, string tagPrefix)
    {
        if (!entityInfo.IsAllowed(endpoint))
        {
            return;
        }

        ++sort.SecondaryOrderNumber;

        var key = HttpUtility.UrlDecode(endpoint.RoutePattern.RawText.FillRoute(entityInfo));

        key = key.Replace("?", "");

        var routePatternParameters = ResolveRoutePatternParameters(endpoint)
           .ToList();

        var methods = endpoint.GetMethods();

        foreach (var method in methods)
        {
            // Batch tag is prefixed with "Batch-"
            var tagName = $"{tagPrefix}{(!string.IsNullOrEmpty(tagPrefix) ? "-" : "")}{entityInfo.Name}";

            // create OpenApiOperation with tag
            var openApiOperation = new OpenApiOperation
            {
                Tags =
                [
                    new() { Name = tagName }
                ]
            };

            // set parameters
            var openApiParameters = GetOpenApiParameters(routePatternParameters);
            openApiParameters.ToList().ForEach(p => openApiOperation.Parameters.Add(p));

            // add operation to OpenApiPathItem.Operations
            var openApiPathItem = new OpenApiPathItemEx
            {
                Sort = new OpenApiOperationSort
                {
                    MainSortNumber = sort.MainSortNumber,
                    SecondaryOrderNumber = sort.SecondaryOrderNumber
                }
            };

            if (Enum.TryParse(method, true, out OperationType operationType))
            {
                openApiPathItem.Operations[operationType] = openApiOperation;
            }

            // add responses (201, 202, 404 etc)
            var responses = CreateOpenApiResponses(swaggerDoc, context, endpoint, entityInfo, operationType);

            foreach (var response in responses)
            {
                openApiOperation.Responses.Add(response.Key.ToString(), response.Value);
            }

            // add body if any
            var requestBody = CreateOpenApiRequestBody(endpoint, entityInfo, operationType);

            if (requestBody != null)
            {
                openApiOperation.RequestBody = requestBody;
            }

            if (swaggerDoc.Paths.ContainsKey(key))
            {
                swaggerDoc.Paths[key].Operations[operationType] = openApiOperation;
            }
            else
            {
                swaggerDoc.Paths.Add(key, openApiPathItem);
            }
        }
    }

    internal void CreateComponentSchema(OpenApiDocument swaggerDoc, DocumentFilterContext context, EntityInfo entityInfo)
    {
        if (!swaggerDoc.Components.Schemas.ContainsKey(entityInfo.PayloadOutItemName(entityInfo.Operation)) && entityInfo.ResultType != null)
        {
            var schema = context.SchemaGenerator.GenerateSchema(entityInfo.ResultType, context.SchemaRepository);
            swaggerDoc.Components.Schemas[entityInfo.PayloadOutItemName(entityInfo.Operation)] = schema;
        }

        if (!swaggerDoc.Components.Schemas.ContainsKey(entityInfo.PayloadOutArrayName(entityInfo.Operation)) && entityInfo.ResultType != null)
        {
            var schema = context.SchemaGenerator.GenerateSchema(entityInfo.ResultType.MakeArrayType(), context.SchemaRepository);
            swaggerDoc.Components.Schemas[entityInfo.PayloadOutArrayName(entityInfo.Operation)] = schema;
        }

        if (!swaggerDoc.Components.Schemas.ContainsKey(entityInfo.PayloadInItemVal(entityInfo.Operation)) && entityInfo.PayLoadVal != null)
        {
            var schema = context.SchemaGenerator.GenerateSchema(entityInfo.PayLoadVal, context.SchemaRepository);
            swaggerDoc.Components.Schemas[entityInfo.PayloadInItemVal(entityInfo.Operation)] = schema;
        }

        if (!swaggerDoc.Components.Schemas.ContainsKey(entityInfo.PayloadInItemRef(entityInfo.Operation)) && entityInfo.PayLoadRef != null)
        {
            var schema = context.SchemaGenerator.GenerateSchema(entityInfo.PayLoadRef, context.SchemaRepository);
            swaggerDoc.Components.Schemas[entityInfo.PayloadInItemRef(entityInfo.Operation)] = schema;
        }
    }

    internal IEnumerable<RoutePatternParameterPart> ResolveRoutePatternParameters(RouteEndpoint batchEndpoint)
    {
        List<string> knownParameters = ["version", "name", "operation"];
        return batchEndpoint.RoutePattern.Parameters
                            .Where(x => !knownParameters.Contains(x.Name));
    }

    internal IEnumerable<OpenApiParameter> GetOpenApiParameters(IEnumerable<RoutePatternParameterPart> routePatternParameters)
    {
        var openApiParameters = new List<OpenApiParameter>();

        foreach (var routePatternParameter in routePatternParameters)
        {
            var openApiParameter = new OpenApiParameter
            {
                Name = routePatternParameter.Name,
                Required = !routePatternParameter.IsOptional,
                In = ParameterLocation.Path,
                Style = ParameterStyle.Simple,
                AllowEmptyValue = routePatternParameter.IsOptional,
                Schema = new OpenApiSchema
                {
                    Type = routePatternParameter.GetSchemaTypeName()
                }
            };

            openApiParameters.Add(openApiParameter);
        }

        return openApiParameters;
    }

    internal Dictionary<HttpStatusCode, OpenApiResponse> CreateOpenApiResponses(OpenApiDocument swaggerDoc, DocumentFilterContext context,
                                                                                 RouteEndpoint endpoint, EntityInfo entityInfo, OperationType operationType)
    {
        var responses = new Dictionary<HttpStatusCode, OpenApiResponse>();

        OpenApiResponse openApiResponse;

        if (endpoint.IsSchema())
        {
            // schema value
            responses[HttpStatusCode.OK] = new OpenApiResponse
            { Description = $"{entityInfo.Operation} schema" };
            return responses;
        }

        switch (operationType)
        {
            case OperationType.Post:
                {
                    // succeeded response
                    openApiResponse = new OpenApiResponse
                    { Description = "Success" };
                    var openApiSchema = context.SchemaGenerator.GenerateSchema(typeof(int), context.SchemaRepository);
                    openApiResponse.Content["application/json"] = new OpenApiMediaType
                    { Schema = openApiSchema };
                    responses[HttpStatusCode.Created] = openApiResponse;

                    // error response
                    openApiResponse = new OpenApiResponse();
                    responses[HttpStatusCode.BadRequest] = openApiResponse;
                }
                break;
            case OperationType.Patch:
            case OperationType.Put:
            case OperationType.Delete:
                {
                    // succeeded response
                    openApiResponse = new OpenApiResponse
                    { Description = "Success" };
                    var openApiSchema = context.SchemaGenerator.GenerateSchema(typeof(int), context.SchemaRepository);
                    openApiResponse.Content["application/json"] = new OpenApiMediaType
                    { Schema = openApiSchema };
                    responses[HttpStatusCode.OK] = openApiResponse;
                }
                break;
            case OperationType.Get:
                {
                    if (endpoint.IsCount())
                    {
                        openApiResponse = new OpenApiResponse
                        { Description = "Number of records" };
                        var openApiSchema = context.SchemaGenerator.GenerateSchema(typeof(int), context.SchemaRepository);
                        openApiResponse.Content["application/json"] = new OpenApiMediaType
                        { Schema = openApiSchema };
                        responses[HttpStatusCode.OK] = openApiResponse;
                    }
                    else
                    {
                        var openApiSchema = new OpenApiSchema();
                        openApiSchema.Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = endpoint.IsSingleItem() ? entityInfo.PayloadOutItemName(entityInfo.Operation) : entityInfo.PayloadOutArrayName(entityInfo.Operation)
                        };

                        openApiResponse = new OpenApiResponse();
                        openApiResponse.Content["application/json"] = new OpenApiMediaType
                        { Schema = openApiSchema };
                        responses[HttpStatusCode.OK] = openApiResponse;

                        if (endpoint.IsSingleItem())
                        {
                            responses[HttpStatusCode.NotFound] = new OpenApiResponse();
                        }
                    }

                ;
                }
                break;
        }

        responses[HttpStatusCode.BadRequest] = new OpenApiResponse();
        responses[HttpStatusCode.Unauthorized] = new OpenApiResponse();
        responses[HttpStatusCode.Forbidden] = new OpenApiResponse();
        responses[HttpStatusCode.InternalServerError] = new OpenApiResponse();

        return responses;
    }

    internal OpenApiRequestBody? CreateOpenApiRequestBody(RouteEndpoint endpoint, EntityInfo entityInfo, OperationType operationType)
    {
        if (endpoint.IsSchema())
        {
            return null;
        }

        var tr = new Dictionary<Operations, OperationType>
        {
            { Operations.Insert, OperationType.Post },
            { Operations.Replace, OperationType.Put },
            { Operations.Update, OperationType.Patch },
            { Operations.Remove, OperationType.Delete },
            { Operations.Retrieve, OperationType.Get }
        };

        // batches are sent in POST then operation is taken from the entity
        // datapullout are sent with porper verb, then operation is taken from the verb
        operationType = endpoint.IsBatch() ? tr[entityInfo.Operation] : operationType;

        switch (operationType)
        {
            case OperationType.Post:
            case OperationType.Patch:
            case OperationType.Put:
                {
                    var operation = operationType == OperationType.Post ? Operations.Insert
                                    : operationType == OperationType.Patch ? Operations.Update
                                    : operationType == OperationType.Put ? Operations.Replace
                                    : throw new Exception($"Not implemented body for verb {operationType}");

                    var openApiSchema = new OpenApiSchema
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = endpoint.IsBatch() ? entityInfo.PayloadInItemRef(operation) : entityInfo.PayloadInItemVal(operation)
                        }
                    };

                    OpenApiRequestBody? openApiRequestBody = new();
                    openApiRequestBody.Content["application/json"] = new OpenApiMediaType
                    { 
                        Schema = openApiSchema 
                    };
                    return openApiRequestBody;
                }
            default:
                return null;
        }
    }

    /// <summary>
    ///     Sorted OpenApiPathItem
    /// </summary>
    public class OpenApiPathItemEx : OpenApiPathItem
    {
        public OpenApiOperationSort Sort = new();
    }
}