import _ from "underscore";
import {
    ABaseApiController, ADailyConfigService,
    DailyPublicRegistrationContainer, Graph, store
} from "@tcpos/backoffice-core";
import type {AERObjectController, IApiError, IViewConfigModel, IBatchOperationType,
} from "@tcpos/backoffice-core";
import type {IUiTree} from "@tcpos/backoffice-core";
import type {
    IInterfaceBuilderSubForm,
    IInterfaceBuilderComponent,
    IInterfaceBuilderSubFormFields, IInterfaceBuilderComboBox, ICustomComponentPermissionTree
} from "@tcpos/common-core";

interface IRemoteVersion {
    Id: number,
    ConcurrencyCode: string,
    EntityName: string,
    Version: string
}

interface IVersionCheck {
    status: 'updated' | 'oldRemoteVersion' | 'oldLocalVersion' | 'error',
    message: string
}

export interface ISinglePermissionEndPoint {
    Url: string;
    Verb: string;
}

export interface ISinglePermission {
    Entity: string;
    Code: string;
    Description: string;
    PermissionItemEndPoint: ISinglePermissionEndPoint | null;
    PermissionItemParents: string[]; // Codes of the parents
}

export interface IPermissionList {
    Name: 'Read' | 'Write';
    PermissionItems: ISinglePermission[];
}

export interface IPermissionTree {
    ApplicationName: string;
    Version: string;
    ClientKey: string;
    Permissions: IPermissionList[];
}

export interface IControllerInstance {
    registrationKey: string;
    controller: AERObjectController<any, any>;
}

//export type localeServiceFormatMessageType = typeof ALocalizationService.prototype.formatMessage;
export class PermissionLogic {
    static versionValidationRule = new RegExp('^[0-9][0-9]*\\.[0-9][0-9]*\\.[0-9][0-9]*$');

    public static getDBUIPermissionVersion = async (): Promise<IRemoteVersion[] | undefined> => {
        const apiUrl = store.getState().interfaceConfig.apiUrl;
        try {
            const res = await  DailyPublicRegistrationContainer.resolve(ABaseApiController)
                .dataListLoad(`adWebEntityVersion`, [], [], undefined, undefined,
                    undefined, undefined, undefined, true);
            if (!(res as IApiError).message) {
                return res as unknown as IRemoteVersion[];
            }
            return undefined;
        } catch {
            return undefined;
        }
    };

    public static getLocalUIPermissionVersion = () => {
        return store.getState().interfaceConfig.uiVersion;
    };

    public static getLocalApplicationName = () => {
        return store.getState().interfaceConfig.applicationName;
    };

    public static checkUIPermissionVersion = async (dbVersion?: IRemoteVersion[] | undefined): Promise<IVersionCheck> => {
        if (!dbVersion) {
            dbVersion = await this.getDBUIPermissionVersion();
        }
        const localVersion = this.getLocalUIPermissionVersion();
        return this.compareUIPermissionVersion(dbVersion, localVersion, this.getLocalApplicationName());
    };

    public static convertVersionNumber = (version: string): number => {
        if (!this.versionValidationRule.test(version)) {
            return 0;
        }
        const values = version.split('.');
        let valid = true;
        values.forEach(v => {
            if (Number(v) >= 1000) {
                valid = false;
            }
        });
        if (!valid) {
            return 0;
        }
        return Number(values[2]) + Number(values[1]) * 1000 + Number(values[0]) * 1000000;
    };

    public static compareUIPermissionVersion = (dbVersion: IRemoteVersion[] | undefined, localVersion: string,
                                                applicationName: string /*localeServiceFormatMessage: localeServiceFormatMessageType*/): IVersionCheck => {
        if (!dbVersion) {
            //return {status: 'error', message: localeServiceFormatMessage({id: 'No remote version found'})};
            return {status: 'error', message: 'No remote version found'};
        }
        if (localVersion === '') {
            //return {status: 'error', message: localeServiceFormatMessage({id: 'No local version found'})};
            return {status: 'error', message: 'No local version found'};
        }
        const formRemoteVersion =
            dbVersion.find(el => el.EntityName.toLowerCase() === applicationName.toLowerCase());
/*
        if (!formRemoteVersion) {
            return {status: 'error', message: 'No remote version found'};
        }
*/
        if (formRemoteVersion) {
            if (!this.versionValidationRule.test(formRemoteVersion.Version)) {
                //return {status: 'error', message: localeServiceFormatMessage({id: 'Wrong remote version found'})};
                return {status: 'error', message: 'Wrong remote version found'};
            }
        }
        if (!this.versionValidationRule.test(localVersion)) {
            //return {status: 'error', message: localeServiceFormatMessage({id: 'Wrong local version found'})};
            return {status: 'error', message: 'Wrong local version found'};
        }
        if (formRemoteVersion) {
            const convertedRemoteVersion = this.convertVersionNumber(formRemoteVersion.Version);
            const convertedLocalVersion = this.convertVersionNumber(localVersion);
            if (convertedRemoteVersion === convertedLocalVersion) {
                return {status: 'updated', message: ''};
            } else if (convertedRemoteVersion < convertedLocalVersion) {
                return {status: 'oldRemoteVersion', message: ''};
            } else {
                //return {status: 'oldLocalVersion', message: localeServiceFormatMessage({id: 'Not updated client'})};
                return {status: 'oldLocalVersion', message: 'Not updated client'};
            }
        } else {
            return {status: 'oldRemoteVersion', message: ''}; // Triggers the remote version update
        }
    };

    private static getCustomComponentPermissionTree(uiTree: IUiTree[], subTree: ICustomComponentPermissionTree[], parentNodeId: number): IUiTree[] {
        const res: IUiTree[] = [...uiTree];
        const maxNodeId = uiTree[uiTree.length - 1].nodeId;
        let cnt = maxNodeId + 1;
        const indexedSubTree: {componentName: string, index: number}[] = [];
        subTree.forEach(el => {
            indexedSubTree.push({componentName: el.componentName, index: cnt});
            cnt++;
        });
        subTree.forEach(el => {
            if (!res.find(comp => comp.component === el.componentName)) {
                res.push({
                    nodeId: indexedSubTree.find(s => s.componentName === el.componentName)!.index,
                    parentNodeId: el.parent ? indexedSubTree.find(s => s.componentName === el.parent)!.index
                        : parentNodeId,
                    component: el.componentName,
                    parent: ``,
                    type: 'ListComponent',
                    api: el.api,
                    description: el.label ?? el.componentName
                });
                cnt++;
            }
        });
        return res;
    };

    public static getUIPermissionTree = async  () => {
        const interfaceConfig: IViewConfigModel<string> = await DailyPublicRegistrationContainer.resolve(ADailyConfigService)
            .getInterfaceConfig();
        const menuGroups = interfaceConfig.menuGroups; // store.getState().interfaceConfig.menuGroups;
        const controllerList: IControllerInstance[] = [];
        const reportList: string[] = [];
        menuGroups.forEach(group => {
            group.entities.forEach(obj => {
                if (DailyPublicRegistrationContainer.isBound("objectControllers", obj.entityId)) {
                    const controllerRegistration = DailyPublicRegistrationContainer
                        .resolveEntry("objectControllers", obj.entityId).controller;
                    if (controllerRegistration) {
                        const controller = DailyPublicRegistrationContainer.resolveConstructor(controllerRegistration);
                        controller.init("-1", obj.entityId);
                        controllerList.push({registrationKey: obj.entityId, controller: controller as AERObjectController<any, any>});
                    }
                } else if (obj.category === 'webReporting') {
                    reportList.push(obj.entityId);
                }
            });
        });
        // TODO manage plugins

        const stdObjectsPermissionTree = await this.createUIPermissionTree(
            controllerList, this.getLocalUIPermissionVersion(), store.getState().interfaceConfig.apiUrl,
            store.getState().interfaceConfig.applicationName);

        const reportPermissionTree = await this.createReportPermissionTree(reportList, this.getLocalUIPermissionVersion(),
            store.getState().interfaceConfig.applicationName);

        stdObjectsPermissionTree.Permissions = [...stdObjectsPermissionTree.Permissions, ...reportPermissionTree.Permissions];
        return stdObjectsPermissionTree;
    };

    private static getBoundComponentDataList(component: IInterfaceBuilderComponent | IInterfaceBuilderSubFormFields, controller: IControllerInstance): string | undefined {
        const dataList = (component as IInterfaceBuilderComboBox).listName;

        const apiDataList = controller.controller.externalData?.find(
            el => el.listFieldName === dataList
        )?.apiCallInfo?.apiSuffix;
        if (typeof apiDataList === 'string') {
            return apiDataList;
        } else {
            return undefined;
        }
    };

    private static async setPermissionList(controller: IControllerInstance, applicationName: string, apiBaseUrl?: string): Promise<IPermissionList[]> {
        const readPermissions: IPermissionList = {Name: "Read", PermissionItems: []};
        const writePermissions: IPermissionList = {Name: "Write", PermissionItems: []};

        if (apiBaseUrl) {
            // this.apiController.setApiUrl(apiBaseUrl);
        }

        const uiTree: IUiTree[] = await this.getDependencyTree(controller, applicationName);

        const appendPermission = (type: 'Read' | 'Write'): ISinglePermission[] => {
            return [
                ...DailyPublicRegistrationContainer.resolve(ABaseApiController).basePermissions.find(el => el.Name === type)?.PermissionItems ?? [],
                ...(type === 'Read' ? readPermissions.PermissionItems : writePermissions.PermissionItems),
                ..._.flatten(uiTree.filter(comp => comp.api).map(comp =>
                    this.setAPIPermissionGroups(
                        comp.api!.filter(el => !el.verb || el.verb === type || el.verb === 'All')
                            .map(el => ({entity: el.entity, url: el.url, verb: el.verb})),
                        type).map(el => el.permission))
                )
            ];
        };
        // API permissions
        readPermissions.PermissionItems = appendPermission('Read');
        writePermissions.PermissionItems = appendPermission('Write');
        /*
                writePermissions.PermissionItems = [
                    ...this.apiController.basePermissions.find(el => el.Name === 'Write')?.PermissionItems ?? [],
                    ...writePermissions.PermissionItems,
                    ..._.flatten(uiTree.filter(comp => comp.api).map(comp =>
                        this.setAPIPermissionGroups(
                            comp.api!.filter(el => !el.verb || el.verb === 'Write' || el.verb === 'All')
                                .map(el => el.entity),
                            'Write').map(el => el.permission))
                    )
                ];
        */

        // UI permissions
        readPermissions.PermissionItems = [
            ...readPermissions.PermissionItems,
            ...uiTree.map(comp => ({
                Entity: comp.component,
                Code: `${controller.registrationKey}-${comp.nodeId}-read`,
                Description: comp.description,
                PermissionItemEndPoint: null,
                PermissionItemParents: [
                    ...(comp.parentNodeId !== 0 ? [`${controller.registrationKey}-${comp.parentNodeId}-read`] : []),
                    ...(comp.api ?
                        this.setAPIPermissionGroups(comp.api!.filter(el =>
                                !el.verb || el.verb === 'Read' || el.verb === 'All'
                            ).map(el => ({entity: el.entity, url: el.url, verb: el.verb})),
                            'Read').map(el => el.code) : [])
                ]
            }))
        ];
        writePermissions.PermissionItems = [
            ...writePermissions.PermissionItems,
            ...uiTree.map(comp => ({
                Entity: comp.component,
                Code: `${controller.registrationKey}-${comp.nodeId}-write`,
                Description: comp.description,
                PermissionItemEndPoint: null,
                PermissionItemParents: [
                    `${controller.registrationKey}-${comp.nodeId}-read`,
                    ...(comp.parentNodeId !== 0 ? [`${controller.registrationKey}-${comp.parentNodeId}-write`] : []),
                    ...(comp.api /*&& (comp.nodeId === 1 || comp.type === 'SubForm')*/ ?
                        this.setAPIPermissionGroups(comp.api!.filter(
                                el => !el.verb || el.verb === 'Write' || el.verb === 'All'
                            ).map(el => ({entity: el.entity, url: el.url, verb: el.verb})),
                            'Write').map(el => el.code) : [])
                ]
            }))
        ];
        // Object creation permission
        writePermissions.PermissionItems = [
            ...writePermissions.PermissionItems,
            ...uiTree.filter(comp => comp.type === 'MainForm').map(comp => ({
                Entity: comp.component + ".new",
                Code: `${controller.registrationKey}-${comp.nodeId}-create-new`,
                Description: comp.description + " - Create new item",
                PermissionItemEndPoint: null,
                PermissionItemParents: [
                    `${controller.registrationKey}-${comp.nodeId}-write`,
                ]
            }))
        ];

        return [readPermissions, writePermissions];
    }

    public static createUIPermissionTree = async (controllerList: IControllerInstance[], localVersion: string, apiUrl: string,
                                            applicationName: string): Promise<IPermissionTree> => {
        const tree: IPermissionTree = {
            ApplicationName: applicationName,
            Version: localVersion,
            ClientKey: '',
            Permissions: [],
        };
        for (const controller of controllerList) {
            const currentPermissions = await this.setPermissionList(controller, applicationName, apiUrl);
            currentPermissions.forEach(prm => {
                if (!tree.Permissions.find(el => el.Name === prm.Name)) {
                    tree.Permissions.push(prm);
                } else {
                    const existingPermissionType =
                        tree.Permissions.find(el => el.Name === prm.Name);
                    existingPermissionType!.PermissionItems = [
                        ...existingPermissionType!.PermissionItems,
                        ...prm.PermissionItems
                    ];
                }
            });
        }

        // Add plugins TODO manage plugins
        return this.optimizePermissionTree(this.addPluginsToTree(tree, applicationName));
    };

     public static createReportPermissionTree = async (reportList: string[], localVersion: string, applicationName: string) => {
         const tree: IPermissionTree = {
             ApplicationName: applicationName,
             Version: localVersion,
             ClientKey: '',
             Permissions: [],
         };
         for (const report of reportList) {
             tree.Permissions.push({
                 Name: "Read",
                 PermissionItems: [
                     {
                         Code: `${report}-read`,
                         Description: "Report " + report,
                         Entity: report,
                         PermissionItemParents: [],
                         PermissionItemEndPoint: null
                     }
                 ]
             })
         }
         return tree;
     };

    static addPluginsToTree = (tree: IPermissionTree, applicationName: string): IPermissionTree => {
        let currentReadPermissions = tree.Permissions.find(el => el.Name === "Read")?.PermissionItems;
        let currentWritePermissions = tree.Permissions.find(el => el.Name === "Write")?.PermissionItems;
        const addedReadPermissions:  ISinglePermission[] = [
        ];

        const addedWritePermissions:  ISinglePermission[] = [];
        currentReadPermissions = [...(currentReadPermissions ?? []), ...addedReadPermissions];
        currentWritePermissions = [...(currentWritePermissions ?? []), ...addedWritePermissions];
        tree.Permissions = [{Name: 'Read', PermissionItems: currentReadPermissions},
            {Name: 'Write', PermissionItems: currentWritePermissions}];
        return tree;
    };

    public static optimizePermissionTree(permissionTree: IPermissionTree): IPermissionTree {
        const optimizedTree: IPermissionTree = {
            ...permissionTree,
            Permissions: permissionTree.Permissions.map(p => {
                    return {Name: p.Name, PermissionItems: []};
                })
        };
        // Duplications removal
        const uniquePermList: ISinglePermission[] = [];
        permissionTree.Permissions.forEach(permission => {
            permission.PermissionItems.forEach(p => {
                const dedupedPermissionParents =
                    {...p, PermissionItemParents: _.uniq(p.PermissionItemParents)};
                const existing = uniquePermList.find(
                    el => el.Code === dedupedPermissionParents.Code
                );
                if (existing) {
                    // duplication: if the new permission is the same, ignore it, otherwise throws an error
                    if (!_.isEqual(existing, dedupedPermissionParents)) {
                        throw new Error('Unresolvable duplication found in permission tree: ' + dedupedPermissionParents.Code);
                    }
                } else {
                    uniquePermList.push(dedupedPermissionParents);
                    optimizedTree.Permissions.find(el => el.Name === permission.Name)!.PermissionItems.push(
                        dedupedPermissionParents
                    );
                }
            });
        });

        // References check
        const G = new Graph(uniquePermList.length);
        uniquePermList.forEach((p, index) => {
            p.PermissionItemParents.forEach(parent => {
                if (parent === p.Code) {
                    throw new Error(`Circular reference found in permission tree for ${p.Code} permission`);
                }
                const existing = uniquePermList.findIndex(el =>
                    el.Code === parent
                );
                if (existing === -1) {
                    throw new Error(`Reference not found in permission tree for parent "${parent}" in "${p.Code}" permission`);
                }
                G.addEdge(index, existing);
            });
        });
        const isCyclic: boolean = G.isCyclic();
        if (isCyclic) {
            throw new Error("Circular reference found in permission tree");
        }

        return optimizedTree;
    }

    private static async getDependencyTree(controller: IControllerInstance, applicationName: string) {
        const viewConfig = await DailyPublicRegistrationContainer
            .resolve(ADailyConfigService).getDataViewConfig(controller.registrationKey);

        let uiTree: IUiTree[] = [];
        let groupId: number, sectionId: number, componentId: number, subComponentId: number;
        let cnt = 1;
        if (viewConfig?.objectName) {
            const resolveTabsCustomization = DailyPublicRegistrationContainer.isRegisteredTabsCustomization(viewConfig.objectName)
                ? DailyPublicRegistrationContainer.resolveTabsCustomization(viewConfig.objectName)
                : undefined;
            if (resolveTabsCustomization) {
                viewConfig.detailView.layoutGroups =
                    resolveTabsCustomization(viewConfig.detailView.layoutGroups);
            }
            uiTree.push({
                nodeId: cnt,
                parentNodeId: 0,
                component: controller.registrationKey,
                parent: "",
                type: 'MainForm',
                api: [{entity: controller.controller.mainEntity}],
                description: `${applicationName} - Page: ${controller.controller.objectDescription}`,
            });
            viewConfig.detailView.layoutGroups.forEach(layoutGroup => {
                cnt++;
                groupId = cnt;
                uiTree.push({
                    nodeId: cnt,
                    parentNodeId: 1,
                    component: `${controller.registrationKey}.${layoutGroup.groupName}`,
                    parent: controller.registrationKey,
                    type: 'Group',
                    description: `Group: ${layoutGroup.label && layoutGroup.label !== "" ? layoutGroup.label : layoutGroup.groupName}`,
                    api: layoutGroup.customApiDependencies ?? undefined,
                });
                if (!layoutGroup.customComponent) {
                    layoutGroup.sections.forEach(section => {
                        cnt++;
                        sectionId = cnt;
                        uiTree.push({
                            nodeId: sectionId,
                            parentNodeId: groupId,
                            component: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}`,
                            parent: `${controller.registrationKey}.${layoutGroup.groupName}`,
                            type: 'Section',
                            description: `Section: ${section.label && section.label !== "" ? section.label : section.sectionName}`,
                            api: section.customApiDependencies ?? undefined,
                        });
                        section.components.filter(c => c.componentType === 'wdCombobox')
                            .forEach(component => {
                                const apiDataList = this.getBoundComponentDataList(component, controller);
                                if (apiDataList) {
                                    cnt++;
                                    componentId = cnt;
                                    uiTree.push({
                                        nodeId: componentId,
                                        parentNodeId: sectionId,
                                        component: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}.${component.componentName}`,
                                        parent: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}`,
                                        type: 'ListComponent',
                                        api: [{entity: apiDataList}],
                                        description: `Data list: ${component.label && component.label !== "" ? component.label : component.componentName}`
                                    });
                                }
                            });
                        section.components.filter(c => c.componentType === 'wdSubForm').forEach(component => {
                            const subForm = (component as IInterfaceBuilderSubForm);
                            cnt++;
                            componentId = cnt;
                            uiTree.push({
                                nodeId: componentId,
                                parentNodeId: sectionId,
                                component: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}.${component.componentName}`,
                                parent: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}`,
                                type: 'SubForm',
                                api: subForm.entityName ? [{entity: subForm.entityName}] : undefined,
                                description: `Subform: ${component.label && component.label !== "" ? component.label : component.componentName}`
                            });
                            subForm.subFields.filter(el => el.cellRenderer.componentType === 'wdCombobox')
                                .forEach(subField => {
                                    const apiDataList = this.getBoundComponentDataList(subField.cellRenderer, controller);
                                    if (apiDataList) {
                                        cnt++;
                                        subComponentId = cnt;
                                        uiTree.push({
                                            nodeId: subComponentId,
                                            parentNodeId: componentId,
                                            component: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}.${component.componentName}.${subField.cellRenderer.componentName}`,
                                            parent: `${controller.registrationKey}.${layoutGroup.groupName}.${section.sectionName}.${component.componentName}`,
                                            type: 'ListComponent',
                                            api: [{entity: apiDataList}],
                                            description: `Data list: ${subField.cellRenderer.label && subField.cellRenderer.label !== "" ? subField.cellRenderer.label : subField.cellRenderer.componentName}`
                                        });
                                    }
                                });
                        });
                    });
                } else if (layoutGroup.customComponentPermissionTree) {
                    uiTree = this.getCustomComponentPermissionTree(uiTree, layoutGroup.customComponentPermissionTree, groupId);
                    const maxNodeId = uiTree[uiTree.length - 1].nodeId;
                    cnt = maxNodeId + 1;
                }
            });
        }
        return uiTree;
    };

    private static setAPIPermissionGroups(entities: { entity: string, url?: string, verb?: 'Read' | 'Write' | 'All' }[], mode: 'Read' | 'Write'): {code: string, permission: ISinglePermission}[] {
        const apiController = DailyPublicRegistrationContainer.resolve(ABaseApiController);
        const permList: ISinglePermission[] = mode === 'Read'
            ? _.flatten(entities.map(ent => ([
                {
                    Entity: ent.entity,
                    Code: `ERP-${ent.entity}-get-list`,
                    Description: `API ERP endpoint: ${ent.entity} - Get data list`,
                    PermissionItemEndPoint: ent.url && ent.verb ? {Url: ent.url, Verb: ent.verb } : apiController.getData(ent.entity).endPoint,
                    PermissionItemParents: []
                },
                {
                    Entity: ent.entity,
                    Code: `ERP-${ent.entity}-get-list-count`,
                    Description: `API ERP endpoint: ${ent.entity} - Get data list count`,
                    PermissionItemEndPoint: ent.url && ent.verb ? {Url: ent.url, Verb: ent.verb } : apiController.getData(ent.entity, true).endPoint,
                    PermissionItemParents: []
                },
                {
                    Entity: ent.entity,
                    Code: `ERP-${ent.entity}-get`,
                    Description: `API ERP endpoint: ${ent.entity} - Get single data`,
                    PermissionItemEndPoint: ent.url && ent.verb ? {Url: ent.url, Verb: ent.verb } : apiController.getData(ent.entity).endPoint,
                    PermissionItemParents: []
                },

            ])))
            : _.flatten(entities.map(ent => ([
                {
                    Entity: ent.entity,
                    Code: `ERP-${ent.entity}-post`,
                    Description: `API ERP endpoint: ${ent.entity} - Post data`,
                    PermissionItemEndPoint: ent.url && ent.verb ? {Url: ent.url, Verb: ent.verb } : apiController.batchInsertCommand(ent.entity).endPoint,
                    PermissionItemParents: []
                },
                ...(['Replace', 'Update', 'Remove'].map((op) => {return {
                        Entity: ent.entity,
                        Code: `ERP-${ent.entity}-${op}`,
                        Description: `API ERP endpoint: ${ent.entity} - ${op} data`,
                        PermissionItemEndPoint: ent.url && ent.verb ? {Url: ent.url, Verb: ent.verb } : apiController.batchEditCommand(ent.entity, op as IBatchOperationType).endPoint,
                        PermissionItemParents: []
                    };})
                )
            ])));
        return permList.map(el => {
            return {
                code: el.Code,
                permission: el
            };
        });
    }


}