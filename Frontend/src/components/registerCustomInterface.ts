import {createRegistrationEntry, NextBOPublicRegistrationContainer} from "@tcpos/backoffice-core";
import {CustomerAnonymizeDataAction} from "../plugins/customers/customerAnonymizeDataAction";
import { CustomSectionTest1 } from "../plugins/customers/CustomSectionTest1";

/**
 * Registers custom interface components
 * This function uses methods provided by the {@link NextBOPublicRegistrationContainer} class.
 *
 */
export function RegisterCustomInterface(): void {

    NextBOPublicRegistrationContainer.registerAction('Customers', 'CustomerAnonymizeDataAction',
        CustomerAnonymizeDataAction);

    NextBOPublicRegistrationContainer.registerEntry("uiCustomComponents",
        createRegistrationEntry({_registrationName: 'customSectionTest1', component: CustomSectionTest1}));        
    NextBOPublicRegistrationContainer.registerEntry("uiComponents",
        createRegistrationEntry({_registrationName: 'customSectionTest', component: CustomSectionTest1}));        
}
