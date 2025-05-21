import type {LogicResult} from "@tcpos/common-core";
import {iocInjectable} from "@tcpos/common-core";
import {NextBOPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type {IPrmOperatorPermAssocPayload, PrmOperatorPermAssocEntityType} from "../apiModels";

@iocInjectable()
export class PrmOperatorPermAssocDataController extends CommonDataController<PrmOperatorPermAssocEntityType> {

    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('PrmOperatorPermAssocs');
    }

    async createNewEntity(initialData: IPrmOperatorPermAssocPayload | undefined, id?: number): Promise<LogicResult<IPrmOperatorPermAssocPayload>> {
        return await super.createNewEntity({
            Id: id ?? -1,
            OperatorId: null,
            PermissionId: null,
            PermissionValue: null,
        }, id);
    }

    batchRefFields: (keyof IPrmOperatorPermAssocPayload)[] = [
    ];

    dateFields: (keyof IPrmOperatorPermAssocPayload)[] = [
    ];
}