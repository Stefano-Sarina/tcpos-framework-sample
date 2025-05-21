import { ANextBOApiClient, NextBOPublicRegistrationContainer, store } from "@tcpos/backoffice-core";
import type { CommonObjectController, EntityType, IUiComponentPermissionAccess, IUserPermission } from "@tcpos/backoffice-core";

export const getPermissions = async <OBJECT_DATA_TYPE extends EntityType[], OBJECT_EXTENDED_DATA_TYPE extends EntityType[], I18N>(
                                    applicationName: string, objectName: string, objectDescription: string, 
                                    objectController: CommonObjectController<OBJECT_DATA_TYPE, OBJECT_EXTENDED_DATA_TYPE, I18N>, 
                                    permissionData?: IUserPermission[]
                                ): Promise<IUiComponentPermissionAccess[]> => {
        const apiClient = NextBOPublicRegistrationContainer.resolve(ANextBOApiClient);
        const apiUrl =store.getState().interfaceConfig.apiUrl;
 
        if (!permissionData) {
            let skip = 0;
            const size = 100;
/*             let result: IPermissionsOperatorPayload[] = [];
            let partialResult: IPermissionsOperatorPayload[] | undefined | IApiError = [];
            const top = size;
            let endExtraction = false;
 */            
            //while (!endExtraction) {
                const response = await apiClient.get(apiUrl + `/PermissionsOperator?$filter=contains(PermissionName, '-${applicationName.toLowerCase()}-') and ` +
                    `startswith(tolower(PermissionName),tolower('${objectName}'))`, {}, false, true);
                const permissions: {code: string, type: string}[] =
                    Array.isArray(response) ?
                        response.filter((row: Record<string, unknown>) => row.PermissionValue === 1)
                            .map((row: Record<string, unknown>) => {
                                return {code: String(row.PermissionName), type: String(row.PermissionName).split('-').slice(String(row.PermissionName).split('-').length -1)[0]};
                            })
                            : [];
/*                 if (partialResult && Array.isArray(partialResult)) {
                    if (partialResult.length) {
                        result = [...result, ...partialResult];
                        if (partialResult.length === top) {
                            skip += top;
                        } else {
                            endExtraction = true;
                        }
                    } else {
                        endExtraction = true;
                    }
                } else {
                    endExtraction = true;
                }
 */            
            //}
            if (Array.isArray(response)) {
                permissionData = response.map(row => ({
                    code: row.PermissionName!, type: '', permissionValue: row.PermissionValue!
                }));    
            }

        }
        if (permissionData) {
            const componentPermissions: IUiComponentPermissionAccess[] = [];
            const uiTree = await objectController.getDependencyTree(objectName, applicationName, objectDescription);
            const calculatePermissionAccess = (node: IUiTree) => {
                let component = permissionData.find(el =>
                    String(el.code).toLowerCase() === (node.component + "-" + applicationName + "-" + "write").toLowerCase()
                    && el.permissionValue === 1
                );
                if (component) {
                    componentPermissions.push({
                        componentName: node.component,
                        access: 'Write',
                    });
                } else {
                    component = permissionData.find(el =>
                        String(el.code).toLowerCase() === (node.component + "-" + applicationName + "-" + "read").toLowerCase()
                    );
                    if (component) {
                        componentPermissions.push({
                            componentName: node.component,
                            access: component.permissionValue === 1 ? 'Read' : "NoAccess",
                        });
                    } else {
                        // Not Set
                        const parentNode = uiTree.find(el => el.nodeId === node.parentNodeId);
                        if (parentNode) {
                            componentPermissions.push({
                                componentName: node.component,
                                access: componentPermissions.find(
                                    el => el.componentName === parentNode.component)?.access ?? "NoAccess"
                            });
                        } else {
                            componentPermissions.push({
                                componentName: node.component,
                                access: "NoAccess",
                            });
                        }
                    }
                }
                uiTree.filter(el => el.parentNodeId === node.nodeId).forEach((subNode) => {
                    calculatePermissionAccess(subNode);
                });
            };
            if (Array.isArray(permissionData)) {
                const mainNode = uiTree.find(el => el.parentNodeId === 0);
                if (mainNode) {
                    calculatePermissionAccess(mainNode);
                }
            }
            return componentPermissions;
        } else {
            return [];
        }
    }
