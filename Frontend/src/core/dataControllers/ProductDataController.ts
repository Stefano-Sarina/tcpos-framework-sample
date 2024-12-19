import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { LogicResult} from "@tcpos/common-core";
import {iocInjectable} from "@tcpos/common-core";
import type { ProductEntityType } from "../apiModels/IProductPayload";
import type { IProductPayload } from "../apiModels/IProductPayload";

@iocInjectable()
export class ProductDataController extends CommonDataController<ProductEntityType> {
    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('Product');
    }

    async createNewEntity(initialData: IProductPayload | undefined, id?: number): Promise<LogicResult<IProductPayload>> {
        return await super.createNewEntity( {
                Id: id ?? -1,
                Name: "",
                Price: null,

        }, id);
    }
    
    batchRefFields: (keyof IProductPayload)[] = [
    ];

    dateFields: (keyof IProductPayload)[] = [
    ];
}