import {NextBOPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import {iocInjectable} from "@tcpos/common-core";
import type { LogicResult} from "@tcpos/common-core";
import type { IOrderDetailPayload, OrderDetailEntityType } from "../apiModels/IOrderDetailPayload";

@iocInjectable()
export class OrderDetailDataController extends CommonDataController<OrderDetailEntityType> {
    constructor(
        @NextBOPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('OrderDetail');
    }

    async createNewEntity(initialData: IOrderDetailPayload, id?: number): Promise<LogicResult<IOrderDetailPayload>> {
        return await super.createNewEntity( {
                Id: id ?? -1,
                OrderId: null,
                ProductId: null,
                Quantity: null
        }, id);
    }

    batchRefFields: (keyof IOrderDetailPayload)[]= [
        'OrderId',
        'ProductId',
    ];

    dateFields: (keyof IOrderDetailPayload)[] = [];

}