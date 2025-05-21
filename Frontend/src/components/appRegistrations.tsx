import {activatePlugins, registerCoreServices} from "../core/registerCoreServices";
import {registerAppDefaultComponent} from "./registerAppDefaultComponent";
import {RegisterCustomInterface} from "./registerCustomInterface";

/**
 * Startup registrations:
 * - Core services: {@link registerCoreService}
 * - Default UI components {@link registerAppDefaultComponent}
 * - Custom UI components {@link RegisterCustomInterface}
 * - Plugins
 *
 * The registrations are performed using the {@link NextBOPublicRegistrationContainer} class provided by the _backoffice-core_
 * package.
 *
 * @category Functions
 */
export const appRegistrations = () => {
    registerCoreServices();

    registerAppDefaultComponent();

    RegisterCustomInterface();

    activatePlugins();

};