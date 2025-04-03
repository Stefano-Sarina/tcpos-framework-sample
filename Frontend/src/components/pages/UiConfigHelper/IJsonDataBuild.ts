import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {IJsonTreeData} from "./IJsonTreeData";
import type {IDataSchema} from "./IDataSchema";

export interface IJsonDataBuild {
    /**
     * Contains the data that will be used to render the tree before checking the opened nodes
     */
    baseData: NodeModel<IJsonTreeData>[],

    /**
     * Contains the data that will be used to render the tree after checking the opened nodes
     */
    treeData: NodeModel<IJsonTreeData>[],

    /**
     * Contains the nodes that are opened
     */
    openNodes: (string | number)[]

    /**
     * Contains the data schemas
     */
    dataSchema: IDataSchema[]
}