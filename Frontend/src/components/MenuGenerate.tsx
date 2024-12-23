import React, { useEffect} from "react";
import type {PropsWithChildren} from "react";
import {
    buildGridFilterTreeStore,
    DailyPublicRegistrationContainer,
    loadInterfaceBuilder,
    loadInterfaceMenu,
    setPermissions,
    ADailyApiClient,
    ADailyConfigService
} from "@tcpos/backoffice-core";
import type  {
    IEntityModel,
    IMenuGroupModel,
    IPluginEntitiesMenuCustomization,
    IPluginGroupsMenuCustomization,
    IViewConfigModel,
    IOperatorPayload
} from "@tcpos/backoffice-core";
import {useAppDispatch, useAppSelector} from "@tcpos/backoffice-components";

/**
 * Generates the menu items list according to application configuration, customizations, and user permissions
 * @param children
 */
export const MenuGenerate = ({children}: PropsWithChildren) => {
    const dispatch = useAppDispatch();
    const apiClient = DailyPublicRegistrationContainer.resolve(ADailyApiClient);
    const apiUrl = useAppSelector(state => state.interfaceConfig.apiUrl);
    let response: any;
    const pluginList = useAppSelector((state) => state.pluginsConfig);
    const userName = useAppSelector(state => state.user.name);

    const customizeMenuGroups = (currentGroupList: IMenuGroupModel[], groupsCustomization: IPluginGroupsMenuCustomization[],
                                 entitiesCustomization: IPluginEntitiesMenuCustomization[])
        : IMenuGroupModel[] => {
        const tmpGroupList: IMenuGroupModel[] = [...currentGroupList]; // Temporary copy of menu groups list
        groupsCustomization.forEach(newGroup => {
            const newId = newGroup.id; // Id of the group being considered
            const currentGroupIndex = tmpGroupList.findIndex(g => g.id === newId); // Current index of the group
            let removed: IMenuGroupModel[] = []; // If the group exists, it will be removed and added again
            if (currentGroupIndex > -1) {
                removed = tmpGroupList.splice(currentGroupIndex, 1); // Saves the removed group
            }
            let newPosition = currentGroupIndex > -1 ? currentGroupIndex : tmpGroupList.length; // Default: if it's a new group, it's appended at the end of the list
            if (newGroup.position) {
                newPosition = newGroup.position - 1; // New position of the group
            } else if (newGroup.after || newGroup.before) {
                const otherPosition = tmpGroupList.findIndex(g => g.id === (newGroup.after ?? newGroup.before)); // Index of the "after" or "before" group
                if (otherPosition) {
                    newPosition = otherPosition + (newGroup.after ? 1 : 0); // New position of the group
                }
            }
            const added: IMenuGroupModel = {
                id: newId,
                label: newGroup.label,
                entities: removed.length ? removed[0].entities : [] // If it's a new group, the entities list is empty
            };
            tmpGroupList.splice(newPosition, 0, added); // Group added
        });
        entitiesCustomization.forEach(newEntity => {
            const modifiedGroup = tmpGroupList.find((g) => g.id === newEntity.groupId);
            if (modifiedGroup) {
                const newId = newEntity.entityId; // Id of the entity being considered
                const currentEntityIndex = modifiedGroup.entities.findIndex(g => g.entityId === newId); // Current index of the entity
                let removed: IEntityModel[] = []; // If the entity exists, it will be removed and added again
                if (currentEntityIndex > -1) {
                    removed = modifiedGroup.entities.splice(currentEntityIndex, 1); // Saves the removed entity
                }
                if (currentEntityIndex > -1 || (newEntity.label && newEntity.icon && newEntity.gridView)) { // If it's a new entity, then label, icon and gridview are mandatory
                    let newPosition = currentEntityIndex > -1 ? currentEntityIndex : modifiedGroup.entities.length; // Default: if it's a new entity, it's appended at the end of the list
                    if (newEntity.position) {
                        newPosition = newEntity.position - 1; // New position of the entity
                    } else if (newEntity.after || newEntity.before) {
                        const otherPosition = modifiedGroup.entities.findIndex(
                            g => g.entityId === (newEntity.after ?? newEntity.before)
                        ); // Index of the "after" or "before" entity
                        if (otherPosition) {
                            newPosition = otherPosition + (newEntity.after ? 1 : 0); // New position of the group
                        }
                    }
                    const added: IEntityModel = {
                        entityId: newId,
                        label: newEntity.label ?? removed[0].label,
                        icon: newEntity.icon ?? removed[0].icon,
                        gridView: newEntity.gridView ?? removed[0].gridView
                    };
                    modifiedGroup.entities.splice(newPosition, 0, added); // Entity added
                }
            }
        });
        return tmpGroupList;
    };

    const updateMenu = async () => {
        try {
            const interfaceConfig: IViewConfigModel<string> = await DailyPublicRegistrationContainer.resolve(ADailyConfigService)
                .getInterfaceConfig();
            const menuEntityList: string[] = [];
            const localInterfaceConfig = {...interfaceConfig};
            localInterfaceConfig.menuGroups.forEach(m => {
                m.entities.forEach(ent => {
                    if (ent.active) {
                        menuEntityList.push(ent.entityId);
                    }
                });
            });
            response = await apiClient.get(apiUrl + `/PermissionsOperator?$filter=Type eq '${interfaceConfig.applicationName.toLowerCase()}' and ` +
                "((KeyCode in ('" + menuEntityList.map(ent => ent.toLowerCase() + "-" + interfaceConfig.applicationName.toLowerCase() + "-read").join("','") + "')) or " +
                "(KeyCode in ('" + menuEntityList.map(ent => ent.toLowerCase() + "-" + interfaceConfig.applicationName.toLowerCase() + "-write").join("','") + "')))",
                {}, false, true);
            const permissions: {code: string, type: string}[] =
                Array.isArray(response) ?
                    response.filter((row: Record<string, unknown>) => row.PermissionValue === 2)
                        .map((row: Record<string, unknown>) => {
                            return {code: String(row.KeyCode), type: String(row.SubType)};
                        })
                        : [];
/*             const permissions: {code: string, type: string, permissionValue?: number}[] = [
                {
                    code: "customer-backofficesample-read",
                    type: 'read'
                },
                {
                    code: "customer-backofficesample-write",
                    type: 'write'
                },
                {
                    code: "customer.new-backofficesample-write",
                    type: 'write',
                    permissionValue: 2
                },
                {
                    code: "tax-backofficesample-read",
                    type: 'read'
                },
                {
                    code: "tax-backofficesample-write",
                    type: 'write'
                },
                {
                    code: "tax.new-backofficesample-write",
                    type: 'write',
                    permissionValue: 2
                },
                {
                    code: "product-backofficesample-read",
                    type: 'read'
                },
                {
                    code: "product-backofficesample-write",
                    type: 'write'
                },
                {
                    code: "product.new-backofficesample-write",
                    type: 'write',
                    permissionValue: 2
                },
                {
                    code: "order-backofficesample-read",
                    type: 'read'
                },
                {
                    code: "order-backofficesample-write",
                    type: 'write'
                },
                {
                    code: "order.new-backofficesample-write",
                    type: 'write',
                    permissionValue: 2
                },
            ]
 */            
            dispatch(setPermissions(permissions));
            pluginList.forEach(p => {
                if (DailyPublicRegistrationContainer.isRegisteredPluginMenuCustomization(p.toLowerCase())) {
                    const customization = DailyPublicRegistrationContainer.resolvePluginMenuCustomization(p.toLowerCase());
                    localInterfaceConfig.menuGroups = customizeMenuGroups(localInterfaceConfig.menuGroups, customization.groups ?? [],
                        customization.entities ?? []);
                }
            });
            const inactiveObjects: string[] = [];
            localInterfaceConfig.menuGroups.forEach(m => {
                const activeMenus = m.entities.filter(ent => ent.active);
                activeMenus.forEach(ent => {
                    if (!permissions.find(el =>
                        el.code.toLowerCase() === ent.entityId.toLowerCase() + "-" + interfaceConfig.applicationName.toLowerCase() + "-read" ||
                        el.code.toLowerCase() === ent.entityId.toLowerCase() + "-" + interfaceConfig.applicationName.toLowerCase() + "-write")
                    ) {
                        inactiveObjects.push(ent.entityId);
                    }
                });
            });
            let permissionAdministrator = false;
            try {
/*                const response: any = await apiClient.get('/connect/userinfo', {}, false, true);
                 if (response?.Subject) {
                    const operatorDataControllerRegistration =
                            DailyPublicRegistrationContainer.resolveEntry("dataControllers", "Operators").controller;
                    const operatorDataController =
                            DailyPublicRegistrationContainer.resolveConstructor(operatorDataControllerRegistration);
                    operatorDataController.init();
                    if (operatorDataController) {
                        const currentOperatorData = await operatorDataController.dataListLoad<IOperatorPayload>(
                            [{type: 'filter', field: 'Code', id: 1, parentId: 0, operator: "String.equals",
                                values: [response.Subject], embedded: false}],
                            []);
                        if (Array.isArray(currentOperatorData)) {
                            permissionAdministrator = (currentOperatorData[0].IsPermissionAdministrator === 1);
                        }
                    }
                }
 */         
                permissionAdministrator = userName === 'Admin';
            } catch {
                // No permissions to get user data
            }
            const activeItems = localInterfaceConfig.menuGroups.map(m => {
                return {...m, entities: m.entities.filter(ent =>
                        inactiveObjects.indexOf(ent.entityId) === -1 ||
                        ent.entityId === 'dashboard' ||
                        (permissionAdministrator && ent.entityId === 'prmPermission'))};
            });
            dispatch(loadInterfaceMenu(activeItems /*{...localInterfaceConfig, menuGroups: activeItems }*/));
            const fetchAllMenuGroups = () => {
                interfaceConfig.menuGroups.map(el => {
                    el.entities.forEach(entity => {
                        if (entity.active) {
                            const fetchEntityDataConfig = async () => {
                                dispatch(buildGridFilterTreeStore({
                                    entity: entity.entityId,
                                    filters: [],
                                    appliedFilters: [],
                                    lastAddedNode: null
                                }));

                                const response2 = await DailyPublicRegistrationContainer
                                    .resolve(ADailyConfigService).getDataViewConfig(entity.entityId);
                                if (response2?.objectName) {
                                    dispatch(loadInterfaceBuilder(response2));
                                }
                            };
                            fetchEntityDataConfig();
                        }
                    });
                });
            };
            fetchAllMenuGroups();
        } catch {
            dispatch(setPermissions([]));
        }
    };


    useEffect(() => {
        updateMenu();
    }, [userName]);

    return <>
        {children}
    </>;
};