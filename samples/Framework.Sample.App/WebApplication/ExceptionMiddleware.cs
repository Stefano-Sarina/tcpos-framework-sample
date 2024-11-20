using TCPOS.Data.Batches.Enums;
using TCPOS.Data.Batches.Exceptions;

namespace Framework.Sample.App.WebApplication;

internal class ExceptionMiddleware(RequestDelegate next)
{
    public async Task Invoke(HttpContext context)
    {
        try
        {
            await next(context);
        }
        catch (BatchException e)
        {
            switch (e.BatchExceptionCode)
            {
                case BatchExceptionCode.BatchNotFound:
                    await Results.NotFound(e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchExpired:
                    await Results.Problem(statusCode: 410, detail: e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchNotCompleted:
                    await Results.Problem(statusCode: 410, detail: e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.InvalidStorageProvider:
                    await Results.Problem(e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchException:
                    await Results.Problem(e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.Conflict:
                    await Results.Conflict(e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.PayloadValidationError:
                    await Results.BadRequest(e.Message).ExecuteAsync(context);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }
}