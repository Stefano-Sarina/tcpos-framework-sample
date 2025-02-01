using TCPOS.Common.Linq.Extensions;

namespace Framework.Sample.App.WebApplication.FormsEndpoints;

internal class PermissionNode
{
    // prevent infinite loop checking for recursive dependencies
    private readonly int max_nested_entity_watchdog = 100;

    internal PermissionNode(FePermission permission, FePermissionItem item)
    {
        Item = item;
        Permission = permission;
    }

    internal FePermission Permission
    {
        get;
        set;
    }

    internal FePermissionItem Item
    {
        get;
        set;
    }

    internal PermissionNode[]? ParentNodes
    {
        get;
        set;
    }

    internal string GetKeyCode(string applicationName)
    {
        return (Item.PermissionItemEndpoint == null
                    ? $"{Item.Entity}-{applicationName}-{Permission.Name}"
                    : Item.ApiPermissionName)
           .ToLowerInvariant();
    }

    // check if all the parents have been found the 
    internal bool HasAllParents()
    {
        return ParentNodes.ToEnumerableOrEmpty().Count() == Item.PermissionItemParents.ToEnumerableOrEmpty().Count();
    }

    // return true if nodes or parents do not refer this node
    internal bool HasParent(PermissionNode node, List<PermissionNode>? nodes, int level = 0)
    {
        if (level > max_nested_entity_watchdog)
        {
            throw new Exception($"max nested entity level reached {max_nested_entity_watchdog}");
        }

        nodes ??= new List<PermissionNode>();

        var found = false;

        var filteredNodes = ParentNodes?.Where(x => x.ParentNodes?.Length > 0).ToList();

        if (filteredNodes?.Count > 0)
        {
            found = filteredNodes.ToEnumerableOrEmpty().Contains(node);

            if (!found)
            {
                nodes.AddRange(filteredNodes);
                return filteredNodes.Any(x => x.HasParent(node, nodes, level + 1));
            }
        }

        return found;
    }

    /// <summary>
    ///     Retrieves a list of permission nodes from the provided endpoint forms,
    ///     processes the permission items, and resolves the parent-child relationships
    ///     between permission nodes, ensuring that duplicates are removed and URLs are
    ///     properly formatted.
    /// </summary>
    /// <param name="formsEndpoints">
    ///     The FeIn object containing the form endpoints
    ///     and their associated permission items.
    /// </param>
    /// <returns>
    ///     A list of <see cref="PermissionNode" /> objects representing
    ///     the processed and validated permission nodes with resolved parent-child
    ///     relationships.
    /// </returns>
    /// <remarks>
    ///     This method performs the following tasks:
    ///     1. Flattens the permission items from the provided <paramref name="formsEndpoints" />
    ///     and removes any duplicates based on the permission item code.
    ///     2. Trims any trailing slashes from the endpoint URLs.
    ///     3. Identifies the parent permission nodes and establishes parent-child relationships
    ///     among the nodes.
    ///     4. Validates the nodes before returning the list of processed nodes.
    /// </remarks>
    internal static List<PermissionNode> GetNodes(FeIn formsEndpoints)
    {
        // load all permissions and remove duplicates  
        var nodes = formsEndpoints.Permissions
                                  .SelectMany(x => x.PermissionItems,
                                              (parent, child) => new PermissionNode(parent, child))
                                  .DistinctBy(x => x.Item.Code)
                                  .ToList();

        // trim ending '/' on endpoint
        nodes.Where(x => x.Item.PermissionItemEndpoint != null).ToList()
             .ForEach(x => x.Item.PermissionItemEndpoint.Url = x.Item.PermissionItemEndpoint.Url.TrimEnd('/'));

        // load parent permissions
        var formNodes = nodes
                       .Where(n => n.Item.PermissionItemParents.ToEnumerableOrEmpty().Count() > 0)
                       .ToList();

        foreach (var node in formNodes)
        {
            node.ParentNodes = nodes.Where(x => node.Item.PermissionItemParents.Any(y => y == x.Item.Code)).ToArray();
        }

        ValidateNodes(nodes);

        return nodes;
    }

    // TODO
    // move validate to a class to inject
    private static void ValidateNodes(List<PermissionNode> nodes)
    {
        // check all parents are found
        var invalidNodes = nodes
                          .Where(x => !x.HasAllParents())
                          .ToList();

        if (invalidNodes.Count > 0)
        {
            throw new Exception($"Missing parents in nodes: {string.Join(',', invalidNodes.Select(x => $"<{x.Item.Code}>"))}");
        }

        var circularCandidate = nodes.Where(x => x.ParentNodes?.Length > 0).ToList();

        // check for circular references
        var circularNodes = circularCandidate
                           .Where(x => x.HasParent(x, null))
                           .ToList();

        if (circularNodes.Count > 0)
        {
            throw new Exception($"Circular reference in nodes: {string.Join(',', circularNodes.Select(x => $"<{x.Item.Code}>"))}");
        }
    }
}
