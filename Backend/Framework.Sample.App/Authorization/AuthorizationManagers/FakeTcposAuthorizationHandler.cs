using Microsoft.AspNetCore.Authorization;
using TCPOS.Authorization.Abstracts;

namespace Framework.Sample.App.Authorization.AuthorizationManagers;

public class FakeTcposAuthorizationHandler : AuthorizationHandler<ITcposAuthorizationRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ITcposAuthorizationRequirement requirement)
    {
        context.Succeed(requirement);
        await Task.CompletedTask;
    }
}
