﻿using System.Data;
using System.Net;
using TCPOS.Lib.Web.DataBind.Exceptions;
using TCPOS.Lib.Common.Diagnostics.Extensions;
using TCPOS.Lib.Data.Batches.Enums;
using TCPOS.Lib.Data.Batches.Exceptions;

namespace Framework.Sample.App.WebApplication;

public class ExceptionMiddleware(RequestDelegate next)
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
                    await Results.NotFound(new
                    {
                        e.Message,
                        Exception = e.InnerException.GetFullDetails()
                    }).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.BatchExpired:
                case BatchExceptionCode.BatchNotCompleted:
                    await Results.Problem(statusCode: (int)HttpStatusCode.Gone, detail: e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.InvalidStorageProvider:
                case BatchExceptionCode.BatchException:
                    await Results.Problem(e.Message).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.Conflict:
                    await Results.Conflict(new
                    {
                        e.Message,
                        Exception = e.InnerException.GetFullDetails()
                    }).ExecuteAsync(context);
                    break;
                case BatchExceptionCode.PayloadValidationError:
                    await Results.BadRequest(new
                    {
                        e.Message,
                        Exception = e.InnerException.GetFullDetails()
                    }).ExecuteAsync(context);
                    break;
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }
        catch (DataException e)
        {
            await Results.BadRequest(new
            {
                e.Message,
                Exception = e.GetFullDetails()
            }).ExecuteAsync(context);
        }
        catch (HttpException e)
        {
            await Results.Problem(e.GetFullDetails(), statusCode: (int)e.HttpStatusCode).ExecuteAsync(context);
        }
        catch (Exception e)
        {
            await Results.Problem(e.GetFullDetails(), statusCode: StatusCodes.Status500InternalServerError).ExecuteAsync(context);
        }
    }
}
