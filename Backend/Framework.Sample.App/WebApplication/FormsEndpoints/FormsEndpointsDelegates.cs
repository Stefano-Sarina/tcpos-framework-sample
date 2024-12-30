using Microsoft.AspNetCore.Mvc;
using TCPOS.Common.Diagnostics;

namespace Framework.Sample.App.WebApplication.FormsEndpoints
{
    public static class FormsEndpointsDelegates
    {
        public static async Task<IResult> SaveFormEndpoints([FromServices] FeManager feManager, [FromRoute] string version, [FromBody] FeIn formsEndpoints)
        {
            Safety.Check(formsEndpoints != null, "formsEndpoints payload is null");

            await feManager.ProcessAsync(formsEndpoints);

            return Results.Ok();
        }
    }
}
