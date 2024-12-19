import type {IObjectControllerRegistration, IDataControllerRegistration} from "@tcpos/backoffice-core";
import type {RegistrationEntry} from "@tcpos/common-core";
import type {IUiComponentRegistration} from "./IUiComponentRegistration";
import type {IUiToolbarComponentRegistration} from "./IUiToolbarComponentRegistration";
import type {IUiActionComponentRegistration} from "./IUiActionComponentRegistration";
import type {IUiCustomComponentRegistration} from "./IUiCustomComponentRegistration";
import type { IApiControllerRegistration } from "./IApiControllerRegistration";

declare module "@tcpos/common-core" {

    interface RegistrationEntries {
        apiController: RegistrationEntry<IApiControllerRegistration>
        dataControllers: RegistrationEntry<IDataControllerRegistration<any>>
        objectControllers: RegistrationEntry<IObjectControllerRegistration<any>>
        uiComponents: RegistrationEntry<IUiComponentRegistration>,
        uiCustomComponents: RegistrationEntry<IUiCustomComponentRegistration>,
        uiToolbarComponents: RegistrationEntry<IUiToolbarComponentRegistration>,
        uiActionComponents: RegistrationEntry<IUiActionComponentRegistration>,
    }
}

export {};

