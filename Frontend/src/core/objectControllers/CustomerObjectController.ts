import { ALocalizationService, PublicInjectable, type IEntityDataError, type IEntityDataMainObject, type IEntityFieldError } from "@tcpos/common-core";
import {
    DailyPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ADailyConfigService
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IBatchCommand, ISortModes, IUiComponentPermissionAccess } from "@tcpos/backoffice-core";
import type {
    CustomerObjectDataType, 
    CustomerObjectExtendedDataType,
    ICustomerExtendedPayload,
    ICustomerObjectModel,
    CustomerObjectExternalDataType,
    CustomerExtendedEntityType
} from "./objectControllerModels/ICustomerObjectModel";
import type {I18n} from "../services/intl";
import type {IExternalObjectData} from "@tcpos/backoffice-core";
import type { ICustomerPayload } from "../apiModels/ICustomerPayload";

@PublicInjectable()
export class CustomerObjectController extends
        CommonObjectController<CustomerObjectDataType, CustomerObjectExtendedDataType, CustomerObjectExternalDataType, I18n> {

    constructor(
                @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
                @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }

    init(mainId: string) {
        this.mainId = mainId;
        this.mainEntity = "Customer";
        this.objectDescription = "Customers";
        this.entityList = [
            {
                entityName: "Customer",
                id: Number(mainId),
                addedFields: ['FullName'] as unknown as (keyof CustomerExtendedEntityType)[] 
            },
        ];
    }

    async onUpdate(data: ICustomerObjectModel): Promise<ICustomerObjectModel | undefined> {
        const customerData = data.objectData;
        const customerEntityData =
            customerData.find(el => el.entityName === 'Customer')?.data as ICustomerExtendedPayload;
        if (customerEntityData) {
            // Full name
            customerEntityData.FullName = (customerEntityData.FirstName ? customerEntityData.FirstName + ' ' : '') +
                (customerEntityData.LastName ?? "");
        }

        return super.onUpdate(data, 'customer');
    }

/*     async saveObject(data: ICustomerObjectModel): Promise<number | { error: string } | undefined> {
        const localData = data.objectData.find(
            el => el.entityName === this.mainEntity
        )?.data as ICustomerPayload;
        return super.saveObject(localData);
    }
*/    
    deleteObject = async (data: ICustomerObjectModel): Promise<number | {error: string} | undefined> => {
        const commands: IBatchCommand[] = [];
        commands.push({
            objectId: Number(data.objectId),
            operation: "Remove",
            entity: "Customer",
            payload: {},
            refFields: []
        });
        return this.apiController.saveData(commands, commands.length);
    };

    async validate(data: IEntityDataMainObject<CustomerObjectExtendedDataType>, objectName?: string, customValidation?: ((errors: IEntityDataError<ICustomerExtendedPayload>[]) => Promise<IEntityDataError<ICustomerExtendedPayload>[]>) | undefined): Promise<IEntityDataError<ICustomerExtendedPayload>[]> {
        const errors = await super.validate(data, 'customer');
        const customerEntity =
            data.objectData.find(el => el.entityName === 'Customer');
        if (customerEntity) {
            const customerEntityData = customerEntity.data as ICustomerPayload;
            if (customerEntityData.LastName && customerEntityData.LastName.substring(0,1) !== 'A') {
                const localError = "Customer last name must start with 'A'";
                const entityErrors =
                    errors.find(el => el.entityName === 'Customer')?.errors as IEntityFieldError<ICustomerPayload>[];
                if (entityErrors) {
                    const fieldErrors =
                        entityErrors.find(el => el.fieldName === 'LastName');
                    if (fieldErrors) {
                        fieldErrors.error.push({key: localError});
                    } else {
                        entityErrors.push({fieldName: 'LastName', error: [{key: localError}]});
                    }
                } else {
                    const newErrors: IEntityDataError<ICustomerPayload> = {entityId: customerEntity.entityId, entityName: "Customer",
                        errors: [{
                            fieldName: 'LastName',
                            error: [{key: localError}]
                        }]};
                    errors.push(newErrors as IEntityDataError<ICustomerPayload>);
                }

            }
        }
        return errors;

    };

    externalData: IExternalObjectData<CustomerObjectExtendedDataType, CustomerObjectExternalDataType>[] = [];

    gridViewFieldConverter = [
        {
            newFieldName: "FullName",
            localConverterFunc: (row: Record<string, unknown>) => {
                return (row['FirstName'] ? row['FirstName'] + " " : "") + row["LastName"];
                },
            filterField: "concat(concat(FirstName, ' '), LastName)"
        }
    ];

    gridViewSortConverter(fieldName: string, mode: ISortModes): string {
        if (fieldName === 'FullName') {
            return "LastName " + mode + ",FirstName " + mode;
        } else {
            return fieldName + ' ' + mode;
        }
    }

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