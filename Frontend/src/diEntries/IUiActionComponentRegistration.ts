import type React from "react";
import type {INextBOActionToolbarItem} from "@tcpos/common-core";

export interface IUiActionComponentRegistration {
    component:  (props: INextBOActionToolbarItem) => React.JSX.Element,
}