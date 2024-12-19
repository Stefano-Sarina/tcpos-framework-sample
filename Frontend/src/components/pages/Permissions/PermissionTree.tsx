import React from "react";
import {PermissionNodeList} from "./PermissionNodeList";
import type {PermissionTreeProps} from "./PermissionTreeProps";

export const PermissionTree = ({treeData, nodeGraph,selectedNodes,onSelected,openedNodes,onToggleOpen,onDeselected}: PermissionTreeProps) => {
    return (
        <div className="wdtree-app"><h5 className="MuiTypography-root MuiTypography-h5 css-zkuve9-MuiTypography-root"
                                        data-testid="wd-treenode-title"></h5>
            {<PermissionNodeList treeData={treeData} nodeGraph={nodeGraph} level={0}
                {...{
                    selectedNodes,onSelected,openedNodes,onToggleOpen,onDeselected
                }}

            ></PermissionNodeList>}

        </div>);
};


/**
 * <ul role="list" className="">
 *                 <li className="level0" role="listitem" draggable="true" style="--indent: 0px;">
 *
 *
 *                 </li>
 *             </ul>
 */