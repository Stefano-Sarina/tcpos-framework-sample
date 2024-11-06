using System.Globalization;
using System.Net;
using TCPOS.AspNetCore.DataBind.Batch.Enums;
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.AspNetCore.DataBind.Interfaces;
using TCPOS.AspNetCore.DataBind.Interfaces.Routes;
using TCPOS.AspNetCore.DataBind.RouteData;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.DataBind;

public class RouteConfigurationData : IRouteConfigurationData
{
    private static readonly Func<HttpRequest, EntityVersion> FEntityVersion = httpRequest =>
    {
        string name;
        Safety.Check(string.IsNullOrWhiteSpace(name = "" + httpRequest.RouteValues["entity"]), new HttpException(HttpStatusCode.BadRequest, "Invalid route value entity"));
        var version = Version.TryParse("" + httpRequest.RouteValues["ver"], out var v) ? v : throw new HttpException(HttpStatusCode.BadRequest, "Invalid route value version");
        return new EntityVersion(name, version, Array.Empty<RequestAdditionalData>());
    };

    private static readonly Func<HttpRequest, EntityVersionWithKey> FEntityVersionWithKey = httpRequest =>
    {
        string httpRequestRouteValue;
        Safety.Check(string.IsNullOrWhiteSpace(httpRequestRouteValue = "" + httpRequest.RouteValues["entity"]), new HttpException(HttpStatusCode.BadRequest, "Invalid route value entity"));
        var version = Version.TryParse("" + httpRequest.RouteValues["ver"], out var v) ? v : throw new HttpException(HttpStatusCode.BadRequest, "Invalid route value version");
        var requestRouteValue = int.TryParse("" + httpRequest.RouteValues["key"], CultureInfo.InvariantCulture, out var k) ? k : throw new HttpException(HttpStatusCode.BadRequest, "Invalid route value key");
        return new EntityVersionWithKey(httpRequestRouteValue, version, requestRouteValue, Array.Empty<RequestAdditionalData>());
    };

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
    } = new RouteData<EntityVersion>("DataPullOutGet", "/api/{ver}/{entity}/{key}/count", FEntityVersion);

    public IRouteData<EntityVersion> DataPullOutGetSchema
    {
        get;
    } = new RouteData<EntityVersion>("DataPullOutGet", "/api/{ver}/{entity}/schema", FEntityVersion);

    public IRouteData<string> BatchRun
    {
        get;
    } = new RouteData<string>("BatchRun", "/api/1.0/batch/{key}", httpRequest =>
    {
        string key;
        Safety.Check(string.IsNullOrWhiteSpace(key = "" + httpRequest.RouteValues["key"]), new HttpException(HttpStatusCode.BadRequest, "Invalid route value key"));
        return key;
    });

    public IRouteData<BatchEntityVersion> BatchInsert
    {
        get;
    }

    public IRouteData<BatchEntityVersionWithKey> BatchRemove
    {
        get;
    }

    public IRouteData<BatchEntityVersionWithKey> BatchUpdate
    {
        get;
    }

    public IRouteData<BatchEntityVersionWithKey> BatchReplace
    {
        get;
    }

    public IRouteData<string> BatchGet
    {
        get;
    } = new RouteData<string>("BatchGet", "/api/1.0/batch/{key}", httpRequest =>
    {
        string key;
        Safety.Check(string.IsNullOrWhiteSpace(key = "" + httpRequest.RouteValues["key"]), new HttpException(HttpStatusCode.BadRequest, "Invalid route value key"));
        return key;
    });

    public IRouteData<BatchCreateData> BatchCreate
    {
        get;
    }

    public IRouteData<EntityVersion> BatchInsertSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchInsertSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Insert}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchRemoveSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchInsertSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Remove}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchUpdateSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchInsertSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Update}/schema", FEntityVersion);

    public IRouteData<EntityVersion> BatchReplaceSchema
    {
        get;
    } = new RouteData<EntityVersion>("BatchInsertSchema", $"/api/{{ver}}/batch/add/{{entity}}/{Operations.Replace}/schema", FEntityVersion);
}
