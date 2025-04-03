import type {LogicResult} from "@tcpos/common-core";
import {PublicInjectable} from "@tcpos/common-core";
import {DailyPublicRegistrationContainer, ABaseApiController, CommonDataController} from "@tcpos/backoffice-core";
import type { IPermissionsCtesPayload,PermissionsCtesEntityType } from "../apiModels/IPermissionsCtesPayload";

@PublicInjectable()
export class PermissionsCtesDataController extends CommonDataController<PermissionsCtesEntityType> {

    constructor(
        @DailyPublicRegistrationContainer.inject(ABaseApiController) apiController: ABaseApiController
    ) {
        super(apiController);
    }

    init() {
        super.init('PermissionsCtes');
    }

    async createNewEntity(initialData: IPermissionsCtesPayload | undefined, id?: number): Promise<LogicResult<IPermissionsCtesPayload>> {
        // Not applicable - This is a view
        return await super.createNewEntity({
            Id: id ?? -1,
            ChildPermissionId: null, // Mandatory
            ChildPermissionName: null, // Mandatory
            ChildPermissionType: null, // Mandatory
            ParentPermissionId: null, // Mandatory
            ParentPermissionName: null, // Mandatory
            ParentPermissionType: null, // Mandatory
            Level: null, // Mandatory
        }, id);
    }

    batchRefFields: (keyof IPermissionsCtesPayload)[] = [
    ];

    dateFields: (keyof IPermissionsCtesPayload)[] = [
    ];
}