import type {IEntryRegistrationPayload} from "@tcpos/common-core";
import type {IocUiComponent} from "@tcpos/backoffice-core";

export interface IUiComponentRegistration extends IEntryRegistrationPayload {
    component: IocUiComponent
}