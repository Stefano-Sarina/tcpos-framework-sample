import {type CustomerEntityType, type ICustomerPayload} from "../apiModels/ICustomerPayload";
import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {ABaseApiController, CommonDataController, NextBOPublicRegistrationContainer} from "@tcpos/backoffice-core";
import type { IOrderPayload, OrderEntityType } from "../apiModels/IOrderPayload";

@PublicInjectable()
export class OrderDataController extends CommonDataController<OrderEntityType> {

    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Order');
    }

    async createNewEntity(initialData: IOrderPayload | undefined, id?: number): Promise<LogicResult<IOrderPayload>> {
        return await super.createNewEntity({
                Id: id ?? -1,
                OrderDate: null,
                Notes: "",
                CustomerId: null
        }, id);
    }

    batchRefFields: (keyof IOrderPayload)[]= ['CustomerId'];

    dateFields: (keyof IOrderPayload)[] = [];
}