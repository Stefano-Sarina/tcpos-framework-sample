import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IUserGroupPayload, UserGroupEntityType } from "../apiModels/IUserGroupPayload";

@PublicInjectable()
export class UserGroupDataController extends CommonDataController<UserGroupEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('UserGroup');
    }

    async createNewEntity(initialData: IUserGroupPayload | undefined, id?: number): Promise<LogicResult<IUserGroupPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            UserId: null,
            GroupId: null,
        }, id);
    }

    batchRefFields: (keyof IUserGroupPayload)[] = [
    ];

    dateFields: (keyof IUserGroupPayload)[] = [
    ];
}