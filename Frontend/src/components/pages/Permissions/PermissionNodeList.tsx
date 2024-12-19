import _ from "underscore";
import React, {useCallback, useMemo} from "react";
import type {PermissionNodeListProps} from "./PermissionNodeListProps";
import type {DataListGraphNode} from "./DataListGraphNode";
import type {IPermissionData} from "./permissionNode/IPermissionData";
import type {NodeModel} from "@minoru/react-dnd-treeview";
import {PermissionNode} from "./permissionNode/PermissionNode";
import {Collapse} from "@mui/material";

/**
 * render a list of permission nodes
 * @param nodeGraph
 * @param treeData
 * @param level
 * @param selectedNodes
 * @param onSelected
 * @param openedNodes
 * @param onToggleOpen
 * @param onDeselected
 * @constructor
 */
export const PermissionNodeList = ({
                                       nodeGraph,
                                       treeData,
                                       level,
                                       selectedNodes,
                                       onSelected,
                                       openedNodes,
                                       onToggleOpen,
                                       onDeselected
                                   }: PermissionNodeListProps) => {


    return <ul role="list" className="">

        {_(treeData).map(data => {

            /**
             * do not render nodes that are not at this level
             */
            const node = _(nodeGraph).findWhere({id: data.id});
            if (!node) return null;
            return <PermissionNodeRoot key={data.id} level={level} node={node} data={data} onToggleOpen={onToggleOpen}
                                       openedNodes={openedNodes} selectedNodes={selectedNodes}
                                       onSelected={onSelected} onDeselected={onDeselected} treeData={treeData}
                                       nodeGraph={nodeGraph}/>;
        })}

    </ul>
        ;
};

interface PermissionNodeRootProps extends PermissionNodeListProps {
    node: DataListGraphNode<IPermissionData>,
    data: NodeModel<IPermissionData>

}

export function PermissionNodeRoot({
                                       data,
                                       level,
                                       node,
                                       onDeselected,
                                       onSelected,
                                       treeData,
                                       openedNodes,
                                       onToggleOpen,
                                       selectedNodes,
                                   }: PermissionNodeRootProps) {
    const _onOpenToggle = useCallback(() => onToggleOpen(data.id), [data.id]);

    const isOpen = _(openedNodes).contains(data.id);
    const isSelected = _(selectedNodes).contains(data.id);

    return useMemo(() => <li className={`level${level}`} role="listitem"
                             style={{"--indent": level} as React.CSSProperties}>
        <PermissionNode depth={level}
                        droppable={!!node.children.length}
                        isOpen={isOpen}
                        data={data.data}
                        dataGraph={node}
                        onOpenToggle={_onOpenToggle}
                        selected={isSelected}
                        onSelected={onSelected}
                        onDeselected={onDeselected}
                        id={data.id}
                        parent={""}
                        text={data.text}/>
        {!!node.children.length&&<Collapse in={isOpen}>
            <PermissionNodeList treeData={treeData} nodeGraph={node.children} level={level + 1} onSelected={onSelected}
                                onDeselected={onDeselected} onToggleOpen={onToggleOpen} openedNodes={openedNodes}
                                selectedNodes={selectedNodes}/>
        </Collapse>}
    </li>, [isSelected, _onOpenToggle, data.data, data.id, data.text, isOpen, level, node.children, onDeselected, onSelected, onToggleOpen, openedNodes, selectedNodes, treeData]);
}