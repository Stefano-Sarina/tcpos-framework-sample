import type {DataListGraphNode} from "../DataListGraphNode";
import type {IPermissionData} from "./IPermissionData";
import _ from "underscore";

/**
 * gat all the ids of child nodes
 * @param node
 * @param children
 * @param visitedChildIDs
 */
export function getChildrenIDs(children: Array<DataListGraphNode<IPermissionData>>, visitedChildIDs: (string | number)[] = []) {

    const ids: (number | string)[] = [];


    for (const child of children) {
        if (_.contains(visitedChildIDs, child.id)) {
            //avoid circular dependencies
            continue;
        }
        visitedChildIDs.push(child.id);
        Reflect.apply(ids.push, ids, [child.id, ...getChildrenIDs(child.children)]);
    }


    return ids;
}