import { ALocalizationService, PublicInjectable } from "@tcpos/common-core";
import {
    DailyPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ADailyConfigService
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IBatchCommand, IUiComponentPermissionAccess, IUserPermission } from "@tcpos/backoffice-core";
import type {I18n} from "../services/intl";
import type {IExternalObjectData} from "@tcpos/backoffice-core";
import type { ITaxObjectModel, TaxObjectDataType, TaxObjectExternalDataType } from "./objectControllerModels/ITaxObjectModel";
import { getPermissions } from "../../core/common/getPermissions";

@PublicInjectable()
export class TaxObjectController extends
        CommonObjectController<TaxObjectDataType, TaxObjectDataType, TaxObjectExternalDataType, I18n> {

    constructor(
                @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
                @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }

    init(mainId: string) {
        this.mainId = mainId;
        this.mainEntity = "Taxes";
        this.objectDescription = "Taxes";
        this.entityList = [
            {
                entityName: "Tax",
                id: Number(mainId),
            },
        ];
    }

    deleteObject = async (data: ITaxObjectModel): Promise<number | {error: string} | undefined> => {
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

    externalData: IExternalObjectData<TaxObjectDataType, TaxObjectExternalDataType>[] = [];

    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<TaxObjectDataType, TaxObjectDataType, TaxObjectExternalDataType, I18n>(applicationName, objectName, objectDescription, this);
    }
    
}