import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IPermissionPayload, PermissionEntityType } from "../apiModels/IPermissionPayload";

@PublicInjectable()
export class PermissionDataController extends CommonDataController<PermissionEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Permission');
    }

    async createNewEntity(initialData: IPermissionPayload | undefined, id?: number): Promise<LogicResult<IPermissionPayload>> {
        // Not applicable - This is a view
        return await super.createNewEntity({
            Id: id ?? -1,
            PermissionName: "",
            PermissionType: 0,
        }, id);
    }

    batchRefFields: (keyof IPermissionPayload)[] = [
    ];

    dateFields: (keyof IPermissionPayload)[] = [
    ];
}