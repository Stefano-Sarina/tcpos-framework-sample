using Framework.Sample.App.Authorization.AuthorizationStores.Extensions;
using Framework.Sample.App.Authorization.AuthorizationStores.Models;
using Framework.Sample.App.DB;
using Microsoft.EntityFrameworkCore;
using TCPOS.Authorization.Abstracts.AuthorizationStores;

namespace Framework.Sample.App.Authorization.AuthorizationStores;

internal class AuthzGroupStore(SampleDbContext dbContext) : IAuthzGroupStore<AuthzUser, AuthzGroup>
{
    public void Dispose()
    { }

    public async Task<IEnumerable<AuthzGroup>> GetGroupsAsync(AuthzUser? user, CancellationToken cancellationToken)
    {
        if (user == null)
        {
            return Enumerable.Empty<AuthzGroup>();
        }

        var mapUsrGrp = dbContext.UserGroups
                                 .Where(x => x.UserId == user.Id);

        var groups = await dbContext.Groups
                                    .Where(x => mapUsrGrp.Any(y => y.GroupId == x.Id))
                                    .ToListAsync();

        return groups.Select(x => x.ToAuthorizationData())
                     .OfType<AuthzGroup>();
    }

    public async Task<IEnumerable<AuthzGroup>> GetGroupsAsync(AuthzGroup? group, CancellationToken cancellationToken)
    {
        return await Task.FromResult(Array.Empty<AuthzGroup>());
    }
}
