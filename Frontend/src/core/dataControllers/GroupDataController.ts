import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {NextBOPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IGroupPayload, GroupEntityType } from "../apiModels/IGroupPayload";

@PublicInjectable()
export class GroupDataController extends CommonDataController<GroupEntityType> {

    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Group');
    }

    async createNewEntity(initialData: IGroupPayload | undefined, id?: number): Promise<LogicResult<IGroupPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            GroupName: null,
        }, id);
    }

    batchRefFields: (keyof IGroupPayload)[] = [
    ];

    dateFields: (keyof IGroupPayload)[] = [
    ];
}