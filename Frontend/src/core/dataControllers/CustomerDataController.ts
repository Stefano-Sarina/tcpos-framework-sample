import {type CustomerEntityType, type ICustomerPayload} from "../apiModels/ICustomerPayload";
import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {ABaseApiController, CommonDataController, DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";

@PublicInjectable()
export class CustomerDataController extends CommonDataController<CustomerEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Customer');
    }

    async createNewEntity(initialData: ICustomerPayload | undefined, id?: number): Promise<LogicResult<ICustomerPayload>> {
        return await super.createNewEntity({
                Id: id ?? -1,
                FirstName: "",
                LastName: "",
        }, id);
    }

    batchRefFields: (keyof ICustomerPayload)[]= [
    ];

    dateFields: (keyof ICustomerPayload)[] = [];
}