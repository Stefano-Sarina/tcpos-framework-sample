import type { IOrderObjectModel, OrderObjectDataType} from "./objectControllerModels/IOrderObjectModel";
import type { I18n } from "../services/intl";
import {
    ABaseApiController,
    ADailyConfigService,
    CommonObjectController,
    DailyPublicRegistrationContainer,
    PublicInjectable,
    type IBatchCommand,
    type IBatchSavedReturnValue,
    type IUiComponentPermissionAccess,
    type IUserPermission
} from "@tcpos/backoffice-core";
import {ALocalizationService, type IEntityDataMainObject, type IInterfaceBuilderModel} from "@tcpos/common-core";
import { getPermissions } from "../../core/common/getPermissions";
import type { OrderEntityType } from "../../core/apiModels/IOrderPayload";
import type { OrderDetailEntityType } from "../../core/apiModels/IOrderDetailPayload";

@PublicInjectable()
export class OrderObjectController extends CommonObjectController<OrderObjectDataType, OrderObjectDataType, I18n> {
    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
        @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
        @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);
    }

    init(mainId: string, objectName: string, interfaceConfig: IInterfaceBuilderModel) {
        this.mainId = mainId;
        this.mainEntity = "Order";
        this.objectDescription = "Orders";
        this.objectName = objectName;
        super.init(mainId, this.objectName, interfaceConfig);
    }

    deleteObject = async (data: IOrderObjectModel): Promise<number | {error: string} | undefined> => {
        const commands: IBatchCommand[] = [];
        ['OrderDetail'].forEach(t => {
            data.objectData.filter(el => el.entityName === t).forEach(row => {
                if (row.data.Id) {
                    commands.push({
                        objectId: Number(row.data.Id),
                        operation: "Remove",
                        entity: t,
                        payload: {},
                        refFields: []
                    });
                }
            });
        });
        commands.push({
            objectId: Number(data.objectId),
            operation: "Remove",
            entity: "Order",
            payload: {},
            refFields: []
        });
        return this.apiController.saveData(commands, commands.length);

    }

    saveObject(data: IEntityDataMainObject<[OrderEntityType, ...OrderDetailEntityType[]]>, objectName?: string): Promise<IBatchSavedReturnValue> {
        const newData = data.objectData.find(el => el.entityName === 'Order')?.data as unknown as Record<string, unknown>;
        if (newData) {
            newData.OrderDate = String(newData.OrderDate).substring(0, 10); 
        }
        return super.saveObject(data, objectName);    
    }

    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<OrderObjectDataType, OrderObjectDataType, I18n>(applicationName, objectName, objectDescription, this);
     }


}