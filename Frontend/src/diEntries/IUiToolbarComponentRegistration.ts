import type {IEntryRegistrationPayload} from "@tcpos/common-core";
import type {IocUiComponent} from "@tcpos/backoffice-core";

export interface IUiToolbarComponentRegistration extends IEntryRegistrationPayload {
    component: IocUiComponent
}