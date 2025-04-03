import { ALocalizationService, PublicInjectable, type IEntityDataError, type IEntityDataMainObject, type IEntityFieldError, type IInterfaceBuilderModel } from "@tcpos/common-core";
import {
    DailyPublicRegistrationContainer, ABaseApiController,
    CommonObjectController, ADailyConfigService,
    ADailyApiClient,
    store
} from "@tcpos/backoffice-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type { IApiError, IBatchCommand, ISortModes, IUiComponentPermissionAccess, IUserPermission } from "@tcpos/backoffice-core";
import type {
    CustomerObjectDataType, 
    CustomerObjectExtendedDataType,
    ICustomerExtendedPayload,
    ICustomerObjectModel,
} from "./objectControllerModels/ICustomerObjectModel";
import type {I18n} from "../services/intl";
import type { ICustomerPayload } from "../apiModels/ICustomerPayload";
import type { IPermissionsOperatorPayload } from "../../core/apiModels/IPermissionsOperatorPayload";
import { getPermissions } from "../../core/common/getPermissions";

@PublicInjectable()
export class CustomerObjectController extends
        CommonObjectController<CustomerObjectDataType, CustomerObjectExtendedDataType, I18n> {

    constructor(
                @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
                @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
                @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService,
    ) {
        super(apiController, configService, localeService);

    }
    apiClient = DailyPublicRegistrationContainer.resolve(ADailyApiClient);

    init(mainId: string, objectName: string, interfaceConfig: IInterfaceBuilderModel) {
        this.mainId = mainId;
        this.mainEntity = "Customer";
        this.objectDescription = "Customers";
        this.objectName = objectName;
        super.init(mainId, this.objectName, interfaceConfig);
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
/*         if (customerEntity) {
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
 */        
        return errors;

    };

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

    getPermissions = async (applicationName: string, objectName: string, objectDescription: string, permissionData?: IUserPermission[]): Promise<IUiComponentPermissionAccess[]> => {
        return getPermissions<CustomerObjectDataType, CustomerObjectExtendedDataType, I18n>(applicationName, objectName, objectDescription, this);
     }



}