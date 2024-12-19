import {activatePlugins, registerCoreServices} from "../core/registerCoreServices";
import {registerDailyDefaultComponent} from "./registerDailyDefaultComponent";
import {RegisterCustomInterface} from "./registerCustomInterface";

/**
 * Startup registrations:
 * - Core services: {@link registerCoreService}
 * - Default UI components {@link registerDailyDefaultComponent}
 * - Custom UI components {@link RegisterCustomInterface}
 * - Plugins
 *
 * The registrations are performed using the {@link DailyPublicRegistrationContainer} class provided by the _webdaily-core_
 * package.
 *
 * @category Functions
 */
export const appRegistrations = () => {
    registerCoreServices();

    registerDailyDefaultComponent();

    RegisterCustomInterface();

    activatePlugins();

};