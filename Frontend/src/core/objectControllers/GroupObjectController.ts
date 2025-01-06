import { ALocalizationService, PublicInjectable } from "@tcpos/common-core";
import {
    DailyPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ADailyConfigService
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IBatchCommand, IUiComponentPermissionAccess } from "@tcpos/backoffice-core";
import type {I18n} from "../services/intl";
import type {IExternalObjectData} from "@tcpos/backoffice-core";
import type { IGroupObjectModel, GroupObjectDataType, GroupObjectExternalDataType } from "./objectControllerModels/IGroupObjectModel";

@PublicInjectable()
export class GroupObjectController extends
        CommonObjectController<GroupObjectDataType, GroupObjectDataType, GroupObjectExternalDataType, I18n> {

    constructor(
                @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
                @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }

    init(mainId: string) {
        this.mainId = mainId;
        this.mainEntity = "Group";
        this.objectDescription = "Groups";
        this.entityList = [
            {
                entityName: "Group",
                id: Number(mainId),
            },
        ];
    }

    deleteObject = async (data: IGroupObjectModel): Promise<number | {error: string} | undefined> => {
        const commands: IBatchCommand[] = [];
        commands.push({
            objectId: Number(data.objectId),
            operation: "Remove",
            entity: "Group",
            payload: {},
            refFields: []
        });
        return this.apiController.saveData(commands, commands.length);
    };

    externalData: IExternalObjectData<GroupObjectDataType, GroupObjectExternalDataType>[] = [];

    async getPermissions(applicationName: string, objectName: string, objectDescription: string): Promise<IUiComponentPermissionAccess[]> {
        const componentPermissions: IUiComponentPermissionAccess[] = [];
        const uiTree = await this.getDependencyTree(objectName, applicationName, objectDescription);
        const calculatePermissionAccess = (node: IUiTree) => {
            componentPermissions.push({
                componentName: node.component,
                access: 'Write',
            });
            uiTree.filter(el => el.parentNodeId === node.nodeId).forEach((subNode) => {
                calculatePermissionAccess(subNode);
            });
        };
        const mainNode = uiTree.find(el => el.parentNodeId === 0);
        if (mainNode) {
            calculatePermissionAccess(mainNode);
        }
        return componentPermissions;

    }

}