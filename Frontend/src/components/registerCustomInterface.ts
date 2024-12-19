import {DailyPublicRegistrationContainer} from "@tcpos/backoffice-core";
import {CustomerAnonymizeDataAction} from "../plugins/customers/customerAnonymizeDataAction";

/**
 * Registers custom interface components
 * This function uses methods provided by the {@link DailyPublicRegistrationContainer} class.
 *
 */
export function RegisterCustomInterface(): void {

    DailyPublicRegistrationContainer.registerAction('Customers', 'CustomerAnonymizeDataAction',
        CustomerAnonymizeDataAction);

}
