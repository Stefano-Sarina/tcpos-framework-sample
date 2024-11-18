using System.Net;
using Microsoft.AspNetCore.Mvc;
using TCPOS.AspNetCore.DataBind.Exceptions;
using TCPOS.Common.Diagnostics;
using TCPOS.Data.Batches.Engine.Runners;

namespace Framework.Sample.App;

public static class Delegates
{
    public static async Task<IResult> BatchCreate([FromServices] BatchController batchController, [FromRoute] int numCommands, [FromRoute] int ttlMilliseconds)
    {
        var batchId = await batchController.Create(numCommands, ttlMilliseconds);
        return await Task.FromResult(Results.Created($"/api/1.0/Batch/{batchId}", batchId));
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

    public static async Task<IResult> BatchAddInsert([FromServices] BatchAddInsertRunner batchAddInsertRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddInsertRunner.Run(batchId, commandIdNum, name, versionVer, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddRemove([FromServices] BatchAddRemoveRunner batchAddRemoveRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddRemoveRunner.Run(batchId, commandIdNum, name, versionVer, key, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddReplace([FromServices] BatchAddReplaceRunner batchAddReplaceRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddReplaceRunner.Run(batchId, commandIdNum, name, versionVer, key, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> BatchAddUpdate([FromServices] BatchAddUpdateRunner batchAddUpdateRunner, [FromRoute] string batchId, [FromRoute] string commandId, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(commandId, out var commandIdNum), new HttpException(HttpStatusCode.BadRequest, "Invalid CommandId"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await batchAddUpdateRunner.Run(batchId, commandIdNum, name, versionVer, key, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> ErpInsert([FromServices] ErpInsertRunner erpInsertRunner, [FromRoute] string name, [FromRoute] string version, [FromBody] string payload)
    {
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpInsertRunner.Run(name, versionVer, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> ErpRemove([FromServices] ErpRemoveRunner erpRemoveRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpRemoveRunner.Run(name, versionVer, keyNum, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> ErpReplace([FromServices] ErpReplaceRunner erpReplaceRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpReplaceRunner.Run(name, versionVer, keyNum, payload, []);

        return await Task.FromResult(Results.Created());
    }

    public static async Task<IResult> ErpUpdate([FromServices] ErpUpdateRunner erpUpdateRunner, [FromRoute] string name, [FromRoute] string version, [FromRoute] string key, [FromBody] string payload)
    {
        Safety.Check(int.TryParse(key, out var keyNum), new HttpException(HttpStatusCode.BadRequest, "Invalid Key"));
        Safety.Check(Version.TryParse(version, out var versionVer), new HttpException(HttpStatusCode.BadRequest, "Invalid Version"));

        await erpUpdateRunner.Run(name, versionVer, keyNum, payload, []);

        return await Task.FromResult(Results.Created());
    }
}
