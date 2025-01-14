import type { IOrderObjectModel, OrderDetailExtendedEntityType, OrderExtendedEntityType, OrderObjectDataType, OrderObjectExtendedDataType, OrderObjectExternalDataType } from "./objectControllerModels/IOrderObjectModel";
import type { I18n } from "../services/intl";
import {
    ABaseApiController,
    ADailyConfigService,
    CommonObjectController,
    DailyPublicRegistrationContainer,
    PublicInjectable,
    type IBatchCommand,
    type IBatchSavedReturnValue,
    type IExternalObjectData,
    type IUiComponentPermissionAccess,
    type IUserPermission
} from "@tcpos/backoffice-core";
import {ALocalizationService, type IEntityDataMainObject} from "@tcpos/common-core";
import { getPermissions } from "../../core/common/getPermissions";

@PublicInjectable()
export class OrderObjectController extends CommonObjectController<OrderObjectDataType, OrderObjectExtendedDataType, 
                                                                    OrderObjectExternalDataType, I18n> {
    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
        @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
        @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);
    }

    init(mainId: string) {
        this.mainId = mainId;
        this.mainEntity = "Order";
        this.objectDescription = "Orders";
        this.entityList = [
            {
                entityName: "Order",
                id: Number(mainId),
                addedFields: ['Customer'] as unknown as (keyof OrderExtendedEntityType)[]
            },
            {
                entityName: "OrderDetail",
                refField: "OrderId" as keyof OrderObjectDataType[number]['payload'],
                filter: [{
                    id: 1,
                    field: 'OrderId',
                    operator: 'Number.equals',
                    values: [mainId],
                    parentId: 0,
                    type: 'filter',
                    embedded: false,
                }],
                addedFields: ['Product'] as unknown as (keyof OrderDetailExtendedEntityType)[]
            }
        ]
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

    saveObject(data: IEntityDataMainObject<[OrderExtendedEntityType, ...OrderDetailExtendedEntityType[]]>, objectName?: string): Promise<IBatchSavedReturnValue> {
        const newData = data.objectData.find(el => el.entityName === 'Order')?.data as unknown as Record<string, unknown>;
        if (newData) {
            newData.OrderDate = String(newData.OrderDate).substring(0, 10); 
        }
        return super.saveObject(data, objectName);    
    }

    externalData: IExternalObjectData<OrderObjectExtendedDataType, OrderObjectExternalDataType>[] = [
        {
            apiCallInfo: {
                apiSuffix: 'Customer',
                descriptionField: {
                    formula: (data: Record<string, unknown>) => {
                        return data.FirstName + ' ' + data.LastName
                    },
                    apiFilterFormula: "concat(concat(FirstName, ' '), LastName)"
                },
                foreignIdField: "Id",
            },
            localEntityName: 'Order',
            listFieldName: "Customer_List",
            localIdField: "CustomerId" as keyof OrderObjectExtendedDataType[number]['payload'],
            displayNameField: "Customer" as keyof OrderObjectExtendedDataType[number]['payload'],
        },
        {
            apiCallInfo: {
                apiSuffix: 'Product',
                descriptionField: 'Name' as keyof OrderObjectExtendedDataType[number]['payload'],
                foreignIdField: "Id",
            },
            localEntityName: 'OrderDetail',
            listFieldName: "Product_List",
            localIdField: "ProductId" as keyof OrderObjectExtendedDataType[number]['payload'],
            displayNameField: "Product" as keyof OrderObjectExtendedDataType[number]['payload'],
        }
    ];

    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<OrderObjectDataType, OrderObjectExtendedDataType, OrderObjectExternalDataType, I18n>(applicationName, objectName, objectDescription, this);
     }


}