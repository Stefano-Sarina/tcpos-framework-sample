using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json.Linq;
using TCPOS.AspNetCore.DataBind.DataPullOut.Delegates;
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Engine.Runners;
using TCPOS.Data.Batches.Payload;

namespace Framework.Sample.App.WebApplication;

public static class Delegates
{
    public static async Task<IResult> BatchCreate([FromServices] BatchController batchController, [FromRoute] string numCommands, [FromRoute] string ttlMilliseconds)
    {
        Safety.Check(int.TryParse(numCommands, out var numCommandsNum), new HttpException(HttpStatusCode.BadRequest, "Invalid NumCommands"));
        Safety.Check(int.TryParse(ttlMilliseconds, out var ttlMillisecondsNum), new HttpException(HttpStatusCode.BadRequest, "Invalid TtlMilliseconds"));

        var batchId = await batchController.Create(numCommandsNum, ttlMillisecondsNum);
        return Results.Created($"/api/1.0/Batch/{batchId}", batchId);
    }

    public static async Task<IResult> BatchGet([FromServices] BatchController batchController, [FromRoute] string batchId)
    {
        var data = await batchController.GetData(batchId);
        return Results.Json(new
        {
            data.IsExpired,
            data.BatchId,
            data.IsCompleted
        });
    }

    public static async Task<IResult> BatchRun([FromServices] BatchController batchController, [FromRoute] string batchId)
    {
        var data = await batchController.Run(batchId);
        return Results.Json(data);
    }

    public static async Task<IResult> BatchAddInsert(HttpContext c, [FromServices] BatchAddInsertRunner batchAddInsertRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromBody] JsonDocument payload)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddInsertRunner.Run(batchId, commandIdNum, name, versionVer, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddRemove([FromServices] BatchAddRemoveRunner batchAddRemoveRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddRemoveRunner.Run(batchId, commandIdNum, name, versionVer, key, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddReplace([FromServices] BatchAddReplaceRunner batchAddReplaceRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] JsonDocument payload, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddReplaceRunner.Run(batchId, commandIdNum, name, versionVer, key, payload, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddUpdate([FromServices] BatchAddUpdateRunner batchAddUpdateRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] JsonDocument payload, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddUpdateRunner.Run(batchId, commandIdNum, name, versionVer, key, payload, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> ErpInsert([FromServices] ErpInsertRunner erpInsertRunner, [FromRoute] string name, [FromRoute] string version, [FromBody] JsonDocument payload)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        var result = await erpInsertRunner.Run(name, versionVer, payload, []);

        return Results.Created($"/api/{version:2}/{name}/{result.Value<int>()}", result.Value<int>());
    }

    public static async Task<IResult> ErpRemove([FromServices] ErpRemoveRunner erpRemoveRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpRemoveRunner.Run(name, versionVer, keyNum, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Ok());
    }

    public static async Task<IResult> ErpReplace([FromServices] ErpReplaceRunner erpReplaceRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] JsonDocument payload, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpReplaceRunner.Run(name, versionVer, keyNum, payload, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Ok());
    }

    public static async Task<IResult> ErpUpdate([FromServices] ErpUpdateRunner erpUpdateRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] JsonDocument payload, [FromRoute] string? concurrencyCode)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpUpdateRunner.Run(name, versionVer, keyNum, payload, GetAdditionalData(concurrencyCode));

        return await Task.FromResult(Results.Ok());
    }

    public static async Task<IResult> DataPullOut(HttpContext httpContext, [FromServices] DataPullOutController erpUpdateRunner, [FromRoute] string name, [FromRoute] string version)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        return await erpUpdateRunner.GetData(httpContext.Request, name, versionVer, []);
    }

    public static async Task<IResult> DataPullOutWithKey(HttpContext httpContext, [FromServices] DataPullOutController erpUpdateRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));

        return await erpUpdateRunner.GetDataWithKey(httpContext.Request, name, versionVer, keyNum, []);
    }

    public static async Task<IResult> DataPullOutCount(HttpContext httpContext, [FromServices] DataPullOutController erpUpdateRunner, [FromRoute] string name, [FromRoute] string version)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        return await erpUpdateRunner.GetCount(httpContext.Request, name, versionVer, []);
    }

    public static async Task<IResult> DataPullSchema(HttpContext httpContext, [FromServices] DataPullOutController erpUpdateRunner, [FromRoute] string name, [FromRoute] string version)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        return await erpUpdateRunner.GetSchema(name, versionVer);
    }

    private static AdditionalData[] GetAdditionalData(string? concurrencycode)
    {
        return !string.IsNullOrEmpty(concurrencycode) ? [new AdditionalData("ConcurrencyCode", Uri.UnescapeDataString(concurrencycode))] : [];
    }
}
