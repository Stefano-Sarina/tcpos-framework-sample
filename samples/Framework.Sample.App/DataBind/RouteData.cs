using TCPOS.AspNetCore.DataBind.Interfaces;
using TCPOS.AspNetCore.DataBind.Interfaces.Routes;

namespace Framework.Sample.App.DataBind;

public class RouteData<T>(string routeName, string routePattern, Func<HttpRequest, T> func) : IRouteData<T>
{
    public T GetRouteData(HttpRequest httpRequest)
    {
        return func(httpRequest);
    }

    public string RouteName
    {
        get;
    } = routeName;

    public string RoutePattern
    {
        get;
    } = routePattern;
}