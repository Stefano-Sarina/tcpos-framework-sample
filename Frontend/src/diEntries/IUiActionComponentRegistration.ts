import type React from "react";
import type {IDailyActionToolbarItem} from "@tcpos/common-core";

export interface IUiActionComponentRegistration {
    component:  (props: IDailyActionToolbarItem) => React.JSX.Element,
}