import type {ClassDefinition} from "@tcpos/common-core";
import type {ABaseApiController} from "@tcpos/backoffice-core";

export interface IApiControllerRegistration {
    controller: ClassDefinition<ABaseApiController>
}