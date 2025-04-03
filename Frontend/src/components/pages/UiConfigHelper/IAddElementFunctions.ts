import type {JsonElementsType} from "./JsonElementsType";
import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {IJsonTreeData} from "./IJsonTreeData";

export interface IAddElementFunctions {
    operations: {
        type: JsonElementsType,
        function: (treeData: NodeModel<IJsonTreeData>[], id: (number | string), params?: any) =>
            ({ treeData: NodeModel<IJsonTreeData>[], newNodeId: (string | number)[] })
    }[]
}