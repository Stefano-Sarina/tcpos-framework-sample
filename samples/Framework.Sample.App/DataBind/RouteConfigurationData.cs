using TCPOS.AspNetCore.DataBind.Batch.Enums;
using TCPOS.AspNetCore.DataBind.Interfaces.Routes;
using TCPOS.AspNetCore.DataBind.RouteData;

namespace Framework.Sample.App.DataBind;

public class RouteConfigurationData : IRouteConfigurationData
{
    private static readonly Func<HttpRequest, EntityVersion> FEntityVersion = httpRequest => new EntityVersion(httpRequest.GetStringFromRoute("entity"),
                                                                                                               httpRequest.GetVersionFromRoute("ver"),
                                                                                                               Array.Empty<RequestAdditionalData>());

    private static readonly Func<HttpRequest, EntityVersionWithKey> FEntityVersionWithKey = httpRequest => new EntityVersionWithKey(httpRequest.GetStringFromRoute("entity"),
                                                                                                                                    httpRequest.GetVersionFromRoute("ver"),
                                                                                                                                    httpRequest.GetIntFromRoute("key"),
                                                                                                                                    Array.Empty<RequestAdditionalData>());

    public IRouteData<EntityVersionWithKey> ErpRemove
    {
        get;
    } = new RouteData<EntityVersionWithKey>("ErpRemove", "/api/{ver}/{entity}/{key}", FEntityVersionWithKey);

    public IRouteData<EntityVersionWithKey> ErpUpdate
    {
        get;
    } = new RouteData<EntityVersionWithKey>("ErpUpdate", "/api/{ver}/{entity}/{key}", FEntityVersionWithKey);

    public IRouteData<EntityVersionWithKey> ErpReplace
    {
        get;
    } = new RouteData<EntityVersionWithKey>("ErpReplace", "/api/{ver}/{entity}/{key}", FEntityVersionWithKey);

    public IRouteData<EntityVersion> ErpInsert
    {
        get;
    } = new RouteData<EntityVersion>("ErpInsert", "/api/{ver}/{entity}", FEntityVersion);

    public IRouteData<EntityVersion> ErpRemoveSchema
    {
        get;
    } = new RouteData<EntityVersion>("ErpRemoveSchema", $"/api/{{ver}}/{{entity}}/{Operations.Remove}/schema", FEntityVersion);

    public IRouteData<EntityVersion> ErpUpdateSchema
    {
        get;
    } = new RouteData<EntityVersion>("ErpUpdateSchema", $"/api/{{ver}}/{{entity}}/{Operations.Update}/schema", FEntityVersion);

    public IRouteData<EntityVersion> ErpReplaceSchema
    {
        get;
    } = new RouteData<EntityVersion>("ErpReplaceSchema", $"/api/{{ver}}/{{entity}}/{Operations.Replace}/schema", FEntityVersion);

    public IRouteData<EntityVersion> ErpInsertSchema
    {
        get;
    } = new RouteData<EntityVersion>("ErpInsertSchema", $"/api/{{ver}}/{{entity}}/{Operations.Insert}/schema", FEntityVersion);

    public IRouteData<EntityVersionWithKey> DataPullOutGetWithKey
    {
        get;
    } = new RouteData<EntityVersionWithKey>("DataPullOutGetWithKey", "/api/{ver}/{entity}/{key}", FEntityVersionWithKey);

    public IRouteData<EntityVersion> DataPullOutGet
    {
        get;
    } = new RouteData<EntityVersion>("DataPullOutGet", "/api/{ver}/{entity}/{key}", FEntityVersion);

    public IRouteData<EntityVersion> DataPullOutGetCount
    {
        get;
    } = new RouteData<EntityVersion>("DataPullOutGetCount", "/api/{ver}/{entity}/{key}/count", FEntityVersion);

    public IRouteData<EntityVersion> DataPullOutGetSchema
    {
        get;
    } = new RouteData<EntityVersion>("DataPullOutGetSchema", "/api/{ver}/{entity}/schema", FEntityVersion);

    public IRouteData<string> BatchRun
    {
        get;
    } = new RouteData<string>("BatchRun", "/api/1.0/batch/{key}", httpRequest => httpRequest.GetStringFromRoute("key"));

    public IRouteData<BatchEntityVersion> BatchInsert
    {
        get;
    } = new RouteData<BatchEntityVersion>("BatchInsert", $"/api/{{ver}}/batch/{{batchId}}/{{commandId}}/{{entity}}/{Operations.Insert}", httpRequest => new BatchEntityVersion(httpRequest.GetStringFromRoute("batchId"), httpRequest.GetIntFromRoute("commandId"), httpRequest.GetStringFromRoute("commandId"), httpRequest.GetVersionFromRoute("ver"), Array.Empty<RequestAdditionalData>()));

    public IRouteData<BatchEntityVersionWithKey> BatchRemove
    {
        get;
    } = new RouteData<BatchEntityVersionWithKey>("BatchRemove", $"/api/{{ver}}/batch/{{batchId}}/{{commandId}}/{{entity}}/{{key}}/{Operations.Remove}", httpRequest => new BatchEntityVersionWithKey(httpRequest.GetStringFromRoute("batchId"), httpRequest.GetIntFromRoute("commandId"), httpRequest.GetStringFromRoute("commandId"), httpRequest.GetVersionFromRoute("ver"), httpRequest.GetStringFromRoute("key"), Array.Empty<RequestAdditionalData>()));

    public IRouteData<BatchEntityVersionWithKey> BatchUpdate
    {
        get;
    } = new RouteData<BatchEntityVersionWithKey>("BatchUpdate", $"/api/{{ver}}/batch/{{batchId}}/{{commandId}}/{{entity}}/{{key}}/{Operations.Update}", httpRequest => new BatchEntityVersionWithKey(httpRequest.GetStringFromRoute("batchId"), httpRequest.GetIntFromRoute("commandId"), httpRequest.GetStringFromRoute("commandId"), httpRequest.GetVersionFromRoute("ver"), httpRequest.GetStringFromRoute("key"), Array.Empty<RequestAdditionalData>()));

    public IRouteData<BatchEntityVersionWithKey> BatchReplace
    {
        get;
    } = new RouteData<BatchEntityVersionWithKey>("BatchReplace", $"/api/{{ver}}/batch/{{batchId}}/{{commandId}}/{{entity}}/{{key}}/{Operations.Replace}", httpRequest => new BatchEntityVersionWithKey(httpRequest.GetStringFromRoute("batchId"), httpRequest.GetIntFromRoute("commandId"), httpRequest.GetStringFromRoute("commandId"), httpRequest.GetVersionFromRoute("ver"), httpRequest.GetStringFromRoute("key"), Array.Empty<RequestAdditionalData>()));

    public IRouteData<string> BatchGet
    {
        get;
    } = new RouteData<string>("BatchGet", "/api/1.0/batch/{key}", httpRequest => httpRequest.GetStringFromRoute("key"));

    public IRouteData<BatchCreateData> BatchCreate
    {
        get;
    } = new RouteData<BatchCreateData>("BatchCreate", "/api/1.0/batch/{NumCommands}/{TtlMilliseconds}", httpRequest => new BatchCreateData(httpRequest.GetIntFromRoute("NumCommands"), httpRequest.GetIntFromRoute("TtlMilliseconds")));

    public IRouteData<EntityVersion> BatchInsertSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchInsertSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Insert}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchRemoveSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchRemoveSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Remove}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchUpdateSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchUpdateSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Update}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchReplaceSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchReplaceSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Replace}/schema", FEntityVersion);
}