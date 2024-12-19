/* import { ALocalizationService, iocInjectable } from "@tcpos/common-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import type {IBatchCommand, IDailyConfigService, ISortModes} from "@tcpos/backoffice-core";
import {
    ABaseApiController,
    CommonObjectController,
    ADailyConfigService,
    DailyPublicRegistrationContainer
} from "@tcpos/backoffice-core";
import type {
    IPrmPermissionObjectModel,
    PrmPermissionObjectDataType,
    PrmPermissionObjectExternalDataListsType, PrmPermissionObjectLocalDataListsType
} from "./objectControllerModels/IPrmPermissionObjectModel";
import type {I18n} from "../../core/services/intl";

@iocInjectable()
export class PrmPermissionObjectController extends CommonObjectController<
    PrmPermissionObjectDataType,
    PrmPermissionObjectDataType, [],
    I18n
> {
    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController,
        @DailyPublicRegistrationContainer.inject(ADailyConfigService) protected configService: ADailyConfigService<I18n>,
        @DailyPublicRegistrationContainer.inject(ALocalizationService) protected localeService: ALocalizationService
    ) {
        super(apiController, configService, localeService);
    }

    init(mainId: string) {
        this.mainId = mainId;
        this.mainEntity = "PrmPermissions";
        this.objectDescription = "Permissions";
        this.entityList = [
            {
                entityName: "PrmPermissions",
                id: Number(mainId),
            },
        ];
    }

    async onUpdate(data: IPrmPermissionObjectModel): Promise<IPrmPermissionObjectModel | undefined> {
        return super.onUpdate(data, "prmPermission");
    }

    deleteObject = async (data: IPrmPermissionObjectModel): Promise<number | { error: string } | undefined> => {
        const commands: IBatchCommand[] = [];
        commands.push({
            objectId: Number(data.objectId),
            operation: "Remove",
            entity: this.mainEntity,
            payload: {},
            refFields: [],
        });
        return this.apiController.saveData(commands, commands.length);
    };

    async saveObject(data: IPrmPermissionObjectModel): Promise<number | { error: string } | undefined> {
        return super.saveObject(data);
    }

    dataLists: PrmPermissionObjectExternalDataListsType = [
    ];

    gridViewFieldConverter = [
    ];

    gridViewSortConverter(fieldName: string, mode: ISortModes): string {
        return fieldName + ' ' + mode;
    }
} */