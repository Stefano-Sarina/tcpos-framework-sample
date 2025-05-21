import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {NextBOPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type {
    IUserPermissionPayload,
    UserPermissionEntityType
} from "../apiModels/IUserPermissionPayload";

@PublicInjectable()
export class UserPermissionDataController extends CommonDataController<UserPermissionEntityType> {

    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('UserPermission');
    }

    async createNewEntity(initialData: IUserPermissionPayload | undefined, id?: number): Promise<LogicResult<IUserPermissionPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            UserId: null,
            PermissionId: null,
            PermissionValue: null,
        }, id);
    }

    batchRefFields: (keyof IUserPermissionPayload)[] = [
    ];

    dateFields: (keyof IUserPermissionPayload)[] = [
    ];
}