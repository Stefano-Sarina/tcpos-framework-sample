import {ALocalizationService, createRegistrationEntry} from "@tcpos/common-core";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import {
    ABaseApiController,
    ACacheLogic,
    ADailyConfigService,
    AUserLogic,
    CacheLogic,
    checkResolverNames,
    DailyHooksAfter,
    DailyHooksBefore,
    DailyPublicRegistrationContainer,
    getPluginSortedList,
    loadPlugins,
    LocalizationService,
    pluginInfoList,
    pluginSortedListMap,
    setLoadingStateCompleted,
    store,
    UserLogic
} from "@tcpos/backoffice-core";
import type { PluginInfo } from "@tcpos/backoffice-core";
import {
    CustomerDataController,
    GroupPermissionDataController,
    OrderDataController,
    OrderDetailDataController,
    PermissionDataController,
    FullPermissionDependencyDataController,
    ProductDataController,
    UserPermissionDataController
} from "./dataControllers";
import {
    CustomerObjectController,
} from "./objectControllers";
import {basePluginListRegistration} from "../plugins/basePlugins/basePluginListRegistration";
import { ProductObjectController } from "./objectControllers/ProductObjectController";
import { OrderObjectController } from "./objectControllers/OrderObjectController";
import { CommonApiController } from "./services/CommonApiController";
import { UserDataController } from "./dataControllers/UserDataController";
import { UserGroupDataController } from "./dataControllers/UserGroupDataController";
import { TaxDataController } from "./dataControllers/TaxDataController";
import { TaxObjectController } from "./objectControllers/TaxObjectController";

/**
 * Registration of core services:
 * - {@link LocalizationService}
 * - {@link CacheLogic}, which satisfies {@link ACacheLogic}
 * - {@link UserLogic}, which satisfies {@link AUserLogic}
 * - {@link CommonApiController}, which satisfies {@link ABaseApiController}
 * - Data controllers (that map database tables), extending {@link CommonDataController}
 * - Object controllers (one for each application page), extending {@link CommonObjectController}
 *
 * This function uses methods provided by the {@link DailyPublicRegistrationContainer} class.
 */
export function registerCoreServices() {
    DailyPublicRegistrationContainer.register(ALocalizationService, LocalizationService);

    DailyPublicRegistrationContainer.register(ACacheLogic, CacheLogic);

    //DailyPublicRegistrationContainer.registerIHistory(history);

    DailyPublicRegistrationContainer.register(AUserLogic, UserLogic);

    DailyPublicRegistrationContainer.register(ABaseApiController, CommonApiController);

    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "Customer", controller: CustomerDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "Tax", controller: TaxDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "Product", controller: ProductDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "Order", controller: OrderDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "OrderDetail", controller: OrderDetailDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "User", controller: UserDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "UserGroup", controller: UserGroupDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "Permission", controller: PermissionDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "FullPermissionDependency", controller: FullPermissionDependencyDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "UserPermission", controller: UserPermissionDataController}));
    DailyPublicRegistrationContainer.registerEntry("dataControllers", createRegistrationEntry({
        _registrationName: "GroupPermission", controller: GroupPermissionDataController}));
                    
    DailyPublicRegistrationContainer.registerEntry("objectControllers", createRegistrationEntry(
        {_registrationName: "tax", controller: TaxObjectController}));
    DailyPublicRegistrationContainer.registerEntry("objectControllers", createRegistrationEntry(
        {_registrationName: "customer", controller: CustomerObjectController}));
    DailyPublicRegistrationContainer.registerEntry("objectControllers", createRegistrationEntry(
        {_registrationName: "product", controller: ProductObjectController}));
    DailyPublicRegistrationContainer.registerEntry("objectControllers", createRegistrationEntry(
        {_registrationName: "order", controller: OrderObjectController}));

    store.dispatch(setLoadingStateCompleted({step: 'registrations'}));

}

export const activatePlugins = (): void  => {
    const fetchPlugins = async () => {
        const pluginList = await DailyPublicRegistrationContainer.resolve(ADailyConfigService).getPluginList();
        pluginList.forEach(p => {
            if (basePluginListRegistration[p]) {
                basePluginListRegistration[p]();
            }
        });
        store.dispatch(loadPlugins(pluginList));
        store.dispatch(setLoadingStateCompleted({step: 'pluginRegistrations'}));
    };

    fetchPlugins();

};

/**
 * TODO: the weakSorting settings must be moved to a config file
 * Usage:
 * [
 *  {
 *      responder: (one of TCHooksBefore or TCHooksAfter values, or "*"),
 *      pluginList: [ordered plugin names list for the related responder]
 *  }
 * ]
 */
const weakSorting: any[] = [];

/**
 * await for all content loaded to build plugin map
 */
window.addEventListener("PluginLoaded", () => {
    // "Before" responders
    for (const hookType of Object.keys(DailyHooksBefore)) {
        const currentHookType: string = DailyHooksBefore[hookType as keyof typeof DailyHooksBefore];
        // Extracts the list of the plugins associated to this responder
        const pluginResponderList = pluginInfoList.filter((el) =>
            el.responder === currentHookType);
        if (pluginResponderList.length > 0) {
            // Verifies that there aren't plugins with empty name or different plugins with the same name
            if (checkResolverNames(pluginResponderList, currentHookType)) {
                // Defines the list to be used to manage dependencies
                let responderWeaklySortedList: PluginInfo[] = [];
                // Checks if a weak sorting is configured for this responder
                const weakSortingResponder = weakSorting.find(
                    (el) => el.responder.toString() === currentHookType);
                if (weakSortingResponder) {
                    // If there is a quick sorting setting, checks if each element in "pluginList" field is a
                    // valid element and, if so, pushes it in the responderWeaklySortedList
                    for (const nextPlugin of weakSortingResponder.pluginList) {
                        const currentPlugin = pluginResponderList.find((el) => el.pluginName === nextPlugin);
                        if (currentPlugin) {
                            responderWeaklySortedList.push(currentPlugin);
                        }
                    }
                    // Adds to responderWeaklySortedList the eventual plugins not yet added
                    for (const nextMissingPlugin of pluginResponderList) {
                        if (!responderWeaklySortedList.find((el) =>
                            el.pluginName === nextMissingPlugin.pluginName)) {
                            responderWeaklySortedList.push(nextMissingPlugin);
                        }
                    }
                    responderWeaklySortedList.reverse();
                } else {
                    responderWeaklySortedList = pluginResponderList;
                }
                const pluginSortedList = getPluginSortedList(responderWeaklySortedList);
                pluginSortedListMap.set(currentHookType, pluginSortedList);
            }
        }
    }

    // "After" responders
    for (const hookType of Object.keys(DailyHooksAfter)) {
        const currentHookType = DailyHooksAfter[hookType as keyof typeof DailyHooksAfter];
        const pluginResponderList = pluginInfoList.filter((el) => el.responder === currentHookType);
        if (pluginResponderList.length > 0) {
            if (checkResolverNames(pluginResponderList, currentHookType)) {
                pluginResponderList.reverse();
                const pluginSortedList = getPluginSortedList(pluginResponderList);
                pluginSortedListMap.set(currentHookType, pluginSortedList);
            }
        }
    }

    store.dispatch(setLoadingStateCompleted({step: 'pluginHookRegistrations'}));

});
