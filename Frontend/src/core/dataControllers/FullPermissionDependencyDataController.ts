import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IFullPermissionDependencyPayload,FullPermissionDependencyEntityType } from "../apiModels/IFullPermissionDependencyPayload";

@PublicInjectable()
export class FullPermissionDependencyDataController extends CommonDataController<FullPermissionDependencyEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('FullPermissionDependency');
    }

    async createNewEntity(initialData: IFullPermissionDependencyPayload | undefined, id?: number): Promise<LogicResult<IFullPermissionDependencyPayload>> {
        // Not applicable - This is a view
        return await super.createNewEntity({
            Id: id ?? -1,
            ChildPermissionId: null, // Mandatory
            ChildPermissionName: null, // Mandatory
            ParentPermissionId: null, // Mandatory
            ParentPermissionName: null, // Mandatory
            Level: null, // Mandatory
        }, id);
    }

    batchRefFields: (keyof IFullPermissionDependencyPayload)[] = [
    ];

    dateFields: (keyof IFullPermissionDependencyPayload)[] = [
    ];
}