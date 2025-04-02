import { ALocalizationService, PublicInjectable, type IInterfaceBuilderModel } from "@tcpos/common-core";
import {
    DailyPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ADailyConfigService
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IBatchCommand, IUiComponentPermissionAccess, IUserPermission } from "@tcpos/backoffice-core";
import type {I18n} from "../services/intl";
import type { IGroupObjectModel, GroupObjectDataType } from "./objectControllerModels/IGroupObjectModel";
import { getPermissions } from "../../core/common/getPermissions";

@PublicInjectable()
export class GroupObjectController extends
        CommonObjectController<GroupObjectDataType, GroupObjectDataType, I18n> {

    constructor(
                @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
                @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }

    init(mainId: string, objectName: string, interfaceConfig: IInterfaceBuilderModel) {
        this.mainId = mainId;
        this.mainEntity = "Group";
        this.objectDescription = "Groups";
        this.objectName = objectName;
        super.init(mainId, this.objectName, interfaceConfig);
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


    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<GroupObjectDataType, GroupObjectDataType, I18n>(applicationName, objectName, objectDescription, this);
     }

}