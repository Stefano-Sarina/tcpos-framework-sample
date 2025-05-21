import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {NextBOPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IUserPayload, UserEntityType } from "../apiModels/IUserPayload";

@PublicInjectable()
export class UserDataController extends CommonDataController<UserEntityType> {

    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('User');
    }

    async createNewEntity(initialData: IUserPayload | undefined, id?: number): Promise<LogicResult<IUserPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            UserName: null,
            Password: null,
        }, id);
    }

    batchRefFields: (keyof IUserPayload)[] = [
    ];

    dateFields: (keyof IUserPayload)[] = [
    ];
}