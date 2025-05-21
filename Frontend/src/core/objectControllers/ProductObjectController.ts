import { ALocalizationService, PublicInjectable, type IInterfaceBuilderModel } from "@tcpos/common-core";
import {
    NextBOPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ANextBOConfigService
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IBatchCommand, IUiComponentPermissionAccess, IUserPermission } from "@tcpos/backoffice-core";
import type {I18n} from "../services/intl";
import type {IExternalObjectData} from "@tcpos/backoffice-core";
import type { IProductObjectModel, ProductObjectDataType } from "./objectControllerModels/IProductObjectModel";
import { getPermissions } from "../../core/common/getPermissions";

@PublicInjectable()
export class ProductObjectController extends
        CommonObjectController<ProductObjectDataType, ProductObjectDataType, I18n> {

    constructor(
                @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @NextBOPublicRegistrationContainer.inject(ANextBOConfigService) protected configService: ANextBOConfigService<I18n>,
                @NextBOPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }

    init(mainId: string, objectName: string, interfaceConfig: IInterfaceBuilderModel) {
        this.mainId = mainId;
        this.mainEntity = "Product";
        this.objectDescription = "Products";
        this.objectName = objectName;
        super.init(mainId, this.objectName, interfaceConfig);
    }

    deleteObject = async (data: IProductObjectModel): Promise<number | {error: string} | undefined> => {
        const commands: IBatchCommand[] = [];
        commands.push({
            objectId: Number(data.objectId),
            operation: "Remove",
            entity: "Product",
            payload: {},
            refFields: []
        });
        return this.apiController.saveData(commands, commands.length);
    };

    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<ProductObjectDataType, ProductObjectDataType, I18n>(applicationName, objectName, objectDescription, this);
    }

}