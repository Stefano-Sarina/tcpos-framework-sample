import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {ABaseApiController, CommonDataController, DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";
import type { ITaxPayload, TaxEntityType } from "../apiModels/ITaxPayload";

@PublicInjectable()
export class TaxDataController extends CommonDataController<TaxEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Tax');
    }

    async createNewEntity(initialData: ITaxPayload | undefined, id?: number): Promise<LogicResult<ITaxPayload>> {
        return await super.createNewEntity({
                Id: id ?? -1,
                Code: "",
                Description: "",
                Tax: null
        }, id);
    }

    batchRefFields: (keyof ITaxPayload)[]= [
    ];

    dateFields: (keyof ITaxPayload)[] = [];
}