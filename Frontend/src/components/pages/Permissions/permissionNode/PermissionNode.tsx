import type {NodeModel} from "@minoru/react-dnd-treeview";
import React, {useContext, useMemo, useRef, useState} from "react";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import {TCIcon} from "@tcpos/common-components";
import {Box, IconButton, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import "./PermissionNode.scss";
import {WD_DailyActionToolbarButton} from "@tcpos/backoffice-components";
import type {IPermissionData} from "./IPermissionData";
import {PermissionStatusComp} from "./PermissionStatusComp";
import {PermissionChildStats} from "./PermissionChildStats";
import type {DataListGraphNode} from "../DataListGraphNode";
import type {IPermissionChildrenStats} from "./IPermissionChildrenStats";
import {PermissionState} from "./PermissionState";
import {useTheme} from "@mui/material/styles";
import SvgIcon from "@mui/material/SvgIcon";
import {mdiCheckboxBlankOutline, mdiCheckboxOutline, mdiDotsVertical, mdiFileTree, mdiFileTreeOutline} from "@mdi/js";
import {FormattedMessage} from "react-intl";
import _ from "underscore";
import {PermissionSelectionContext} from "../PermissionSelectionContext";
import {getChildrenIDs} from "./GetChildrenIDs";

export interface PermissionNodeParams extends NodeModel<IPermissionData> {
    depth: number,
    isOpen: boolean,
    //handler fired when open is toggled
    onOpenToggle: () => void,
    //selected,
    selected: boolean,
    //handler fired when items are selected is changed
    onSelected: (newValue: (string | number)[]) => void,
    //handler fired when items are deselected is changed
    onDeselected: (newValue: (string | number)[]) => void,
    //a map of all the nodes and their connections
    dataGraph?: DataListGraphNode<IPermissionData>,


}

/**
 * perform calculation on children stats
 * @param node
 * @param children
 * @param visitedChildIDs
 */
function getChildrenStats(node: IPermissionData, children: Array<DataListGraphNode<IPermissionData>>, visitedChildIDs: (string | number)[] = []) {

    const stats: IPermissionChildrenStats = {notSet: 0, denied: 0, allowed: 0, total: 0,};


    for (const child of children) {
        if (_.contains(visitedChildIDs, child.id)) {
            //avoid circular dependencies
            continue;
        }
        visitedChildIDs.push(child.id);
        const childStats = getChildrenStats(child.data, child.children, visitedChildIDs);
        stats.total += (childStats?.total ?? 0) + 1;
        stats.allowed += childStats?.allowed ?? 0;
        stats.denied += childStats?.denied ?? 0;
        stats.notSet += childStats?.notSet ?? 0;

        switch (child.data.nodeStatus) {
            case PermissionState.ALLOWED:
                stats.allowed++;
                break;
            case PermissionState.DENIED:
                stats.denied++;
                break;
            case PermissionState.NOT_SET:
                stats.notSet++;
                break;
        }
    }


    return stats;
}

export const PermissionNodeInner = (props: PermissionNodeParams) => {
    const indent = props.depth * 3;


    const handleToggle = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        e.stopPropagation();
        e.preventDefault();
        props.onOpenToggle();
    };


    const stats = useMemo(() => {
        if (!props.data) throw new Error(`no data found in node ${props.id}`);
        return getChildrenStats(props.data, props.dataGraph?.children || []);
    }, [props.data, props.dataGraph, props.id]);

    const currentColor = props.data?.color as
        "error" | "primary" | "secondary" | "info" | "success" | "warning" | undefined;

    const currentIconColor = (props.data?.iconColor ?? currentColor) as
        "error" | "primary" | "secondary" | "info" | "success" | "warning" | undefined;

    const ref = useRef<HTMLDivElement>(null);


    return <Box ref={ref}
                className={`wd-treenode-root permission-node level${indent}`}
                sx={{
                    //paddingInlineStart: indent,
                    display: 'flex',
                    alignItems: 'center',
                    //   "--indent": theme => theme.spacing(indent)
                }}
                style={{}}
                data-testid={`wd-treenode-${props.id}`}
    >
        <div className={"wd-treenode-elementWrapper"}>
            <Box
                data-testid={'wd-treenode-expandIconWrapper'}
                className={'wd-treenode-expandIconWrapper'}
                sx={{
                    alignItems: 'center',
                    fontSize: 0,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'transform linear .1s',
                    transform: !props.isOpen ? 'rotate(0deg)' : 'rotate(90deg)',
                    minWidth: '24px',
                    minHeight: '24px',
                    marginInlineStart: indent,

                }}
                onClick={(e) => handleToggle(e)}
            >
                {props.droppable && <Box sx={{
                    color: (theme) => currentColor
                        ? theme.palette[currentColor].main + " !important"
                        : undefined
                }}>
                    <ArrowRightIcon data-testid={'wd-treenode-ArrowRightIcon' + props.id}/>
                </Box>
                }
            </Box>
            <Box
                className={'wd-treenode-selection'}
                data-testid={"wd-treenode-selector"}
            >
                <IconButton color={"default"} onClick={() => {
                    const newValue = !props.selected;
                    if (newValue) {
                        props.onSelected([props.id]);
                    } else {
                        props.onDeselected([props.id]);
                    }
                }}>
                    <SvgIcon>
                        <path d={props.selected ? mdiCheckboxOutline : mdiCheckboxBlankOutline}/>
                    </SvgIcon>

                </IconButton>
            </Box>
            <Box
                className={'wd-treenode-itemText'}
                data-testid={'wd-treenode-itemText' + props.id}
            >

                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                    className={"wd-treenode-nodeTitleCont"}
                >
                    {props.data?.icon && <Box
                        className={'wd-treenode-gridItemIcon'}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '24px',
                            minHeight: '24px',
                        }}
                    >
                        <TCIcon
                            {...props.data?.typographyProps}
                            iconCode={'tci-' + props.data?.icon}
                            color={props.data?.iconColor ?? props.data?.color}
                            sx={{
                                fontSize: '1rem',
                                color: (theme) => currentIconColor
                                    ? theme.palette[currentIconColor].main + " !important"
                                    : undefined,
                                margin: 'auto'
                            }}
                            data-testid={'wd-treenode-icon' + props.id}
                        />
                    </Box>}
                    {props.data?.actions?.filter(el => el.position === 'start')
                        .map((el, index) => (
                            <IconButton
                                key={'treeActionButton' + index + "_" + props.id}
                                onClick={el.action}
                                size={"small"}
                            >
                                <TCIcon
                                    {...props.data?.typographyProps}
                                    iconCode={'tci-' + el.icon}
                                    color={el.color}
                                    data-testid={'wd-treenode-iconbutton' + index + "_" + props.id}
                                />
                            </IconButton>
                        ))
                    }
                    <Box sx={{marginLeft: 1}}>
                        {props.text}
                    </Box>
                    <PermissionStatusComp variant={props.data?.nodeStatus}
                                          inherit={props.data?.params?.inherited ? String(props.data?.params?.inherited) : undefined}
                                          inheritType={props.data?.params?.inheritedPermissionState ?
                                              props.data?.params?.inheritedPermissionState as PermissionState : undefined}
                    />
                    <ActionButtons onSelectAll={() => {
                        props.onSelected(getChildrenIDs(props.dataGraph?.children ?? []));
                    }} onDeSelectAll={() => {
                        props.onDeselected(getChildrenIDs(props.dataGraph?.children ?? []));

                    }}/>
                </Box>
                {props.data?.actions?.length && (
                    <Box sx={{alignItems: 'center', marginLeft: 2}}>
                        {props.data?.actions?.filter(el => !el.position || el.position === 'end')
                            .map((el, index) => (
                                <WD_DailyActionToolbarButton
                                    isInMoreItemsList={false}
                                    name={'TreeToolbarButton' + index}
                                    enabled={true}
                                    visible={true}
                                    label={el.label}
                                    tooltip={el.label}
                                    onEvent={el.action}
                                    icon={el.icon}
                                    displayStyle={"ICON_ONLY"}
                                    moreItemsMenuCloseOnEvent={true}
                                    setMoreItemsMenuClose={() => {
                                    }}
                                    color={el.color}
                                    typographyVariant={props.data?.typographyProps?.variant as "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "subtitle1" | "subtitle2" | "body1" | "body2" | "caption"}
                                />
                            ))
                        }
                    </Box>
                )}
            </Box></div>
        <PermissionChildStats headerMode={!indent} data={stats} dataGraph={props.dataGraph}/>
    </Box>;
};


export const PermissionNode = React.memo(PermissionNodeInner);


export const PermissionNodeConnected = (props: Omit<PermissionNodeParams, "selected">) => {
    const context = useContext(PermissionSelectionContext);
    const selected = context?.includes(props.id);


    return <PermissionNode {...props} selected={!!selected}/>;
};


const ActionButtons = ({onSelectAll, onDeSelectAll}: {
    onSelectAll: () => void;
    onDeSelectAll: () => void;
}) => {
    const [ref, setRef] = useState<HTMLElement | null>(null);
    return <div className={"action-buttons"}>

        <Menu open={!!ref} onClose={() => setRef(null)} anchorEl={ref} onClick={e => e.stopPropagation()}>
            <MenuItem onClick={() => {
                setRef(null);
                onSelectAll();
            }}>
                <ListItemIcon>
                    <SvgIcon>
                        <path d={mdiFileTree}/>
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText><FormattedMessage id={"Select all children"}/></ListItemText>

            </MenuItem>
            <MenuItem onClick={() => {
                setRef(null);
                onDeSelectAll();
            }}>
                <ListItemIcon>
                    <SvgIcon>
                        <path d={mdiFileTreeOutline}/>
                    </SvgIcon>
                </ListItemIcon>
                <ListItemText><FormattedMessage id={"Deselect all children"}/></ListItemText>

            </MenuItem>
        </Menu>
        <IconButton color={"default"} onClick={e => {
            setRef(e.target as HTMLElement);
        }}>
            <SvgIcon>
                <path d={mdiDotsVertical}/>
            </SvgIcon>
        </IconButton>
    </div>;
};