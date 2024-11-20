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
                    await Results.NotFound(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchExpired:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchNotCompleted:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.InvalidStorageProvider:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchException:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.Conflict:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.PreconditionFailed:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.PayloadValidationError:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.DataConcurrency:
                    await Results.BadRequest(e.Data).ExecuteAsync(context);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
    }
}