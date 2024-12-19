import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { GroupPermissionEntityType, IGroupPermissionPayload } from "../apiModels/IGroupPermissionPayload";

@PublicInjectable()
export class GroupPermissionDataController extends CommonDataController<GroupPermissionEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('GroupPermission');
    }

    async createNewEntity(initialData: IGroupPermissionPayload | undefined, id?: number): Promise<LogicResult<IGroupPermissionPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            GroupId: null,
            PermissionId: null,
            PermissionValue: null,
        }, id);
    }

    batchRefFields: (keyof IGroupPermissionPayload)[] = [
    ];

    dateFields: (keyof IGroupPermissionPayload)[] = [
    ];
}