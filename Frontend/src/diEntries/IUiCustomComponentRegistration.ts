import type {IEntryRegistrationPayload} from "@tcpos/common-core";
import type React from "react";

export interface IUiCustomComponentRegistration extends IEntryRegistrationPayload {
    component: (props: any) => React.JSX.Element
}