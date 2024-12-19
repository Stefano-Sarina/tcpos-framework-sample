/* import type {LogicResult} from "@tcpos/common-core";
import {iocInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type {IPrmPermissionPayload, PrmPermissionEntityType} from "../apiModels/IPermissionPayload";

@iocInjectable()
export class PrmPermissionDataController extends CommonDataController<PrmPermissionEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('PrmPermissions');
    }

    async createNewEntity(initialData: IPrmPermissionPayload | undefined, id?: number): Promise<LogicResult<IPrmPermissionPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            KeyCode: "",
            Description: "",
            Entity: "",
            Type: "",
            SubType: "",
        }, id);
    }

    batchRefFields: (keyof IPrmPermissionPayload)[] = [
    ];

    dateFields: (keyof IPrmPermissionPayload)[] = [
    ];
} */