import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {IPermissionData} from "./permissionNode/IPermissionData";
import type {DataListGraphNode} from "./DataListGraphNode";

type IDType = string | number;

export interface PermissionTreeProps {
    treeData: NodeModel<IPermissionData>[],
    nodeGraph: DataListGraphNode<IPermissionData>[],
    /**
     * the list of the selected nodes
     */
    selectedNodes: (string|number)[]
    /**
     * a method that gets called when a new list of nodes is selected
     * @param newValue ids of the newly selected nodes
     */
    onSelected:(newValue: IDType[]) => void,
    /**
     * a method that gets called when a new list of nodes is deselected
     * @param newValue ids of the newly deselected nodes
     */
    onDeselected: (newValue: IDType[]) => void,

    /**
     * list of opened nodes
     */
    openedNodes: IDType[],

    /**
     * toggle opened nodes
     * @param id
     */
    onToggleOpen: (id:IDType)=>void,
}