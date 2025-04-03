import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IPermissionsOperatorPayload, PermissionsOperatorEntityType } from "../apiModels/IPermissionsOperatorPayload";

@PublicInjectable()
export class PermissionsOperatorDataController extends CommonDataController<PermissionsOperatorEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('PermissionsOperator');
    }

    async createNewEntity(initialData: IPermissionsOperatorPayload | undefined, id?: number): Promise<LogicResult<IPermissionsOperatorPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            OperatorId: null,
            OperatorCode: null,
            OperatorGroupId: null,
            OperatorGroupCode: null,
            PermissionId: null,
            PermissionName: null,
            PermissionValue: null,
            PermissionType: null,
                }, id);
    }

    batchRefFields: (keyof IPermissionsOperatorPayload)[] = [
    ];

    dateFields: (keyof IPermissionsOperatorPayload)[] = [
    ];
}