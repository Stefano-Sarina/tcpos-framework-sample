using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;

namespace Framework.Sample.App.Authorization.Extensions;

public static class RouteHandlerBuilderExtensions
{
    public static RouteHandlerBuilder RequireTcposAuthorization<TAuthz>(this RouteHandlerBuilder routeHandlerBuilder)
        where TAuthz : IAuthorizationRequirement, new()
    {
        routeHandlerBuilder.RequireAuthorization(authorizationPolicyBuilder =>
        {
            authorizationPolicyBuilder
               .AddAuthenticationSchemes(CookieAuthenticationDefaults.AuthenticationScheme)
               .RequireAuthenticatedUser()
               .Requirements.Add(new TAuthz());
        });

        return routeHandlerBuilder;
    }
}
