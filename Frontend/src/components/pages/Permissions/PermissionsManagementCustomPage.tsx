import React, {useCallback, useEffect, useMemo, useReducer, useState} from "react";
import {rwModes} from "@tcpos/common-core";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    Grid,
    Radio,
    RadioGroup,
    Tab,
    Tabs,
    Typography
} from "@mui/material";
import MainCard from "../../themeComponents/MainCard";
import {FormattedMessage, useIntl} from "react-intl";
import type {IDataFilter, IDataFilterGroup,
    IApiError, IBatchCommand,
    IViewConfigModel} from "@tcpos/backoffice-core";
import {
    ABaseApiController,
    ADailyConfigService,
    CommonApiController,
    DailyPublicRegistrationContainer,
} from "@tcpos/backoffice-core";
import {TCIcon, useAbortableEffect} from "@tcpos/common-components";
import {useSnackbar} from "notistack";
import {SnackBarCloseAction, useAppSelector, WD_Combobox, WD_StaticCombobox} from "@tcpos/backoffice-components";
import {useTheme} from "@mui/material/styles";
import type {NodeModel} from "@minoru/react-dnd-treeview";
import type {ITreeData, ComboValues} from "@tcpos/backoffice-components";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import _ from "underscore";
import "./PermissionManagementCustomPage.scss";
import {Actions, TreeSelectionStore} from "./TreeSelectionStore";
import type {IPermissionData} from "./permissionNode/IPermissionData";
import {PermissionState} from "./permissionNode/PermissionState";
import {DataListGraphNode} from "./DataListGraphNode";
import type {IPermissionBeingUpdated} from "./IPermissionBeingUpdated";
import {PermissionSavePanel} from "./PermissionSavePanel";
import {darken, lighten, styled} from '@mui/system';
import {PermissionSelectionContext} from "./PermissionSelectionContext";
import {PermissionTree} from "./PermissionTree";
import {produce} from "immer";
import type {IPermissionsOperatorPayload} from "../../../core/apiModels/IPermissionsOperatorPayload";
import type { IPermissionPayload } from "../../../core/apiModels/IPermissionPayload";
import type { IUserPermissionPayload } from "../../../core/apiModels/IUserPermissionPayload";
import type { IGroupPermissionPayload } from "../../../core/apiModels/IGroupPermissionPayload";
import type { IPermissionsCtesPayload } from "../../../core/apiModels/IPermissionsCtesPayload";

interface IAssignedPermission {
    permissionId: number,
    userGroupId: number | null,
    permissionValue: number
}

interface IDialogAction {
    label: string,
    icon?: string,
    color?: "error" | "primary" | "success",
    value: number,
    //onClick: () => void
}

interface IDialogParams {
    permissionDescription: string,
    permissionWarnings?: string,
    warningsColor?: "error" | "primary",
    actions?: IDialogAction[],
    selectedAction?: number,
}

enum PermissionAccessValue {
    ALLOW = 1,
    DENY = 2
}

// TabPanel
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const {children, value, index} = props;

    return <Box sx={{display: value === index ? "block" : "none"}}>{children}</Box>;
};
const a11yProps = (index: number) => {
    return {
        id: `simple-tab-${index}`,
        "aria-controls": `simple-tabpanel-${index}`,
    };
};

const GroupHeader = styled('div')(({theme}) => ({
    position: 'sticky',
    top: '-8px',
    padding: '4px 10px',
    color: theme.palette.primary.main,
    backgroundColor:
        theme.palette.mode === 'light'
            ? lighten(theme.palette.primary.light, 0.85)
            : darken(theme.palette.primary.main, 0.8),
}));

const GroupItems = styled('ul')({
    padding: 0,
});


const initialOpen: [] = [];

function getDatalistGraph(nodes: NodeModel<IPermissionData>[]): {
    allNodes: Map<string | number, DataListGraphNode<IPermissionData>>;
    rootNodes: Array<DataListGraphNode<IPermissionData>>
} {
    // const treeRoots: DataListGraphNode<IPermissionData>[] = [];

    type nodeKey = NodeModel<ITreeData>["id"];
    const allNodes = new Map<nodeKey, DataListGraphNode<IPermissionData>>();


    const rootNodes: DataListGraphNode<IPermissionData>[] = [];
    for (const node of nodes) {
        if (!node.data) throw new Error(`found a node without data ${node.id}`);

        /**
         * every node gets added to the tree
         */

        const dataListGraphNode = new DataListGraphNode({
            data: node.data,
            parent: node.parent || null,
            id: node.id
        });

        if (!node.parent) {
            rootNodes.push(dataListGraphNode);
        }

        allNodes.set(node.id,
            dataListGraphNode
        );
    }

    allNodes.forEach(graphNode => {
        if (!graphNode.parent) {
            // treeRoots.push(graphNode);
            return;
        }
        const parentNode = allNodes.get(graphNode.parent);
        if (parentNode) {
            parentNode.children.push(graphNode);
        }
    });

    return {allNodes, rootNodes};
}

export const PermissionsManagementCustomPage = () => {
    const intl = useIntl();
    const theme = useTheme();
    const {closeSnackbar, enqueueSnackbar} = useSnackbar();

    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);
    const applicationName = useAppSelector(state => state.interfaceConfig.applicationName);
    const [selectedIds, dispatchSelected] = useReducer(TreeSelectionStore, {});


    const [loading, setLoading] = useState<boolean>(false);

    const [permissionTypes, setPermissionTypes] = useState<ComboValues[]>([]);
    const [permissionTree, setPermissionTree] =
        useState<IPermissionsCtesPayload[]>([]);
    const [permissionEntityList, setPermissionEntityList] =
        useState<{ type: string, entities?: { value: string, label: string }[] }[]>([]);
    const [selectedPermissionEntities, setSelectedPermissionEntities] =
        useState<{ type: string, entities?: { value: string, label: string }[] }[]>([]);
    const [selectedUserProfile, setSelectedUserProfile] = useState<{
        type: 'User' | 'Group',
        id: number
    } | undefined>(undefined);
    const [userList, setUserList] = useState<ComboValues[]>([]);
    const [userGroupList, setUserGroupList] = useState<ComboValues[]>([]);
    const [fullDataList, setFullDataList] =
        useState<{ type: string, dataList: NodeModel<IPermissionData>[], loaded: boolean }[]>([]);

    const [activateSaveData, setActivateSaveData] =
        useState<boolean>(false);
    const [openedNodes, setOpenedNodes] =
        useState<{ type: string, opened: (string | number)[], trigger: boolean }[]>([]);
    const [selectedNodeData, setSelectedNodeData] = useState<number[]>([]);
    const [modifyingPermissionNodes, setModifyingPermissionNodes] = useState<(string | number)[]>([]);
    const [childrenPermissionsBeingUpdatedList, setChildrenPermissionsBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    const [childrenPermissionsForDenyBeingUpdatedList, setChildrenPermissionsForDenyBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    const [permissionsForNotSetBeingUpdatedList, setPermissionsForNotSetBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    const [depPermissionsBeingUpdatedList, setDepPermissionsBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    const [depMainPermissionBeingUpdatedList, setDepMainPermissionBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    const [permissionsBeingUpdatedList, setPermissionsBeingUpdatedList] =
        useState<IPermissionBeingUpdated[]>([]);
    //const [treeData, setTreeData] = useState<NodeModel<IPermissionData>[]>([]);

    const [dialogOpened, setDialogOpened] = useState<boolean>(false);
    const [dialogParams, setDialogParams] = useState<IDialogParams>({
        permissionDescription: "",
        permissionWarnings: ""
    });

    const userDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "User").controller;
    const userDataController = DailyPublicRegistrationContainer.resolveConstructor(userDataControllerRegistration);// as ADataController<OperatorEntityType>;
    userDataController.init();
    const userGroupDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "UserGroup").controller;
    const userGroupDataController = DailyPublicRegistrationContainer.resolveConstructor(userGroupDataControllerRegistration);
    userGroupDataController.init();
    const permissionDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "Permission").controller;
    const permissionDataController = DailyPublicRegistrationContainer.resolveConstructor(permissionDataControllerRegistration);
    permissionDataController.init();
    const PermissionsCtesDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "PermissionsCtes").controller;
    const PermissionsCtesDataController = DailyPublicRegistrationContainer.resolveConstructor(PermissionsCtesDataControllerRegistration);
    PermissionsCtesDataController.init();
    const userPermissionDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "UserPermission").controller;
    const userPermissionDataController = DailyPublicRegistrationContainer.resolveConstructor(userPermissionDataControllerRegistration);
    userPermissionDataController.init();
    const groupPermissionDataControllerRegistration = DailyPublicRegistrationContainer.resolveEntry("dataControllers", "GroupPermission").controller;
    const groupPermissionDataController = DailyPublicRegistrationContainer.resolveConstructor(groupPermissionDataControllerRegistration);
    groupPermissionDataController.init();

    const [menuEntityList, setMenuEntityList] = useState<string[] | undefined>(undefined);
    // Tabs
    const [tabsValue, setTabsValue] = React.useState<number>(0);
    const handleSelectedTabChange = useCallback((event: React.SyntheticEvent, newValue: number) => {
        setTabsValue(newValue);
    }, []);

    useEffect(() => {
        // Initialization
        setOpenedNodes(permissionTypes.map(el => ({type: String(el.value), opened: [], trigger: false})));
        (async () => {
            const interfaceConfig: IViewConfigModel<string> = await DailyPublicRegistrationContainer.resolve(ADailyConfigService)
            .getInterfaceConfig();
            const newMenuEntityList: string[] = [];
            const localInterfaceConfig = {...interfaceConfig};
            localInterfaceConfig.menuGroups.forEach(m => {
                m.entities.forEach(ent => {
                    if (ent.active) {
                        newMenuEntityList.push(ent.entityId);
                    }
                });
            }); 
            setMenuEntityList(newMenuEntityList);
        })();

    }, []);


    useAbortableEffect((abortSignal) => {
        if (menuEntityList) {
            if (!permissionEntityList.length) {
                loadPermissionEntityList(abortSignal);
            }    
        }
    }, [menuEntityList]);

    const initialLoadingCompleted = useMemo(() => fullDataList.length > 0 &&
                                    !fullDataList.find(el => !el.loaded),
            [fullDataList]);

    useAbortableEffect((abortSignal) => {
        if (initialLoadingCompleted) {
            if (!userList.length) {
                getUsers(abortSignal);
            }
            if (!userGroupList.length) {
                getUserGroups(abortSignal);
            }
        }
    }, [initialLoadingCompleted]);

    const loadPermissionEntityList = async (abortSignal: AbortSignal) => {
        setLoading(true);
        // Download all the permission tree using the Permission endpoint
/*         const allEntities = await PermissionsCtesDataController.dataListLoad<IPermissionsCtesPayload>(
            [], [], [], undefined, undefined, undefined, abortSignal, true);
 */        
        const allEntities = await DailyPublicRegistrationContainer.resolve(ABaseApiController).getData<IPermissionsCtesPayload[]>(
            "PermissionsCtes"
        ).apiCall({queryParams: {}, noCache: false, filter: []});
        if (Array.isArray(allEntities)) {
            const permissionTypesList = ['api', 'BackOfficeSample'];
            // Store the list of the permission types (erp, etl, application name)
            setPermissionTypes([
                ...permissionTypesList.filter(el => el.toLowerCase() === applicationName.toLowerCase())
                    .map(el => ({value: el, label: el})),
                ...permissionTypesList.filter(el => el.toLowerCase() !== applicationName.toLowerCase())
                    .map(el => ({value: el, label: el})),
            ]);
            // Store the permission tree
            setPermissionTree(allEntities);
            // Store the list of main permission entities for each permission type
            setPermissionEntityList(permissionTypesList.map(permissionType =>
                ({
                    type: permissionType,
                    entities: _.uniq(allEntities.filter(ent => 
                        (
                            (
                                permissionType ===  applicationName && ent.ChildPermissionName!.indexOf('-' + permissionType.toLowerCase() + '-') !== -1 &&
                                (menuEntityList!.indexOf(ent.ChildPermissionName!.slice(0,ent.ChildPermissionName!.length - ('-' + permissionType.toLowerCase() + '-read').length) ) !== -1  
                                /*|| menuEntityList.indexOf(ent.ChildPermissionName!.slice(0,ent.ChildPermissionName!.length - ('-' + permissionType.toLowerCase() + '-write').length) ) !== -1  */)
                            ) ||
                            (
                                permissionType !==  applicationName &&
                                ent.ChildPermissionName!.indexOf('-' + permissionType.toLowerCase() + '-') !== -1
                            )
                        )
                            && ( // Extract the entities belonging to the permission type
                                ent.Level === 0 //&& // Only the first level (i.e., list of nodes of the tree, without dependencies)
                                /*!allEntities.find( // Exclude the permissions that are present at level 1 (i.e., permissions that are children of other permissions)
                                    childEnt => childEnt.ParentType === permissionType &&
                                        childEnt.Level === 1 &&
                                        childEnt.Entity !== childEnt.ParentEntity &&
                                        childEnt.PermissionId === ent.PermissionId
                                )*/
                            )
                    ).map(el => ({ // Data format for combobox
                        value: el.ChildPermissionName!.split('-').slice(0,el.ChildPermissionName!.split('-').length -1).join('-'),
                        label: el.ChildPermissionName!.split('-').slice(0,el.ChildPermissionName!.split('-').length -1).join('-')
                    })).sort((a,b) => a.label < b.label ? -1 : 1), true, (a) => a.value)
                })
            ));
            // Initialize the selected permissions array
            setSelectedPermissionEntities(permissionTypesList.map(el => ({type: el, entities: []})));
            // Initialize the tree component data
            setFullDataList(permissionTypes.map(el => ({type: String(el.value), dataList: [], loaded: false})));
        }
        setLoading(false);
    };

    const loadPermissionTree = () => {
        const partialFullDataList: { type: string, dataList: NodeModel<IPermissionData>[], loaded: boolean }[] = [];
        permissionTypes.map(el => String(el.value)).forEach(permissionType => {
            const currentPermissionEntityList =
                permissionEntityList.find(el => el.type === permissionType)!.entities ?? [];
            if (currentPermissionEntityList.length) {
                let nodeId = 0;
                let newData: NodeModel<IPermissionData>[] = [];
                let entities: { value: string, label: string }[];
                if (selectedPermissionEntities.find(el => el.type === permissionType)?.entities?.length) {
                    entities = selectedPermissionEntities.find(el => el.type === permissionType)!.entities!;
                } else {
                    entities = currentPermissionEntityList;
                }

                nodeId++;
                newData.push({
                    id: 1,
                    text: intl.formatMessage({id: "All permissions"}),
                    parent: 0,
                    droppable: true,
                    data: {
                        permissionID: 0,
                        nodeStatus: PermissionState.NOT_SET,
                        typographyProps: {variant: 'h4'},
                        params: {
                            permissionId: 0,
                            permissionEntity: "ALL"
                        }
                    }
                });
                const permissionTypeTree = permissionTree.filter(perm =>
                    perm.ParentPermissionName!.indexOf('-' + permissionType.toLowerCase() + '-') !== -1
                    //&& entities.find(ent => ent.value === String(perm.ParentPermissionId))
                ); 
/*                 const rootNodes = permissionTypeTree.filter(perm => perm.Level === 0 && 
                            perm.ChildPermissionName!.split('-').slice(perm.ChildPermissionName!.split('-').length -1)[0] ===
                            perm.ParentPermissionName!.split('-').slice(perm.ParentPermissionName!.split('-').length -1)[0]
                        )
                    .sort((a,b) => a.ChildPermissionName! < b.ChildPermissionName! ? -1 : 1);    
 */                
                const rootNodes = permissionTypeTree.filter(perm => perm.Level === 0 &&
                    menuEntityList!.indexOf(perm.ChildPermissionName!.split('-')[0]) !== -1 &&
                    (permissionType === applicationName &&
                        (perm.ChildPermissionName!.split('-').slice(1).join('-') === applicationName.toLowerCase() + '-read' ||
                            perm.ChildPermissionName!.split('-').slice(1).join('-') === applicationName.toLowerCase() + '-write'
                        ) 
                    ) || permissionType !== applicationName
                );
                rootNodes.forEach(rootNode => {
                    nodeId=Number(newData[newData.length-1].id) + 1;
                    // Root node for each permission entity and subtype
                    newData.push({
                        id: nodeId,
                        text: rootNode.ParentPermissionName!, // + ' - ' + rootNode.ParentSubType,
                        parent: -1, // Temporary value for rootNodes; it will be changed into 1 ("All permissions" node); setting 1 here would cause a problem if the permission id is 1
                        droppable: false, // updated later
                        data: {
                            /**
                             * this is created as NOT SET and then assigned when user/group is selected
                             */
                            nodeStatus: PermissionState.NOT_SET,
                            permissionID: rootNode.ParentPermissionId,
                            typographyProps: {variant: 'h4'},
                            params: {
                                permissionId: rootNode.ParentPermissionId,
                                permissionEntity: permissionType,
                                mainPermissionEntity: rootNode.ParentPermissionName! // Main permission entity: used for filtering
                            },

                        }
                    });

                    newData = [...newData, ...loadPermissionSubTree(Number(newData[newData.length-1].id), rootNode.ParentPermissionId!, rootNode.ParentPermissionId!, 
                                                    permissionType, rootNode.ParentPermissionName!, permissionTypeTree)];
                    // const childrenNodes = permissionTypeTree.filter(el =>
                    //     el.ParentPermissionId === rootNode.ParentPermissionId && el.Level! > 0 &&
                    //     el.ChildPermissionName!.split('-').slice(el.ChildPermissionName!.split('-').length -1)[0] ===
                    //     el.ParentPermissionName!.split('-').slice(el.ChildPermissionName!.split('-').length -1)[0]
                    // ); // && el.SubType === rootNode.SubType);
                    // childrenNodes.forEach(childNode => {
                    //     nodeId++;
                    // //  Children nodes (same subtype)
                    //     newData.push({
                    //         id: nodeId,
                    //         text: childNode.ChildPermissionName!,
                    //         parent: childNode.ParentPermissionId!, // Temporary value to be translated into node id
                    //         droppable: false, // updated later
                    //         data: {
                    //             /**
                    //              * this is created as NOT SET and then assigned when user/group is selected
                    //              */
                    //             nodeStatus: PermissionState.NOT_SET,
                    //             permissionID: rootNode.ParentPermissionId,
                    //             params: {
                    //                 permissionId: childNode.ChildPermissionId!,
                    //                 permissionEntity: permissionType,
                    //                 mainPermissionEntity: rootNode.ParentPermissionName // Main permission entity: used for filtering
                    //             },

                    //         }
                    //     });
                    // });
                });
                // Parent nodes translation
                newData.forEach(el => {
                    if (el.parent === -1) {
                        el.parent = 1;
                    } else if (el.parent !== 0) {
                        const parentNodeId = newData.find(node =>
                            node.data?.params?.permissionId === el.parent
                        )?.id;
                        if (parentNodeId) {
                            el.parent = parentNodeId;
                        } else {
                            el.parent = 1; // Parent not found
                        }
                    }
                });
                // Droppable property
                newData.forEach(el => {
                    el.droppable = !!newData.find(node => node.parent === el.id);
                });
                partialFullDataList.push({
                    type: permissionType,
                    dataList: newData,
                    loaded: true
                });
            }
        });
        setFullDataList(partialFullDataList);
    };

    useEffect(() => {
        if (menuEntityList) {
            loadPermissionTree();
        }
    }, [permissionTypes, permissionEntityList, menuEntityList]);

    const treeData: NodeModel<IPermissionData>[] = useMemo(() => {
        const permissionType = String(permissionTypes[tabsValue]?.value);
        if (permissionType) {
            return (fullDataList.find(el => el.type === permissionType)?.dataList ?? [])
                .filter(el =>
                    el.data!.params!.permissionEntity === "ALL"
                    || !selectedPermissionEntities.find(
                        perm => perm.type === permissionType)
                    || !selectedPermissionEntities?.find(
                        perm => perm.type === permissionType)?.entities
                    || selectedPermissionEntities!.find(
                        perm => perm.type === permissionType)!.entities!.length === 0
                    || selectedPermissionEntities.find(
                        perm => perm.type === permissionType)!.entities!.find(
                        ent => ent.value === String(el.data!.params!.mainPermissionEntity ?? "").slice(0, ent.value.length))
                );
        } else {
            return [];
        }

    }, [fullDataList, permissionTypes, selectedPermissionEntities, tabsValue]);

    const {allNodes: dataListGraph, rootNodes} = useMemo(() => {
        if (!permissionTypes.length) {
            return {allNodes: new Map<string | number, DataListGraphNode<IPermissionData>>(), rootNodes: []};
        }

        const currenDataList = _(fullDataList).findWhere({
            type: (String(permissionTypes[tabsValue]?.value)) ?? ""
        })?.dataList.filter(el => !!treeData.find(node => node.id === el.id));

        if (!currenDataList) {
            return {allNodes: new Map<string | number, DataListGraphNode<IPermissionData>>(), rootNodes: []};
        }

        return getDatalistGraph(currenDataList);
    }, [fullDataList, permissionTypes, tabsValue, selectedUserProfile, permissionTree, selectedPermissionEntities, treeData]);

    const loadPermissionSubTree = (newId: number, immediateParentId: number, mainParentId: number, permissionType: string,
                        mainPermissionName: string,
                        permissionTypeTree: IPermissionsCtesPayload[]): NodeModel<IPermissionData>[] => {
        let result: NodeModel<IPermissionData>[] = [];
        const childrenNodes = permissionTypeTree.filter(el =>
            el.ParentPermissionId === immediateParentId && el.Level! === 1 &&
            el.ChildPermissionName!.split('-').slice(el.ChildPermissionName!.split('-').length -1)[0] ===
            el.ParentPermissionName!.split('-').slice(el.ChildPermissionName!.split('-').length -1)[0]
        );
        let nodeId = newId;
        childrenNodes.forEach(childNode => {
            nodeId++;
           //  Children nodes (same subtype)
            result.push({
                id: nodeId,
                text: childNode.ChildPermissionName!,
                parent: childNode.ParentPermissionId!, // Temporary value to be translated into node id
                droppable: false, // updated later
                data: {
                    /**
                     * this is created as NOT SET and then assigned when user/group is selected
                     */
                    nodeStatus: PermissionState.NOT_SET,
                    permissionID: mainParentId,
                    params: {
                        permissionId: childNode.ChildPermissionId!,
                        permissionEntity: permissionType,
                        mainPermissionEntity: mainPermissionName // Main permission entity: used for filtering
                    },
                }
            });
        });
        childrenNodes.forEach(childNode => {
            const subResult = loadPermissionSubTree(nodeId, childNode.ChildPermissionId!, mainParentId, permissionType, mainPermissionName, 
                permissionTypeTree);
            result = [...result, ...subResult];
            if (subResult.length > 0) {
                nodeId = Number(subResult[subResult.length-1].id);
            }
        });
        return result;
    };

    const getCurrentAssignedPermission = async (abortSignal: AbortSignal): Promise<IAssignedPermission[]> => {
        if (selectedUserProfile) {
            const filters: (IDataFilterGroup | IDataFilter)[] = [{
                id: 1,
                parentId: 0,
                type: 'filter',
                field: selectedUserProfile.type === 'Group' ? 'GroupId' : 'UserId',
                values: [selectedUserProfile.id],
                embedded: false,
                operator: 'Number.equals'
            }];
            let assignedPermissions: IPermissionsOperatorPayload[] | undefined | IApiError;
            if (selectedUserProfile.type === 'User') {
                assignedPermissions =
                    await userPermissionDataController.dataListLoad<IPermissionsOperatorPayload>(
                        filters, [], [], undefined, undefined, undefined, abortSignal,
                        true
                    );
            } else {
                assignedPermissions =
                    await groupPermissionDataController.dataListLoad<IPermissionsOperatorPayload>(
                        filters, [], [], undefined, undefined, undefined, abortSignal,
                        true
                    );
            }
            if (Array.isArray(assignedPermissions)) {
                return assignedPermissions.map(row => (
                    {
                        permissionId: row.PermissionId!,
                        userGroupId: row.OperatorGroupId,
                        permissionValue: row.PermissionValue!
                    }
                ));
            } else {
                return [];
            }
        } else {
            return [];
        }
    };

    const loadAssignedPermissions = async (abortSignal: AbortSignal) => {
        const newData = [...fullDataList]; // Copy of permission tree to set assigned permissions
        const newOpenedNodes: number[] = [1]; // Reset the tree expanded nodes: only the first one is expanded (all permissions)

        newData.forEach(treeType => treeType.dataList.forEach(node =>
            node.data!.params!.status = undefined)); // Reset the assigned permissions
        try {
            if (selectedUserProfile) {
                const userPermissionData = await getCurrentAssignedPermission(abortSignal);
                // Assign the new permissions
                let newStatus: PermissionState;
                let inheritedPermission = "";
                newData.forEach(treeType => treeType.dataList.forEach(node => {
                    const currentPermission = userPermissionData.find(
                        el => el.permissionId === node.data!.params!.permissionId
                    );
                    inheritedPermission = "";
                    if (!currentPermission) {
                        newStatus = PermissionState.NOT_SET;
                    } else if (selectedUserProfile?.type === 'User' && currentPermission.userGroupId) {
                        newStatus = PermissionState.NOT_SET;
                        inheritedPermission = userGroupList
                            .find(el => el.value === currentPermission.userGroupId)!.label;
                    } else {
                        newStatus = currentPermission.permissionValue === PermissionAccessValue.DENY ? PermissionState.DENIED : PermissionState.ALLOWED;
                    }

                    if (!node.data) return;

                    node.data.nodeStatus = newStatus;
                    node.data.params!.status = newStatus;
                    if (inheritedPermission !== "") {
                        node.data.params!.inherited = inheritedPermission;
                        node.data.params!.inheritedPermissionState = currentPermission!.permissionValue === PermissionAccessValue.DENY
                            ? PermissionState.DENIED : PermissionState.ALLOWED;
                    } else {
                        node.data.params!.inherited = undefined;
                    }
                }));
            }
            setFullDataList(newData);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(intl.formatMessage({id: "Error when getting permission data"}), {
                variant: "error",
                persist: true,
                action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
            });
        }
    };

    // Effect from selectedUsers or selectedUserGroups modification: assigned permissions loading
    const onSelectedProfilesChange = async (abortSignal: AbortSignal) => {
        try {
            setLoading(true);
            await loadAssignedPermissions(abortSignal);
        } catch (err) {
            console.error(err);
            enqueueSnackbar(intl.formatMessage({id: "Error when getting permission data"}), {
                variant: "error",
                persist: true,
                action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
            });
        } finally {
            setLoading(false);
        }
    };

    useAbortableEffect((abortSignal) => {
        onSelectedProfilesChange(abortSignal);
    }, [selectedUserProfile]);

    const getUsers = async (abortSignal: AbortSignal): Promise<void> => {
        const opList = await userDataController.dataListLoad([], [],
            undefined, undefined, undefined, undefined, abortSignal, true);
        if (Array.isArray(opList)) {
            setUserList(opList?.map(el => {
                return {value: el.Id, label: String(el.UserName)};
            }) ?? []);
        } else {
            setUserList([]);
        }
    };

    const getUserGroups = async (abortSignal: AbortSignal): Promise<void> => {
        const opList = await userGroupDataController.dataListLoad([], [],
            undefined, undefined, undefined, undefined, abortSignal);
        if (Array.isArray(opList)) {
            setUserGroupList(opList?.map(el => {
                return {value: el.Id, label: String(el.Code) + ' - ' + String(el.Description)};
            }) ?? []);
        } else {
            setUserGroupList([]);
        }
    };

    const onPermissionEntityChange = (values: string[]) => {
        const newSelectedPermissionEntities = [...selectedPermissionEntities];
        newSelectedPermissionEntities.find(el => el.type === permissionTypes[tabsValue]!.value)!.entities =
            permissionEntityList.find(
                el => el.type === permissionTypes[tabsValue]!.value
            )!.entities!.filter(el => values.indexOf(el.value) !== -1);
        setSelectedPermissionEntities(newSelectedPermissionEntities);
        onDeselected([...selectedId ?? []]);
    };

    const onUserChange = (value: string | undefined) => {
        if (value) {
            setSelectedUserProfile({type: value[0] === 'U' ? 'User' : "Group", id: Number(value.slice(1))});
        } else {
            setSelectedUserProfile(undefined);
        }
    };

    useEffect(() => {
        if (!permissionDataController) {
            enqueueSnackbar(intl.formatMessage({id: "Data controller not found"}), {
                variant: "error",
                persist: true,
                action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
            });
        }
    }, [permissionDataController]);

    const onPermissionUpdate = useCallback((nodeId: (number | string)[], data: NodeModel<ITreeData>[], massOperation?: number) => {
        const currentSelectedNodeData = data.filter(el =>
            nodeId.indexOf(Number(el.id)) !== -1);
        setSelectedNodeData(currentSelectedNodeData ? currentSelectedNodeData.map(el => Number(el.id)) : []);
        if (!currentSelectedNodeData.length) {
            return;
        }
        const warning = "";
        const warningColor: "error" | "primary" = "primary";
        //let actions: IDialogAction[] = [];
        const defaultAction = 2;

        const actionAllowAll: IDialogAction = {
            label: intl.formatMessage({id: "Allow all"}),
            icon: 'playlist-check',
            color: "success",
            value: 1,
        };
        const actionAllowOnlyThis: IDialogAction = {
            label: intl.formatMessage({id: "Allow"}),
            icon: 'subdirectory-arrow-left',
            color: "success",
            value: 2,
        };
        const actionAllow: IDialogAction = {
            label: intl.formatMessage({id: "Allow"}),
            icon: 'subdirectory-arrow-left',
            color: "success",
            value: 2,
        };
        const actionDeny: IDialogAction = {
            label: intl.formatMessage({id: "Deny"}),
            icon: 'account-cancel',
            color: "error",
            value: 3,
        };
        const actionNotSet: IDialogAction = {
            label: intl.formatMessage({id: "Not Set"}),
            icon: 'account-cancel',
            value: 4,
        };
        const actions: IDialogAction[] = [actionAllow, actionDeny, actionNotSet];
        const newDialogParams = {
            permissionDescription: intl.formatMessage({id: "Operation on selected permissions"}),
            permissionWarnings: warning,
            warningsColor: warningColor,
            actions: actions,
            selectedAction: defaultAction,
        };

        setDialogParams(newDialogParams);
        setDialogOpened(true);
        setModifyingPermissionNodes(nodeId);
    }, [fullDataList]);

    const onDialogSelectedActionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDialogParams: IDialogParams = {...dialogParams};
        newDialogParams.selectedAction = Number((event.target as HTMLInputElement).value);
        setDialogParams(newDialogParams);
    };

    useAbortableEffect((abortSignal) => {
        if (dialogOpened) {
            const dataList = fullDataList.find(
                el => el.type === String(permissionTypes[tabsValue]!.value))!.dataList;
            const getList = async () => {
                setLoading(true);
                const {
                    depPermissions, childrenPermissions, depMainPermissions,
                    childrenPermissionsForDeny, singlePermissionsForNotSet
                } =
                    await getModificationList(modifyingPermissionNodes.map(el =>
                            Number(dataList.find(perm => perm.id === el)!.data!.params!.permissionId)),
                        dialogParams.actions,
                        abortSignal);
                setModificationList(depPermissions, childrenPermissions, depMainPermissions, childrenPermissionsForDeny, singlePermissionsForNotSet);
                showModificationList(depPermissions, childrenPermissions, depMainPermissions, childrenPermissionsForDeny, singlePermissionsForNotSet);
                setLoading(false);
            };
            getList();
        }
    }, [dialogOpened, modifyingPermissionNodes]);

    const setModificationList = (depPermissions: IPermissionBeingUpdated[], childrenPermissions: IPermissionBeingUpdated[],
                                 depMainPermissions: IPermissionBeingUpdated[], childrenPermissionsForDeny: IPermissionBeingUpdated[],
                                 permissionsForNotSet: IPermissionBeingUpdated[]) => {
        setChildrenPermissionsBeingUpdatedList(childrenPermissions);
        setChildrenPermissionsForDenyBeingUpdatedList(childrenPermissionsForDeny);
        setDepPermissionsBeingUpdatedList(depPermissions);
        setDepMainPermissionBeingUpdatedList(depMainPermissions);
        setPermissionsForNotSetBeingUpdatedList(permissionsForNotSet);
    };

    const getModificationList = async (
        modifyingPermissionIdList: number[], actions: IDialogAction[] | undefined, abortSignal: AbortSignal
    ): Promise<{
        depPermissions: IPermissionBeingUpdated[], childrenPermissions: IPermissionBeingUpdated[],
        depMainPermissions: IPermissionBeingUpdated[], childrenPermissionsForDeny: IPermissionBeingUpdated[],
        singlePermissionsForNotSet: IPermissionBeingUpdated[]
    }> => {
        // childrenPermissions: List of children permissions of same type and same subtype (needed for "Allow all") // NO LONGER USED
        // childrenPermissionsForDeny: List of children permissions of same type and all subtypes (needed for "Deny")
        // depPermissions: List of permission dependencies for the main permission and the children permissions of same type and same subtype (needed for "Allow all")
        // depMainPermissions: List of permission dependencies for the main permission (needed for "Allow")
        // singlePermissions: List of permissions without children and dependencies (needed for "Not Set")

        if (!selectedUserProfile) {
            return {
                depPermissions: [],
                childrenPermissions: [],
                depMainPermissions: [],
                childrenPermissionsForDeny: [],
                singlePermissionsForNotSet: []
            };
        }
        // Extract the permission tree for the permission being modified
        let childrenPermissionTree: IPermissionsCtesPayload[] = [];
        let childrenPermissionTreeForDeny: IPermissionsCtesPayload[] = [];
        let depPermissionTree: IPermissionsCtesPayload[] = [];
        let splitCnt: number;
        const callSize = 40;
        let results: IPermissionsCtesPayload[] = [];
        if (actions?.find(el => el.value === 1) || actions?.find(el => el.value === 3)) {
            // If the selected operation can be "AllowAll" or "Deny", the children permissions must be loaded
            splitCnt = 0;
            const idList = _.uniq([
                ...modifyingPermissionIdList
            ]);
            results = [];
            while (splitCnt < idList.length) {
                const res = await DailyPublicRegistrationContainer.resolve(ABaseApiController).getData<IPermissionsCtesPayload[]>(
                    "PermissionsCtes"
                ).apiCall({queryParams: {}, noCache: false, filter: [
                    {id: 1, field: "ParentPermissionId", type: 'filter', operator: "oneOf", values: idList.slice(splitCnt, splitCnt + callSize), parentId: 0}
                ]});
/*                 const res = await permissionDataController.dataListLoad<IPermissionsCtesPayload>(
                    `ParentPermissionId in (${idList.slice(splitCnt, splitCnt + callSize).join(',')}) and ParentType eq Type`, // and ParentSubType eq SubType`,
                    [], ['Type', 'Description'], undefined, undefined, undefined, abortSignal, true);
 */                
                splitCnt += callSize;
                if (Array.isArray(res)) {
                    results = [...results, ...res.filter(
                        el => el.ChildPermissionName!.split('-').slice(String(el.ChildPermissionName).split('-').length -1)[0] === 
                                el.ParentPermissionName!.split('-').slice(String(el.ParentPermissionName).split('-').length -1)[0]
                    )];
                }
            }
            childrenPermissionTreeForDeny = results;
            childrenPermissionTree = results; //.filter(el => el.ParentSubType === el.SubType);
        }
        if (actions?.find(el => el.value === 1) || actions?.find(el => el.value === 2)) {
            // If the selected operation can be "AllowAll" or "Allow", the permission dependencies must be loaded
            splitCnt = 0;
            const idList = _.uniq([
                ...modifyingPermissionIdList, ...childrenPermissionTree.map(el => el.ChildPermissionId)
            ]);
            let results: IPermissionsCtesPayload[] = [];
            while (splitCnt < idList.length) {
/*                 const res = await permissionDataController.dataListLoad<IPermissionPayload>(
                    [
                        {
                            id: 1,
                            parentId: 0,
                            type: 'filter',
                            field: 'PermissionId',
                            values: idList.slice(splitCnt, splitCnt + callSize),
                            embedded: false,
                            operator: "oneOf"
                        },
                    ],
                    [], ['ParentType', 'ParentDescription'], undefined, undefined, undefined, abortSignal, true);
 */                
                const res = await DailyPublicRegistrationContainer.resolve(ABaseApiController).getData<IPermissionsCtesPayload[]>(
                    "PermissionsCtes"
                ).apiCall({queryParams: {}, noCache: false, filter: [
                    {id: 1, field: "ChildPermissionId", type: 'filter', operator: "oneOf", values: idList.slice(splitCnt, splitCnt + callSize), parentId: 0}
                ]});
                if (Array.isArray(res)) {
                    results = [...results, ...res];
                }
                splitCnt += callSize;
            }
            depPermissionTree = results;
        }
        const modifyingList: IPermissionBeingUpdated[] = _.uniq([
            ...depPermissionTree.map(el => ({
                permissionId: el.ChildPermissionId!,
                description: el.ChildPermissionName!,
                isBeingChanged: false
            })),
            ...depPermissionTree.map(el => ({
                permissionId: el.ParentPermissionId!,
                description: el.ParentPermissionName!,
                isBeingChanged: false
            })),
            ...childrenPermissionTreeForDeny.map(el => ({
                permissionId: el.ChildPermissionId!,
                description: el.ChildPermissionName!,
                isBeingChanged: false
            }))
        ], false, a => a.permissionId);

        const depPermissions = modifyingList.filter(el => depPermissionTree.find(
            prm => prm.ChildPermissionId === el.permissionId || prm.ParentPermissionId === el.permissionId)) ;
        const depMainPermissions = modifyingList.filter(el => depPermissionTree.find(
            prm => prm.ChildPermissionId === el.permissionId || prm.ParentPermissionId === el.permissionId 
        ));
        const childrenPermissions = modifyingList.filter(el => childrenPermissionTree.find(
            prm => prm.ChildPermissionId === el.permissionId));
        const childrenPermissionsForDeny = modifyingList.filter(el => childrenPermissionTreeForDeny.find(
            prm => prm.ChildPermissionId === el.permissionId));
        const singlePermissionsForNotSet = modifyingList.filter(el =>
            modifyingPermissionIdList.indexOf(el.permissionId) !== -1);
        return {
            depPermissions: depPermissions,
            childrenPermissions: childrenPermissions,
            depMainPermissions: depMainPermissions,
            childrenPermissionsForDeny: childrenPermissionsForDeny,
            singlePermissionsForNotSet: singlePermissionsForNotSet
        };
    };

    const showModificationList = (depPermissions: IPermissionBeingUpdated[], childrenPermissions: IPermissionBeingUpdated[],
                                  depMainPermissions: IPermissionBeingUpdated[], childrenPermissionsForDeny: IPermissionBeingUpdated[],
                                  singlePermissionsForNotSet: IPermissionBeingUpdated[]) => {
        if (dialogParams.selectedAction === 4) {
            // If the selected operation is "Not Set", the children permission and the dependencies are shown
            setPermissionsBeingUpdatedList(singlePermissionsForNotSet);
        } else if (dialogParams.selectedAction === 2) {
            // If the selected operation is "Allow", the dependencies of the main permissions are shown
            setPermissionsBeingUpdatedList(depMainPermissions);
        } else if (dialogParams.selectedAction === 3) {
            // If the selected operation is "Deny", the children are shown
            setPermissionsBeingUpdatedList(childrenPermissionsForDeny);
        }
    };

    useEffect(() => {
        if (dialogParams.selectedAction) {
            showModificationList(depPermissionsBeingUpdatedList, childrenPermissionsBeingUpdatedList,
                depMainPermissionBeingUpdatedList, childrenPermissionsForDenyBeingUpdatedList, permissionsForNotSetBeingUpdatedList);
        }
    }, [dialogParams.selectedAction]);

    const onDialogCancel = () => {
        setDialogOpened(false);
        setChildrenPermissionsBeingUpdatedList([]);
        setDepPermissionsBeingUpdatedList([]);
        setPermissionsBeingUpdatedList([]);
    };

    const savePermission = async (abortSignal: AbortSignal) => {
        setLoading(true);
        try {
            const nodeId = selectedNodeData; // Current node ids
            const dataList = fullDataList.find(el => el.type === permissionTypes[tabsValue]!.value)!.dataList;
            const operation = dialogParams.selectedAction;  // Current operation
            if (!dialogParams.actions?.find(el => el.value === operation)) {
                return;
            }
            if (!selectedUserProfile) {
                return;
            }
            const modifyingPermissionsIds = modifyingPermissionNodes.map(el =>
                Number(dataList.find(perm => perm.id === el)!.data!.params!.permissionId));
            const {depPermissions, childrenPermissions, depMainPermissions, childrenPermissionsForDeny} =
                await getModificationList(modifyingPermissionsIds,
                    [dialogParams.actions.find(el => el.value === operation)!],
                    abortSignal);

            let modifyingList: number[];
            if (operation === 4) { // Not Set: only selected nodes
                modifyingList = modifyingPermissionsIds;
            } else if (operation === 3) { // Deny: selected nodes and children
                modifyingList = _.uniq(childrenPermissionsForDeny, false,
                    a => a.permissionId).map(el => el.permissionId);
            } else { // operation = 2 -> Allow: selected nodes and dependencies
                modifyingList = _.uniq(depPermissions, false,
                    a => a.permissionId).map(el => el.permissionId);
            }
            // To decide whether to execute an insert or an update on the db, we must check if each permission exists
            const existingDataList: {
                existingId: number,
                type: 'user' | 'group',
                id: number,
                permissionId: number
            }[] = []; // List of existing data
            let splitModifyingList = 0;
            //let splitProfiles = 0;
            const splitSize = 40;
            while (splitModifyingList < modifyingList.length) {
                //splitProfiles = 0;
                // Extract the set permissions for the selected users
                if (selectedUserProfile.type === 'User') {
                    const existingUserData = await userPermissionDataController.dataListLoad<IUserPermissionPayload>(
                        [
                            {id: 1, parentId: 0, type: "filterGroup", mode: "AND"},
                            {
                                id: 2, parentId: 1, type: 'filter', field: 'PermissionId',
                                values: modifyingList.slice(splitModifyingList, splitModifyingList + splitSize),
                                embedded: false, operator: "oneOf"
                            },
                            {
                                id: 3, parentId: 1, type: 'filter', field: 'UserId',
                                values: [selectedUserProfile.id],
                                embedded: false, operator: "oneOf"
                            }
                        ], [], [], undefined, undefined, undefined, abortSignal);
                    // Add the existing data to the list
                    if (Array.isArray(existingUserData)) {
                        existingUserData.forEach(el => {
                            existingDataList.push({
                                existingId: el.Id, // Id of the "permission assoc" table
                                type: 'user', // This is a permission associated to a user
                                id: el.UserId!, // User id
                                permissionId: el.PermissionId!, // Permission id
                            });
                        });
                    }
                } else {
                    const existingGroupData = await groupPermissionDataController.dataListLoad<IGroupPermissionPayload>([
                        {id: 1, parentId: 0, type: "filterGroup", mode: "AND"},
                        {
                            id: 2, parentId: 1, type: 'filter', field: 'PermissionId',
                            values: modifyingList.slice(splitModifyingList, splitModifyingList + splitSize),
                            embedded: false, operator: "oneOf"
                        },
                        {
                            id: 3, parentId: 1, type: 'filter', field: 'GroupId',
                            values: [selectedUserProfile.id], embedded: false, operator: "oneOf"
                        },
                    ], [], [], undefined, undefined, undefined, abortSignal);
                    if (Array.isArray(existingGroupData)) {
                        existingGroupData.forEach(el => {
                            existingDataList.push({
                                existingId: el.Id, // Id of the "permission assoc" table
                                type: 'group', // This is a permission associated to a group
                                id: el.GroupId!, // Group id
                                permissionId: el.PermissionId!, // Permission id
                            });
                        });
                    }
                }
                splitModifyingList += splitSize;
            }

            const commands: IBatchCommand[] = [];
            const permissionValue = operation === 3 ? PermissionAccessValue.DENY : PermissionAccessValue.ALLOW; // Deny = 2, Allow = 1
            const addCommand = (type: 'user' | 'group', id: number, perm: number) => {
                // Check if the permission assoc exists
                const currentExisting = existingDataList.find(el =>
                    el.type === type && el.id === id && el.permissionId === perm
                );
                // Add the batch command
                if (operation !== 4 || currentExisting) {
                    commands.push({
                        entity: type === 'user' ? "UserPermission" : "GroupPermission", // Table name
                        operation: operation !== 4 ? (currentExisting ? "Replace" : "Insert") : "Remove", // Operation (Replace of Remove) if the row exists, otherwise Insert)
                        objectId: currentExisting?.existingId ?? -1, // Id (only if the row exists)
                        payload:  type === 'user' ? {
                                UserId: {Value: id, ValueType: 0},
                                PermissionId: {Value: perm, ValueType: 0},
                                PermissionValue: permissionValue
                            } :
                            {
                                GroupId: {Value: id, ValueType: 0},
                                PermissionId: {Value: perm, ValueType: 0},
                                PermissionValue: permissionValue
                            },
                        refFields: []
                    });
                }
            };

            modifyingList.forEach(perm => { // For each permission to update
                addCommand(selectedUserProfile.type === 'User' ? 'user' : 'group', selectedUserProfile.id, perm);
            });


            if (commands.length) {
                let splitCommand = 0;
                const splitSizeCommand = 20;
                while (splitCommand < commands.length) {
                    const res = await  DailyPublicRegistrationContainer.resolve(ABaseApiController)
                            .saveData(commands.slice(splitCommand, splitCommand + splitSizeCommand), 1);
                    if (!res) {
                        enqueueSnackbar(intl.formatMessage({id: "Error when saving permission data"}), {
                            variant: "error",
                            persist: true,
                            action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
                        });
                        return;
                    }
                    if ((res as { error: string, errorCode?: string }).error) {
                        const errorRes = res as { error: string, errorCode?: string };
                        enqueueSnackbar(intl.formatMessage({id: "Error when saving permission data"}) +
                            (errorRes.errorCode ? " - Error code: " + errorRes.errorCode : "") +
                            " - " + errorRes.error, {
                            variant: "error",
                            persist: true,
                            action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
                        });
                        return;
                    }
                    splitCommand += splitSizeCommand;
                }
            }
            try {
                await loadAssignedPermissions(abortSignal);
                onDialogCancel();
            } catch {
                enqueueSnackbar(intl.formatMessage({id: "It was not possible to retrieve the saved data"}), {
                    variant: "error",
                    persist: true,
                    action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
                });
            }
        } catch (err) {
            console.log(err);
            enqueueSnackbar(intl.formatMessage({id: "Error when saving permission data"}), {
                variant: "error",
                persist: true,
                action: (snackbarID) => <SnackBarCloseAction snackbarId={snackbarID}/>,
            });
        } finally {
            setLoading(false);
            setActivateSaveData(false);
        }
    };

    useAbortableEffect((abortSignal) => {
        if (activateSaveData) {
            savePermission(abortSignal);
        }
    }, [activateSaveData]);


    const onSelected = useCallback(((data: (string | number)[]) => {

        dispatchSelected(Actions.ADD_SELECTED({ids: data, type: String(tabsValue)}));


    }), [dispatchSelected, tabsValue]);
    const onDeselected = useCallback((data: (string | number)[]) => {


        dispatchSelected(Actions.REMOVE_SELECTED({ids: data, type: String(tabsValue)}));


    }, [dispatchSelected, tabsValue]);

    const selectedId = selectedIds[tabsValue + ""];
    const selectedPermissionType = String(permissionTypes[tabsValue]?.value);

    const onToggleOpen = useCallback((id: number | string) => {
        setOpenedNodes(oldData => {

            return produce(oldData, draft => {
                const oldPermissionData = draft.find(data => data.type == selectedPermissionType);

                if (!oldPermissionData) {
                    draft.push({
                        type: selectedPermissionType,
                        opened: [id],
                        trigger:false,
                    });
                    return;
                }

                if (oldPermissionData.opened.includes(id)) {
                    oldPermissionData.opened = oldPermissionData.opened.filter(data => data != id);
                } else {
                    oldPermissionData.opened.push(id);
                }
            });

        });
    }, [selectedPermissionType]);


    return <PermissionSelectionContext.Provider value={selectedId}>
        <div className={"permissionPage"}>

            <Backdrop sx={{color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1}} open={loading}>
                <CircularProgress color="inherit"/>
            </Backdrop>
            <Dialog
                PaperProps={{
                    className: "permission-save-dialog"

                }}
                open={dialogOpened}
            >
                <DialogTitle>
                    <Box>
                        <Typography variant="h5">{dialogParams.permissionDescription}</Typography>
                    </Box>
                    <Box>
                        <RadioGroup
                            aria-labelledby={"actions-on-permission"}
                            value={dialogParams.selectedAction}
                            onChange={onDialogSelectedActionChange}
                            row
                        >
                            {dialogParams.actions?.map((el, index) => (
                                <FormControlLabel value={el.value} control={<Radio/>} label={el.label}/>
                            ))}
                        </RadioGroup>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <Box sx={{mr: 8}}>
                        <Typography variant={'h5'}>
                            {intl.formatMessage({id: 'The following permissions will be set'})}
                        </Typography>
                    </Box>
                    {permissionsBeingUpdatedList.map((el, index) => (
                        <Box key={'permissionBeingUpdated' + index} sx={{m: 0}}>
                            <Typography color={el.isBeingChanged ? 'error' : undefined}>
                                <Box sx={{display: 'flex', alignItems: 'center'}}>
                                    {el.isBeingChanged &&
                                        <TCIcon
                                            iconCode={'tci-alert-outline'}
                                            data-testid={'permissionBeingUpdated' + index + "_icon"}
                                            sx={{mr: 1}}
                                        />
                                    }
                                    {el.description}
                                </Box>
                            </Typography>
                        </Box>
                    ))}
                </DialogContent>
                <DialogActions>
                    <Button
                        color={'secondary'}
                        onClick={onDialogCancel}
                    >
                        {intl.formatMessage({id: "Cancel"})}
                    </Button>
                    <Button
                        variant={"contained"}
                        color={'primary'}
                        onClick={() => {
                            setActivateSaveData(true);
                        }}
                    >
                        {intl.formatMessage({id: "Save"})}
                    </Button>
                </DialogActions>
            </Dialog>

            <Grid container spacing={3}>

                <Grid item xs={12}>
                    <form>
                        <MainCard
                                title={intl.formatMessage({id: "Permissions management"})}
                            content={false}
                            padding={'10px'}
                            className={"permission-main-card"}
                        >
                            <Box sx={{margin: '10px'}}>
                                <Grid item xs={12} md={6}>
                                    <Grid item xs={12} md={12}>
                                        <Box>
                                            <WD_StaticCombobox
                                                valueList={[...userList.map(el => ({...el, value: 'U' + el.value})),
                                                    ...userGroupList.map(el => ({...el, value: 'G' + el.value}))]}
                                                componentName={'UserList'}
                                                componentId={'UserList'}
                                                label={intl.formatMessage({id: "Users"})}
                                                rwMode={rwModes.W}
                                                value={selectedUserProfile ? selectedUserProfile.type[0] + selectedUserProfile.id : null}
                                                onChange={onUserChange}
                                                error={false}
                                                type={""}
                                                multiple={false}
                                                bindingGuid={""}
                                                groupName={""}
                                                groupBy={(option) => option.value[0]}
                                                renderGroup={params => <li key={params.key}>
                                                    <GroupHeader>{intl.formatMessage({id: params.group === 'U' ? 'Users' : 'Groups'})}</GroupHeader>
                                                    <GroupItems>{params.children}</GroupItems>
                                                </li>}
                                            />
                                        </Box>
                                    </Grid>
                                </Grid>
                                <Box sx={{width: "100%", height: "100%", display: "flex", flexDirection: "column"}}>
                                    <Tabs
                                        value={tabsValue}
                                        onChange={handleSelectedTabChange}
                                        orientation={"horizontal"}
                                        variant={"scrollable"}
                                    >
                                        {permissionTypes.map((el, index) => (
                                            <Tab
                                                key={'PermissionTab' + index}
                                                label={el.label}
                                                {...a11yProps(index)}
                                            />
                                        ))}
                                    </Tabs>
                                    {permissionTypes.map((el, index) => {
                                        const permissionType = String(permissionTypes[index]?.value);

                                        return (
                                            <TabPanel key={"TabPanel" + index} index={index} value={tabsValue}>
                                                <Box>
                                                    <WD_StaticCombobox
                                                        valueList={permissionEntityList.find(el =>
                                                            el.type === permissionTypes[index]?.value)?.entities ?? []}
                                                        componentName={'PermissionEntityList' + index}
                                                        componentId={'PermissionEntityList' + index}
                                                        label={intl.formatMessage({id: "Permission entities"})}
                                                        rwMode={rwModes.W}
                                                        value={selectedPermissionEntities.find(el =>
                                                            el.type === permissionTypes[index]?.value)?.entities?.map(el => el.value) ?? []}
                                                        onChange={onPermissionEntityChange}
                                                        error={false}
                                                        type={""}
                                                        multiple={true}
                                                        bindingGuid={""}
                                                        groupName={""}
                                                    />
                                                </Box>
                                                <Box>
                                                    {!loading && <div className={"tree-header permission-node"}>
                                                        <div><FormattedMessage id={"Elements"}/></div>
                                                        <div><FormattedMessage id={"Sub Elements"}/></div>
                                                    </div>}
                                                    {tabsValue === index &&<PermissionTree

                                                        openedNodes={[...(openedNodes.find(el => el.type === permissionType)?.opened ?? []), 1]}
                                                        selectedNodes={selectedIds[tabsValue] ?? []}
                                                        onSelected={onSelected}
                                                        onDeselected={onDeselected}
                                                        onToggleOpen={onToggleOpen}
                                                        key={"tree"}
                                                        treeData={treeData}
                                                        nodeGraph={rootNodes ?? []}
                                                    />}
                                                </Box>

                                            </TabPanel>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </MainCard>
                    </form>
                </Grid>
            </Grid>
            <PermissionSavePanel selectedUserProfile={!!selectedUserProfile}
                                 selected={selectedId}
                //^?
                                 permissionBeingUpdated={permissionsBeingUpdatedList}

                                 onProceed={() => {
                                     const dataList = fullDataList.find(el =>
                                         el.type === String(permissionTypes[tabsValue]!.value))!.dataList;
                                     onPermissionUpdate([...selectedId ?? []], dataList);
                                 }}
            ></PermissionSavePanel>
        </div>
    </PermissionSelectionContext.Provider>;
};


